// EQ Session Layer - Reliable UDP Protocol
// Based on EQEmu's reliable_stream implementation

import dgram from 'dgram';
import net from 'net';
import { EventEmitter } from 'events';
import { SessionOpcodes } from './opcodes';
import zlib from 'zlib';

export interface SessionOptions {
  host: string;
  port: number;
  timeout?: number;
  useTcp?: boolean; // Use TCP instead of UDP (for world server)
}

export enum SessionState {
  Closed,
  Connecting,
  Connected,
  Disconnecting,
}

interface PendingPacket {
  sequence: number;
  data: Buffer;
  timestamp: number;
  retries: number;
}

export class EQSession extends EventEmitter {
  private udpSocket?: dgram.Socket;
  private tcpSocket?: net.Socket;
  private useTcp: boolean;
  private host: string;
  private port: number;
  private state: SessionState = SessionState.Closed;
  private sessionId: number = 0;
  private encodeKey: number = 0;
  private crcBytes: number = 2;
  private encodePass1: number = 0;
  private encodePass2: number = 0;
  private maxPacketSize: number = 512;

  private sequenceOut: number = 0;
  private sequenceIn: number = 0;
  private pendingPackets: Map<number, PendingPacket> = new Map();
  private fragmentBuffer: Map<number, Buffer[]> = new Map();

  private keepAliveInterval?: NodeJS.Timeout;
  private retryInterval?: NodeJS.Timeout;

  // TCP buffer for partial packets
  private tcpBuffer: Buffer = Buffer.alloc(0);

  constructor(options: SessionOptions) {
    super();
    this.host = options.host;
    this.port = options.port;
    this.useTcp = options.useTcp || false;

    if (this.useTcp) {
      // TCP mode for world server
      this.tcpSocket = new net.Socket();

      this.tcpSocket.on('data', (data) => {
        this.handleTcpData(data);
      });

      this.tcpSocket.on('error', (err) => {
        this.emit('error', err);
      });

      this.tcpSocket.on('close', () => {
        this.emit('disconnected');
      });
    } else {
      // UDP mode for login server
      this.udpSocket = dgram.createSocket('udp4');

      this.udpSocket.on('message', (msg, rinfo) => {
        this.handlePacket(msg);
      });

      this.udpSocket.on('error', (err) => {
        this.emit('error', err);
      });
    }
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.state = SessionState.Connecting;

      const timeout = setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, 10000);

      this.once('connected', () => {
        clearTimeout(timeout);
        if (!this.useTcp) {
          this.startKeepAlive();
        }
        resolve();
      });

      this.once('error', (err) => {
        clearTimeout(timeout);
        reject(err);
      });

