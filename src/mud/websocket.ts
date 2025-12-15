import WebSocket, { WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { GameState } from './state';
import { CommandParser } from './commands';
import { NpcGenerator } from '../content/npc-generator';
import { DatabaseClient } from '../api/database';

interface Client {
  id: string;
  ws: WebSocket;
  name: string;
}

export class MudServer {
  private wss: WebSocketServer;
  private clients: Map<string, Client> = new Map();
  private state: GameState;
  private parser: CommandParser;

  constructor(
    port: number,
    db: DatabaseClient,
    npcGenerator: NpcGenerator
  ) {
    this.state = new GameState(db);
    this.parser = new CommandParser(this.state, npcGenerator);

    this.wss = new WebSocketServer({ port });

    this.wss.on('connection', (ws) => this.handleConnection(ws));

    console.log(`MUD WebSocket server listening on port ${port}`);
  }

  private handleConnection(ws: WebSocket): void {
    const clientId = uuidv4();
    const client: Client = {
      id: clientId,
      ws,
      name: `Player_${clientId.substring(0, 8)}`,
    };

    this.clients.set(clientId, client);

    // Create player state
    this.state.createPlayer(clientId, client.name);

    // Send welcome message
    this.send(ws, {
      type: 'welcome',
      message: `
====================================
  EQ Content Engine MUD Interface
====================================

Welcome, ${client.name}!

You find yourself in the tutorial zone.
Type 'help' for available commands.
Type 'zones' to see available zones.
Type 'zone <name>' to teleport.

> `,
    });

    ws.on('message', async (data) => {
      try {
        const message = data.toString().trim();
        await this.handleMessage(client, message);
      } catch (error) {
        this.send(ws, {
          type: 'error',
          message: `Error: ${error}`,
        });
      }
    });

    ws.on('close', () => {
      this.state.removePlayer(clientId);
      this.clients.delete(clientId);
      console.log(`Client ${clientId} disconnected`);
    });

    ws.on('error', (error) => {
      console.error(`WebSocket error for ${clientId}:`, error);
    });

    console.log(`Client ${clientId} connected`);
  }

  private async handleMessage(client: Client, message: string): Promise<void> {
    // Handle special commands
    if (message.startsWith('/name ')) {
      const newName = message.substring(6).trim();
      client.name = newName;
      this.send(client.ws, {
        type: 'system',
        message: `Your name is now ${newName}`,
      });
      return;
    }

    // Handle JSON commands (for LLM integration)
    if (message.startsWith('{')) {
      try {
        const cmd = JSON.parse(message);
        if (cmd.command) {
          message = cmd.command;
        }
      } catch {
        // Not JSON, treat as regular command
      }
    }

    // Execute command
    const result = await this.parser.execute(client.id, message);

    this.send(client.ws, {
      type: result.success ? 'response' : 'error',
      message: result.message,
      data: result.data,
    });
  }

  private send(ws: WebSocket, data: any): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  }

  broadcast(message: string, excludeId?: string): void {
    for (const [id, client] of this.clients) {
      if (id !== excludeId) {
        this.send(client.ws, {
          type: 'broadcast',
          message,
        });
      }
    }
  }

  close(): void {
    this.wss.close();
  }
}
