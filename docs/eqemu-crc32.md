# EQEmu CRC32 Implementation

From EQEmu Server `common/net/crc32.cpp`

## CRC32 with encode_key

```cpp
int EQ::Crc32(const void * data, int size, int encode_key)
{
    int crc = 0xffffffff;

    // First, process the encode_key bytes (4 bytes, byte by byte from LSB to MSB)
    for (int i = 0; i < 4; ++i) {
        crc = ((crc >> 8) & 0x00FFFFFFL) ^ CRC32EncodeTable[(crc ^ ((encode_key >> (i * 8)) & 0xff)) & 0x000000FFL];
    }

    // Then process the actual data
    auto buffer = (const uint8_t *)data;
    for (int i = 0; i < size; ++i) {
        crc = ((crc >> 8) & 0x00FFFFFFL) ^ CRC32EncodeTable[(crc ^ *&buffer[i]) & 0x000000FFL];
    }

    return ~crc;
}
```

## Key Points:

1. **Initial CRC**: `0xffffffff`
2. **Key processing order**: LSB first (`(encode_key >> (i * 8)) & 0xff` for i=0,1,2,3)
   - i=0: byte 0 (bits 0-7) - LSB
   - i=1: byte 1 (bits 8-15)
   - i=2: byte 2 (bits 16-23)
   - i=3: byte 3 (bits 24-31) - MSB
3. **CRC table**: Standard Ethernet polynomial 0xEDB88320 (reflected)
4. **Finalization**: Invert result with `~crc`
5. **For CRC16**: Take lower 16 bits: `crc & 0xFFFF`

## CRC Table (first 16 entries)

```
0x00000000, 0x77073096, 0xEE0E612C, 0x990951BA,
0x076DC419, 0x706AF48F, 0xE963A535, 0x9E6495A3,
0x0EDB8832, 0x79DCB8A4, 0xE0D5E91E, 0x97D2D988,
0x09B64C2B, 0x7EB17CBD, 0xE7B82D07, 0x90BF1D91,
```

## TypeScript Equivalent

```typescript
calculateCRC(data: Buffer): number {
    let crc = 0xFFFFFFFF;

    // Process encode key bytes (LSB first)
    // Assuming encodeKey is stored as a number
    for (let i = 0; i < 4; i++) {
        const keyByte = (this.encodeKey >> (i * 8)) & 0xFF;
        crc = (crc >>> 8) ^ CRC32_TABLE[(crc ^ keyByte) & 0xFF];
    }

    // Process data bytes
    for (let i = 0; i < data.length; i++) {
        crc = (crc >>> 8) ^ CRC32_TABLE[(crc ^ data[i]) & 0xFF];
    }

    // Finalize and return lower 16 bits for CRC16
    return (~crc >>> 0) & 0xFFFF;
}
```

## ACK Packet with CRC

```
Offset  Size  Field
0       1     Zero (0x00)
1       1     Opcode (0x15 + stream_id)
2       2     Sequence (big-endian)
4       2     CRC16 (big-endian)
```

CRC is calculated over bytes 0-3, then appended as bytes 4-5.
