# EQ Headless Client - Current Status

## BREAKTHROUGH! (Dec 14, 22:30)

**World server connection is NOW WORKING!**

We successfully:
1. Connect to login server (127.0.0.1:5998)
2. Authenticate with admin/admin
3. Get account ID and session key
4. Connect to world server (127.0.0.1:9000)
5. Send OP_SendLoginInfo with correct 464-byte LoginInfo_Struct
6. Receive character list, guilds list, and world approval!

## What's Working

### 1. Login Server Connection - Fully Working
- Connect to 127.0.0.1:5998 (Titanium port)
- Session negotiation works (UDP reliable session)
- Authentication works (DES-CBC encrypted credentials)
- Server list received
- Server selection works
- Account ID and Session Key successfully extracted from OP_LoginAccepted

### 2. World Server Connection - NOW WORKING!
- Connect to 127.0.0.1:9000 (UDP)
- Session negotiation works
- OP_SendLoginInfo (0x4dd0) with 464-byte LoginInfo_Struct
- Fragment reassembly works (server sends large fragmented packets)

**Packets received from world server:**
- OP_ApproveWorld (0x3c25) - 544 bytes
- OP_SendCharInfo (0x4513) - 1704 bytes (CHARACTER LIST!)
- OP_GuildsList (0x6957) - 96064 bytes (huge packet)

## Key Technical Fixes

### Critical Fix: LoginInfo_Struct Size
The EQEmu source has confusing comments suggesting 488 bytes, but the actual struct size with `#pragma pack(1)` is **464 bytes**:
```c
struct LoginInfo {
    char   login_info[64];      // 64 bytes
    uint8  unknown064[124];     // 124 bytes
    uint8  zoning;              // 1 byte
    uint8  unknown189[275];     // 275 bytes
};                              // TOTAL: 464 bytes
```

This was causing the server to not recognize our client!

### Fixed Fragment Reassembly
The server sends large packets (like guilds list) as fragments. Our fragment handling was broken:
- First fragment has total_size at offset 4, data at offset 8
- Subsequent fragments have data at offset 4 (no total_size)
- All fragments share sequential sequence numbers

## Titanium Client Opcodes (Verified)

From patch_Titanium.conf:
```
OP_SendLoginInfo: 0x4dd0
OP_ApproveWorld: 0x3c25
OP_SendCharInfo: 0x4513
OP_GuildsList: 0x6957
OP_EnterWorld: 0x7cba
OP_MOTD: 0x295c
OP_ExpansionInfo: 0x7bb4
```

## Files Modified

- `/src/client/protocol/session.ts` - Fragment reassembly fixed
- `/src/client/protocol/packets.ts` - LoginInfo_Struct size fixed to 464 bytes
- `/src/client/protocol/opcodes.ts` - Updated Titanium opcodes
- `/src/client/eq-client.ts` - Main client

## Test Command
```bash
cd /home/zachroth/eq-content-engine
timeout 20 npx ts-node src/test-login.ts 2>&1 | grep -E "(World packet:|character|Character)"
```

## Server Config
- Login Server: 127.0.0.1:5998 (Titanium)
- World Server: 127.0.0.1:9000 (UDP)
- Docker container IP: 172.30.252.132
- Credentials: admin/admin

## Next Steps
1. Parse the character list properly
2. Implement EnterWorld packet to enter game
3. Connect to zone server
4. Create MUD command interface

## Architecture
```
┌─────────────────────────────────────────────────────────────┐
│              EQ Content Engine (TypeScript)                  │
├─────────────────────────────────────────────────────────────┤
│  src/client/                                                 │
│  ├── eq-client.ts           # Main client class             │
│  ├── protocol/                                               │
│  │   ├── session.ts         # UDP reliable session layer    │
│  │   ├── packets.ts         # Packet encode/decode          │
│  │   ├── opcodes.ts         # Titanium opcodes              │
│  │   └── crypto.ts          # DES-CBC for login             │
│  └── test-login.ts          # Test script                   │
└─────────────────────────────────────────────────────────────┘
```
