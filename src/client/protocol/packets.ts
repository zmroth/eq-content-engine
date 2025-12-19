// EQ Packet Structures - Binary serialization/deserialization
// Based on eq_packet_structs.h from EQEmu source

import { Buffer } from 'buffer';
import { encryptCredentials, eqcryptBlock } from './crypto';

// Helper for reading/writing packed binary data
export class PacketBuffer {
  private buffer: Buffer;
  private offset: number = 0;

  constructor(data?: Buffer | number) {
    if (typeof data === 'number') {
      this.buffer = Buffer.alloc(data);
    } else if (data) {
      this.buffer = data;
    } else {
      this.buffer = Buffer.alloc(4096);
    }
  }

  // Read methods
  readUInt8(): number {
    const val = this.buffer.readUInt8(this.offset);
    this.offset += 1;
    return val;
  }

  readUInt16LE(): number {
    const val = this.buffer.readUInt16LE(this.offset);
    this.offset += 2;
    return val;
  }

  readUInt32LE(): number {
    const val = this.buffer.readUInt32LE(this.offset);
    this.offset += 4;
    return val;
  }

  readInt32LE(): number {
    const val = this.buffer.readInt32LE(this.offset);
    this.offset += 4;
    return val;
  }

  readFloatLE(): number {
    const val = this.buffer.readFloatLE(this.offset);
    this.offset += 4;
    return val;
  }

  readString(length: number): string {
    const str = this.buffer.toString('utf8', this.offset, this.offset + length);
    this.offset += length;
    return str.replace(/\0/g, '');
  }

  readNullString(): string {
    let end = this.offset;
    while (end < this.buffer.length && this.buffer[end] !== 0) end++;
    const str = this.buffer.toString('utf8', this.offset, end);
    this.offset = end + 1;
    return str;
  }

  readBytes(length: number): Buffer {
    const bytes = this.buffer.slice(this.offset, this.offset + length);
    this.offset += length;
    return bytes;
  }

  // Write methods
  writeUInt8(val: number): void {
    this.buffer.writeUInt8(val, this.offset);
    this.offset += 1;
  }

  writeUInt16LE(val: number): void {
    this.buffer.writeUInt16LE(val, this.offset);
    this.offset += 2;
  }

  writeUInt32LE(val: number): void {
    this.buffer.writeUInt32LE(val, this.offset);
    this.offset += 4;
  }

  writeInt32LE(val: number): void {
    this.buffer.writeInt32LE(val, this.offset);
    this.offset += 4;
  }

  writeFloatLE(val: number): void {
    this.buffer.writeFloatLE(val, this.offset);
    this.offset += 4;
  }

  writeString(str: string, length: number): void {
    const buf = Buffer.alloc(length);
    buf.write(str, 0, Math.min(str.length, length - 1), 'utf8');
    buf.copy(this.buffer, this.offset);
    this.offset += length;
  }

  writeNullString(str: string): void {
    this.buffer.write(str, this.offset, 'utf8');
    this.offset += str.length;
    this.buffer.writeUInt8(0, this.offset);
    this.offset += 1;
  }

  writeBytes(data: Buffer): void {
    data.copy(this.buffer, this.offset);
    this.offset += data.length;
  }

  // Utility
  seek(offset: number): void {
    this.offset = offset;
  }

  skip(bytes: number): void {
    this.offset += bytes;
  }

  getOffset(): number {
    return this.offset;
  }

  getBuffer(): Buffer {
    return this.buffer.slice(0, this.offset);
  }

  getRawBuffer(): Buffer {
    return this.buffer;
  }

  remaining(): number {
    return this.buffer.length - this.offset;
  }
}

// ============= Login Server Packets =============
// These are used for the login server protocol (port 5998)

// LoginBaseMessage header - present in all login server packets
export interface LoginBaseMessage {
  sequence: number;      // int32 - request type (2=handshake, 3=login, 4=serverlist)
  compressed: boolean;   // bool
  encryptType: number;   // int8 - 1=invert (unused), 2=DES
  unk3: number;          // int32 - unused
}

