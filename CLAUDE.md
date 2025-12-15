# EQ Content Engine - Claude Instructions

## Project Overview

This is a TypeScript headless client and LLM-powered content generation engine for EverQuest Emulator (EQEmu) servers. It implements the **Titanium client protocol** for connecting to EQEmu servers without the game client.

## Server Environment

### EQEmu Server (Docker)
The EQEmu server runs locally in Docker:
- **Docker container IP:** 172.30.252.132
- **Login Server:** 127.0.0.1:5998 (Titanium port, UDP)
- **World Server:** 127.0.0.1:9000 (UDP)
- **Database:** MySQL on 127.0.0.1:3306
- **Spire API:** http://127.0.0.1:3000/api/v1
- **Test credentials:** admin/admin

### Titanium Client Protocol

This project implements the **Titanium-era EQ client protocol**:

**Critical: LoginInfo_Struct is 464 bytes (not 488)**
```c
struct LoginInfo {
    char   login_info[64];      // 64 bytes
    uint8  unknown064[124];     // 124 bytes
    uint8  zoning;              // 1 byte
    uint8  unknown189[275];     // 275 bytes
};                              // TOTAL: 464 bytes
```

**Titanium Opcodes (from patch_Titanium.conf):**
```
OP_SendLoginInfo: 0x4dd0
OP_ApproveWorld:  0x3c25
OP_SendCharInfo:  0x4513
OP_GuildsList:    0x6957
OP_EnterWorld:    0x7cba
OP_MOTD:          0x295c
OP_ExpansionInfo: 0x7bb4
```

**Protocol layers:**
- UDP reliable session with sequence numbers and ACKs
- DES-CBC encryption for login authentication
- Fragment reassembly for large packets (guild list can be 96KB+)

## Project Structure

```
eq-content-engine/
├── src/
│   ├── client/                    # Headless EQ client
│   │   ├── eq-client.ts          # Main client class
│   │   ├── protocol/
│   │   │   ├── session.ts        # UDP reliable session layer
│   │   │   ├── packets.ts        # Packet encode/decode (464-byte LoginInfo!)
│   │   │   ├── opcodes.ts        # Titanium opcodes
│   │   │   └── crypto.ts         # DES-CBC for login
│   │   ├── game/                 # Game state handling
│   │   └── mud/                  # MUD interface components
│   ├── api/
│   │   ├── openrouter.ts         # LLM API client
│   │   ├── spire.ts              # Spire API integration
│   │   └── database.ts           # Direct MySQL queries
│   ├── content/
│   │   └── npc-generator.ts      # NPC generation from descriptions
│   ├── prompts/                  # LLM prompt templates
│   ├── mud/                      # MUD server components
│   ├── index.ts                  # Content generator CLI entry
│   ├── mud-client.ts             # MUD client entry (CLI + WebSocket)
│   └── test-login.ts             # Protocol test script
├── dist/                         # Compiled JavaScript
├── .env                          # Environment config (not in git)
├── .env.example                  # Environment template
└── package.json
```

## Development Commands

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Content Generator (LLM-powered NPC generation)
npm run dev                       # Run with ts-node

# MUD Client
npm run mud                       # WebSocket server mode
npm run mud:cli                   # Terminal mode
npm run dev:mud                   # Dev mode with ts-node

# Test login connection
npx ts-node src/test-login.ts
timeout 20 npx ts-node src/test-login.ts 2>&1 | grep -E "(World packet:|character|Character)"
```

## Key Features

### 1. LLM Content Generator
- Generate NPCs from natural language descriptions
- Uses OpenRouter API (Claude, GPT-4, etc.)
- Outputs database-ready NPC stats and Lua quest scripts
- Can auto-spawn NPCs into the database

### 2. MUD Read-Only Client
- Text-based interface to EQEmu servers
- Connect and authenticate via Titanium protocol
- View character lists, server status
- CLI or browser-based (WebSocket)

## What's Working

- Login server authentication (UDP 5998)
- World server connection (UDP 9000)
- Session negotiation and fragment reassembly
- Character list retrieval
- NPC generation from descriptions
- Database insertion via Spire API

## In Progress

- Zone server connection
- EnterWorld packet implementation
- Full MUD command interface
- Item and quest generation

## Environment Variables

```env
# LLM (OpenRouter)
OPENROUTER_API_KEY=sk-or-...
OPENROUTER_MODEL=anthropic/claude-sonnet-4

# EQEmu Database
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=eqemu
DB_PASSWORD=eqemu
DB_NAME=peq

# Spire API
SPIRE_API_URL=http://127.0.0.1:3000/api/v1

# EQ Server (for MUD client)
EQ_LOGIN_HOST=127.0.0.1
EQ_LOGIN_PORT=5998

# WebSocket
MUD_WS_PORT=8768
```

## Technical Notes

### Fragment Reassembly
Large packets from the server (like OP_GuildsList at 96KB) are sent as fragments:
- First fragment: total_size at offset 4, data at offset 8
- Subsequent fragments: data at offset 4 (no total_size)
- All fragments share sequential sequence numbers

### Session Layer
UDP reliable session protocol:
- Session request/response handshake
- Sequence numbers for ordering
- ACKs for reliability
- Combined packets for efficiency

## References

- EQEmu source: https://github.com/EQEmu/Server
- Titanium opcodes: `utils/patches/patch_Titanium.conf` in EQEmu source
- Struct definitions: `common/eq_packet_structs.h`
