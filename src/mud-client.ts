// EQ MUD Client - Main Entry Point
// Text-based MUD client that connects to EQEmu server

import dotenv from 'dotenv';
import WebSocket, { WebSocketServer } from 'ws';
import readline from 'readline';
import { EQClient } from './client/eq-client';
import { MudInterface } from './client/mud/mud-interface';

dotenv.config();

const CONFIG = {
  loginHost: process.env.EQ_LOGIN_HOST || '127.0.0.1',
  loginPort: parseInt(process.env.EQ_LOGIN_PORT || '5998'),
  username: process.env.EQ_USERNAME || 'testuser',
  password: process.env.EQ_PASSWORD || 'testpass',
  wsPort: parseInt(process.env.MUD_WS_PORT || '8768'),
};

class MudServer {
  private wss: WebSocketServer;
  private client?: EQClient;
  private mud?: MudInterface;
  private wsClients: Set<WebSocket> = new Set();

  constructor(port: number) {
    this.wss = new WebSocketServer({ port });
    this.setupWebSocket();
    this.printBanner();
  }

  private printBanner(): void {
    console.log(`
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║     ███████╗ ██████╗ ███████╗███╗   ███╗██╗   ██╗██████╗          ║
║     ██╔════╝██╔═══██╗██╔════╝████╗ ████║██║   ██║██╔══██╗         ║
║     █████╗  ██║   ██║█████╗  ██╔████╔██║██║   ██║██║  ██║         ║
║     ██╔══╝  ██║▄▄ ██║██╔══╝  ██║╚██╔╝██║██║   ██║██║  ██║         ║
║     ███████╗╚██████╔╝███████╗██║ ╚═╝ ██║╚██████╔╝██████╔╝         ║
║     ╚══════╝ ╚══▀▀═╝ ╚══════╝╚═╝     ╚═╝ ╚═════╝ ╚═════╝          ║
║                                                                   ║
║              H E A D L E S S   E Q   C L I E N T                  ║
║                                                                   ║
╠═══════════════════════════════════════════════════════════════════╣
║  WebSocket Server: ws://localhost:${CONFIG.wsPort}                        ║
║  Login Server: ${CONFIG.loginHost}:${CONFIG.loginPort}                              ║
╚═══════════════════════════════════════════════════════════════════╝
`);
  }

  private setupWebSocket(): void {
    this.wss.on('connection', (ws) => {
      console.log('[MUD] Client connected');
      this.wsClients.add(ws);

      // Send welcome
      this.sendToClient(ws, {
        type: 'welcome',
        message: this.getWelcomeScreen(),
      });

      ws.on('message', (data) => {
        const input = data.toString().trim();
        this.handleInput(ws, input);
      });

      ws.on('close', () => {
        console.log('[MUD] Client disconnected');
        this.wsClients.delete(ws);
      });
    });
  }

  private getWelcomeScreen(): string {
    return `
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║     ███████╗ ██████╗ ███████╗███╗   ███╗██╗   ██╗██████╗          ║
║     ██╔════╝██╔═══██╗██╔════╝████╗ ████║██║   ██║██╔══██╗         ║
║     █████╗  ██║   ██║█████╗  ██╔████╔██║██║   ██║██║  ██║         ║
║     ██╔══╝  ██║▄▄ ██║██╔══╝  ██║╚██╔╝██║██║   ██║██║  ██║         ║
║     ███████╗╚██████╔╝███████╗██║ ╚═╝ ██║╚██████╔╝██████╔╝         ║
║     ╚══════╝ ╚══▀▀═╝ ╚══════╝╚═╝     ╚═╝ ╚═════╝ ╚═════╝          ║
║                                                                   ║
║              H E A D L E S S   E Q   C L I E N T                  ║
║                                                                   ║
╠═══════════════════════════════════════════════════════════════════╣
║  Welcome to EverQuest MUD!                                        ║
║                                                                   ║
║  Commands:                                                        ║
║    connect <user> <pass>  - Connect to EQ server                  ║
║    help                   - Show all commands                     ║
║                                                                   ║
║  Note: This is a TEXT-BASED client. No graphics required!         ║
╚═══════════════════════════════════════════════════════════════════╝
`;
  }