// Session ready packet (client -> server, first packet)
// Format: just a uint32 with value 2 (the opcode is added by the session layer)
export function encodeSessionReady(): Buffer {
  const pb = new PacketBuffer(4);
  pb.writeUInt32LE(2); // Session ready sequence value
  return pb.getBuffer();
}

// Login packet with encrypted credentials
export function encodeLoginPacket(username: string, password: string): Buffer {
  // Encrypt credentials
  const encryptedCreds = encryptCredentials(username, password);

  // Build packet: LoginBaseMessage header + encrypted credentials
  const pb = new PacketBuffer(10 + encryptedCreds.length);

  // LoginBaseMessage header
  pb.writeInt32LE(3);      // sequence = 3 (login)
  pb.writeUInt8(0);        // compressed = false
  pb.writeUInt8(2);        // encrypt_type = 2 (DES)
  pb.writeInt32LE(0);      // unk3

  // Encrypted credentials
  pb.writeBytes(encryptedCreds);

  return pb.getBuffer();
}

// Decode login accepted response (contains account ID and session key)
export interface LoginAcceptedResponse {
  accountId: number;    // Login server account ID
  sessionKey: string;   // Session key for world server auth (10 chars)
}

export function decodeLoginAccepted(data: Buffer): LoginAcceptedResponse | null {
  if (data.length < 90) return null; // 10 byte header + 80 byte encrypted payload

  const pb = new PacketBuffer(data);

  // Skip LoginBaseMessage header
  pb.skip(10);

  // Decrypt the 80-byte payload
  const encryptedPayload = pb.readBytes(80);
  const decrypted = eqcryptBlock(encryptedPayload, false);


  // PlayerLoginReply structure:
  // LoginBaseReplyMessage base_reply:
  //   uint8_t success          (1 byte)
  //   int32_t error_str_id     (4 bytes)
  // 3 bytes padding/unknown    (based on observed hex pattern)
  // int32_t lsid               (4 bytes) - login server account ID
  // char key[11]               (11 bytes) - session key
  const decryptedPb = new PacketBuffer(decrypted);
  const success = decryptedPb.readUInt8();       // offset 0
  const errorStrId = decryptedPb.readInt32LE();  // offset 1-4
  decryptedPb.skip(3);                           // offset 5-7 (padding)
  const accountId = decryptedPb.readUInt32LE();  // offset 8-11
  const sessionKey = decryptedPb.readString(11); // offset 12-22


  if (success !== 1) return null;

  return { accountId, sessionKey };
}

// Server list request
export function encodeServerListRequest(): Buffer {
  const pb = new PacketBuffer(14);

  // LoginBaseMessage header
  pb.writeInt32LE(4);      // sequence = 4 (serverlist)
  pb.writeUInt8(0);        // compressed = false
  pb.writeUInt8(0);        // encrypt_type = 0 (none)
  pb.writeInt32LE(0);      // unk3

  // Server list sequence (typically 1)
  pb.writeUInt32LE(1);

  return pb.getBuffer();
}

// Play EverQuest request (select server)
export interface PlayEverquestRequest {
  serverNumber: number;
}

export function encodePlayRequest(serverNumber: number): Buffer {
  const pb = new PacketBuffer(14);

  // LoginBaseMessage header
  pb.writeInt32LE(5);      // sequence = 5 (play)
  pb.writeUInt8(0);        // compressed = false
  pb.writeUInt8(0);        // encrypt_type = 0 (none)
  pb.writeInt32LE(0);      // unk3

  // Server number
  pb.writeUInt32LE(serverNumber);

  return pb.getBuffer();
}

// Parse server list response
export interface ServerInfo {
  ip: string;
  serverType: number;
  serverId: number;
  serverName: string;
  countryCode: string;
  languageCode: string;
  serverStatus: number;
  playerCount: number;
}

