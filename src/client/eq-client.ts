// EverQuest Headless Client - Text-based MUD Interface
// Connects to EQEmu server and provides text interface

import { EventEmitter } from 'events';
import { EQSession, SessionState } from './protocol/session';
import { LoginOpcodes, WorldOpcodes, ZoneOpcodes, ChatChannels } from './protocol/opcodes';
import * as Packets from './protocol/packets';

export interface EQClientOptions {
  loginHost: string;
  loginPort: number;
  username: string;
  password: string;
}

export interface Entity {
  id: number;
  name: string;
  lastName: string;
  x: number;
  y: number;
  z: number;
  heading: number;
  level: number;
  race: number;
  class_: number;
  hp: number;
  maxHp: number;
  isNpc: boolean;
  isPet: boolean;
}

export interface ZoneInfo {
  shortName: string;
  longName: string;
  zoneId: number;
  safeX: number;
  safeY: number;
  safeZ: number;
}

export interface ServerInfo {
  id: number;
  name: string;
  ip: string;
  players: number;
  status: number;
}

export class EQClient extends EventEmitter {
  private options: EQClientOptions;
  private loginSession?: EQSession;
  private worldSession?: EQSession;
  private zoneSession?: EQSession;

  // Server list from login
  private servers: ServerInfo[] = [];
  private selectedServer?: ServerInfo;

  // Login server auth info (needed for world server)
  private lsAccountId: number = 0;
  private lsSessionKey: string = '';

  // Game state
  private characterName: string = '';
  private characterId: number = 0;
  private currentZone?: ZoneInfo;
  private entities: Map<number, Entity> = new Map();
  private targetId: number = 0;
  private mySpawnId: number = 0;
  private myPosition = { x: 0, y: 0, z: 0, heading: 0 };
  private isAutoAttacking: boolean = false;
  private characters: any[] = [];

  constructor(options: EQClientOptions) {
    super();
    this.options = options;
  }

  // ============= Connection Flow =============

  async connect(): Promise<void> {
    this.emit('status', 'Connecting to login server...');

    // Phase 1: Connect to login server
    this.loginSession = new EQSession({
      host: this.options.loginHost,
      port: this.options.loginPort,
    });

    this.setupLoginHandlers();

    try {
      await this.loginSession.connect();
      this.emit('status', 'Connected to login server');

      // Send login credentials
      await this.sendLogin();
    } catch (error) {
      this.emit('error', `Login failed: ${error}`);
      throw error;
    }
  }

  private setupLoginHandlers(): void {
    if (!this.loginSession) return;

    this.loginSession.on('packet', (opcode: number, data: Buffer) => {
      this.handleLoginPacket(opcode, data);
    });

    this.loginSession.on('error', (err) => {
      this.emit('error', `Login session error: ${err.message}`);
    });

    this.loginSession.on('disconnected', () => {
      this.emit('status', 'Disconnected from login server');
    });

    this.loginSession.on('debug', (msg) => {
      this.emit('debug', `[LOGIN] ${msg}`);
    });
  }

  private async sendLogin(): Promise<void> {
    if (!this.loginSession) return;

    // Step 1: Send session ready
    const sessionReady = Packets.encodeSessionReady();
    this.loginSession.send(LoginOpcodes.OP_SessionReady, sessionReady);
    this.emit('debug', 'Sent session ready');
  }

  private sendCredentials(): void {
    if (!this.loginSession) return;

    // Step 2: Send encrypted credentials
    const loginData = Packets.encodeLoginPacket(
      this.options.username,
      this.options.password
    );
    this.loginSession.send(LoginOpcodes.OP_Login, loginData);
    this.emit('debug', 'Sent login credentials');
  }

  private handleLoginPacket(opcode: number, data: Buffer): void {
    this.emit('debug', `Login packet: 0x${opcode.toString(16)} (${data.length} bytes)`);

    switch (opcode) {
      case LoginOpcodes.OP_ChatMessage:
        // Handshake reply - now send credentials
        this.emit('debug', 'Received handshake, sending credentials');
        this.sendCredentials();
        break;

      case LoginOpcodes.OP_LoginAccepted:
        // Decode response to get account ID and session key
        const loginResp = Packets.decodeLoginAccepted(data);
        if (loginResp) {
          this.lsAccountId = loginResp.accountId;
          this.lsSessionKey = loginResp.sessionKey;
          this.emit('status', `Login accepted (account ID: ${this.lsAccountId})`);
          this.emit('debug', `Session key: ${this.lsSessionKey}`);
        } else {
          this.emit('status', 'Login accepted');
        }
        // Request server list
        const serverListReq = Packets.encodeServerListRequest();
        this.loginSession?.send(LoginOpcodes.OP_ServerListRequest, serverListReq);
        break;

      case LoginOpcodes.OP_ServerListResponse:
        this.handleServerList(data);
        break;

      case LoginOpcodes.OP_PlayEverquestResponse:
        this.handlePlayResponse(data);
        break;

      case LoginOpcodes.OP_LoginFailed:
        this.emit('error', 'Login failed - invalid credentials');
        break;

      default:
        this.emit('debug', `Unhandled login opcode: 0x${opcode.toString(16)}`);
    }
  }

