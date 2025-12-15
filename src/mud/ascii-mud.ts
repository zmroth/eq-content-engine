import { spawn } from 'child_process';
import WebSocket, { WebSocketServer } from 'ws';
import { EventEmitter } from 'events';
import { DatabaseClient } from '../api/database';

interface GameEvent {
  ts: number;
  type: string;
  zone: string;
  data: any;
}

interface PlayerPosition {
  name: string;
  zone: string;
  x: number;
  y: number;
  z: number;
  level: number;
  class: string;
}

interface NpcData {
  id: number;
  name: string;
  level: number;
  x: number;
  y: number;
  z: number;
}

// ASCII Map Generator
class AsciiMap {
  private width = 40;
  private height = 20;

  generate(playerX: number, playerY: number, npcs: NpcData[], scale: number = 50): string {
    const map: string[][] = [];

    // Initialize empty map
    for (let y = 0; y < this.height; y++) {
      map[y] = [];
      for (let x = 0; x < this.width; x++) {
        map[y][x] = '·';
      }
    }

    // Add border
    for (let x = 0; x < this.width; x++) {
      map[0][x] = '─';
      map[this.height - 1][x] = '─';
    }
    for (let y = 0; y < this.height; y++) {
      map[y][0] = '│';
      map[y][this.width - 1] = '│';
    }
    map[0][0] = '┌';
    map[0][this.width - 1] = '┐';
    map[this.height - 1][0] = '└';
    map[this.height - 1][this.width - 1] = '┘';

    // Center of map
    const centerX = Math.floor(this.width / 2);
    const centerY = Math.floor(this.height / 2);

    // Plot NPCs relative to player
    for (const npc of npcs) {
      const relX = Math.round((npc.x - playerX) / scale) + centerX;
      const relY = Math.round((npc.y - playerY) / scale) + centerY;

      if (relX > 0 && relX < this.width - 1 && relY > 0 && relY < this.height - 1) {
        // Different symbols for different NPC types
        let symbol = 'n';
        if (npc.name.toLowerCase().includes('guard')) symbol = 'G';
        else if (npc.name.toLowerCase().includes('merchant')) symbol = 'M';
        else if (npc.name.toLowerCase().includes('rat') || npc.name.toLowerCase().includes('rodent')) symbol = 'r';
        else if (npc.level > 30) symbol = 'N';
        else if (npc.level > 10) symbol = 'n';
        else symbol = '·';

        map[relY][relX] = symbol;
      }
    }

    // Plot player at center
    map[centerY][centerX] = '@';

    // Add compass
    map[1][centerX] = 'N';
    map[this.height - 2][centerX] = 'S';
    map[centerY][2] = 'W';
    map[centerY][this.width - 3] = 'E';

    // Convert to string
    return map.map(row => row.join('')).join('\n');
  }
}

// Zone Descriptions
const ZONE_DESCRIPTIONS: { [key: string]: string } = {
  qeynos: `
╔════════════════════════════════════════════════════════════════╗
║                      SOUTH QEYNOS                              ║
╠════════════════════════════════════════════════════════════════╣
║  The southern district of the great city of Qeynos stretches   ║
║  before you. Cobblestone streets wind between sturdy stone     ║
║  buildings. Guards patrol the streets keeping the peace.       ║
║  The smell of baking bread mingles with the salt air from      ║
║  the nearby harbor.                                            ║
╚════════════════════════════════════════════════════════════════╝`,

  qeynos2: `
╔════════════════════════════════════════════════════════════════╗
║                      NORTH QEYNOS                              ║
╠════════════════════════════════════════════════════════════════╣
║  The northern gates of Qeynos loom ahead. Merchants hawk       ║
║  their wares from wooden stalls. The Temple of Life stands     ║
║  prominently, its white spires reaching toward the sky.        ║
╚════════════════════════════════════════════════════════════════╝`,

  befallen: `
╔════════════════════════════════════════════════════════════════╗
║                        BEFALLEN                                ║
╠════════════════════════════════════════════════════════════════╣
║  A chill runs down your spine as you enter this accursed       ║
║  crypt. The walls drip with moisture and the air smells of     ║
║  decay. Undead horrors lurk in every shadow. The faint         ║
║  sound of chanting echoes from somewhere below...              ║
╚════════════════════════════════════════════════════════════════╝`,
};