export function decodeServerListResponse(data: Buffer): ServerInfo[] {
  const pb = new PacketBuffer(data);
  const servers: ServerInfo[] = [];

  // Skip LoginBaseMessage header
  pb.skip(10);

  // Skip LoginBaseReplyMessage
  const success = pb.readUInt8();
  const errorStrId = pb.readInt32LE();
  // Skip variable length string (unknown)
  while (pb.remaining() > 0 && pb.readUInt8() !== 0);

  // Server count
  if (pb.remaining() < 4) return servers;
  const serverCount = pb.readInt32LE();

  // Parse servers
  for (let i = 0; i < serverCount && pb.remaining() > 20; i++) {
    const ip = pb.readNullString();
    const serverType = pb.readInt32LE();
    const serverId = pb.readInt32LE();
    const serverName = pb.readNullString();
    const countryCode = pb.readNullString();
    const languageCode = pb.readNullString();
    const serverStatus = pb.readInt32LE();
    const playerCount = pb.readInt32LE();

    servers.push({
      ip,
      serverType,
      serverId,
      serverName,
      countryCode,
      languageCode,
      serverStatus,
      playerCount,
    });
  }

  return servers;
}

// Parse play response (contains world server info)
export interface PlayResponse {
  success: boolean;
  serverNumber: number;
  worldHost: string;
  worldPort: number;
}

export function decodePlayResponse(data: Buffer): PlayResponse | null {
  if (data.length < 15) return null;

  const pb = new PacketBuffer(data);

  // Skip LoginBaseMessage header
  pb.skip(10);

  // LoginBaseReplyMessage
  const success = pb.readUInt8() === 1;
  const errorStrId = pb.readInt32LE();

  if (!success) return null;

  // Server number
  const serverNumber = pb.readUInt32LE();

  // World server info is sent separately or via redirect

  return {
    success,
    serverNumber,
    worldHost: '',  // Extracted from redirect or separate packet
    worldPort: 0,
  };
}

// ============= World Server Login Packets =============
// These are used after connecting to the world server

export interface LoginInfo {
  accountId: number;    // Login server account ID
  sessionKey: string;   // Session key from login server
  zoning: number;
}

export function encodeLoginInfo(accountId: number, sessionKey: string): Buffer {
  // LoginInfo_Struct - actual size is 464 bytes with #pragma pack(1):
  // login_info[64] + unknown064[124] + zoning[1] + unknown189[275] = 464
  // The offset comments in EQEmu source say 488 but that's inconsistent with field sizes
  const pb = new PacketBuffer(464);

  // login_info[64] - Format: "<account_id>\0<session_key>\0"
  // Account ID as numeric string, null-terminated
  // Session key after first null
  const accountIdStr = accountId.toString();
  const loginInfoField = Buffer.alloc(64, 0);
  loginInfoField.write(accountIdStr, 0, 'utf8');
  loginInfoField.write(sessionKey, accountIdStr.length + 1, 'utf8');
  pb.writeBytes(loginInfoField);

  // unknown064[124]
  pb.skip(124);

  // zoning (0 = not zoning, first entry)
  pb.writeUInt8(0);

  // unknown189[275]
  pb.skip(275);

  return pb.getBuffer();
}

// ============= World Packets =============

// Character info from OP_SendCharInfo
export interface CharacterEntry {
  name: string;
  level: number;
  class_: number;
  race: number;
  zone: string;
  gender: number;
  face: number;
  deity: number;
}

