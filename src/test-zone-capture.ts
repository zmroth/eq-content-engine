// Capture and analyze zone packets with detailed structure info
import { EQClient } from './client/eq-client';
import zlib from 'zlib';

const config = {
  loginHost: '127.0.0.1',
  loginPort: 5998,
  username: 'admin',
  password: 'admin',
};

async function main() {
  const client = new EQClient(config);
  const packets: { raw: string; decompressed?: string; analysis: string }[] = [];
  let packetCount = 0;

  client.on('debug', (msg) => {
    // Capture zone packet data
    if (msg.includes('Received:') && msg.includes('hex=')) {
      const hexMatch = msg.match(/hex=([a-f0-9]+)/);
      if (hexMatch) {
        const hex = hexMatch[1];
        const buf = Buffer.from(hex, 'hex');

        // Check if this is a compressed fragment (000d5a78...)
        if (buf.length >= 4 && buf[0] === 0x00 && buf[1] === 0x0d && buf[2] === 0x5a && buf[3] === 0x78) {
          packetCount++;
          if (packetCount <= 20) {  // Capture first 20 packets
            const analysis = analyzeCompressedPacket(buf, packetCount);
            console.log(analysis);
            packets.push({ raw: hex, ...analysis });
          }
        }
      }
    }

    // Show important debug messages
    if (msg.includes('Zone') || msg.includes('zone') || msg.includes('fragment') || msg.includes('Fragment')) {
      console.log('[DEBUG]', msg);
    }
  });

  client.on('error', (err) => {
    console.error('Error:', err.message);
  });

  try {
    console.log('Connecting to login server...');
    await client.connect();

    console.log('Waiting for character list...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    const characters = client.getCharacters();
    console.log('Characters:', characters.map((c: any) => c.name).join(', '));

    if (characters.length > 0) {
      const char = characters[0];
      console.log(`\nEntering world with ${char.name}...`);
      await client.enterWorld(char.name);

      console.log('\nWaiting for zone packets...');
      await new Promise(resolve => setTimeout(resolve, 8000));

      console.log('\n' + '='.repeat(80));
      console.log('PACKET SUMMARY:');
      console.log('='.repeat(80));
      console.log(`Captured ${packetCount} compressed zone packets`);
    }
  } catch (err) {
    console.error('Failed:', err);
  }

  process.exit(0);
}

function analyzeCompressedPacket(buf: Buffer, packetNum: number): { decompressed?: string; analysis: string } {
  let analysis = `\n=== Packet ${packetNum} ===\n`;
  analysis += `Raw length: ${buf.length} bytes\n`;
  analysis += `Raw hex (first 40): ${buf.slice(0, 40).toString('hex')}\n`;

  // Session layer
  analysis += `Session opcode: 0x${buf.readUInt16BE(0).toString(16)} (OP_Fragment)\n`;
  analysis += `Compression marker: 0x${buf[2].toString(16)} ('${String.fromCharCode(buf[2])}')\n`;
  analysis += `Zlib header: 0x${buf[3].toString(16)}\n`;

  try {
    // Skip 000d5a (session opcode + compression marker)
    const compressed = buf.slice(3);
    const decompressed = zlib.inflateSync(compressed);

    analysis += `\nDecompressed length: ${decompressed.length} bytes\n`;
    analysis += `Decompressed hex (first 60): ${decompressed.slice(0, 60).toString('hex')}\n`;

    // Analyze decompressed structure
    if (decompressed.length >= 2) {
      const seqBE = decompressed.readUInt16BE(0);
      const seqLE = decompressed.readUInt16LE(0);
      analysis += `\nSequence interpretation:\n`;
      analysis += `  bytes[0-1] as BE: ${seqBE}\n`;
      analysis += `  bytes[0-1] as LE: ${seqLE}\n`;
      analysis += `  byte[0]: ${decompressed[0]}, byte[1]: ${decompressed[1]}\n`;
    }

    if (decompressed.length >= 6) {
      const totalBE = decompressed.readUInt32BE(2);
      const totalLE = decompressed.readUInt32LE(2);
      analysis += `\nPotential total_size at offset 2:\n`;
      analysis += `  bytes[2-5] as BE: ${totalBE}\n`;
      analysis += `  bytes[2-5] as LE: ${totalLE}\n`;
    }

    if (decompressed.length >= 8) {
      const opcodeBE = decompressed.readUInt16BE(6);
      const opcodeLE = decompressed.readUInt16LE(6);
      analysis += `\nPotential opcode at offset 6:\n`;
      analysis += `  bytes[6-7] as BE: 0x${opcodeBE.toString(16)} (${opcodeBE})\n`;
      analysis += `  bytes[6-7] as LE: 0x${opcodeLE.toString(16)} (${opcodeLE})\n`;
    }

    // Check for non-zero data regions
    let firstNonZero = -1;
    for (let i = 2; i < decompressed.length; i++) {
      if (decompressed[i] !== 0) {
        firstNonZero = i;
        break;
      }
    }

    if (firstNonZero >= 0) {
      analysis += `\nFirst non-zero byte after seq: offset ${firstNonZero}\n`;
      analysis += `  Context: ${decompressed.slice(Math.max(0, firstNonZero - 2), firstNonZero + 10).toString('hex')}\n`;
    } else {
      analysis += `\nAll data after sequence is zeros!\n`;
    }

    // Count non-zero bytes
    let nonZeroCount = 0;
    for (let i = 2; i < decompressed.length; i++) {
      if (decompressed[i] !== 0) nonZeroCount++;
    }
    analysis += `Non-zero bytes in payload: ${nonZeroCount} / ${decompressed.length - 2}\n`;

    return { decompressed: decompressed.toString('hex'), analysis };
  } catch (e) {
    analysis += `\nDecompression failed: ${(e as Error).message}\n`;
    return { analysis };
  }
}

main().catch(console.error);