function getZoneDescription(zone: string): string {
  return ZONE_DESCRIPTIONS[zone] || `
╔════════════════════════════════════════════════════════════════╗
║  ${zone.toUpperCase().padEnd(60)}║
╠════════════════════════════════════════════════════════════════╣
║  You find yourself in an unfamiliar area.                      ║
╚════════════════════════════════════════════════════════════════╝`;
}

export class AsciiMudServer {
  private wss: WebSocketServer;
  private db: DatabaseClient;
  private clients: Map<string, WebSocket> = new Map();
  private players: Map<string, PlayerPosition> = new Map();
  private logWatcher: any;
  private asciiMap: AsciiMap;
  private combatLog: string[] = [];

  constructor(port: number, db: DatabaseClient) {
    this.db = db;
    this.asciiMap = new AsciiMap();
    this.wss = new WebSocketServer({ port });

    this.startLogWatcher();
    this.setupWebSocket();

    console.log(`
╔═══════════════════════════════════════════════════════════╗
║         EverQuest ASCII MUD - Live Server Bridge          ║
╠═══════════════════════════════════════════════════════════╣
║  WebSocket: ws://localhost:${port}                          ║
║  Watching:  All zones (global events)                     ║
╚═══════════════════════════════════════════════════════════╝
`);
  }

  private startLogWatcher(): void {
    this.logWatcher = spawn('docker', [
      'exec', 'akk-stack_eqemu-server_1',
      'tail', '-f', '-n', '0', '/home/eqemu/server/logs/mud_events/global.log'
    ]);

    this.logWatcher.stdout.on('data', (data: Buffer) => {
      const lines = data.toString().split('\n').filter(l => l.trim());
      for (const line of lines) {
        try {
          const event: GameEvent = JSON.parse(line);
          this.handleGameEvent(event);
        } catch { }
      }
    });
  }

  private handleGameEvent(event: GameEvent): void {
    const message = this.formatEvent(event);
    if (message) {
      this.broadcast({
        type: 'event',
        eventType: event.type,
        zone: event.zone,
        message,
        raw: event
      });
    }

    // Track player positions
    if (event.type === 'enter_zone' && event.data.player) {
      this.players.set(event.data.player, {
        name: event.data.player,
        zone: event.zone,
        x: event.data.x,
        y: event.data.y,
        z: event.data.z,
        level: event.data.level,
        class: event.data.class
      });

      // Send zone description
      this.broadcast({
        type: 'zone_enter',
        message: getZoneDescription(event.zone)
      });
    }

    // Track combat
    if (message && (event.type === 'damage' || event.type === 'combat_start' || event.type === 'npc_death' || event.type === 'player_death')) {
      this.combatLog.push(message);
      if (this.combatLog.length > 20) this.combatLog.shift();
    }
  }

  private formatEvent(event: GameEvent): string | null {
    const d = event.data;
    switch (event.type) {
      case 'enter_zone':
        return `\n>>> ${d.player} (Level ${d.level} ${d.class}) enters ${event.zone}`;

      case 'leave_zone':
        return `\n<<< ${d.player} leaves ${event.zone}`;

      case 'say':
        return `\n${d.player} says, '${d.message}'`;

      case 'player_death':
        return `\n*** ${d.player} has been SLAIN by ${d.killer}! ***`;

      case 'npc_death':
        return `\n${d.killer} has slain ${d.npc}!`;

      case 'npc_spawn':
        return `\n[${d.npc} (${d.level}) materializes nearby]`;

      case 'combat_start':
        return `\n⚔ ${d.npc} engages ${d.target} in combat!`;

      case 'damage':
        if (d.damage > 0) {
          return `  ${d.source} ${d.skill}s ${d.target} for ${d.damage} damage!`;
        }
        return null;

      case 'level_up':
        return `\n✧ ${d.player} has reached level ${d.level}! ✧`;

      case 'kill_npc':
        return `\n${d.player} has slain ${d.npc}!`;

      case 'loot':
        return `\n${d.player} loots ${d.item}`;

      case 'spell_cast':
        return `\n✨ ${d.caster} casts a spell on ${d.target}`;

      default:
        return null;
    }
  }