export function decodeCharacterList(data: Buffer): CharacterEntry[] {
  const characters: CharacterEntry[] = [];

  // Titanium CharacterSelect_Struct layout (from titanium_structs.h)
  // This struct uses per-field arrays, NOT per-slot structs!
  // Packet has 4-byte header + 1704 byte struct
  //
  // struct CharacterSelect_Struct {
  //   /*0000*/ uint32 Race[10];           // 40 bytes
  //   /*0040*/ TintProfile CS_Colors[10]; // 360 bytes (9 tints * 4 bytes * 10 chars)
  //   /*0400*/ uint8 BeardColor[10];      // 10 bytes
  //   /*0410*/ uint8 HairStyle[10];       // 10 bytes
  //   /*0420*/ TextureProfile Equip[10];  // 360 bytes
  //   /*0780*/ uint32 SecondaryIDFile[10];// 40 bytes
  //   /*0820*/ uint8 Unknown820[10];      // 10 bytes
  //   /*0830*/ uint8 Unknown830[2];       // 2 bytes
  //   /*0832*/ uint32 Deity[10];          // 40 bytes
  //   /*0872*/ uint8 GoHome[10];          // 10 bytes
  //   /*0882*/ uint8 Tutorial[10];        // 10 bytes
  //   /*0892*/ uint8 Beard[10];           // 10 bytes
  //   /*0902*/ uint8 Unknown902[10];      // 10 bytes
  //   /*0912*/ uint32 PrimaryIDFile[10];  // 40 bytes
  //   /*0952*/ uint8 HairColor[10];       // 10 bytes
  //   /*0962*/ uint8 Unknown0962[2];      // 2 bytes
  //   /*0964*/ uint32 Zone[10];           // 40 bytes
  //   /*1004*/ uint8 Class[10];           // 10 bytes
  //   /*1014*/ uint8 Face[10];            // 10 bytes
  //   /*1024*/ char Name[10][64];         // 640 bytes
  //   /*1664*/ uint8 Gender[10];          // 10 bytes
  //   /*1674*/ uint8 EyeColor1[10];       // 10 bytes
  //   /*1684*/ uint8 EyeColor2[10];       // 10 bytes
  //   /*1694*/ uint8 Level[10];           // 10 bytes
  // }; // Total: 1704 bytes

  const STRUCT_SIZE = 1704;
  const NUM_SLOTS = 10;

  if (data.length < STRUCT_SIZE) {
    return characters;
  }

  // Field offsets within CharacterSelect_Struct (no header - packet IS the struct)
  const OFF_RACE = 0;      // uint32[10]
  const OFF_DEITY = 832;   // uint32[10]
  const OFF_ZONE = 964;    // uint32[10]
  const OFF_CLASS = 1004;  // uint8[10]
  const OFF_FACE = 1014;   // uint8[10]
  const OFF_NAME = 1024;   // char[10][64]
  const OFF_GENDER = 1664; // uint8[10]
  const OFF_LEVEL = 1694;  // uint8[10]

  // First pass: collect all valid character names and their slot indices
  const validSlots: Array<{slot: number, name: string}> = [];
  for (let slot = 0; slot < NUM_SLOTS; slot++) {
    const nameOffset = OFF_NAME + (slot * 64);
    // Name may have 4-byte prefix within 64-byte field
    const rawName = data.slice(nameOffset, nameOffset + 64).toString('utf8').replace(/\0/g, '').trim();
    if (rawName && rawName.length > 0 && !rawName.toLowerCase().startsWith('<none>')) {
      validSlots.push({slot, name: rawName});
    }
  }

  // Find where level data actually is by looking for non-zero values
  const levelValues: number[] = [];
  for (let i = 0; i < NUM_SLOTS; i++) {
    levelValues.push(data.readUInt8(OFF_LEVEL + i));
  }

  // Match valid names with their data
  // Due to inconsistent slot mapping, try to find matching level by checking all slots
  for (const {slot, name} of validSlots) {
    try {
      // Read race from the same slot
      const race = data.readUInt32LE(OFF_RACE + slot * 4);

      // For level/class, first try same slot, then search for non-zero values
      let level = data.readUInt8(OFF_LEVEL + slot);
      let class_ = data.readUInt8(OFF_CLASS + slot);
      let gender = data.readUInt8(OFF_GENDER + slot);
      let face = data.readUInt8(OFF_FACE + slot);
      let deity = data.readUInt32LE(OFF_DEITY + slot * 4);
      let zoneId = data.readUInt32LE(OFF_ZONE + slot * 4);

      // If level is 0, search for a non-zero level value (server may use different slot)
      if (level === 0) {
        for (let i = 0; i < NUM_SLOTS; i++) {
          const lvl = data.readUInt8(OFF_LEVEL + i);
          if (lvl > 0 && lvl <= 100) {
            level = lvl;
            // Also try to get class from same alternate slot
            const cls = data.readUInt8(OFF_CLASS + i);
            if (cls > 0 && cls <= 16) {
              class_ = cls;
            }
            break;
          }
        }
      }

      characters.push({
        name,
        level,
        class_: class_,
        race,
        zone: (zoneId > 0 && zoneId < 1000) ? `Zone ${zoneId}` : 'Unknown',
        gender,
        face,
        deity,
      });
    } catch (e) {
      // Skip malformed slot
      continue;
    }
  }

  return characters;
}

