import { spawn } from 'child_process';
import WebSocket, { WebSocketServer } from 'ws';
import { EventEmitter } from 'events';

interface GameEvent {
  ts: number;
  type: string;
  zone: string;
  data: any;
}

export class ServerBridge extends EventEmitter {
  private logWatcher: any;
  private zone: string;

  constructor(zone: string = 'qeynos') {
    super();
    this.zone = zone;
  }

  startWatching(): void {
    const logPath = `/home/eqemu/server/logs/mud_events/${this.zone}.log`;

    // Use docker exec to tail the log file
    this.logWatcher = spawn('docker', [
      'exec', 'akk-stack_eqemu-server_1',
      'tail', '-f', '-n', '0', logPath
    ]);

    this.logWatcher.stdout.on('data', (data: Buffer) => {
      const lines = data.toString().split('\n').filter(l => l.trim());
      for (const line of lines) {
        try {
          const event: GameEvent = JSON.parse(line);
          this.emit('gameEvent', event);
        } catch {
          // Skip malformed lines
        }
      }
    });

    this.logWatcher.stderr.on('data', (data: Buffer) => {
      console.error('Log watcher error:', data.toString());
    });

    console.log(`Watching events for zone: ${this.zone}`);
  }

  stop(): void {
    if (this.logWatcher) {
      this.logWatcher.kill();
    }
  }
}

export class RealMudServer {
  private wss: WebSocketServer;
  private bridge: ServerBridge;
  private clients: Map<string, WebSocket> = new Map();

  constructor(port: number, zone: string = 'qeynos') {
    this.bridge = new ServerBridge(zone);
    this.wss = new WebSocketServer({ port });

    this.setupBridge();
    this.setupWebSocket();

    console.log(`\n========================================`);
    console.log(`  EQ MUD - Real Server Bridge`);
    console.log(`  Zone: ${zone}`);
    console.log(`  WebSocket: ws://localhost:${port}`);
    console.log(`========================================\n`);
  }

  private setupBridge(): void {
    this.bridge.on('gameEvent', (event: GameEvent) => {
      const message = this.formatEvent(event);
      if (message) {
        this.broadcast({ type: 'game_event', event: event.type, message });
      }
    });

    this.bridge.startWatching();
  }

  private formatEvent(event: GameEvent): string | null {
    switch (event.type) {
      case 'player_enter':
        return `\n>>> ${event.data.player} enters the zone at (${Math.round(event.data.x)}, ${Math.round(event.data.y)}, ${Math.round(event.data.z)})`;

      case 'player_say':
        return `\n${event.data.player} says, '${event.data.message}'`;

      case 'player_death':
        return `\n*** ${event.data.player} has been slain by ${event.data.killer}! ***`;

      case 'npc_say':
        return `\n${event.data.npc} says, '${event.data.message}'`;

      case 'npc_spawn':
        return `\n[${event.data.npc} has spawned]`;

      default:
        return null;
    }
  }

  private setupWebSocket(): void {
    this.wss.on('connection', (ws) => {
      const clientId = Math.random().toString(36).substring(7);
      this.clients.set(clientId, ws);

      this.send(ws, {
        type: 'welcome',
        message: `
========================================
  EQ MUD - Live Server Connection
  Zone: qeynos (South Qeynos)
========================================

You are connected to the REAL EQ server.
Events from the game will appear here.

In your EQ client (as Alexandros):
  - Zone to qeynos: #zone qeynos
  - Go to Grimbar: #goto 50 -100 3
  - Talk to him: /say hail

Your actions will appear here in real-time.

Commands:
  /look - Show area info
  /who  - Who's online (from DB)
  /loc  - Your last known location

========================================
`
      });

      ws.on('message', (data) => {
        this.handleCommand(clientId, data.toString());
      });

      ws.on('close', () => {
        this.clients.delete(clientId);
      });
    });
  }

  private async handleCommand(clientId: string, input: string): Promise<void> {
    const ws = this.clients.get(clientId);
    if (!ws) return;

    const cmd = input.trim().toLowerCase();

    if (cmd === '/look' || cmd === 'look') {
      this.send(ws, {
        type: 'response',
        message: `
=== South Qeynos ===
The bustling city of Qeynos stretches around you.
Stone buildings line the cobbled streets.

Notable NPCs nearby (around 50, -100, 3):
  - Grimbar Copperkettle (Dwarven Innkeeper)
  - Fibble Quickfingers (Halfling Fence)
  - Various guards and citizens

To interact, use your EQ client:
  /target Grimbar
  /say hail
`
      });
    } else if (cmd === '/who' || cmd === 'who') {
      this.send(ws, {
        type: 'response',
        message: `\nPlayers online: Check your EQ client with /who all`
      });
    } else if (cmd === '/help' || cmd === 'help') {
      this.send(ws, {
        type: 'response',
        message: `
Commands:
  /look  - Describe the area
  /who   - Who's online
  /help  - This message

This MUD displays real events from the EQ server.
Use your EQ client to actually play - actions there
will appear here.
`
      });
    } else {
      this.send(ws, {
        type: 'info',
        message: `\n[To do that, use your EQ client. Actions there will show here.]`
      });
    }
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
    this.bridge.stop();
    this.wss.close();
  }
}