  private setupWebSocket(): void {
    this.wss.on('connection', async (ws) => {
      const clientId = Math.random().toString(36).substring(7);
      this.clients.set(clientId, ws);

      // Send welcome screen
      const welcome = `
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║     ███████╗ ██████╗ ███████╗███╗   ███╗██╗   ██╗                 ║
║     ██╔════╝██╔═══██╗██╔════╝████╗ ████║██║   ██║                 ║
║     █████╗  ██║   ██║█████╗  ██╔████╔██║██║   ██║                 ║
║     ██╔══╝  ██║▄▄ ██║██╔══╝  ██║╚██╔╝██║██║   ██║                 ║
║     ███████╗╚██████╔╝███████╗██║ ╚═╝ ██║╚██████╔╝                 ║
║     ╚══════╝ ╚══▀▀═╝ ╚══════╝╚═╝     ╚═╝ ╚═════╝                  ║
║                                                                   ║
║              A S C I I   M U D   I N T E R F A C E                ║
║                                                                   ║
╠═══════════════════════════════════════════════════════════════════╣
║  Connected to LIVE EverQuest server                               ║
║  Events from your game client will appear here in real-time       ║
╠═══════════════════════════════════════════════════════════════════╣
║  COMMANDS:                                                        ║
║    look, l     - Show zone description and map                    ║
║    map         - Show ASCII map of nearby NPCs                    ║
║    who         - Show tracked players                             ║
║    combat      - Show recent combat log                           ║
║    help        - Show all commands                                ║
╠═══════════════════════════════════════════════════════════════════╣
║  IN YOUR EQ CLIENT:                                               ║
║    #reloadquests                                                  ║
║    #zone qeynos                                                   ║
║    Walk around, fight, talk - it all shows here!                  ║
╚═══════════════════════════════════════════════════════════════════╝

`;
      this.send(ws, { type: 'welcome', message: welcome });

      ws.on('message', async (data) => {
        await this.handleCommand(clientId, data.toString().trim());
      });

      ws.on('close', () => {
        this.clients.delete(clientId);
      });
    });
  }

  private async handleCommand(clientId: string, input: string): Promise<void> {
    const ws = this.clients.get(clientId);
    if (!ws) return;

    const cmd = input.toLowerCase();

    if (cmd === 'look' || cmd === 'l') {
      await this.cmdLook(ws);
    } else if (cmd === 'map' || cmd === 'm') {
      await this.cmdMap(ws);
    } else if (cmd === 'who' || cmd === 'w') {
      this.cmdWho(ws);
    } else if (cmd === 'combat' || cmd === 'c') {
      this.cmdCombat(ws);
    } else if (cmd === 'help' || cmd === 'h' || cmd === '?') {
      this.cmdHelp(ws);
    } else if (input) {
      this.send(ws, {
        type: 'info',
        message: `\n[Use your EQ client to perform actions. Type 'help' for MUD commands.]`
      });
    }
  }

  private async cmdLook(ws: WebSocket): Promise<void> {
    // Find most recent player
    const players = Array.from(this.players.values());
    const player = players[players.length - 1];

    if (!player) {
      this.send(ws, {
        type: 'response',
        message: `\n[No player detected yet. Zone into the game first!]`
      });
      return;
    }

    // Get zone description
    let output = getZoneDescription(player.zone);

    // Get nearby NPCs from DB
    try {
      const npcs = await this.db.getNpcsInZone(player.zone) as NpcData[];
      const nearby = npcs.filter(npc => {
        const dist = Math.sqrt(
          Math.pow(npc.x - player.x, 2) +
          Math.pow(npc.y - player.y, 2)
        );
        return dist < 200;
      }).slice(0, 10);

      output += `\n\nYou are at (${Math.round(player.x)}, ${Math.round(player.y)}, ${Math.round(player.z)})\n`;
      output += `\n┌─────────────────────────────────────┐`;
      output += `\n│ NEARBY:                             │`;
      output += `\n├─────────────────────────────────────┤`;

      if (nearby.length === 0) {
        output += `\n│ The area appears empty.             │`;
      } else {
        for (const npc of nearby) {
          const dist = Math.round(Math.sqrt(
            Math.pow(npc.x - player.x, 2) +
            Math.pow(npc.y - player.y, 2)
          ));
          const line = ` ${npc.name} (${npc.level}) - ${dist}m`;
          output += `\n│${line.padEnd(37)}│`;
        }
      }
      output += `\n└─────────────────────────────────────┘`;

      // Add map
      output += `\n\n${this.asciiMap.generate(player.x, player.y, nearby)}`;
      output += `\n\nLegend: @ You  n NPC  G Guard  M Merchant  N Elite`;

    } catch (e) {
      output += `\n\n[Could not load NPC data]`;
    }

    this.send(ws, { type: 'response', message: output });
  }

