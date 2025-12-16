// EQEmu Opcodes - Based on opcodes.conf and packet analysis
// These are for Titanium client compatibility

export const SessionOpcodes = {
  // Session layer opcodes (first byte after 0x00)
  OP_SessionRequest: 0x01,
  OP_SessionResponse: 0x02,
  OP_Combined: 0x03,
  OP_SessionDisconnect: 0x05,
  OP_KeepAlive: 0x06,
  OP_SessionStatRequest: 0x07,
  OP_SessionStatResponse: 0x08,
  OP_Packet: 0x09,
  OP_Fragment: 0x0d,
  OP_OutOfOrderAck: 0x11,
  OP_Ack: 0x15,
};

export const LoginOpcodes = {
  OP_SessionReady: 0x0001,
  OP_Login: 0x0002,
  OP_ServerListRequest: 0x0004,
  OP_PlayEverquestRequest: 0x000d,
  OP_EnterChat: 0x000f,
  OP_PollResponse: 0x0011,
  OP_ChatMessage: 0x0016,       // Handshake reply
  OP_LoginAccepted: 0x0017,
  OP_ServerListResponse: 0x0018,
  OP_PlayEverquestResponse: 0x0021,
  OP_Poll: 0x0029,
  OP_LoginFailed: 0x0030,       // Login failure
};

export const WorldOpcodes = {
  // Titanium opcodes from patch_Titanium.conf (verified)
  OP_SendLoginInfo: 0x4dd0,
  OP_ApproveWorld: 0x3c25,     // Updated from ShowEQ 10/27/05
  OP_LogServer: 0x4c35,
  OP_MOTD: 0x295c,             // Updated from patch_Titanium.conf
  OP_SendCharInfo: 0x4513,     // Updated from ShowEQ 10/27/05
  OP_ExpansionInfo: 0x7bb4,
  OP_GuildsList: 0x6957,       // Updated - same as zone guild list
  OP_EnterWorld: 0x7cba,       // Updated from patch_Titanium.conf
  OP_PostEnterWorld: 0x52A4,
  OP_DeleteCharacter: 0x26c9,  // Updated
  OP_CharacterCreate: 0x10b2,  // Updated
  OP_RandomNameGenerator: 0x79c5,
  OP_ApproveName: 0x3ea6,      // Updated
  OP_WorldClientReady: 0x7d23,
  OP_ZoneServerInfo: 0x61b6,  // ShowEQ 10/27/05
  OP_CharInventory: 0x5394,
  OP_PlayerProfile: 0x75df,
};

export const ZoneOpcodes = {
  // Zone entry - opcodes verified against actual server traffic
  OP_ZoneEntry: 0x7213,      // ShowEQ 10/27/05
  OP_PlayerProfile: 0x75df,  // Same as world - server sends same opcode
  OP_NewZone: 0x0920,
  OP_ZoneSpawns: 0x2e78,     // Actual opcode from server (contains NPC spawn data)
  OP_ReqNewZone: 0x7ac5,     // ShowEQ 10/27/05
  OP_ReqClientSpawn: 0x0322, // ShowEQ 10/27/05
  OP_SpawnAppearance: 0x0f1d,
  OP_ClientReady: 0x56cf,
  OP_DoorInfo: 0x4c24,       // Door spawn data

  // Movement
  OP_ClientUpdate: 0x14cb,
  OP_SpawnPositionUpdate: 0x0000, // Varies by client

  // Combat
  OP_AutoAttack: 0x5e55,
  OP_AutoAttack2: 0x0000,
  OP_TargetMouse: 0x0cde,
  OP_TargetCommand: 0x0ce3,
  OP_Damage: 0x5c78,
  OP_Action: 0x497c,
  OP_Death: 0x0114,
  OP_HPUpdate: 0x3bcf,
  OP_MobHealth: 0x0695,

  // Spells
  OP_CastSpell: 0x304b,
  OP_BeginCast: 0x3990,
  OP_Buff: 0x0000,
  OP_MemorizeSpell: 0x0000,

  // Chat
  OP_ChannelMessage: 0x1004,
  OP_FormattedMessage: 0x5a48,
  OP_Emote: 0x547a,
  OP_Animation: 0x0000,

  // Spawns
  OP_NewSpawn: 0x4921,
  OP_DeleteSpawn: 0x2968,
  OP_Illusion: 0x0000,

  // Items/Trade
  OP_ItemLinkResponse: 0x0000,
  OP_Consider: 0x0000,
  OP_ConsiderCorpse: 0x0000,

  // Zone changes
  OP_ZoneChange: 0x5dd8,
  OP_RequestClientZoneChange: 0x0000,

  // Misc
  OP_WhoAllRequest: 0x0000,
  OP_WhoAllResponse: 0x0000,
  OP_TimeOfDay: 0x0000,
  OP_Weather: 0x0000,
};

// Chat channel types
export const ChatChannels = {
  CH_GUILD: 0,
  CH_GROUP: 2,
  CH_SHOUT: 3,
  CH_AUCTION: 4,
  CH_OOC: 5,
  CH_BROADCAST: 6,
  CH_TELL: 7,
  CH_SAY: 8,
  CH_GM: 11,
  CH_RAID: 15,
};

// Animation types
export const Animations = {
  ANIM_STAND: 0x64,
  ANIM_WALK: 0x00,
  ANIM_RUN: 0x00,
  ANIM_JUMP: 0x00,
  ANIM_ATTACK: 0x00,
  ANIM_ATTACK2H: 0x00,
  ANIM_CAST: 0x00,
  ANIM_SIT: 0x00,
  ANIM_DUCK: 0x00,
};