      if (this.useTcp) {
        // TCP connection for world server
        this.tcpSocket!.connect(this.port, this.host, () => {
          this.emit('debug', `TCP connected to ${this.host}:${this.port}`);
          // For TCP, we're connected immediately (no session negotiation like UDP)
          // But the EQEmu protocol still uses a session layer over TCP
          // Send session request
          const request = this.buildSessionRequest();
          this.sendRaw(request);
        });
      } else {
        // UDP connection for login server
        this.udpSocket!.bind(() => {
          // Send session request
          const request = this.buildSessionRequest();
          this.sendRaw(request);
        });
      }
    });
  }

  disconnect(): void {
    this.state = SessionState.Disconnecting;

    // Send disconnect packet
    const disconnect = Buffer.alloc(8);
    disconnect.writeUInt8(0x00, 0);
    disconnect.writeUInt8(SessionOpcodes.OP_SessionDisconnect, 1);
    disconnect.writeUInt32LE(this.sessionId, 2);
    this.sendRaw(disconnect);

    this.cleanup();
    this.state = SessionState.Closed;

    if (this.useTcp && this.tcpSocket) {
      this.tcpSocket.destroy();
    }

    this.emit('disconnected');
  }

  // Handle TCP stream data (may contain multiple packets or partial packets)
  private handleTcpData(data: Buffer): void {
    // Append to buffer
    this.tcpBuffer = Buffer.concat([this.tcpBuffer, data]);

    // Process complete packets
    // TCP packets are length-prefixed with 2-byte size
    while (this.tcpBuffer.length >= 2) {
      const packetLen = this.tcpBuffer.readUInt16BE(0);
      if (this.tcpBuffer.length < packetLen + 2) {
        // Not enough data yet
        break;
      }

      // Extract packet
      const packet = this.tcpBuffer.slice(2, packetLen + 2);
      this.tcpBuffer = this.tcpBuffer.slice(packetLen + 2);

      // Process the packet
      this.handlePacket(packet);
    }
  }

  // Send an application packet (will be wrapped in session layer)
  send(opcode: number, data: Buffer): void {
    if (this.state !== SessionState.Connected) {
      throw new Error('Not connected');
    }

    // Build application packet
    const appPacket = Buffer.alloc(2 + data.length);
    appPacket.writeUInt16LE(opcode, 0);
    data.copy(appPacket, 2);

    this.emit('debug', `Sending app packet: opcode=0x${opcode.toString(16)}, size=${appPacket.length}, hex=${appPacket.toString('hex').substring(0, 40)}...`);

    // Check if we need to fragment
    if (appPacket.length > this.maxPacketSize - 10) {
      this.sendFragmented(appPacket);
    } else {
      this.sendReliable(appPacket);
    }
  }

  private buildSessionRequest(): Buffer {
    const request = Buffer.alloc(14);
    request.writeUInt8(0x00, 0);
    request.writeUInt8(SessionOpcodes.OP_SessionRequest, 1);
    request.writeUInt32BE(0x02, 2); // Protocol version
    request.writeUInt32BE(this.generateSessionId(), 6); // Connect code
    request.writeUInt32BE(512, 10); // Max packet size
    return request;
  }

  private generateSessionId(): number {
    return Math.floor(Math.random() * 0xFFFFFFFF);
  }

  private handlePacket(data: Buffer): void {
    if (data.length < 2) return;

    // Commenting out verbose packet logging
    // this.emit('debug', `Received: ${data.length} bytes, hex=${data.toString('hex').substring(0, 60)}...`);

    const zero = data.readUInt8(0);
    const opcode = data.readUInt8(1);

    if (zero !== 0x00) {
      // This might be compressed/encoded data
      this.handleEncodedPacket(data);
      return;
    }

    switch (opcode) {
      case SessionOpcodes.OP_SessionResponse:
        this.handleSessionResponse(data);
        break;

      case SessionOpcodes.OP_Combined:
        this.handleCombined(data);
        break;

      // Handle all 4 streams for reliable packets
      case SessionOpcodes.OP_Packet:
        this.handleReliable(data, 0);
        break;
      case SessionOpcodes.OP_Packet2:
        this.handleReliable(data, 1);
        break;
      case SessionOpcodes.OP_Packet3:
        this.handleReliable(data, 2);
        break;
      case SessionOpcodes.OP_Packet4:
        this.handleReliable(data, 3);
        break;

      // Handle all 4 streams for fragments
      case SessionOpcodes.OP_Fragment:
        this.handleFragment(data, 0);
        break;
      case SessionOpcodes.OP_Fragment2:
        this.handleFragment(data, 1);
        break;
      case SessionOpcodes.OP_Fragment3:
        this.handleFragment(data, 2);
        break;
      case SessionOpcodes.OP_Fragment4:
        this.handleFragment(data, 3);
        break;

      // Handle all ACK streams
      case SessionOpcodes.OP_Ack:
      case SessionOpcodes.OP_Ack2:
      case SessionOpcodes.OP_Ack3:
      case SessionOpcodes.OP_Ack4:
        this.emit('debug', `OP_Ack (stream ${opcode - SessionOpcodes.OP_Ack}): ${data.toString('hex').substring(0, 20)}`);
        this.handleAck(data);
        break;

      // Handle all OutOfOrderAck streams
      case SessionOpcodes.OP_OutOfOrderAck:
      case SessionOpcodes.OP_OutOfOrderAck2:
      case SessionOpcodes.OP_OutOfOrderAck3:
      case SessionOpcodes.OP_OutOfOrderAck4:
        this.handleOutOfOrderAck(data);
        break;

      case SessionOpcodes.OP_KeepAlive:
        // Respond to keep alive
        this.sendRaw(data);
        break;

      case SessionOpcodes.OP_OutboundPing:
        // Server is pinging us - respond with same packet
        this.sendRaw(data);
        break;

      case SessionOpcodes.OP_SessionDisconnect:
        this.handleDisconnect();
        break;

      case SessionOpcodes.OP_SessionStatRequest:
        this.handleStatRequest(data);
        break;

      case SessionOpcodes.OP_AppCombined:
        this.handleAppCombined(data);
        break;

      default:
        // Unknown session opcode, might be application data
        this.emit('debug', `Unknown session opcode: 0x${opcode.toString(16)}`);
    }
  }

  private handleEncodedPacket(data: Buffer): void {
    // Decode XOR encoding if needed
    // Note: 0xFFFFFFFF means no encoding, any other value (including 0) means encoding is enabled
    let decoded = data;
    if (this.encodeKey !== 0xFFFFFFFF) {
      decoded = this.decodePacket(data);
    }

    // Check for zlib compression - common headers are 0x5a or 0x78
    // 0x78 is the default zlib compression header
    // 0x5a (ASCII 'Z') is also used as a compression marker
    if (decoded[0] === 0x5a || decoded[0] === 0x78) {
      // Compressed with zlib
      try {
        // For 0x5a, skip the marker byte; for 0x78, include it (it's part of zlib header)
        const zlibData = decoded[0] === 0x5a ? decoded.slice(1) : decoded;
        decoded = zlib.inflateSync(zlibData);
      } catch (e) {
        // Not actually compressed, or decompression failed
        // Try to process as regular session packet
        if (data[0] === 0x00 || data[1] < 0x20) {
          // Looks like session layer data
          // Avoid infinite recursion by not calling handlePacket on the same data
          return;
        }
        this.emit('debug', `Failed to decompress packet: ${(e as Error).message}`);
        return;
      }
    } else {
      // Not compressed, but if first byte isn't 0x00, this isn't a session packet
      // Avoid infinite recursion
      this.emit('debug', `Unknown encoded packet format: 0x${data[0].toString(16)}`);
      return;
    }

    // Process the decompressed data as session layer
    this.handlePacket(decoded);
  }

  private handleSessionResponse(data: Buffer): void {
    this.emit('debug', `SessionResponse raw (${data.length} bytes): [${data.toString('hex')}]`);

    if (data.length < 17) {
      this.emit('debug', `SessionResponse too short: ${data.length} bytes`);
      return;
    }

    // ReliableStreamConnectReply layout (17 bytes):
    // offset 0: zero (1 byte)
    // offset 1: opcode (1 byte) = 0x02
    // offset 2: connect_code (4 bytes BE) = session ID
    // offset 6: encode_key (4 bytes BE)
    // offset 10: crc_bytes (1 byte)
    // offset 11: max_packet_size (4 bytes BE)
    // offset 15: encode_pass1 (1 byte)
    // offset 16: encode_pass2 (1 byte)
    this.sessionId = data.readUInt32BE(2);
    this.encodeKey = data.readUInt32BE(6);
    this.crcBytes = data.readUInt8(10);
    this.maxPacketSize = data.readUInt32BE(11);
    this.encodePass1 = data.readUInt8(15);
    this.encodePass2 = data.readUInt8(16);

    // Fallback if maxPacketSize is invalid
    if (this.maxPacketSize === 0 || this.maxPacketSize > 10000) {
      this.emit('debug', `Invalid maxPacketSize ${this.maxPacketSize}, defaulting to 512`);
      this.maxPacketSize = 512;
    }

    this.state = SessionState.Connected;
    this.emit('connected');
    this.emit('debug', `Session established: id=0x${this.sessionId.toString(16)}, encodeKey=0x${this.encodeKey.toString(16)}, crc=${this.crcBytes}, maxPkt=${this.maxPacketSize}`);
  }

  private handleCombined(data: Buffer): void {
    // Combined packets contain multiple sub-packets
    // Sub-packets already include the 0x00 prefix byte
    let offset = 2;
    while (offset < data.length) {
      const subLen = data.readUInt8(offset);
      if (subLen === 0 || offset + 1 + subLen > data.length) break;

      const subPacket = data.slice(offset + 1, offset + 1 + subLen);
      // Sub-packets already have the session layer format (00 + opcode + data)
      this.handlePacket(subPacket);
      offset += 1 + subLen;
    }
  }

  private handleAppCombined(data: Buffer): void {
    // AppCombined (0x19) contains multiple APPLICATION layer packets
    // Format: [00][19][len1][app_opcode1+payload1][len2][app_opcode2+payload2]...
    // Unlike OP_Combined, these are NOT session layer packets
    let offset = 2;
    let count = 0;
    while (offset < data.length) {
      const subLen = data.readUInt8(offset);
      if (subLen === 0 || offset + 1 + subLen > data.length) break;

      const subPacket = data.slice(offset + 1, offset + 1 + subLen);
      // These are application packets (opcode LE + payload)
      // Process directly without going through session layer
      this.processAppPacket(subPacket);
      offset += 1 + subLen;
      count++;
    }
    this.emit('debug', `AppCombined: processed ${count} sub-packets`);
  }

  private handleReliable(data: Buffer, stream: number = 0): void {
    if (data.length < 4) return;

    const sequence = data.readUInt16BE(2);

    // Send ACK for the correct stream
    this.sendAck(sequence, stream);

    // Calculate sequence difference (handling wrap-around)
    const diff = (sequence - this.sequenceIn) & 0xFFFF;
    
    // If sequence is way ahead (but not wrapped around), accept it and update sequenceIn
    // This handles cases where packets were dropped or arrived out of order
    if (diff === 0) {
      // Expected sequence - process normally
      this.sequenceIn = (this.sequenceIn + 1) & 0xFFFF;
    } else if (diff < 1000) {
      // Ahead of expected but within reasonable range - accept and skip gap
      this.emit('debug', `Accepting packet ahead of sequence: got ${sequence}, expected ${this.sequenceIn}, gap=${diff}`);
      this.sequenceIn = (sequence + 1) & 0xFFFF;
    } else if (diff > 64000) {
      // This is actually behind us (wrapped around) - likely retransmission, ignore
      this.emit('debug', `Ignoring old packet: seq ${sequence}, current ${this.sequenceIn}`);
      return;
    } else {
      // Way out of range - something weird, log but try to process
      this.emit('debug', `Out of order packet: got ${sequence}, expected ${this.sequenceIn}`);
      return;
    }

    // Extract application packet
    const appData = data.slice(4);
    this.processAppPacket(appData);
  }

  // Fragment reassembly state (for uncompressed fragments)
  private fragmentTotalSize: number = 0;
  private fragmentData: Buffer[] = [];
  private fragmentSequenceStart: number = -1;
  private completedFragmentSequences: Set<number> = new Set();  // Track completed sequences to ignore retransmits
  private fragmentExpectedSequence: number = 0;

  // Compressed fragment reassembly state (for zone server compressed packets)
  private compressedFragmentTotal: number = 0;
  private compressedFragmentData: Buffer[] = [];
  private compressedFragmentSeq: number = -1;

  private handleFragment(data: Buffer, stream: number = 0): void {
    if (data.length < 4) return;

    // Check for compressed fragment: session_opcode(2) + 0x5a + 0x78...
    // 0x5a is EQ's compression marker, 0x78 is zlib header
    if (data.length >= 4 && data[2] === 0x5a && data[3] === 0x78) {
      try {
        const compressed = data.slice(3); // Skip session opcode and 0x5a marker
        const decompressed = zlib.inflateSync(compressed);

        // Decompressed format: [seq_BE 2 bytes][fragment_data...]
        if (decompressed.length < 2) return;

        const sequence = decompressed.readUInt16BE(0);
        const fragmentData = decompressed.slice(2);

        // ACK the sequence on the correct stream
        this.sendAck(sequence, stream);

        // Handle compressed fragment piece
        // Zone sends large structs (like PlayerProfile ~19KB) as multiple fragments
        // The sequence number may not be contiguous - zone uses its own numbering
        // First fragment: [seq 2][total_size 4 BE][app_data...]
        // Subsequent fragments: [seq 2][more_data...]

        // Try to detect first fragment by looking for valid totalSize header
        // Key insight: fragmented packets have totalSize > data in first fragment
        // If totalSize <= current data, it's a standalone packet
        if (this.compressedFragmentTotal === 0) {
          // No active assembly - check if this is a first fragment with size header
          if (fragmentData.length >= 4) {
            const potentialSize = fragmentData.readUInt32BE(0);
            const remainingData = fragmentData.length - 4; // Data after size header
            const opcodeIfStandalone = fragmentData.readUInt16LE(0);

            // A fragmented packet has totalSize > remainingData (needs more fragments)
            // And totalSize should be reasonable (< 100KB but > current data)
            // The key heuristic: fragments have size headers that are reasonable totals
            const looksLikeFragmentStart = potentialSize > remainingData &&
                                           potentialSize < 100000 &&
                                           potentialSize > 1000;  // Real fragments are usually > 1KB total

            // Only log for potential issues (standalone with garbage opcodes)
            if (!looksLikeFragmentStart && (opcodeIfStandalone === 0 || opcodeIfStandalone > 0x8000)) {
              this.emit('debug', `Fragment ISSUE: seq=${sequence}, len=${fragmentData.length}, potSize=${potentialSize}, opcode=0x${opcodeIfStandalone.toString(16)}`);
            }

            if (looksLikeFragmentStart) {
              // This is a first fragment - totalSize is larger than what we have
              this.compressedFragmentTotal = potentialSize;
              this.compressedFragmentData = [fragmentData.slice(4)];
              this.compressedFragmentSeq = sequence;
              this.emit('debug', `Compressed fragment START: seq=${sequence}, totalSize=${potentialSize}, firstData=${remainingData}bytes`);
            } else {
              // Standalone packet - either totalSize fits in one fragment or is invalid
              // Treat entire fragmentData as app packet (first 2 bytes are opcode)
              this.emit('debug', `Fragment STANDALONE: seq=${sequence}, len=${fragmentData.length}, opcode=0x${opcodeIfStandalone.toString(16)}`);
              this.processAppPacket(fragmentData);
            }
          } else {
            // Too short for size header - standalone
            this.processAppPacket(fragmentData);
          }
        } else {
          // Active assembly - add this fragment
          this.compressedFragmentData.push(fragmentData);
          this.compressedFragmentSeq = sequence;

          // Check if complete
          const currentSize = this.compressedFragmentData.reduce((sum, f) => sum + f.length, 0);
          // Only log completion, not every fragment add
          // this.emit('debug', `Fragment added: seq=${sequence}, parts=${this.compressedFragmentData.length}, current=${currentSize}/${this.compressedFragmentTotal}`);

          if (currentSize >= this.compressedFragmentTotal) {
            const complete = Buffer.concat(this.compressedFragmentData);
            const totalSize = this.compressedFragmentTotal;
            this.emit('debug', `Compressed fragment complete: ${this.compressedFragmentData.length} parts, ${totalSize} bytes`);

            // Reset fragment state
            this.compressedFragmentTotal = 0;
            this.compressedFragmentData = [];
            this.compressedFragmentSeq = -1;

            // Process the complete app packet (first 2 bytes are opcode)
            this.processAppPacket(complete.slice(0, totalSize));
          }
        }
      } catch (e) {
        this.emit('debug', `Decompress error: ${(e as Error).message}`);
      }
      return;
    }

    // Handle 0xa5 uncompressed marker
    if (data.length >= 3 && data[2] === 0xa5) {
      const sequence = 0; // Uncompressed packets may not have sequence
      this.sendAck(sequence, stream);
      const appData = data.slice(3);
      this.processAppPacket(appData);
      return;
    }

    // Normal uncompressed fragment (no 0x5a/0xa5 marker)
    const sequence = data.readUInt16BE(2);
    if (this.completedFragmentSequences.has(sequence)) return;
    this.sendAck(sequence, stream);

    const potentialTotalSize = data.length >= 8 ? data.readUInt32BE(4) : 0;
    const isFirstFragment = potentialTotalSize > 0 && potentialTotalSize < 1000000;

    if (this.fragmentTotalSize === 0 && isFirstFragment) {
      this.fragmentTotalSize = potentialTotalSize;
      this.fragmentSequenceStart = sequence;
      this.fragmentExpectedSequence = sequence;
      this.sequenceIn = (sequence + 1) & 0xFFFF;
      this.fragmentData = [data.slice(8)];
      this.emit('debug', `Fragment start: seq=${sequence}, total=${this.fragmentTotalSize}`);
    } else if (this.fragmentTotalSize > 0) {
      this.fragmentData.push(data.slice(4));
      this.fragmentExpectedSequence = sequence;
      this.sequenceIn = (sequence + 1) & 0xFFFF;
    } else {
      return;
    }

    const currentSize = this.fragmentData.reduce((sum, f) => sum + f.length, 0);
    if (currentSize >= this.fragmentTotalSize) {
      const complete = Buffer.concat(this.fragmentData);
      const totalSize = this.fragmentTotalSize;
      this.emit('debug', `Fragment complete: ${this.fragmentData.length} parts, ${totalSize} bytes`);

      for (let s = this.fragmentSequenceStart; ; s = (s + 1) & 0xFFFF) {
        this.completedFragmentSequences.add(s);
        if (s === this.fragmentExpectedSequence) break;
      }

      this.fragmentTotalSize = 0;
      this.fragmentData = [];
      this.fragmentSequenceStart = -1;
      this.fragmentExpectedSequence = 0;
      this.processAppPacket(complete.slice(0, totalSize));
    }
  }

  private handleAck(data: Buffer): void {
    if (data.length < 4) return;
    const sequence = data.readUInt16BE(2);
    this.emit('debug', `Received ACK for seq=${sequence}`);
    this.pendingPackets.delete(sequence);
  }

  private handleOutOfOrderAck(data: Buffer): void {
    if (data.length < 4) return;
    const sequence = data.readUInt16BE(2);
    // Mark as needing resend
    const pending = this.pendingPackets.get(sequence);
    if (pending) {
      this.sendRaw(pending.data);
    }
  }

  private handleDisconnect(): void {
    this.cleanup();
    this.state = SessionState.Closed;
    this.emit('disconnected');
  }

  private handleStatRequest(data: Buffer): void {
    // OP_SessionStatRequest: Server wants latency stats
    // We need to respond with proper session stats structure
    // Format: [0x00][opcode][16 bytes of stat data]
    const response = Buffer.alloc(18);
    response.writeUInt8(0x00, 0);
    response.writeUInt8(SessionOpcodes.OP_SessionStatResponse, 1);

    // Session stats structure (network byte order):
    // uint16 RequestID (echo from request if present)
    // uint32 last_local_delta
    // uint32 average_delta
    // uint32 low_delta
    // uint32 high_delta
    // uint32 last_remote_delta
    // uint64 packets_sent
    // uint64 packets_received

    // Write minimal stats (32-bit deltas in ms, network byte order)
    response.writeUInt16BE(0, 2);  // RequestID
    response.writeUInt32BE(50, 4); // last_local_delta (50ms)
    response.writeUInt32BE(50, 8); // average_delta
    response.writeUInt32BE(30, 12); // low_delta
    response.writeUInt32BE(100, 16); // high_delta

    this.sendRaw(response);
    this.emit('debug', 'Sent session stat response');
  }

  private processAppPacket(data: Buffer): void {
    if (data.length < 2) return;

    const opcode = data.readUInt16LE(0);
    const payload = data.slice(2);

    // Log ALL application opcodes in zone session for debugging
    this.emit('debug', `APP opcode: 0x${opcode.toString(16).padStart(4, '0')} (${data.length} bytes)`);

    // Debug suspicious opcodes (0x0, 0xffff, or any in the 0x3000-0x3100 range)
    if (opcode === 0 || opcode === 0xffff || (opcode >= 0x3000 && opcode <= 0x3100)) {
      const hex = data.slice(0, Math.min(64, data.length)).toString('hex');
      this.emit('debug', `SUSPICIOUS opcode 0x${opcode.toString(16)} (${data.length} bytes) raw: [${hex}]`);

      // Search for 0x0920 within this packet in case it's mis-aligned
      const target = Buffer.from([0x20, 0x09]); // 0x0920 in LE
      const idx = data.indexOf(target);
      if (idx >= 0) {
        this.emit('debug', `  -> Found 0x0920 at offset ${idx} within this packet!`);
      }
    }

    // Specifically look for OP_NewZone (0x0920)
    if (opcode === 0x0920) {
      this.emit('debug', `*** FOUND OP_NewZone 0x0920! (${data.length} bytes) ***`);
    }

    this.emit('packet', opcode, payload);
  }

  private sendReliable(data: Buffer): void {
    const packet = Buffer.alloc(4 + data.length + this.crcBytes);
    packet.writeUInt8(0x00, 0);
    packet.writeUInt8(SessionOpcodes.OP_Packet, 1);
    packet.writeUInt16BE(this.sequenceOut, 2);
    data.copy(packet, 4);

    // Add CRC
    if (this.crcBytes > 0) {
      const crc = this.calculateCRC(packet.slice(0, -this.crcBytes));
      if (this.crcBytes === 2) {
        packet.writeUInt16BE(crc, packet.length - 2);
      }
    }

    // Store for potential retry
    this.pendingPackets.set(this.sequenceOut, {
      sequence: this.sequenceOut,
      data: packet,
      timestamp: Date.now(),
      retries: 0,
    });

    this.sendRaw(this.encodePacket(packet));
    this.sequenceOut = (this.sequenceOut + 1) & 0xFFFF;
  }

  private sendFragmented(data: Buffer): void {
    const maxFragment = this.maxPacketSize - 12;
    const totalSize = data.length;
    let offset = 0;
    let firstFragment = true;

    while (offset < totalSize) {
      const fragSize = Math.min(maxFragment, totalSize - offset);
      const headerSize = firstFragment ? 8 : 4;
      const packet = Buffer.alloc(headerSize + fragSize + this.crcBytes);

      packet.writeUInt8(0x00, 0);
      packet.writeUInt8(SessionOpcodes.OP_Fragment, 1);
      packet.writeUInt16BE(this.sequenceOut, 2);

      if (firstFragment) {
        packet.writeUInt32BE(totalSize, 4);
        data.copy(packet, 8, offset, offset + fragSize);
        firstFragment = false;
      } else {
        data.copy(packet, 4, offset, offset + fragSize);
      }

      // Store and send
      this.pendingPackets.set(this.sequenceOut, {
        sequence: this.sequenceOut,
        data: packet,
        timestamp: Date.now(),
        retries: 0,
      });

      this.sendRaw(this.encodePacket(packet));
      this.sequenceOut = (this.sequenceOut + 1) & 0xFFFF;
      offset += fragSize;
    }
  }

  private sendAck(sequence: number, stream: number = 0): void {
    // ACKs need CRC if crcBytes > 0
    const packetLen = 4 + this.crcBytes;
    const ack = Buffer.alloc(packetLen);
    ack.writeUInt8(0x00, 0);

    // Use correct ACK opcode for the stream (0x15, 0x16, 0x17, 0x18)
    const ackOpcodes = [
      SessionOpcodes.OP_Ack,    // Stream 0: 0x15
      SessionOpcodes.OP_Ack2,   // Stream 1: 0x16
      SessionOpcodes.OP_Ack3,   // Stream 2: 0x17
      SessionOpcodes.OP_Ack4,   // Stream 3: 0x18
    ];
    ack.writeUInt8(ackOpcodes[stream] || SessionOpcodes.OP_Ack, 1);
    ack.writeUInt16BE(sequence, 2);

    // Add CRC if required
    if (this.crcBytes > 0) {
      const crc = this.calculateCRC(ack.slice(0, 4));
      if (this.crcBytes === 2) {
        ack.writeUInt16BE(crc, 4);
      }
      // Log first few ACKs to debug CRC
      if (sequence < 5) {
        this.emit('debug', `ACK seq=${sequence} stream=${stream} crc=0x${crc.toString(16)} encKey=0x${this.encodeKey.toString(16)} hex=[${ack.toString('hex')}]`);
      }
    }

    this.sendRaw(ack);
  }

  private sendRaw(data: Buffer): void {
    this.emit('debug', `Sending raw: ${data.length} bytes, hex=${data.toString('hex').substring(0, 60)}...`);

    if (this.useTcp && this.tcpSocket) {
      // TCP: prepend 2-byte length
      const lenBuf = Buffer.alloc(2);
      lenBuf.writeUInt16BE(data.length, 0);
      this.tcpSocket.write(Buffer.concat([lenBuf, data]));
    } else if (this.udpSocket) {
      // UDP: send directly
      this.udpSocket.send(data, this.port, this.host);
    }
  }

  private encodePacket(data: Buffer): Buffer {
    // 0 or 0xFFFFFFFF means no encoding
    if (this.encodeKey === 0 || this.encodeKey === 0xFFFFFFFF) return data;

    const encoded = Buffer.from(data);
    // Simple XOR encoding based on EQEmu implementation
    // This is a simplified version - full implementation would match EQEmu exactly
    for (let i = 2; i < encoded.length; i++) {
      encoded[i] ^= this.encodeKey & 0xFF;
    }
    return encoded;
  }

  private decodePacket(data: Buffer): Buffer {
    // 0 or 0xFFFFFFFF means no encoding
    if (this.encodeKey === 0 || this.encodeKey === 0xFFFFFFFF) return data;

    const decoded = Buffer.from(data);
    for (let i = 2; i < decoded.length; i++) {
      decoded[i] ^= this.encodeKey & 0xFF;
    }
    return decoded;
  }

  // CRC32 table (Ethernet polynomial 0xEDB88320)
  private static CRC32_TABLE: number[] = [
    0x00000000, 0x77073096, 0xEE0E612C, 0x990951BA,
    0x076DC419, 0x706AF48F, 0xE963A535, 0x9E6495A3,
    0x0EDB8832, 0x79DCB8A4, 0xE0D5E91E, 0x97D2D988,
    0x09B64C2B, 0x7EB17CBD, 0xE7B82D07, 0x90BF1D91,
    0x1DB71064, 0x6AB020F2, 0xF3B97148, 0x84BE41DE,
    0x1ADAD47D, 0x6DDDE4EB, 0xF4D4B551, 0x83D385C7,
    0x136C9856, 0x646BA8C0, 0xFD62F97A, 0x8A65C9EC,
    0x14015C4F, 0x63066CD9, 0xFA0F3D63, 0x8D080DF5,
    0x3B6E20C8, 0x4C69105E, 0xD56041E4, 0xA2677172,
    0x3C03E4D1, 0x4B04D447, 0xD20D85FD, 0xA50AB56B,
    0x35B5A8FA, 0x42B2986C, 0xDBBBC9D6, 0xACBCF940,
    0x32D86CE3, 0x45DF5C75, 0xDCD60DCF, 0xABD13D59,
    0x26D930AC, 0x51DE003A, 0xC8D75180, 0xBFD06116,
    0x21B4F4B5, 0x56B3C423, 0xCFBA9599, 0xB8BDA50F,
    0x2802B89E, 0x5F058808, 0xC60CD9B2, 0xB10BE924,
    0x2F6F7C87, 0x58684C11, 0xC1611DAB, 0xB6662D3D,
    0x76DC4190, 0x01DB7106, 0x98D220BC, 0xEFD5102A,
    0x71B18589, 0x06B6B51F, 0x9FBFE4A5, 0xE8B8D433,
    0x7807C9A2, 0x0F00F934, 0x9609A88E, 0xE10E9818,
    0x7F6A0DBB, 0x086D3D2D, 0x91646C97, 0xE6635C01,
    0x6B6B51F4, 0x1C6C6162, 0x856530D8, 0xF262004E,
    0x6C0695ED, 0x1B01A57B, 0x8208F4C1, 0xF50FC457,
    0x65B0D9C6, 0x12B7E950, 0x8BBEB8EA, 0xFCB9887C,
    0x62DD1DDF, 0x15DA2D49, 0x8CD37CF3, 0xFBD44C65,
    0x4DB26158, 0x3AB551CE, 0xA3BC0074, 0xD4BB30E2,
    0x4ADFA541, 0x3DD895D7, 0xA4D1C46D, 0xD3D6F4FB,
    0x4369E96A, 0x346ED9FC, 0xAD678846, 0xDA60B8D0,
    0x44042D73, 0x33031DE5, 0xAA0A4C5F, 0xDD0D7CC9,
    0x5005713C, 0x270241AA, 0xBE0B1010, 0xC90C2086,
    0x5768B525, 0x206F85B3, 0xB966D409, 0xCE61E49F,
    0x5EDEF90E, 0x29D9C998, 0xB0D09822, 0xC7D7A8B4,
    0x59B33D17, 0x2EB40D81, 0xB7BD5C3B, 0xC0BA6CAD,
    0xEDB88320, 0x9ABFB3B6, 0x03B6E20C, 0x74B1D29A,
    0xEAD54739, 0x9DD277AF, 0x04DB2615, 0x73DC1683,
    0xE3630B12, 0x94643B84, 0x0D6D6A3E, 0x7A6A5AA8,
    0xE40ECF0B, 0x9309FF9D, 0x0A00AE27, 0x7D079EB1,
    0xF00F9344, 0x8708A3D2, 0x1E01F268, 0x6906C2FE,
    0xF762575D, 0x806567CB, 0x196C3671, 0x6E6B06E7,
    0xFED41B76, 0x89D32BE0, 0x10DA7A5A, 0x67DD4ACC,
    0xF9B9DF6F, 0x8EBEEFF9, 0x17B7BE43, 0x60B08ED5,
    0xD6D6A3E8, 0xA1D1937E, 0x38D8C2C4, 0x4FDFF252,
    0xD1BB67F1, 0xA6BC5767, 0x3FB506DD, 0x48B2364B,
    0xD80D2BDA, 0xAF0A1B4C, 0x36034AF6, 0x41047A60,
    0xDF60EFC3, 0xA867DF55, 0x316E8EEF, 0x4669BE79,
    0xCB61B38C, 0xBC66831A, 0x256FD2A0, 0x5268E236,
    0xCC0C7795, 0xBB0B4703, 0x220216B9, 0x5505262F,
    0xC5BA3BBE, 0xB2BD0B28, 0x2BB45A92, 0x5CB36A04,
    0xC2D7FFA7, 0xB5D0CF31, 0x2CD99E8B, 0x5BDEAE1D,
    0x9B64C2B0, 0xEC63F226, 0x756AA39C, 0x026D930A,
    0x9C0906A9, 0xEB0E363F, 0x72076785, 0x05005713,
    0x95BF4A82, 0xE2B87A14, 0x7BB12BAE, 0x0CB61B38,
    0x92D28E9B, 0xE5D5BE0D, 0x7CDCEFB7, 0x0BDBDF21,
    0x86D3D2D4, 0xF1D4E242, 0x68DDB3F8, 0x1FDA836E,
    0x81BE16CD, 0xF6B9265B, 0x6FB077E1, 0x18B74777,
    0x88085AE6, 0xFF0F6A70, 0x66063BCA, 0x11010B5C,
    0x8F659EFF, 0xF862AE69, 0x616BFFD3, 0x166CCF45,
    0xA00AE278, 0xD70DD2EE, 0x4E048354, 0x3903B3C2,
    0xA7672661, 0xD06016F7, 0x4969474D, 0x3E6E77DB,
    0xAED16A4A, 0xD9D65ADC, 0x40DF0B66, 0x37D83BF0,
    0xA9BCAE53, 0xDEBB9EC5, 0x47B2CF7F, 0x30B5FFE9,
    0xBDBDF21C, 0xCABAC28A, 0x53B39330, 0x24B4A3A6,
    0xBAD03605, 0xCDD70693, 0x54DE5729, 0x23D967BF,
    0xB3667A2E, 0xC4614AB8, 0x5D681B02, 0x2A6F2B94,
    0xB40BBE37, 0xC30C8EA1, 0x5A05DF1B, 0x2D02EF8D
  ];

  // Calculate CRC16 using CRC32 method (EQEmu style)
  // The key is prepended to the data in little-endian order
  private calculateCRC(data: Buffer): number {
    // Prepend the encode key (in little-endian)
    const keyBuf = Buffer.alloc(4);
    keyBuf.writeUInt32LE(this.encodeKey >>> 0);

    // Calculate CRC32
    let crc = 0xFFFFFFFF;

    // Process key bytes first
    for (let i = 0; i < 4; i++) {
      crc = (crc >>> 8) ^ EQSession.CRC32_TABLE[(keyBuf[i] ^ (crc & 0xFF)) >>> 0];
    }

    // Process data bytes
    for (let i = 0; i < data.length; i++) {
      crc = (crc >>> 8) ^ EQSession.CRC32_TABLE[(data[i] ^ (crc & 0xFF)) >>> 0];
    }

    // Finalize (XOR with 0xFFFFFFFF) and take lower 16 bits
    crc = (~crc) >>> 0;
    return crc & 0xFFFF;
  }

  private startKeepAlive(): void {
    // Send immediate keepalive on connect (with CRC if required)
    this.sendKeepAlive();

    // Send every 1 second (zone servers have ~10sec timeout, stay well under)
    this.keepAliveInterval = setInterval(() => {
      this.sendKeepAlive();
    }, 1000);

    // Retry pending packets
    this.retryInterval = setInterval(() => {
      const now = Date.now();
      for (const [seq, pending] of this.pendingPackets) {
        if (now - pending.timestamp > 3000) {
          if (pending.retries < 15) {  // Increased from 5 to 15 for more tolerance
            pending.retries++;
            pending.timestamp = now;
            if (pending.retries % 5 === 0) {
              this.emit('debug', `Retrying packet seq=${seq} (attempt ${pending.retries})`);
            }
            this.sendRaw(pending.data);
          } else {
            // Too many retries - clear this one but don't disconnect immediately
            this.pendingPackets.delete(seq);
            this.emit('debug', `Dropped packet seq=${seq} after 15 retries`);
          }
        }
      }
    }, 1000);
  }

  private sendKeepAlive(): void {
    // Keepalives may need CRC like other packets
    const packetLen = 2 + this.crcBytes;
    const keepAlive = Buffer.alloc(packetLen);
    keepAlive.writeUInt8(0x00, 0);
    keepAlive.writeUInt8(SessionOpcodes.OP_KeepAlive, 1);

    // Add CRC if required
    if (this.crcBytes > 0) {
      const crc = this.calculateCRC(keepAlive.slice(0, 2));
      if (this.crcBytes === 2) {
        keepAlive.writeUInt16BE(crc, 2);
      }
    }

    this.sendRaw(keepAlive);
  }

  private cleanup(): void {
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = undefined;
    }
    if (this.retryInterval) {
      clearInterval(this.retryInterval);
      this.retryInterval = undefined;
    }
    this.pendingPackets.clear();
    this.fragmentBuffer.clear();

    if (this.udpSocket) {
      this.udpSocket.close();
    }
    if (this.tcpSocket) {
      this.tcpSocket.destroy();
    }
  }

  getState(): SessionState {
    return this.state;
  }
}
