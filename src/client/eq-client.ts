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

  // Deduplication flags to avoid processing repeated packets
  private worldApproved: boolean = false;
  private characterListReceived: boolean = false;
  private guildsListReceived: boolean = false;
  private seenSpawnNames: Set<string> = new Set();

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
    this.emit('debug', `selectServer called with ${serverNumber}`);

    if (!this.loginSession) {
      this.emit('debug', 'selectServer: No login session!');
      return;
    }

    // Find and store the selected server
    this.selectedServer = this.servers.find(s => s.id === serverNumber) || this.servers[serverNumber - 1];
    if (!this.selectedServer && this.servers.length > 0) {
      this.selectedServer = this.servers[0];
    }

    this.emit('debug', `Selected server: ${this.selectedServer?.name} (${this.selectedServer?.ip})`);

    try {
      // Use the selected server's actual ID, not the input number
      const serverId = this.selectedServer?.id || serverNumber || 1;
      this.emit('debug', `Using server ID: ${serverId}`);
      const playReq = Packets.encodePlayRequest(serverId);
      this.emit('debug', `Sending play request: ${playReq.toString('hex')}`);
      this.loginSession.send(LoginOpcodes.OP_PlayEverquestRequest, playReq);
      this.emit('debug', 'Play request sent successfully');
    } catch (err: any) {
      this.emit('debug', `Failed to send play request: ${err.message}`);
    }

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
    // Only log non-duplicate packets
    const isDuplicate = (
      (opcode === WorldOpcodes.OP_ApproveWorld && this.worldApproved) ||
      (opcode === WorldOpcodes.OP_SendCharInfo && this.characterListReceived) ||
      (opcode === WorldOpcodes.OP_GuildsList && this.guildsListReceived)
    );

    if (!isDuplicate) {
      this.emit('debug', `World packet: 0x${opcode.toString(16)} (${data.length} bytes)`);
    }

    switch (opcode) {
      case WorldOpcodes.OP_ApproveWorld:
        if (!this.worldApproved) {
          this.worldApproved = true;
          this.emit('status', 'World server approved login');
        }
        break;

      case WorldOpcodes.OP_LogServer:
        this.emit('debug', 'Received log server info');
        break;

      case WorldOpcodes.OP_MOTD:
        this.handleMOTD(data);
        break;

      case WorldOpcodes.OP_SendCharInfo:
        if (!this.characterListReceived) {
          this.characterListReceived = true;
          this.handleCharacterList(data);
        }
        break;

      case WorldOpcodes.OP_ExpansionInfo:
        this.emit('debug', 'Received expansion info');
        break;

      case WorldOpcodes.OP_GuildsList:
        if (!this.guildsListReceived) {
          this.guildsListReceived = true;
          this.emit('debug', 'Received guilds list');
        }
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

    // Emit raw data for debugging
    this.emit('rawCharacterList', data);

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
    // ZoneServerInfo_Struct from eq_packet_structs.h
    // Contains IP address and port for zone server connection
    if (data.length < 130) {
      this.emit('debug', `ZoneServerInfo too short: ${data.length} bytes`);
      return;
    }

    const pb = new Packets.PacketBuffer(data);
    let ip = pb.readString(128).replace(/\0/g, ''); // IP address as string
    const port = pb.readUInt16LE();

    this.emit('debug', `Zone server info: ${ip}:${port}`);
    
    // Override Docker internal IPs with localhost (ports are exposed via Docker)
    if (ip.startsWith('172.') || ip.startsWith('10.') || ip.startsWith('192.168.')) {
      this.emit('debug', `Overriding Docker internal IP ${ip} with 127.0.0.1`);
      ip = '127.0.0.1';
    }
    
    this.emit('zoneServerInfo', { ip, port });

    // Auto-connect to zone server
    this.connectToZone(ip, port).catch(err => {
      this.emit('error', `Failed to connect to zone: ${err.message}`);
    });
  }

  // Get the list of characters (for external access)
  getCharacters(): any[] {
    return this.characters;
  }

  // ============= Zone Server =============

  async enterWorld(characterName: string): Promise<void> {
    if (!this.worldSession) throw new Error('Not connected to world');

    this.characterName = characterName;
    // Reset zone entry state
    this.playerProfileReceived = false;
    this.newZoneReceived = false;
    this.reqClientSpawnSent = false;
    this.clientReadySent = false;
    this.emit('status', `Sending EnterWorld for: ${characterName}`);
    this.emit('debug', `OP_EnterWorld opcode: 0x${WorldOpcodes.OP_EnterWorld.toString(16)}`);

    const enterWorld = Packets.encodeEnterWorld(characterName);
    this.emit('debug', `EnterWorld packet size: ${enterWorld.length} bytes`);
    this.worldSession.send(WorldOpcodes.OP_EnterWorld, enterWorld);
    this.emit('status', 'EnterWorld packet sent, waiting for zone server info...');
  }

  async connectToZone(host: string, port: number): Promise<void> {
    this.emit('status', 'Connecting to zone server...');

    this.zoneSession = new EQSession({ host, port });
    this.setupZoneHandlers();

    await this.zoneSession.connect();
    this.emit('status', 'Connected to zone server');

    // Send zone entry packet with character name
    this.sendZoneEntry();
  }

  private sendZoneEntry(): void {
    if (!this.zoneSession || !this.characterName) return;

    // ClientZoneEntry_Struct: 4 bytes unknown + 64 bytes name = 68 bytes
    const pb = new Packets.PacketBuffer(68);
    pb.writeUInt32LE(0); // unknown00
    pb.writeString(this.characterName, 64);

    this.emit('status', `Sending zone entry for: ${this.characterName}`);
    this.zoneSession.send(ZoneOpcodes.OP_ZoneEntry, pb.getBuffer());
  }

  private setupZoneHandlers(): void {
    if (!this.zoneSession) return;

    this.zoneSession.on('packet', (opcode: number, data: Buffer) => {
      this.handleZonePacket(opcode, data);
    });

    this.zoneSession.on('error', (err) => {
      this.emit('error', `Zone session error: ${err.message}`);
    });

    this.zoneSession.on('debug', (msg) => {
      this.emit('debug', `[ZONE] ${msg}`);
    });

    this.zoneSession.on('disconnected', () => {
      this.emit('status', 'Disconnected from zone server');
    });
  }

  private handleZonePacket(opcode: number, data: Buffer): void {
    // Log ALL zone packets for debugging
    this.emit('debug', `Zone opcode: 0x${opcode.toString(16)} (${data.length} bytes)`);

    switch (opcode) {
      case ZoneOpcodes.OP_PlayerProfile:
        this.handlePlayerProfile(data);
        break;

      case ZoneOpcodes.OP_NewZone:
        this.emit('debug', `Received OP_NewZone (${data.length} bytes)`);
        this.handleNewZone(data);
        break;

      case ZoneOpcodes.OP_ZoneSpawns:
        this.handleZoneSpawns(data);
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

      case ZoneOpcodes.OP_SpawnAppearance:
        // SpawnAppearance contains entity state changes (animations, etc.)
        this.emit('debug', `SpawnAppearance: ${data.length} bytes`);
        break;

      default:
        // Log unknown opcodes with first 32 bytes for analysis
        const hex = data.slice(0, Math.min(32, data.length)).toString('hex');
        this.emit('debug', `Zone unknown: 0x${opcode.toString(16)} (${data.length} bytes) [${hex}]`);
    }
  }

  private playerProfileReceived: boolean = false;

  private handlePlayerProfile(data: Buffer): void {
    // Prevent duplicate processing (retransmits)
    if (this.playerProfileReceived) {
      return;
    }
    this.playerProfileReceived = true;

    // PlayerProfile is a large struct (~19KB) with character stats
    // Titanium PlayerProfile_Struct layout from titanium_structs.h:
    // offset 0: checksum (uint32)
    // offset 4: gender (uint32)
    // offset 8: race (uint32)
    // offset 12: class_ (uint32)
    // offset 20: level (uint8)
    // offset 12940: name (char[64])
    // offset 13004: last_name (char[32])

    if (data.length < 13036) {
      this.emit('debug', `PlayerProfile too short: ${data.length} bytes`);
      return;
    }

    const gender = data.readUInt32LE(4);
    const race = data.readUInt32LE(8);
    const class_ = data.readUInt32LE(12);
    const level = data.readUInt8(20);
    const name = data.slice(12940, 13004).toString('utf8').replace(/\0/g, '').trim();
    const lastName = data.slice(13004, 13036).toString('utf8').replace(/\0/g, '').trim();

    // Extract player position from PlayerProfile (titanium_structs.h offsets)
    // X: 13116, Y: 13120, Z: 13124, Heading: 13128
    if (data.length >= 13132) {
      const x = data.readFloatLE(13116);
      const y = data.readFloatLE(13120);
      const z = data.readFloatLE(13124);
      const heading = data.readFloatLE(13128);
      this.emit('debug', `Player position from profile: (${x.toFixed(1)}, ${y.toFixed(1)}, ${z.toFixed(1)}) heading=${heading.toFixed(1)}`);

      // If position is (0,0,0), try reading from primary bind point
      // binds[5] starts at offset 24, each BindStruct is 20 bytes: zoneId(4) + x(4) + y(4) + z(4) + heading(4)
      if (x === 0 && y === 0 && z === 0 && data.length >= 44) {
        const bindX = data.readFloatLE(28);  // binds[0].x
        const bindY = data.readFloatLE(32);  // binds[0].y
        const bindZ = data.readFloatLE(36);  // binds[0].z
        const bindHeading = data.readFloatLE(40);  // binds[0].heading
        this.emit('debug', `Fallback to bind point: (${bindX.toFixed(1)}, ${bindY.toFixed(1)}, ${bindZ.toFixed(1)}) heading=${bindHeading.toFixed(1)}`);

        if (bindX !== 0 || bindY !== 0 || bindZ !== 0) {
          this.myPosition = { x: bindX, y: bindY, z: bindZ, heading: bindHeading };
        } else {
          this.myPosition = { x, y, z, heading };
        }
      } else {
        this.myPosition = { x, y, z, heading };
      }
    } else {
      this.emit('debug', `PlayerProfile too short for position extraction: ${data.length} bytes (need 13132)`);
    }

    // Extract entity ID from PlayerProfile (offset 14384)
    // This is also used as spawn ID in position updates
    if (data.length >= 14388) {
      const entityId = data.readUInt32LE(14384);
      this.emit('debug', `Profile size: ${data.length}, entityId at 14384: ${entityId}`);
      if (entityId > 0) {
        this.mySpawnId = entityId;
        this.emit('debug', `Player spawn ID from profile: ${entityId}`);
      }
    } else {
      this.emit('debug', `Profile too short for entity ID: ${data.length} bytes (need 14388)`);
    }

    // Store character name for spawn matching
    if (name) {
      this.characterName = name;
      this.emit('debug', `Character name from profile: "${name}"`);
    }

    this.emit('debug', `PlayerProfile: ${name} Level ${level} ${this.getClassName(class_)} (${data.length} bytes)`);
    this.emit('playerProfile', { name, level, class_, race, gender, raw: data });
    this.emit('status', `Player profile loaded: ${name} - Level ${level} ${this.getClassName(class_)}`);

    // Send ReqClientSpawn IMMEDIATELY after receiving PlayerProfile
    // The server waits for this before sending NewZone and spawns
    setTimeout(() => this.sendReqClientSpawn(), 100);
  }

  private getClassName(classId: number): string {
    const classes: Record<number, string> = {
      1: 'Warrior', 2: 'Cleric', 3: 'Paladin', 4: 'Ranger',
      5: 'Shadow Knight', 6: 'Druid', 7: 'Monk', 8: 'Bard',
      9: 'Rogue', 10: 'Shaman', 11: 'Necromancer', 12: 'Wizard',
      13: 'Magician', 14: 'Enchanter', 15: 'Beastlord', 16: 'Berserker',
    };
    return classes[classId] || `Class${classId}`;
  }

  private newZoneReceived: boolean = false;
  private reqClientSpawnSent: boolean = false;
  private clientReadySent: boolean = false;

  private handleNewZone(data: Buffer): void {
    if (this.newZoneReceived) return; // Ignore retransmits
    this.newZoneReceived = true;

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

    // If player position is still (0,0,0), use zone safe point
    if (this.myPosition.x === 0 && this.myPosition.y === 0 && this.myPosition.z === 0) {
      this.myPosition = { x: zone.safeX, y: zone.safeY, z: zone.safeZ, heading: 0 };
      this.emit('debug', `Using zone safe point as position: (${zone.safeX}, ${zone.safeY}, ${zone.safeZ})`);
    }
  }

  private sendReqClientSpawn(): void {
    if (this.reqClientSpawnSent || !this.zoneSession) return;
    this.reqClientSpawnSent = true;

    this.emit('debug', `Sending OP_ReqClientSpawn (0x${ZoneOpcodes.OP_ReqClientSpawn.toString(16)}) to request zone content`);
    // ReqClientSpawn is an empty packet with just the opcode
    const emptyPacket = Buffer.alloc(0);
    this.zoneSession.send(ZoneOpcodes.OP_ReqClientSpawn, emptyPacket);

    // Schedule ClientReady after a short delay to allow spawns to arrive
    setTimeout(() => this.sendClientReady(), 2000);
  }

  private sendClientReady(): void {
    if (this.clientReadySent || !this.zoneSession) return;
    this.clientReadySent = true;

    this.emit('debug', 'Sending OP_ClientReady');
    // ClientReady is also an empty packet
    const emptyPacket = Buffer.alloc(0);
    this.zoneSession.send(ZoneOpcodes.OP_ClientReady, emptyPacket);
    this.emit('status', 'Zone entry complete - ready to play');

    // Start position heartbeat - zone server expects periodic updates
    this.startPositionHeartbeat();
  }

  private positionHeartbeatInterval?: NodeJS.Timeout;
  private positionSequence: number = 0;

  private startPositionHeartbeat(): void {
    // Send position update every 2 seconds to keep zone server alive
    // The zone server has a 30 second linkdead timeout
    this.positionHeartbeatInterval = setInterval(() => {
      if (!this.zoneSession) return;

      // If we don't have spawn ID yet, use our entity ID
      const spawnId = this.mySpawnId || 1;

      // Increment sequence with each position packet
      this.positionSequence = (this.positionSequence + 1) & 0xFFFF;

      this.emit('debug', `Position heartbeat: spawnId=${this.mySpawnId}, seq=${this.positionSequence}, pos=(${this.myPosition.x.toFixed(1)}, ${this.myPosition.y.toFixed(1)}, ${this.myPosition.z.toFixed(1)})`);

      const pos = Packets.encodePlayerPositionUpdate({
        spawnId: spawnId,
        sequence: this.positionSequence,
        x: this.myPosition.x,
        y: this.myPosition.y,
        z: this.myPosition.z,
        heading: this.myPosition.heading,
        deltaX: 0,
        deltaY: 0,
        deltaZ: 0,
        animation: 0x64,  // Standing animation
      });

      this.zoneSession.send(ZoneOpcodes.OP_ClientUpdate, pos);
    }, 2000);
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

      // Check if this is us (case-insensitive, handle underscores)
      const spawnNameLower = spawn.name.toLowerCase().replace(/_/g, ' ').trim();
      const charNameLower = this.characterName.toLowerCase().replace(/_/g, ' ').trim();

      // Debug: log all non-NPC individual spawns
      if (spawn.npc !== 1) {
        this.emit('debug', `NewSpawn player candidate: "${spawn.name}" (looking for "${this.characterName}") pos=(${spawn.x}, ${spawn.y}, ${spawn.z}) spawnId=${spawn.spawnId}`);
      }

      if (spawnNameLower === charNameLower) {
        this.mySpawnId = spawn.spawnId;
        this.myPosition = { x: spawn.x, y: spawn.y, z: spawn.z, heading: spawn.heading };
        this.emit('debug', `Found player spawn (NewSpawn): ${spawn.name} at (${spawn.x}, ${spawn.y}, ${spawn.z}) spawnId=${spawn.spawnId}`);
      }

      this.emit('spawn', entity);
    } catch (e) {
      this.emit('debug', `Failed to parse spawn: ${e}`);
    }
  }

  private handleZoneSpawns(data: Buffer): void {
    // ZoneSpawns contains multiple Spawn_Struct (385 bytes each)
    // Titanium Spawn_Struct layout:
    // offset 7: name[64]
    // offset 83: NPC flag (0=player, 1=npc)
    // offset 86: curHp, offset 87: maxHp
    // offset 94-110: bit-packed coordinates (x, y, z, heading)
    // offset 151: level
    // offset 284: race (uint32)
    // offset 292: lastName[32]
    // offset 331: class_
    // offset 340: spawnId (uint32)

    const SPAWN_SIZE = 385;
    this.emit('debug', `ZoneSpawns: ${data.length} bytes, ~${Math.floor(data.length / SPAWN_SIZE)} spawns`);

    let count = 0;
    let offset = 0;

    while (offset + SPAWN_SIZE <= data.length) {
      try {
        const spawn = this.parseSpawnStruct(data, offset);
        if (spawn && spawn.name.length >= 3) {
          // Clean up name
          const cleanName = spawn.name.replace(/0+$/, '').replace(/_/g, ' ').trim();

          if (cleanName.length >= 3 && !this.seenSpawnNames.has(cleanName)) {
            this.seenSpawnNames.add(cleanName);

            const entity: Entity = {
              id: spawn.spawnId || this.seenSpawnNames.size,
              name: cleanName,
              lastName: spawn.lastName.replace(/_/g, ' ').trim(),
              x: spawn.x,
              y: spawn.y,
              z: spawn.z,
              heading: spawn.heading,
              level: spawn.level,
              race: spawn.race,
              class_: spawn.class_,
              hp: spawn.curHp,
              maxHp: spawn.maxHp,
              isNpc: spawn.isNpc,
              isPet: false,
            };

            this.entities.set(entity.id, entity);

            // Check if this is us (player spawn)
            const spawnNameLower = cleanName.toLowerCase();
            const charNameLower = this.characterName.toLowerCase();

            // Debug: log all non-NPC spawns to help diagnose player matching
            if (!spawn.isNpc) {
              this.emit('debug', `Player spawn candidate: "${cleanName}" (looking for "${this.characterName}") pos=(${spawn.x}, ${spawn.y}, ${spawn.z}) spawnId=${spawn.spawnId}`);
            }

            if (spawnNameLower === charNameLower) {
              // Match found - set spawn ID even if position is zero
              this.mySpawnId = entity.id;
              this.myPosition = { x: spawn.x, y: spawn.y, z: spawn.z, heading: spawn.heading };
              this.emit('debug', `Found player in zone spawns: ${cleanName} at (${spawn.x}, ${spawn.y}, ${spawn.z}) spawnId=${entity.id}`);
            }

            this.emit('spawn', entity);
            count++;
          }
        }
      } catch (e) {
        // Skip malformed spawn
      }
      offset += SPAWN_SIZE;
    }

    // If struct parsing didn't work, fall back to string extraction
    if (count === 0) {
      this.extractNPCNamesFallback(data);
    } else {
      this.emit('debug', `ZoneSpawns: Parsed ${count} spawns with coordinates`);
    }
  }

  private parseSpawnStruct(data: Buffer, offset: number): any {
    // Read name at offset 7 (64 bytes)
    const nameBuffer = data.slice(offset + 7, offset + 7 + 64);
    const name = nameBuffer.toString('utf8').replace(/\0/g, '').trim();

    // Validate name looks reasonable
    if (!name || !name.match(/^[a-zA-Z_]/)) {
      return null;
    }

    // Read NPC flag at offset 83
    const npcFlag = data.readUInt8(offset + 83);

    // Read HP at offsets 86, 87
    const curHp = data.readUInt8(offset + 86);
    const maxHp = data.readUInt8(offset + 87);

    // Read bit-packed coordinates
    // offset 94: [deltaHeading:10][x:19][padding:3]
    // offset 98: [y:19][animation:10][padding:3]
    // offset 102: [z:19][deltaY:13]
    // offset 106: [deltaX:13][heading:12][padding:7]

    const coordData94 = data.readUInt32LE(offset + 94);
    const coordData98 = data.readUInt32LE(offset + 98);
    const coordData102 = data.readUInt32LE(offset + 102);
    const coordData106 = data.readUInt32LE(offset + 106);

    // Extract 19-bit signed x (bits 10-28 of offset 94)
    let x = (coordData94 >> 10) & 0x7FFFF;
    if (x & 0x40000) x = x - 0x80000; // Sign extend

    // Extract 19-bit signed y (bits 0-18 of offset 98)
    let y = coordData98 & 0x7FFFF;
    if (y & 0x40000) y = y - 0x80000;

    // Extract 19-bit signed z (bits 0-18 of offset 102)
    let z = coordData102 & 0x7FFFF;
    if (z & 0x40000) z = z - 0x80000;

    // Extract 12-bit unsigned heading (bits 13-24 of offset 106)
    const heading = (coordData106 >> 13) & 0xFFF;

    // Read level at offset 151
    const level = data.readUInt8(offset + 151);

    // Read race at offset 284 (uint32)
    const race = data.readUInt32LE(offset + 284);

    // Read lastName at offset 292 (32 bytes)
    const lastNameBuffer = data.slice(offset + 292, offset + 292 + 32);
    const lastName = lastNameBuffer.toString('utf8').replace(/\0/g, '').trim();

    // Read class at offset 331
    const class_ = data.readUInt8(offset + 331);

    // Read spawnId at offset 340
    const spawnId = data.readUInt32LE(offset + 340);

    // NPC flag: 0 = player, 1+ = NPC (merchants, guards, etc have different values)
    return {
      name, lastName, x, y, z, heading,
      level, race, class_, curHp, maxHp, spawnId,
      isNpc: npcFlag !== 0,  // Any non-zero value = NPC
    };
  }

  private extractNPCNamesFallback(data: Buffer): void {
    // Fallback: scan for readable ASCII strings that look like NPC names
    let count = 0;
    let i = 0;

    while (i < data.length - 4) {
      const c0 = data[i];
      if ((c0 >= 0x41 && c0 <= 0x5a) || (c0 >= 0x61 && c0 <= 0x7a)) {
        let end = i;
        let hasUnderscore = false;
        let valid = true;

        while (end < data.length && end - i < 64) {
          const c = data[end];
          if (c === 0) break;
          if ((c >= 0x41 && c <= 0x5a) || (c >= 0x61 && c <= 0x7a)) {
            // letter OK
          } else if (c >= 0x30 && c <= 0x39) {
            // digit OK
          } else if (c === 0x5f) {
            hasUnderscore = true;
          } else {
            valid = false;
            break;
          }
          end++;
        }

        const len = end - i;
        if (valid && len >= 5 && len <= 40 && end < data.length && data[end] === 0) {
          const name = data.slice(i, end).toString('utf8');
          const startsCapital = c0 >= 0x41 && c0 <= 0x5a;

          if (hasUnderscore || startsCapital) {
            let cleanName = name.replace(/0+$/, '').replace(/_/g, ' ').trim();

            if (cleanName.length >= 4 && !this.seenSpawnNames.has(cleanName)) {
              this.seenSpawnNames.add(cleanName);

              const entity: Entity = {
                id: this.seenSpawnNames.size,
                name: cleanName,
                lastName: '', x: 0, y: 0, z: 0, heading: 0,
                level: 1, race: 0, class_: 0,
                hp: 100, maxHp: 100, isNpc: true, isPet: false,
              };
              this.entities.set(entity.id, entity);
              this.emit('spawn', entity);
              count++;
            }
          }
        }
        i = end + 1;
      } else {
        i++;
      }
    }

    if (count > 0) {
      this.emit('debug', `ZoneSpawns fallback: Extracted ${count} NPCs`);
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
