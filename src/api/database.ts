import mysql from 'mysql2/promise';

export interface DbConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

export class DatabaseClient {
  private pool: mysql.Pool;

  constructor(config: DbConfig) {
    this.pool = mysql.createPool({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      waitForConnections: true,
      connectionLimit: 10,
    });
  }

  async query<T>(sql: string, params?: any[]): Promise<T[]> {
    const [rows] = await this.pool.execute(sql, params);
    return rows as T[];
  }

  async getOne<T>(sql: string, params?: any[]): Promise<T | null> {
    const rows = await this.query<T>(sql, params);
    return rows[0] || null;
  }

  // Zone queries
  async getZoneInfo(shortName: string) {
    return this.getOne(
      'SELECT * FROM zone WHERE short_name = ?',
      [shortName]
    );
  }

  async listZones() {
    return this.query(
      'SELECT short_name, long_name, safe_x, safe_y, safe_z FROM zone ORDER BY short_name'
    );
  }

  // NPC queries
  async getNpcsInZone(zone: string) {
    return this.query(`
      SELECT nt.id, nt.name, nt.level, nt.race, nt.class, s2.x, s2.y, s2.z
      FROM npc_types nt
      JOIN spawnentry se ON se.npcID = nt.id
      JOIN spawn2 s2 ON s2.spawngroupID = se.spawngroupID
      WHERE s2.zone = ?
      LIMIT 100
    `, [zone]);
  }

  async getNpcById(id: number) {
    return this.getOne(
      'SELECT * FROM npc_types WHERE id = ?',
      [id]
    );
  }

  // Get next available NPC ID
  async getNextNpcId(): Promise<number> {
    const result = await this.getOne<{max_id: number}>(
      'SELECT MAX(id) as max_id FROM npc_types'
    );
    // Use a high range for custom NPCs to avoid conflicts
    return Math.max((result?.max_id || 0) + 1, 900000);
  }

  // Get next available spawn group ID
  async getNextSpawnGroupId(): Promise<number> {
    const result = await this.getOne<{max_id: number}>(
      'SELECT MAX(id) as max_id FROM spawngroup'
    );
    return Math.max((result?.max_id || 0) + 1, 900000);
  }

  // Get spawn info
  async getSpawnsInZone(zone: string) {
    return this.query(`
      SELECT s2.id, s2.x, s2.y, s2.z, s2.heading, s2.respawntime,
             sg.name as spawngroup_name, nt.name as npc_name, nt.level
      FROM spawn2 s2
      JOIN spawngroup sg ON sg.id = s2.spawngroupID
      JOIN spawnentry se ON se.spawngroupID = sg.id
      JOIN npc_types nt ON nt.id = se.npcID
      WHERE s2.zone = ?
      LIMIT 200
    `, [zone]);
  }

  // Race lookup
  async getRaceById(id: number) {
    return this.getOne(
      'SELECT * FROM races WHERE id = ?',
      [id]
    );
  }

  async listRaces() {
    return this.query(
      'SELECT id, name FROM races ORDER BY id LIMIT 100'
    );
  }

  // Class lookup
  async listClasses() {
    return this.query(
      'SELECT id, name FROM classes ORDER BY id'
    );
  }

  // Insert methods for content creation

  async insertNpcType(npc: {
    id: number;
    name: string;
    lastname?: string;
    level: number;
    race: number;
    class: number;
    hp: number;
    mana: number;
    gender?: number;
    size?: number;
    runspeed?: number;
    walkspeed?: number;
    hp_regen_rate?: number;
    mana_regen_rate?: number;
    mindmg?: number;
    maxdmg?: number;
    attack_speed?: number;
    aggroradius?: number;
    findable?: number;
    trackable?: number;
  }): Promise<number> {
    const sql = `
      INSERT INTO npc_types (
        id, name, lastname, level, race, class, hp, mana,
        gender, size, runspeed, walkspeed, hp_regen_rate, mana_regen_rate,
        mindmg, maxdmg, attack_speed, aggroradius, findable, trackable
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await this.pool.execute(sql, [
      npc.id,
      npc.name,
      npc.lastname || null,
      npc.level,
      npc.race,
      npc.class,
      npc.hp,
      npc.mana,
      npc.gender ?? 0,
      npc.size ?? 6,
      npc.runspeed ?? 1.25,
      npc.walkspeed ?? 0.6,
      npc.hp_regen_rate ?? Math.floor(npc.level / 2),
      npc.mana_regen_rate ?? Math.floor(npc.level / 2),
      npc.mindmg ?? Math.floor(npc.level * 0.5),
      npc.maxdmg ?? Math.floor(npc.level * 1.5),
      npc.attack_speed ?? 0,
      npc.aggroradius ?? 70,
      npc.findable ?? 1,
      npc.trackable ?? 1,
    ]);
    return npc.id;
  }

  async insertSpawnGroup(group: {
    id: number;
    name: string;
    spawn_limit?: number;
    dist?: number;
    delay?: number;
    despawn?: number;
    despawn_timer?: number;
  }): Promise<number> {
    const sql = `
      INSERT INTO spawngroup (id, name, spawn_limit, dist, delay, despawn, despawn_timer)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    await this.pool.execute(sql, [
      group.id,
      group.name,
      group.spawn_limit ?? 1,
      group.dist ?? 0,
      group.delay ?? 0,
      group.despawn ?? 0,
      group.despawn_timer ?? 100,
    ]);
    return group.id;
  }

  async insertSpawnEntry(entry: {
    spawngroupID: number;
    npcID: number;
    chance: number;
  }): Promise<void> {
    const sql = `
      INSERT INTO spawnentry (spawngroupID, npcID, chance)
      VALUES (?, ?, ?)
    `;
    await this.pool.execute(sql, [entry.spawngroupID, entry.npcID, entry.chance]);
  }

  async insertSpawn2(spawn: {
    spawngroupID: number;
    zone: string;
    x: number;
    y: number;
    z: number;
    heading?: number;
    respawntime?: number;
    variance?: number;
  }): Promise<number> {
    const nextIdResult = await this.getOne<{max_id: number}>(
      'SELECT MAX(id) as max_id FROM spawn2'
    );
    const nextId = Math.max((nextIdResult?.max_id || 0) + 1, 900000);

    const sql = `
      INSERT INTO spawn2 (id, spawngroupID, zone, version, x, y, z, heading, respawntime, variance)
      VALUES (?, ?, ?, 0, ?, ?, ?, ?, ?, ?)
    `;
    await this.pool.execute(sql, [
      nextId,
      spawn.spawngroupID,
      spawn.zone,
      spawn.x,
      spawn.y,
      spawn.z,
      spawn.heading ?? 0,
      spawn.respawntime ?? 300,
      spawn.variance ?? 0,
    ]);
    return nextId;
  }

  async close() {
    await this.pool.end();
  }
}