  private async cmdMap(ws: WebSocket): Promise<void> {
    const players = Array.from(this.players.values());
    const player = players[players.length - 1];

    if (!player) {
      this.send(ws, { type: 'response', message: `\n[No player position known. Zone into the game!]` });
      return;
    }

    try {
      const npcs = await this.db.getNpcsInZone(player.zone) as NpcData[];
      const nearby = npcs.filter(npc => {
        const dist = Math.sqrt(Math.pow(npc.x - player.x, 2) + Math.pow(npc.y - player.y, 2));
        return dist < 500;
      });

      let output = `\n${player.zone.toUpperCase()} - Position: (${Math.round(player.x)}, ${Math.round(player.y)})\n\n`;
      output += this.asciiMap.generate(player.x, player.y, nearby, 30);
      output += `\n\nLegend: @ You  n NPC  G Guard  M Merchant  r critter  N Elite`;

      this.send(ws, { type: 'response', message: output });
    } catch (e) {
      this.send(ws, { type: 'response', message: `\n[Map error]` });
    }
  }

  private cmdWho(ws: WebSocket): void {
    let output = `\n┌─────────────────────────────────────┐`;
    output += `\n│ PLAYERS ONLINE                      │`;
    output += `\n├─────────────────────────────────────┤`;

    if (this.players.size === 0) {
      output += `\n│ No players detected yet.            │`;
    } else {
      for (const [name, p] of this.players) {
        const line = ` ${p.name} (${p.level} ${p.class}) - ${p.zone}`;
        output += `\n│${line.padEnd(37)}│`;
      }
    }
    output += `\n└─────────────────────────────────────┘`;

    this.send(ws, { type: 'response', message: output });
  }

  private cmdCombat(ws: WebSocket): void {
    let output = `\n┌─────────────────────────────────────────────┐`;
    output += `\n│ COMBAT LOG                                  │`;
    output += `\n├─────────────────────────────────────────────┤`;

    if (this.combatLog.length === 0) {
      output += `\n│ No recent combat.                           │`;
    } else {
      for (const line of this.combatLog.slice(-10)) {
        output += `\n│ ${line.substring(0, 43).padEnd(43)}│`;
      }
    }
    output += `\n└─────────────────────────────────────────────┘`;

    this.send(ws, { type: 'response', message: output });
  }

  private cmdHelp(ws: WebSocket): void {
    const help = `
╔═══════════════════════════════════════════════════════════════════╗
║                          COMMANDS                                 ║
╠═══════════════════════════════════════════════════════════════════╣
║  look, l    - Show zone description, nearby NPCs, and map         ║
║  map, m     - Show larger ASCII map of the area                   ║
║  who, w     - Show players currently tracked                      ║
║  combat, c  - Show recent combat log                              ║
║  help, h    - Show this help                                      ║
╠═══════════════════════════════════════════════════════════════════╣
║  This MUD displays REAL events from your EQ client.               ║
║  Play the game normally - everything shows here!                  ║
╚═══════════════════════════════════════════════════════════════════╝`;
    this.send(ws, { type: 'response', message: help });
  }

  private send(ws: WebSocket, data: any): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  }

  private broadcast(data: any): void {
    for (const ws of this.clients.values()) {
      this.send(ws, data);
    }
  }

  close(): void {
    if (this.logWatcher) this.logWatcher.kill();
    this.wss.close();
  }
}
