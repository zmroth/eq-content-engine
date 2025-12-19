# EQEmu Session Protocol Reference

## Session Response Packet (OP_SessionResponse = 0x02)

From `reliable_stream_structs.h` - **17 bytes total**:

```cpp
struct ReliableStreamConnectReply {
    uint8_t  zero;            // offset 0 - always 0x00
    uint8_t  opcode;          // offset 1 - 0x02 (OP_SessionResponse)
    uint32_t connect_code;    // offset 2 - session ID (network byte order)
    uint32_t encode_key;      // offset 6 - XOR encode key (network byte order)
    uint8_t  crc_bytes;       // offset 10 - CRC length (0, 2, or 4)
    uint32_t max_packet_size; // offset 11 - max packet size (network byte order)
    uint8_t  encode_pass1;    // offset 15 - encode pass 1 flag
    uint8_t  encode_pass2;    // offset 16 - encode pass 2 flag
};
```

**Byte order**: `HostToNetwork()` converts to big-endian for:
- connect_code
- encode_key
- max_packet_size

## Session Request Packet (OP_SessionRequest = 0x01)

```cpp
struct ReliableStreamConnect {
    uint8_t  zero;            // offset 0 - always 0x00
    uint8_t  opcode;          // offset 1 - 0x01 (OP_SessionRequest)
    uint32_t protocol_version;// offset 2 - typically 0x02 (network byte order)
    uint32_t connect_code;    // offset 6 - random session code (network byte order)
    uint32_t max_packet_size; // offset 10 - requested max size (network byte order)
};
```

## ACK Packet Format

```cpp
struct ReliableStreamReliableHeader {
    uint8_t  zero;     // offset 0 - always 0x00
    uint8_t  opcode;   // offset 1 - 0x15 + stream_id (0x15, 0x16, 0x17, 0x18)
    uint16_t sequence; // offset 2 - sequence number (network byte order)
};
```

Total ACK packet: 4 bytes + CRC bytes (usually 2) = 6 bytes

## Encoding Pipeline

Outgoing packets go through:
1. **CRC append** - using `Crc32(data, size, encode_key)`
2. **XOR encoding** (if encode_key != 0 && encode_key != 0xFFFFFFFF)
3. **Compression** (optional, for large packets)

**Important**: ACK packets likely skip XOR encoding but still need CRC!

## Timeout Values (defaults)

```
keepalive_delay_ms: 9000    // Server sends keepalive every 9 seconds
resend_timeout: 30000       // Close connection if oldest unACKed > 30 seconds
stale_connection_ms: 60000  // Mark idle after 60 seconds
resend_delay_ms: 30         // Initial resend delay
resend_delay_min: 150       // Minimum resend delay
resend_delay_max: 5000      // Maximum resend delay
```

## Why We Disconnect at 30 Seconds

The `resend_timeout` (30000ms) causes disconnection when:
1. Server sends us a packet
2. We (should) send an ACK
3. Server doesn't receive valid ACK
4. Server retries the packet
5. After 30 seconds of retrying without ACK, server calls Close()

Root cause is likely:
- Our ACKs have invalid CRC
- Our ACKs are XOR encoded when they shouldn't be
- Our ACKs aren't reaching the server