export interface EnterWorld {
  name: string; // 64 bytes
  tutorial: number;
  returnHome: number;
}

export function encodeEnterWorld(name: string, tutorial = 0, returnHome = 0): Buffer {
  const pb = new PacketBuffer(72);
  pb.writeString(name, 64);
  pb.writeUInt32LE(tutorial);
  pb.writeUInt32LE(returnHome);
  return pb.getBuffer();
}

// ============= Zone Packets =============

export interface Spawn {
  spawnId: number;
  name: string;
  lastName: string;
  x: number;
  y: number;
  z: number;
  heading: number;
  level: number;
  race: number;
  class_: number;
  gender: number;
  curHp: number;
  maxHp: number;
  gm: number;
  npc: number;
  isPet: number;
  petOwnerId: number;
  guildId: number;
  runspeed: number;
  walkspeed: number;
  bodytype: number;
  findable: number;
  size: number;
  deity: number;
}

export function decodeSpawn(data: Buffer): Spawn {
  const pb = new PacketBuffer(data);

  pb.skip(1); // unknown0000
  const gm = pb.readUInt8();
  pb.skip(1); // unknown0003
  pb.skip(1); // aaitle
  pb.skip(1); // unknown0004
  pb.skip(1); // anon
  const face = pb.readUInt8();
  const name = pb.readString(64);
  const deity = pb.readUInt16LE();
  pb.skip(2); // unknown0073
  const size = pb.readFloatLE();
  pb.skip(4); // unknown0079
  const npc = pb.readUInt8();
  pb.skip(1); // invis
  pb.skip(1); // haircolor
  const curHp = pb.readUInt8();
  const maxHp = pb.readUInt8();
  const findable = pb.readUInt8();
  pb.skip(5); // unknown0089

  // Bit-packed position data (complex - simplified here)
  // This is a simplification - actual parsing requires bit manipulation
  const posData = pb.readBytes(20);

  // Extract position from bit-packed data
  // For now, using placeholder - real implementation needs bit unpacking
  const x = 0;
  const y = 0;
  const z = 0;
  const heading = 0;

  pb.skip(11); // various fields
  const level = pb.readUInt8();
  pb.skip(4); // PlayerState
  pb.skip(1); // beardcolor
  pb.skip(32); // suffix
  const petOwnerId = pb.readUInt32LE();
  pb.skip(1); // guildrank
  pb.skip(3); // unknown0194
  pb.skip(36); // equipment texture
  const runspeed = pb.readFloatLE();
  pb.skip(1); // afk
  const guildId = pb.readUInt32LE();
  pb.skip(32); // title
  pb.skip(1); // unknown0274
  pb.skip(8); // set_to_0xFF
  pb.skip(1); // helm
  const race = pb.readUInt32LE();
  pb.skip(4); // unknown0288
  const lastName = pb.readString(32);
  const walkspeed = pb.readFloatLE();
  pb.skip(1); // unknown0328
  const isPet = pb.readUInt8();
  pb.skip(1); // light
  const class_ = pb.readUInt8();
  pb.skip(1); // eyecolor2
  pb.skip(1); // flymode
  const gender = pb.readUInt8();
  const bodytype = pb.readUInt8();
  pb.skip(3); // unknown0336
  pb.skip(1); // equip_chest2/mount_color
  const spawnId = pb.readUInt32LE();

  return {
    spawnId,
    name,
    lastName,
    x, y, z, heading,
    level,
    race,
    class_,
    gender,
    curHp,
    maxHp,
    gm,
    npc,
    isPet,
    petOwnerId,
    guildId,
    runspeed,
    walkspeed,
    bodytype,
    findable,
    size,
    deity,
  };
}