  private handleServerList(data: Buffer): void {
    // Parse server list
    const parsedServers = Packets.decodeServerListResponse(data);
    this.emit('status', `Received server list (${parsedServers.length} servers)`);

    // Store servers with IPs for later world connection
    this.servers = parsedServers.map((s, index) => ({
      id: s.serverId || index + 1,
      name: s.serverName,
      ip: s.ip,
      players: s.playerCount,
      status: s.serverStatus,
    }));

    // If no servers parsed, emit default for testing
    if (this.servers.length === 0) {
      this.servers = [{ name: 'Local Server', id: 1, ip: this.options.loginHost, players: 0, status: 0 }];
    }

    this.emit('serverList', this.servers);
  }

  private handlePlayResponse(data: Buffer): void {
    // Parse world server info
    const response = Packets.decodePlayResponse(data);
    if (response?.success) {
      this.emit('status', 'Server selection accepted');

      // Get world server connection info
      // Use login host (127.0.0.1) because Docker ports are published there
      // The Docker container IP (172.x.x.x) might not properly forward UDP
      const worldHost = this.options.loginHost;  // Use same host as login (127.0.0.1)
      const worldPort = 9000; // EQEmu world server client port (UDP)

      this.emit('debug', `Server IP from login: ${this.selectedServer?.ip || 'none'}`);
      this.emit('debug', `Using world server: ${worldHost}:${worldPort}`);
      this.emit('worldServerReady', { ...response, worldHost, worldPort });

      // Auto-connect to world server after delay
      // The login server needs time to notify the world server about our pending auth
      setTimeout(() => {
        this.connectToWorld(worldHost, worldPort).catch(err => {
          this.emit('error', `Failed to connect to world: ${err.message}`);
        });
      }, 1500);
    } else {
      this.emit('error', 'Failed to join server');
    }
  }

  // Select a server from the server list
  selectServer(serverNumber: number): void {
    if (!this.loginSession) return;

    // Find and store the selected server
    this.selectedServer = this.servers.find(s => s.id === serverNumber) || this.servers[serverNumber - 1];
    if (!this.selectedServer && this.servers.length > 0) {
      this.selectedServer = this.servers[0];
    }

    this.emit('debug', `Selected server: ${this.selectedServer?.name} (${this.selectedServer?.ip})`);

    const playReq = Packets.encodePlayRequest(serverNumber);
    this.loginSession.send(LoginOpcodes.OP_PlayEverquestRequest, playReq);
    this.emit('status', `Selecting server ${serverNumber}...`);
  }

  // ============= World Server =============

  async connectToWorld(host: string, port: number): Promise<void> {
    this.emit('status', `Connecting to world server at ${host}:${port} (UDP)...`);

    // World server uses UDP with same session layer as login
    this.worldSession = new EQSession({ host, port, useTcp: false });
    this.setupWorldHandlers();

    try {
      await this.worldSession.connect();
      this.emit('status', 'Connected to world server');

      // Send login info to world server
      this.sendWorldLoginInfo();
    } catch (error: any) {
      this.emit('error', `World server connection failed: ${error.message}`);
      throw error;
    }
  }

