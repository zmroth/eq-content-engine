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

## EQEmu Documentation (Local)

Pre-extracted documentation from docs.eqemu.dev is available in the `/docs` folder:

| File | Content | Size |
|------|---------|------|
| `eqemu-docs-quest-api.md` | Quest API, Lua/Perl methods, constants | 614KB |
| `eqemu-docs-server.md` | Server setup, commands, operations | 1.9MB |
| `eqemu-docs-schema.md` | Database tables and schema | 345KB |
| `eqemu-docs-client.md` | Client files, zones, models | 951KB |
| `eqemu-docs-developer.md` | Development guides, conventions | 63KB |
| `eqemu-docs-all.md` | Complete combined documentation | 4MB |

**Use these files for context instead of fetching from the web.**

To regenerate docs from source: `node scripts/parse-docs.js`

## Project Structure

```
eq-content-engine/
├── docs/                         # Extracted EQEmu documentation (use for context)
├── scripts/                      # Build/parse scripts
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

### 1. MUD Client (The Main Thing!)
A complete text-based EverQuest experience:
- **Full zone entry** - Login → World → Zone server chain
- **Real spawn data** - Every NPC with actual coordinates
- **EQ-style commands** - /con, /target, /loc, /who, /say
- **ASCII & HTML maps** - Visualize the whole zone

### 2. Zone Visualization
- **zone-visualizer.ts** - Generates interactive HTML spawn maps
- **map-parser.ts** - Parses .map files for zone geometry (walls/floors)
- **In-game htmlmap command** - Generate maps while playing

### 3. LLM Content Generator (Beta)
- Generate NPCs from natural language descriptions
- Uses OpenRouter API (Claude, GPT-4, etc.)
- Outputs database-ready NPC stats and Lua quest scripts

## What's Working (as of Dec 2024)

- ✅ Login server authentication (UDP 5998)
- ✅ World server connection (UDP 9000)
- ✅ **Zone server connection** (compressed packet handling)
- ✅ **Fragment reassembly** (fixed sequence gap handling)
- ✅ Character list retrieval
- ✅ **Zone entry and spawn tracking**
- ✅ **Spawn coordinates** (bit-packed 19-bit parsing)
- ✅ **Player position tracking**
- ✅ **ASCII maps in terminal**
- ✅ **Interactive HTML maps**
- ✅ **Zone geometry parsing** (.map files)
- ✅ **Consider system** (EQ-style con colors)
- ✅ MUD commands: look, nearby, target, con, stats, who, spawns, loc, map, htmlmap

## Not Yet Working

- Movement packets (n/s/e/w direction commands placeholder)
- Combat packets (attack command placeholder)
- Chat sending to server (say/shout/ooc only display locally)
- Inventory display (placeholder)
- Spell casting

## How to Run

```bash
# The MUD Client (main interface)
npx ts-node src/mud-client.ts

# Generate HTML spawn map
npx ts-node src/zone-visualizer.ts

# Parse zone geometry
npx ts-node src/map-parser.ts /path/to/zone.map
```

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

## MUD Commands (EQ-Aligned)

| Command | EQ Equivalent | Description |
|---------|---------------|-------------|
| `play <name>` | Character Select | Enter world |
| `look [name]` | - | Look around or examine |
| `loc` | `/loc` | Show coordinates |
| `target <name>` | `/target` | Target NPC/player |
| `con [name]` | `/con` | Consider difficulty |
| `who` | `/who` | List players |
| `say <msg>` | `/say` | Say something |
| `shout <msg>` | `/shout` | Shout to zone |
| `ooc <msg>` | `/ooc` | Out-of-character |
| `stats` | Inventory window | Show character stats |
| `map` | In-game map | ASCII zone map |
| `htmlmap` | - | Generate HTML map |
| `nearby [dist]` | - | List spawns by distance |
| `n/s/e/w/u/d` | Movement keys | Move in direction |

## Technical Notes

### Fragment Reassembly (FIXED)
The key fix was in fragment sequence handling. Server sends compressed fragments with non-contiguous sequence numbers (0 → 40 jump). Fixed by detecting first fragment via `potentialSize > remainingData` instead of `sequence === 0`.

### Spawn Coordinate Parsing
Titanium Spawn_Struct uses 19-bit signed coordinates packed in 32-bit fields:
```typescript
// X at offset 94, Y at 98, Z at 102
let x = (data.readUInt32LE(offset + 94) >> 10) & 0x7FFFF;
if (x & 0x40000) x = x - 0x80000; // Sign extension
```

### Zone Opcodes
- `OP_ZoneSpawns: 0x2e78` (actual, not documented 0x0fa1)
- Fragment opcode: `0x0d`
- Compression marker: `0x5a` (zlib deflate)

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
