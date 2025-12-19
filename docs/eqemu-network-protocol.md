# EQEmu Network Protocol Reference

Extracted from EQEmu Server source code for Titanium client protocol implementation.

## Session Layer Timeouts (reliable_stream_connection.h defaults)

```cpp
keepalive_delay_ms: 9000      // Server sends keepalive every 9 seconds
resend_timeout: 30000         // 30 seconds - closes connection if oldest unACKed packet exceeds this
stale_connection_ms: 60000    // 60 seconds idle timeout
connect_stale_ms: 5000        // 5 seconds connection establishment timeout
resend_delay_ms: 30           // Initial resend interval
resend_delay_factor: 1.25     // Exponential backoff multiplier
resend_delay_min: 150         // Min resend delay
resend_delay_max: 5000        // Max resend delay
```

## Session Opcodes

```cpp
OP_SessionRequest    = 0x01
OP_SessionResponse   = 0x02
OP_Combined          = 0x03
OP_SessionDisconnect = 0x05
OP_KeepAlive         = 0x06
OP_SessionStatRequest  = 0x07
OP_SessionStatResponse = 0x08

// Stream 0
OP_Packet     = 0x09
OP_Fragment   = 0x0d
OP_OutOfOrderAck = 0x11
OP_Ack        = 0x15

// Stream 1
OP_Packet2    = 0x0a
OP_Fragment2  = 0x0e
OP_OutOfOrderAck2 = 0x12
OP_Ack2       = 0x16

// Stream 2
OP_Packet3    = 0x0b
OP_Fragment3  = 0x0f
OP_OutOfOrderAck3 = 0x13
OP_Ack3       = 0x17

// Stream 3
OP_Packet4    = 0x0c
OP_Fragment4  = 0x10
OP_OutOfOrderAck4 = 0x14
OP_Ack4       = 0x18

OP_AppCombined = 0x19
OP_OutboundPing = 0x1c
```

## CRC Validation (reliable_stream_connection.cpp)

```cpp
bool ValidateCRC(Packet &p) {
    if (m_crc_bytes == 0U) return true;
    if (p.Length() < (size_t)m_crc_bytes) return false;

    char *data = (char*)p.Data();
    int calculated = 0, actual = 0;

    switch (m_crc_bytes) {
        case 2:
            // CRC is stored at end of packet in NETWORK byte order (big-endian)
            actual = NetworkToHost(*(int16_t*)&data[p.Length() - 2]) & 0xffff;
            // Crc32 uses encode_key as seed
            calculated = Crc32(data, p.Length() - 2, m_encode_key) & 0xffff;
            break;
        case 4:
            actual = NetworkToHost(*(int32_t*)&data[p.Length() - 4]);
            calculated = Crc32(data, p.Length() - 4, m_encode_key);
            break;
    }
    return actual == calculated;
}
```

## CRC Append (reliable_stream_connection.cpp)

```cpp
void AppendCRC(Packet &p) {
    if (m_crc_bytes == 0U) return;
    int calculated = 0;
    switch (m_crc_bytes) {
        case 2:
            calculated = Crc32(p.Data(), p.Length(), m_encode_key) & 0xffff;
            p.PutInt16(p.Length(), HostToNetwork((int16_t)calculated));
            break;
        case 4:
            calculated = Crc32(p.Data(), p.Length(), m_encode_key);
            p.PutInt32(p.Length(), HostToNetwork(calculated));
    }
}
```

## ACK Packet Format (reliable_stream_connection.cpp)

```cpp
struct ReliableStreamReliableHeader {
    uint8_t zero;      // Always 0x00
    uint8_t opcode;    // OP_Ack + stream_id (0x15, 0x16, 0x17, 0x18)
    uint16_t sequence; // Network byte order (big-endian)
};

void SendAck(int stream_id, uint16_t seq) {
    ReliableStreamReliableHeader ack;
    ack.zero = 0;
    ack.opcode = OP_Ack + stream_id;
    ack.sequence = HostToNetwork(seq);

    DynamicPacket p;
    p.PutSerialize(0, ack);
    InternalBufferedSend(p);  // Applies CRC before sending
}
```

## Resend Timeout Logic

```cpp
// In ProcessResend():
auto time_since_first_sent = std::chrono::duration_cast<std::chrono::milliseconds>(
    now - first_packet.first_sent).count();

if (time_since_first_sent >= m_owner->m_options.resend_timeout) {
    Close();  // Force close connection after 30 seconds of unACKed packets
    return;
}
```

## Linkdead Detection

```cpp
// In Process():
auto time_since_last_recv = std::chrono::duration_cast<std::chrono::milliseconds>(
    now - connection->m_last_recv);

// m_last_recv is updated when ProcessPacket() receives ANY valid data
if ((size_t)time_since_last_recv.count() > m_options.stale_connection_ms) {
    // 60 second idle timeout
}
```

## Encoding Pipeline

Two-pass encoding:
1. **Compression** (EncodeCompression) - optional zlib
2. **XOR Encoding** (EncodeXOR) - XOR with encode_key

Note: Session layer packets (ACKs, keepalives) may bypass XOR encoding but still need CRC.

## Key Insight for Our Disconnect Issue

The 30-second disconnect is caused by `resend_timeout`:
- Server sends us packets
- We send ACKs back
- If server doesn't receive valid ACKs, it keeps retrying
- After 30 seconds of retrying without ACK, server calls Close()

**Root cause**: Our ACKs are either:
1. Not being sent
2. Have invalid CRC
3. Are XOR encoded when they shouldn't be (or vice versa)