  private async connectWorldRawTcp(host: string, port: number): Promise<void> {
    const net = await import('net');

    return new Promise((resolve, reject) => {
      const socket = new net.Socket();

      socket.on('data', (data: Buffer) => {
        this.emit('debug', `[WORLD-RAW] Received: ${data.length} bytes, hex=${data.toString('hex').substring(0, 60)}...`);

        // Process as raw world server packet (opcode + data)
        if (data.length >= 2) {
          const opcode = data.readUInt16LE(0);
          const payload = data.slice(2);
          this.handleWorldPacket(opcode, payload);
        }
      });

      socket.on('error', (err) => {
        this.emit('error', `World raw TCP error: ${err.message}`);
        reject(err);
      });

      socket.on('close', () => {
        this.emit('status', 'Disconnected from world server');
      });

      socket.connect(port, host, () => {
        this.emit('status', 'Connected to world server (raw TCP)');

        // Send login info using account ID and session key
        const loginInfo = Packets.encodeLoginInfo(
          this.lsAccountId,
          this.lsSessionKey
        );

        // Send with 2-byte length prefix
        const lenBuf = Buffer.alloc(2);
        lenBuf.writeUInt16BE(loginInfo.length + 2, 0);

        // Add opcode (OP_SendLoginInfo = 0x0000)
        const packet = Buffer.alloc(2 + loginInfo.length);
        packet.writeUInt16LE(WorldOpcodes.OP_SendLoginInfo, 0);
        loginInfo.copy(packet, 2);

        socket.write(Buffer.concat([lenBuf, packet]));
        this.emit('debug', 'Sent login info (raw TCP)');

        resolve();
      });
    });
  }

  private sendWorldLoginInfo(): void {
    if (!this.worldSession) return;

    // Send login info using account ID and session key from login server
    // World server validates against pending auth received from login server
    if (!this.lsAccountId || !this.lsSessionKey) {
      this.emit('error', 'Missing login server auth info (account ID or session key)');
      return;
    }

    const loginInfo = Packets.encodeLoginInfo(this.lsAccountId, this.lsSessionKey);
    this.worldSession.send(WorldOpcodes.OP_SendLoginInfo, loginInfo);
    this.emit('debug', `Sent login info to world server (account: ${this.lsAccountId}, key: ${this.lsSessionKey})`);
  }

  private setupWorldHandlers(): void {
    if (!this.worldSession) return;

    this.worldSession.on('packet', (opcode: number, data: Buffer) => {
      this.handleWorldPacket(opcode, data);
    });

    this.worldSession.on('error', (err) => {
      this.emit('error', `World session error: ${err.message}`);
    });

    this.worldSession.on('disconnected', () => {
      this.emit('status', 'Disconnected from world server');
    });

    this.worldSession.on('debug', (msg) => {
      this.emit('debug', `[WORLD] ${msg}`);
    });
  }

  private handleWorldPacket(opcode: number, data: Buffer): void {
    this.emit('debug', `World packet: 0x${opcode.toString(16)} (${data.length} bytes)`);

    switch (opcode) {
      case WorldOpcodes.OP_ApproveWorld:
        this.emit('status', 'World server approved login');
        break;

      case WorldOpcodes.OP_LogServer:
        this.emit('debug', 'Received log server info');
        break;

      case WorldOpcodes.OP_MOTD:
        this.handleMOTD(data);
        break;

      case WorldOpcodes.OP_SendCharInfo:
        this.handleCharacterList(data);
        break;

      case WorldOpcodes.OP_ExpansionInfo:
        this.emit('debug', 'Received expansion info');
        break;

      case WorldOpcodes.OP_GuildsList:
        this.emit('debug', 'Received guilds list');
        break;

      case WorldOpcodes.OP_ZoneServerInfo:
        this.handleZoneServerInfo(data);
        break;

      default:
        this.emit('debug', `Unhandled world opcode: 0x${opcode.toString(16)}`);
    }
  }

  private handleCharacterList(data: Buffer): void {
    // Parse character list
    this.emit('debug', `Character list data: ${data.length} bytes`);

    try {
      const characters = Packets.decodeCharacterList(data);
      this.characters = characters;
      this.emit('status', `Received character list (${characters.length} characters)`);
      this.emit('characterList', characters);
    } catch (e) {
      this.emit('debug', `Failed to parse character list: ${e}`);
      this.emit('characterList', []);
    }
  }

  private handleMOTD(data: Buffer): void {
    const motd = data.toString('utf8').replace(/\0/g, '');
    this.emit('motd', motd);
  }

  private handleZoneServerInfo(data: Buffer): void {
    // Contains zone server IP/port
    // TODO: Parse and connect to zone
  }

  // ============= Zone Server =============

  async enterWorld(characterName: string): Promise<void> {
    if (!this.worldSession) throw new Error('Not connected to world');

    this.characterName = characterName;

    const enterWorld = Packets.encodeEnterWorld(characterName);
    this.worldSession.send(WorldOpcodes.OP_EnterWorld, enterWorld);
  }

  async connectToZone(host: string, port: number): Promise<void> {
    this.emit('status', 'Connecting to zone server...');

    this.zoneSession = new EQSession({ host, port });
    this.setupZoneHandlers();

    await this.zoneSession.connect();
    this.emit('status', 'Connected to zone server');
  }

