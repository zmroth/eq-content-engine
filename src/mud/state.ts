import { DatabaseClient } from '../api/database';

export interface PlayerState {
  id: string;
  name: string;
  zone: string;
  x: number;
  y: number;
  z: number;
}

export interface NpcInfo {
  id: number;
  name: string;
  level: number;
  race: number;
  class: number;
  x: number;
  y: number;
  z: number;
}

export interface ZoneInfo {
  short_name: string;
  long_name: string;
  safe_x: number;
  safe_y: number;
  safe_z: number;
}

export class GameState {
  private db: DatabaseClient;
  private players: Map<string, PlayerState> = new Map();

  constructor(db: DatabaseClient) {
    this.db = db;
  }

  // Player management
  createPlayer(id: string, name: string): PlayerState {
    const player: PlayerState = {
      id,
      name,
      zone: 'tutorial',
      x: 0,
      y: 0,
      z: 0,
    };
    this.players.set(id, player);
    return player;
  }

  getPlayer(id: string): PlayerState | undefined {
    return this.players.get(id);
  }

  removePlayer(id: string): void {
    this.players.delete(id);
  }

  // Zone management
  async getZoneInfo(shortName: string): Promise<ZoneInfo | null> {
    const result = await this.db.getZoneInfo(shortName);
    return result as ZoneInfo | null;
  }

  async listZones(): Promise<ZoneInfo[]> {
    const result = await this.db.listZones();
    return result as ZoneInfo[];
  }

  async movePlayerToZone(playerId: string, zone: string): Promise<boolean> {
    const player = this.players.get(playerId);
    if (!player) return false;

    const zoneInfo = await this.getZoneInfo(zone);
    if (!zoneInfo) return false;

    player.zone = zone;
    player.x = zoneInfo.safe_x || 0;
    player.y = zoneInfo.safe_y || 0;
    player.z = zoneInfo.safe_z || 0;

    return true;
  }

  movePlayer(playerId: string, x: number, y: number, z: number): boolean {
    const player = this.players.get(playerId);
    if (!player) return false;

    player.x = x;
    player.y = y;
    player.z = z;
    return true;
  }

  // NPC queries
  async getNpcsInZone(zone: string): Promise<NpcInfo[]> {
    const result = await this.db.getNpcsInZone(zone);
    return result as NpcInfo[];
  }

  async getNpcsNearPlayer(playerId: string, radius: number = 100): Promise<NpcInfo[]> {
    const player = this.players.get(playerId);
    if (!player) return [];

    const npcs = await this.getNpcsInZone(player.zone);

    // Filter by distance
    return npcs.filter(npc => {
      const dx = npc.x - player.x;
      const dy = npc.y - player.y;
      const dz = npc.z - player.z;
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
      return distance <= radius;
    });
  }

  // Spawn queries
  async getSpawnsInZone(zone: string) {
    return this.db.getSpawnsInZone(zone);
  }
}