// ============= Movement Packets =============

export interface PlayerPositionUpdate {
  spawnId: number;
  sequence?: number;  // Increments each position packet
  x: number;
  y: number;
  z: number;
  heading: number;
  deltaX: number;
  deltaY: number;
  deltaZ: number;
  animation: number;
}

export function encodePlayerPositionUpdate(pos: PlayerPositionUpdate): Buffer {
  // Titanium PlayerPositionUpdateClient_Struct (36 bytes)
  const pb = new PacketBuffer(36);

  // Offset 0: spawn_id (uint16)
  pb.writeUInt16LE(pos.spawnId);

  // Offset 2: sequence (uint16) - increment each packet
  pb.writeUInt16LE(pos.sequence || 0);

  // Offset 4: y_pos (float)
  pb.writeFloatLE(pos.y);

  // Offset 8: delta_z (float)
  pb.writeFloatLE(pos.deltaZ);

  // Offset 12: delta_y (float)
  pb.writeFloatLE(pos.deltaY);

  // Offset 16: delta_x (float)
  pb.writeFloatLE(pos.deltaX);

  // Offset 20: animation(10) | delta_heading(10) | padding(12)
  const animDeltaPacked = (pos.animation & 0x3FF) |
                          ((0 & 0x3FF) << 10) |  // delta_heading
                          (1 << 20);              // padding (mostly 1)
  pb.writeUInt32LE(animDeltaPacked);

  // Offset 24: x_pos (float)
  pb.writeFloatLE(pos.x);

  // Offset 28: z_pos (float)
  pb.writeFloatLE(pos.z);

  // Offset 32: heading(12) | padding(4) as uint16
  const headingPacked = (Math.floor(pos.heading) & 0xFFF);
  pb.writeUInt16LE(headingPacked);

  // Offset 34: unknown[2]
  pb.writeUInt16LE(0);

  return pb.getBuffer();
}

// ============= Combat Packets =============

export interface CombatDamage {
  target: number;
  source: number;
  type: number;
  spellId: number;
  damage: number;
  force: number;
  hitHeading: number;
  hitPitch: number;
  special: number;
}

export function decodeCombatDamage(data: Buffer): CombatDamage {
  const pb = new PacketBuffer(data);
  return {
    target: pb.readUInt16LE(),
    source: pb.readUInt16LE(),
    type: pb.readUInt8(),
    spellId: pb.readUInt16LE(),
    damage: pb.readUInt32LE(),
    force: pb.readFloatLE(),
    hitHeading: pb.readFloatLE(),
    hitPitch: pb.readFloatLE(),
    special: pb.readUInt32LE(),
  };
}

export interface Death {
  spawnId: number;
  killerId: number;
  corpseId: number;
  bindZoneId: number;
  spellId: number;
  attackSkill: number;
  damage: number;
}

export function decodeDeath(data: Buffer): Death {
  const pb = new PacketBuffer(data);
  return {
    spawnId: pb.readUInt32LE(),
    killerId: pb.readUInt32LE(),
    corpseId: pb.readUInt32LE(),
    bindZoneId: pb.readUInt32LE(),
    spellId: pb.readUInt32LE(),
    attackSkill: pb.readUInt32LE(),
    damage: pb.readUInt32LE(),
  };
}

// ============= Chat Packets =============