  private setupZoneHandlers(): void {
    if (!this.zoneSession) return;

    this.zoneSession.on('packet', (opcode: number, data: Buffer) => {
      this.handleZonePacket(opcode, data);
    });

    this.zoneSession.on('error', (err) => {
      this.emit('error', `Zone session error: ${err.message}`);
    });
  }

  private handleZonePacket(opcode: number, data: Buffer): void {
    switch (opcode) {
      case ZoneOpcodes.OP_NewZone:
        this.handleNewZone(data);
        break;

      case ZoneOpcodes.OP_NewSpawn:
        this.handleNewSpawn(data);
        break;

      case ZoneOpcodes.OP_DeleteSpawn:
        this.handleDeleteSpawn(data);
        break;

      case ZoneOpcodes.OP_SpawnPositionUpdate:
        this.handlePositionUpdate(data);
        break;

      case ZoneOpcodes.OP_Damage:
        this.handleDamage(data);
        break;

      case ZoneOpcodes.OP_Death:
        this.handleDeath(data);
        break;

      case ZoneOpcodes.OP_HPUpdate:
        this.handleHPUpdate(data);
        break;

      case ZoneOpcodes.OP_ChannelMessage:
        this.handleChatMessage(data);
        break;

      case ZoneOpcodes.OP_Action:
        this.handleAction(data);
        break;

      default:
        this.emit('debug', `Zone packet: 0x${opcode.toString(16)} (${data.length} bytes)`);
    }
  }

  private handleNewZone(data: Buffer): void {
    const zone = Packets.decodeNewZone(data);
    this.currentZone = {
      shortName: zone.zoneShortName,
      longName: zone.zoneLongName,
      zoneId: zone.zoneId,
      safeX: zone.safeX,
      safeY: zone.safeY,
      safeZ: zone.safeZ,
    };

    this.emit('zoneEnter', this.currentZone);
    this.emit('status', `Entered ${zone.zoneLongName}`);
  }

  private handleNewSpawn(data: Buffer): void {
    try {
      const spawn = Packets.decodeSpawn(data);
      const entity: Entity = {
        id: spawn.spawnId,
        name: spawn.name,
        lastName: spawn.lastName,
        x: spawn.x,
        y: spawn.y,
        z: spawn.z,
        heading: spawn.heading,
        level: spawn.level,
        race: spawn.race,
        class_: spawn.class_,
        hp: spawn.curHp,
        maxHp: spawn.maxHp,
        isNpc: spawn.npc === 1,
        isPet: spawn.isPet === 1,
      };

      this.entities.set(spawn.spawnId, entity);

      // Check if this is us
      if (spawn.name === this.characterName) {
        this.mySpawnId = spawn.spawnId;
        this.myPosition = { x: spawn.x, y: spawn.y, z: spawn.z, heading: spawn.heading };
      }

      this.emit('spawn', entity);
    } catch (e) {
      this.emit('debug', `Failed to parse spawn: ${e}`);
    }
  }

  private handleDeleteSpawn(data: Buffer): void {
    if (data.length < 4) return;
    const pb = new Packets.PacketBuffer(data);
    const spawnId = pb.readUInt32LE();

    const entity = this.entities.get(spawnId);
    if (entity) {
      this.entities.delete(spawnId);
      this.emit('despawn', entity);
    }
  }

  private handlePositionUpdate(data: Buffer): void {
    // Position updates are bit-packed, complex to parse
    // Simplified implementation
    this.emit('debug', 'Position update received');
  }

  private handleDamage(data: Buffer): void {
    const damage = Packets.decodeCombatDamage(data);
    const source = this.entities.get(damage.source);
    const target = this.entities.get(damage.target);

    this.emit('damage', {
      source: source?.name || `Entity ${damage.source}`,
      target: target?.name || `Entity ${damage.target}`,
      amount: damage.damage,
      type: damage.type,
      spell: damage.spellId,
    });
  }

  private handleDeath(data: Buffer): void {
    const death = Packets.decodeDeath(data);
    const victim = this.entities.get(death.spawnId);
    const killer = this.entities.get(death.killerId);

    this.emit('death', {
      victim: victim?.name || `Entity ${death.spawnId}`,
      killer: killer?.name || `Entity ${death.killerId}`,
      damage: death.damage,
    });
  }

