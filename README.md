# EQ Content Engine

A TypeScript headless client and LLM-powered content generation engine for EverQuest Emulator (EQEmu) servers.

## Overview

EQ Content Engine provides two main capabilities:

### 1. LLM-Based Content Generator (Beta)

Generate EverQuest content using natural language descriptions powered by AI:

- **NPC Generation** - Describe an NPC in plain English, get complete database-ready stats, dialogue, and Lua quest scripts
- **Automatic Spawning** - Generate and spawn NPCs directly into your EQEmu database
- **Dialogue & Quests** - AI-generated dialogue trees and Lua scripts for NPC interactions
- **OpenRouter Integration** - Uses Claude, GPT-4, or other models via OpenRouter API

```bash
eq> generate A wise old wizard who studies ancient magic in his tower

Generated NPC:
  Name: Aldric the Sage
  Level: 45
  Race: Human
  Class: Wizard
  Dialogue: "Ah, a visitor... Tell me, do you seek knowledge of the [arcane arts]?"
```

### 2. MUD-Style Read-Only Client

A text-based interface for connecting to EQEmu servers without the game client:

- **Headless Protocol** - Full Titanium-era UDP session layer implementation
- **Character Viewing** - See your character list and server status
- **CLI or Browser** - Use via terminal or web-based interface
- **Read-Only Safe** - Observer mode for server monitoring and testing

```
╔═══════════════════════════════════════════════════════════════════╗
║     ███████╗ ██████╗ ███████╗███╗   ███╗██╗   ██╗██████╗          ║
║     ██╔════╝██╔═══██╗██╔════╝████╗ ████║██║   ██║██╔══██╗         ║
║     █████╗  ██║   ██║█████╗  ██╔████╔██║██║   ██║██║  ██║         ║
║              H E A D L E S S   E Q   C L I E N T                  ║
╚═══════════════════════════════════════════════════════════════════╝
> connect admin password
Connecting to 127.0.0.1:5998...
Authentication successful!
```

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    EQ Content Engine (TypeScript)                   │
├─────────────────────────────────────────────────────────────────────┤
│  CONTENT GENERATION                                                 │
│  ├── src/api/openrouter.ts      # LLM API client (OpenRouter)      │
│  ├── src/api/spire.ts           # Spire API integration            │
│  ├── src/api/database.ts        # Direct MySQL queries             │
│  ├── src/content/npc-generator  # NPC generation from descriptions │
│  └── src/prompts/               # LLM prompt templates             │
├─────────────────────────────────────────────────────────────────────┤
│  HEADLESS CLIENT                                                    │
│  ├── src/client/eq-client.ts    # Main EQ client class             │
│  ├── src/client/protocol/                                          │
│  │   ├── session.ts             # UDP reliable session layer       │
│  │   ├── packets.ts             # Packet encode/decode             │
│  │   ├── opcodes.ts             # Titanium opcodes                 │
│  │   └── crypto.ts              # DES-CBC for login                │
│  └── src/client/mud/            # MUD text interface               │
├─────────────────────────────────────────────────────────────────────┤
│  INTERFACES                                                         │
│  ├── src/index.ts               # Content generator CLI            │
│  ├── src/mud-client.ts          # MUD client (CLI + WebSocket)     │
│  └── mud-client.html            # Browser-based MUD interface      │
└─────────────────────────────────────────────────────────────────────┘
```

## Installation

```bash
# Clone the repository
git clone https://github.com/zmroth/eq-content-engine.git
cd eq-content-engine

# Install dependencies
npm install

# Copy environment file and configure
cp .env.example .env
# Edit .env with your settings

# Build
npm run build
```

## Configuration

Create a `.env` file:

```env
# OpenRouter API (for LLM content generation)
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_MODEL=anthropic/claude-sonnet-4

# Spire API Configuration
SPIRE_API_URL=http://127.0.0.1:3000/api/v1

# Database Configuration (for content generation)
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=eqemu
DB_PASSWORD=your_db_password_here
DB_NAME=peq

# EQ Server (for MUD client)
EQ_LOGIN_HOST=127.0.0.1
EQ_LOGIN_PORT=5998
EQ_USERNAME=testuser
EQ_PASSWORD=testpass

# WebSocket Server
MUD_WS_PORT=8768
```

## Usage

### LLM Content Generator

```bash
# Start the content generator CLI
npm run dev

# Available commands:
eq> generate <description>                    # Generate NPC from description
eq> spawn <description> <zone> <x> <y> <z>   # Generate and spawn NPC
eq> zones                                     # List available zones
eq> npcs <zone>                              # List NPCs in a zone
eq> test                                      # Run test generation
eq> help                                      # Show help
```

**Example: Generate an NPC**
```bash
eq> generate A grizzled dwarven blacksmith who sells weapons

Generated NPC:
  Name: Thorin Ironforge
  Level: 25
  Race: Dwarf
  Class: Warrior
  HP: 2500
  Is Merchant: true
  Greeting: "Welcome to me forge! Looking for [weapons] or [armor]?"
```

**Example: Spawn an NPC**
```bash
eq> spawn A gnoll scout who patrols the hills qeynos 100 200 10

=== NPC Created Successfully ===
NPC ID: 150234
Name: Gnoll_Scout
Spawn Group ID: 45123
Spawn2 ID: 89012
```

### MUD Client

**Terminal Mode:**
```bash
npm run mud:cli
> connect username password
```

**Browser Mode:**
```bash
npm run mud
# Open mud-client.html in your browser
# Connect via WebSocket to ws://localhost:8768
```

**MUD Commands (post-connection):**
- `connect <user> <pass>` - Connect to EQ server
- `server <host> <port>` - Set login server
- `select <number>` - Select a server from list
- `play <name>` - Enter world with character
- `help` - Show available commands

## Scripts

| Command | Description |
|---------|-------------|
| `npm run build` | Compile TypeScript |
| `npm run dev` | Run content generator (dev mode) |
| `npm run mud` | Start MUD WebSocket server |
| `npm run mud:cli` | Start MUD in terminal mode |
| `npm run dev:mud` | MUD client (dev mode) |
| `npm test` | Run tests |

## Technical Details

### Protocol Implementation

The headless client implements the Titanium-era EQ protocol:

- **Login Server** - UDP port 5998, DES-CBC encrypted authentication
- **World Server** - UDP port 9000, session negotiation and fragment reassembly
- **464-byte LoginInfo_Struct** - Correct struct size for Titanium clients

### Verified Opcodes (Titanium)

```
OP_SendLoginInfo: 0x4dd0
OP_ApproveWorld:  0x3c25
OP_SendCharInfo:  0x4513
OP_GuildsList:    0x6957
OP_EnterWorld:    0x7cba
```

### LLM Integration

The content generator uses OpenRouter to access various LLM models:
- Extracts EQ-specific context (races, classes, zones) from the database
- Generates lore-appropriate names, stats, and dialogue
- Outputs database-ready NPC structures and Lua quest scripts

## Requirements

- Node.js 18+
- EQEmu server (for client features)
- MySQL database (for content generation)
- OpenRouter API key (for LLM features)

## Status

**Working:**
- Login server authentication
- World server connection
- Character list retrieval
- NPC generation from descriptions
- Automatic database insertion
- Lua script generation

**In Progress:**
- Zone server connection
- Full MUD command interface
- Item and quest generation

## License

MIT

## Acknowledgments

- [EQEmu](https://www.eqemulator.org/) - EverQuest Emulator project
- [Project EQ](https://projecteq.net/) - Database and tools
- [OpenRouter](https://openrouter.ai/) - LLM API access