  private handleInput(ws: WebSocket, input: string): void {
    const parts = input.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    // Pre-connection commands
    if (!this.client || !this.mud) {
      switch (cmd) {
        case 'connect':
          if (args.length >= 2) {
            this.connect(ws, args[0], args[1]);
          } else {
            this.sendToClient(ws, {
              type: 'error',
              message: 'Usage: connect <username> <password>',
            });
          }
          return;

        case 'help':
          this.sendToClient(ws, {
            type: 'info',
            message: `
Pre-Connection Commands:
  connect <user> <pass>  - Connect to EQ server
  server <host> <port>   - Set login server (default: ${CONFIG.loginHost}:${CONFIG.loginPort})
  help                   - Show this help
`,
          });
          return;

        case 'server':
          if (args.length >= 2) {
            CONFIG.loginHost = args[0];
            CONFIG.loginPort = parseInt(args[1]);
            this.sendToClient(ws, {
              type: 'info',
              message: `Login server set to ${CONFIG.loginHost}:${CONFIG.loginPort}`,
            });
          }
          return;

        default:
          this.sendToClient(ws, {
            type: 'info',
            message: 'Not connected. Use "connect <username> <password>" to connect.',
          });
          return;
      }
    }

    // Pass to MUD interface
    this.mud.processCommand(input);
  }

  private async connect(ws: WebSocket, username: string, password: string): Promise<void> {
    this.sendToClient(ws, {
      type: 'status',
      message: `\nConnecting to ${CONFIG.loginHost}:${CONFIG.loginPort}...`,
    });

    try {
      this.client = new EQClient({
        loginHost: CONFIG.loginHost,
        loginPort: CONFIG.loginPort,
        username,
        password,
      });

      this.mud = new MudInterface(this.client);

      // Forward MUD output to WebSocket clients
      this.mud.on('output', (data) => {
        this.broadcast(data);
      });

      // Forward client events
      this.client.on('debug', (msg) => {
        console.log(`[DEBUG] ${msg}`);
      });

      this.client.on('serverList', (servers) => {
        let msg = '\nAvailable Servers:\n';
        servers.forEach((s: any, i: number) => {
          msg += `  ${i + 1}. ${s.name} (${s.players} players)\n`;
        });
        msg += '\nUse "select <number>" to choose a server.';
        this.broadcast({ type: 'serverList', message: msg });
      });

      this.client.on('characterList', (chars) => {
        let msg = '\nYour Characters:\n';
        if (chars.length === 0) {
          msg += '  No characters yet. Use "create" to make one.\n';
        } else {
          chars.forEach((c: any, i: number) => {
            msg += `  ${i + 1}. ${c.name} - Level ${c.level} ${c.class}\n`;
          });
        }
        msg += '\nUse "play <name>" to enter the world.';
        this.broadcast({ type: 'characterList', message: msg });
      });

      await this.client.connect();

    } catch (error) {
      this.sendToClient(ws, {
        type: 'error',
        message: `Connection failed: ${error}`,
      });
      this.client = undefined;
      this.mud = undefined;
    }
  }

  private sendToClient(ws: WebSocket, data: any): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  }

  private broadcast(data: any): void {
    const msg = JSON.stringify(data);
    for (const ws of this.wsClients) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(msg);
      }
    }
  }
}

// CLI Mode (for direct terminal use)
async function runCLI(): Promise<void> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log(`
╔═══════════════════════════════════════════════════════════════════╗
║  EQ MUD - Terminal Mode                                           ║
║  Type "connect <username> <password>" to begin                    ║
╚═══════════════════════════════════════════════════════════════════╝
`);

  let client: EQClient | undefined;
  let mud: MudInterface | undefined;

  const prompt = () => {
    rl.question('> ', async (input) => {
      const parts = input.trim().split(/\s+/);
      const cmd = parts[0]?.toLowerCase();
      const args = parts.slice(1);

      if (!client && cmd === 'connect' && args.length >= 2) {
        try {
          client = new EQClient({
            loginHost: CONFIG.loginHost,
            loginPort: CONFIG.loginPort,
            username: args[0],
            password: args[1],
          });

          mud = new MudInterface(client);
          mud.on('output', ({ text }) => console.log(text));

          console.log('Connecting...');
          await client.connect();
        } catch (e) {
          console.log(`Connection failed: ${e}`);
          client = undefined;
          mud = undefined;
        }
      } else if (mud) {
        mud.processCommand(input);
      } else if (cmd === 'quit' || cmd === 'exit') {
        rl.close();
        process.exit(0);
      } else {
        console.log('Not connected. Use: connect <username> <password>');
      }

      prompt();
    });
  };

  prompt();
}

// Main
async function main(): Promise<void> {
  const mode = process.argv[2];

  if (mode === 'cli') {
    await runCLI();
  } else {
    // WebSocket server mode
    new MudServer(CONFIG.wsPort);
    console.log(`\n[MUD] WebSocket server running on port ${CONFIG.wsPort}`);
    console.log('[MUD] Open mud-client.html in browser or use: node dist/mud-client.js cli');
  }
}

main().catch(console.error);