  private handleHPUpdate(data: Buffer): void {
    if (data.length < 10) return;
    const pb = new Packets.PacketBuffer(data);
    const curHp = pb.readUInt32LE();
    const maxHp = pb.readInt32LE();
    const spawnId = pb.readUInt16LE();

    const entity = this.entities.get(spawnId);
    if (entity) {
      entity.hp = curHp;
      entity.maxHp = maxHp;
      this.emit('hpUpdate', entity);
    }
  }

  private handleChatMessage(data: Buffer): void {
    const msg = Packets.decodeChannelMessage(data);
    this.emit('chat', {
      sender: msg.sender,
      target: msg.targetName,
      channel: msg.channel,
      message: msg.message,
    });
  }

  private handleAction(data: Buffer): void {
    // Combat/spell actions
    this.emit('debug', 'Action received');
  }

  // ============= Commands =============

  say(message: string): void {
    this.sendChat(ChatChannels.CH_SAY, '', message);
  }

  shout(message: string): void {
    this.sendChat(ChatChannels.CH_SHOUT, '', message);
  }

  ooc(message: string): void {
    this.sendChat(ChatChannels.CH_OOC, '', message);
  }

  tell(target: string, message: string): void {
    this.sendChat(ChatChannels.CH_TELL, target, message);
  }

  group(message: string): void {
    this.sendChat(ChatChannels.CH_GROUP, '', message);
  }

  private sendChat(channel: number, target: string, message: string): void {
    if (!this.zoneSession) return;

    const chat = Packets.encodeChannelMessage({
      targetName: target,
      sender: this.characterName,
      language: 0,
      channel,
      skillInLanguage: 100,
      message,
    });

    this.zoneSession.send(ZoneOpcodes.OP_ChannelMessage, chat);
  }

  target(entityId: number): void {
    if (!this.zoneSession) return;

    this.targetId = entityId;
    const targetData = Packets.encodeTarget(entityId);
    this.zoneSession.send(ZoneOpcodes.OP_TargetCommand, targetData);

    const entity = this.entities.get(entityId);
    this.emit('target', entity);
  }

  targetByName(name: string): Entity | undefined {
    for (const entity of this.entities.values()) {
      if (entity.name.toLowerCase() === name.toLowerCase()) {
        this.target(entity.id);
        return entity;
      }
    }
    return undefined;
  }

  attack(enable: boolean = true): void {
    if (!this.zoneSession) return;

    this.isAutoAttacking = enable;
    const attackData = Packets.encodeAutoAttack(enable);
    this.zoneSession.send(ZoneOpcodes.OP_AutoAttack, attackData);

    this.emit('status', enable ? 'Auto-attack ON' : 'Auto-attack OFF');
  }

  castSpell(spellId: number, slot: number = 0): void {
    if (!this.zoneSession) return;

    const cast = Packets.encodeCastSpell({
      slot,
      spellId,
      inventorySlot: 0xFFFF,
      targetId: this.targetId,
    });

    this.zoneSession.send(ZoneOpcodes.OP_CastSpell, cast);
  }

  move(x: number, y: number, z: number): void {
    if (!this.zoneSession) return;

    const pos = Packets.encodePlayerPositionUpdate({
      spawnId: this.mySpawnId,
      x,
      y,
      z,
      heading: this.myPosition.heading,
      deltaX: x - this.myPosition.x,
      deltaY: y - this.myPosition.y,
      deltaZ: z - this.myPosition.z,
      animation: 0,
    });

    this.myPosition = { ...this.myPosition, x, y, z };
    this.zoneSession.send(ZoneOpcodes.OP_ClientUpdate, pos);
  }

  // ============= Getters =============

  getEntities(): Entity[] {
    return Array.from(this.entities.values());
  }

  getEntity(id: number): Entity | undefined {
    return this.entities.get(id);
  }

  getTarget(): Entity | undefined {
    return this.entities.get(this.targetId);
  }

  getZone(): ZoneInfo | undefined {
    return this.currentZone;
  }

  getPosition(): { x: number; y: number; z: number; heading: number } {
    return { ...this.myPosition };
  }

  getNearbyEntities(range: number = 200): Entity[] {
    return this.getEntities().filter((e) => {
      const dx = e.x - this.myPosition.x;
      const dy = e.y - this.myPosition.y;
      return Math.sqrt(dx * dx + dy * dy) <= range;
    });
  }

  // ============= Disconnect =============

  disconnect(): void {
    this.zoneSession?.disconnect();
    this.worldSession?.disconnect();
    this.loginSession?.disconnect();
    this.emit('status', 'Disconnected');
  }
}