export interface ChannelMessage {
  targetName: string;
  sender: string;
  language: number;
  channel: number;
  skillInLanguage: number;
  message: string;
}

export function decodeChannelMessage(data: Buffer): ChannelMessage {
  const pb = new PacketBuffer(data);
  return {
    targetName: pb.readString(64),
    sender: pb.readString(64),
    language: pb.readUInt32LE(),
    channel: pb.readUInt32LE(),
    skillInLanguage: pb.readUInt32LE() + pb.readUInt32LE(), // skip unknown
    message: pb.readNullString(),
  };
}

export function encodeChannelMessage(msg: ChannelMessage): Buffer {
  const pb = new PacketBuffer(152 + msg.message.length + 1);
  pb.writeString(msg.targetName, 64);
  pb.writeString(msg.sender, 64);
  pb.writeUInt32LE(msg.language);
  pb.writeUInt32LE(msg.channel);
  pb.writeUInt32LE(0); // unknown
  pb.writeUInt32LE(0); // unknown
  pb.writeUInt32LE(msg.skillInLanguage);
  pb.writeNullString(msg.message);
  return pb.getBuffer();
}

// ============= Targeting =============

export interface Target {
  entityId: number;
}

export function encodeTarget(entityId: number): Buffer {
  const pb = new PacketBuffer(4);
  pb.writeUInt32LE(entityId);
  return pb.getBuffer();
}

// ============= Auto Attack =============

export function encodeAutoAttack(enabled: boolean): Buffer {
  const pb = new PacketBuffer(4);
  pb.writeUInt32LE(enabled ? 1 : 0);
  return pb.getBuffer();
}

// ============= Cast Spell =============

export interface CastSpell {
  slot: number;
  spellId: number;
  inventorySlot: number;
  targetId: number;
}

export function encodeCastSpell(spell: CastSpell): Buffer {
  const pb = new PacketBuffer(36);
  pb.writeUInt32LE(spell.slot);
  pb.writeUInt32LE(spell.spellId);
  pb.writeUInt32LE(spell.inventorySlot);
  pb.writeUInt32LE(spell.targetId);
  pb.writeUInt32LE(0); // unknown
  pb.writeUInt32LE(0); // unknown
  pb.writeFloatLE(0); // y_pos
  pb.writeFloatLE(0); // x_pos
  pb.writeFloatLE(0); // z_pos
  return pb.getBuffer();
}

// ============= Zone Info =============

export interface NewZone {
  charName: string;
  zoneShortName: string;
  zoneLongName: string;
  safeX: number;
  safeY: number;
  safeZ: number;
  gravity: number;
  minClip: number;
  maxClip: number;
  zoneId: number;
  zoneInstance: number;
}

export function decodeNewZone(data: Buffer): NewZone {
  const pb = new PacketBuffer(data);
  const charName = pb.readString(64);
  const zoneShortName = pb.readString(32);
  const zoneLongName = pb.readString(278);
  pb.skip(1); // ztype
  pb.skip(16); // fog colors
  pb.skip(1); // unknown
  pb.skip(32); // fog clip values
  const gravity = pb.readFloatLE();
  pb.skip(17); // time/weather
  pb.skip(33); // unknown
  pb.skip(1); // sky
  pb.skip(13); // unknown
  pb.skip(4); // zone_exp_multiplier
  const safeY = pb.readFloatLE();
  const safeX = pb.readFloatLE();
  const safeZ = pb.readFloatLE();
  pb.skip(8); // max_z, underworld
  const minClip = pb.readFloatLE();
  const maxClip = pb.readFloatLE();
  pb.skip(84); // unknown
  pb.skip(68); // zone_short_name2
  pb.skip(12); // unknown
  const zoneId = pb.readUInt16LE();
  const zoneInstance = pb.readUInt16LE();

  return {
    charName,
    zoneShortName,
    zoneLongName,
    safeX,
    safeY,
    safeZ,
    gravity,
    minClip,
    maxClip,
    zoneId,
    zoneInstance,
  };
}
