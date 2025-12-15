import { OpenRouterClient } from '../api/openrouter';
import { SpireClient, NpcType, SpawnGroup, SpawnEntry, Spawn2 } from '../api/spire';
import { DatabaseClient } from '../api/database';

// EQ Race IDs (common ones)
const RACES = {
  HUMAN: 1,
  BARBARIAN: 2,
  ERUDITE: 3,
  WOOD_ELF: 4,
  HIGH_ELF: 5,
  DARK_ELF: 6,
  HALF_ELF: 7,
  DWARF: 8,
  TROLL: 9,
  OGRE: 10,
  HALFLING: 11,
  GNOME: 12,
  SKELETON: 60,
  WOLF: 42,
  BEAR: 43,
  LION: 45,
  SNAKE: 46,
  SPIDER: 47,
  GNOLL: 39,
  GOBLIN: 59,
  ORC: 29,
  GHOST: 118,
  SPECTRE: 85,
  ZOMBIE: 70,
  GIANT: 25,
  DRAGON: 192,
  MERCHANT: 1, // Usually human merchant
};

// EQ Class IDs
const CLASSES = {
  WARRIOR: 1,
  CLERIC: 2,
  PALADIN: 3,
  RANGER: 4,
  SHADOWKNIGHT: 5,
  DRUID: 6,
  MONK: 7,
  BARD: 8,
  ROGUE: 9,
  SHAMAN: 10,
  NECROMANCER: 11,
  WIZARD: 12,
  MAGICIAN: 13,
  ENCHANTER: 14,
  BEASTLORD: 15,
  BERSERKER: 16,
  BANKER: 40,
  MERCHANT: 41,
};

interface GeneratedNpc {
  name: string;
  lastname?: string;
  level: number;
  race: number;
  class: number;
  hp: number;
  mana: number;
  description: string;
  dialogue?: {
    greeting: string;
    keywords: { [key: string]: string };
  };
  isMerchant: boolean;
  isQuestGiver: boolean;
}

interface NpcGenerationResult {
  npc: NpcType;
  spawnGroup?: SpawnGroup;
  spawnEntry?: SpawnEntry;
  spawn2?: Spawn2;
  luaScript?: string;
}

const NPC_GENERATION_PROMPT = `You are an EverQuest content designer. Generate an NPC based on the user's description.

Return a JSON object with these fields:
{
  "name": "NPC name (max 64 chars, no special characters)",
  "lastname": "Optional surname or title",
  "level": number between 1-65,
  "race": "one of: human, barbarian, erudite, wood_elf, high_elf, dark_elf, half_elf, dwarf, troll, ogre, halfling, gnome, skeleton, wolf, bear, lion, snake, spider, gnoll, goblin, orc, ghost, spectre, zombie, giant, dragon",
  "class": "one of: warrior, cleric, paladin, ranger, shadowknight, druid, monk, bard, rogue, shaman, necromancer, wizard, magician, enchanter, beastlord, berserker, banker, merchant",
  "description": "Brief flavor text about this NPC",
  "dialogue": {
    "greeting": "What the NPC says when hailed",
    "keywords": {
      "keyword1": "Response when player says keyword1",
      "keyword2": "Response when player says keyword2"
    }
  },
  "isMerchant": boolean,
  "isQuestGiver": boolean
}

Guidelines:
- Names should fit EverQuest's fantasy setting
- Level should make sense for the NPC type (merchants are usually low level, bosses high)
- Include interesting dialogue with 2-4 keywords
- Merchants sell goods, quest givers have tasks`;

export class NpcGenerator {
  private llm: OpenRouterClient;
  private spire: SpireClient;
  private db: DatabaseClient;

  constructor(llm: OpenRouterClient, spire: SpireClient, db: DatabaseClient) {
    this.llm = llm;
    this.spire = spire;
    this.db = db;
  }

  private getRaceId(raceName: string): number {
    const raceMap: { [key: string]: number } = {
      'human': RACES.HUMAN,
      'barbarian': RACES.BARBARIAN,
      'erudite': RACES.ERUDITE,
      'wood_elf': RACES.WOOD_ELF,
      'high_elf': RACES.HIGH_ELF,
      'dark_elf': RACES.DARK_ELF,
      'half_elf': RACES.HALF_ELF,
      'dwarf': RACES.DWARF,
      'troll': RACES.TROLL,
      'ogre': RACES.OGRE,
      'halfling': RACES.HALFLING,
      'gnome': RACES.GNOME,
      'skeleton': RACES.SKELETON,
      'wolf': RACES.WOLF,
      'bear': RACES.BEAR,
      'lion': RACES.LION,
      'snake': RACES.SNAKE,
      'spider': RACES.SPIDER,
      'gnoll': RACES.GNOLL,
      'goblin': RACES.GOBLIN,
      'orc': RACES.ORC,
      'ghost': RACES.GHOST,
      'spectre': RACES.SPECTRE,
      'zombie': RACES.ZOMBIE,
      'giant': RACES.GIANT,
      'dragon': RACES.DRAGON,
    };
    return raceMap[raceName.toLowerCase()] || RACES.HUMAN;
  }

  private getClassId(className: string): number {
    const classMap: { [key: string]: number } = {
      'warrior': CLASSES.WARRIOR,
      'cleric': CLASSES.CLERIC,
      'paladin': CLASSES.PALADIN,
      'ranger': CLASSES.RANGER,
      'shadowknight': CLASSES.SHADOWKNIGHT,
      'druid': CLASSES.DRUID,
      'monk': CLASSES.MONK,
      'bard': CLASSES.BARD,
      'rogue': CLASSES.ROGUE,
      'shaman': CLASSES.SHAMAN,
      'necromancer': CLASSES.NECROMANCER,
      'wizard': CLASSES.WIZARD,
      'magician': CLASSES.MAGICIAN,
      'enchanter': CLASSES.ENCHANTER,
      'beastlord': CLASSES.BEASTLORD,
      'berserker': CLASSES.BERSERKER,
      'banker': CLASSES.BANKER,
      'merchant': CLASSES.MERCHANT,
    };
    return classMap[className.toLowerCase()] || CLASSES.WARRIOR;
  }

  private calculateHp(level: number, classId: number): number {
    // Base HP formula varies by class
    const baseHp = level * 20;
    const classMultiplier = classId === CLASSES.WARRIOR ? 1.5 : 1.0;
    return Math.floor(baseHp * classMultiplier);
  }

  private calculateMana(level: number, classId: number): number {
    // Casters get mana, others don't
    const casterClasses = [
      CLASSES.CLERIC, CLASSES.DRUID, CLASSES.SHAMAN,
      CLASSES.NECROMANCER, CLASSES.WIZARD, CLASSES.MAGICIAN,
      CLASSES.ENCHANTER,
    ];
    if (casterClasses.includes(classId)) {
      return level * 15;
    }
    return 0;
  }

  async generateNpc(description: string): Promise<GeneratedNpc> {
    const generated = await this.llm.generateJSON<GeneratedNpc>(
      NPC_GENERATION_PROMPT,
      description
    );

    // Convert string race/class to IDs
    const raceId = this.getRaceId(generated.race as unknown as string);
    const classId = this.getClassId(generated.class as unknown as string);

    return {
      ...generated,
      race: raceId,
      class: classId,
      hp: generated.hp || this.calculateHp(generated.level, classId),
      mana: generated.mana || this.calculateMana(generated.level, classId),
    };
  }

  async createNpcInDatabase(generated: GeneratedNpc): Promise<NpcType> {
    const nextId = await this.db.getNextNpcId();

    const npcClass = generated.isMerchant ? CLASSES.MERCHANT : generated.class;

    const npc: NpcType = {
      id: nextId,
      name: generated.name,
      lastname: generated.lastname,
      level: generated.level,
      race: generated.race,
      class: npcClass,
      hp: generated.hp,
      mana: generated.mana,
      gender: 0, // Neutral
      size: 6, // Normal size
      runspeed: 1.25,
      walkspeed: 0.6,
      hp_regen_rate: Math.floor(generated.level / 2),
      mana_regen_rate: Math.floor(generated.level / 2),
      mindmg: Math.floor(generated.level * 0.5),
      maxdmg: Math.floor(generated.level * 1.5),
      attack_speed: 0,
      aggroradius: 70,
      findable: 1,
      trackable: 1,
    };

    // Insert directly into database
    await this.db.insertNpcType({
      id: nextId,
      name: npc.name,
      lastname: npc.lastname,
      level: npc.level,
      race: npc.race,
      class: npc.class,
      hp: npc.hp!,
      mana: npc.mana!,
      gender: npc.gender,
      size: npc.size,
      runspeed: npc.runspeed,
      walkspeed: npc.walkspeed,
      hp_regen_rate: npc.hp_regen_rate,
      mana_regen_rate: npc.mana_regen_rate,
      mindmg: npc.mindmg,
      maxdmg: npc.maxdmg,
      attack_speed: npc.attack_speed,
      aggroradius: npc.aggroradius,
      findable: npc.findable,
      trackable: npc.trackable,
    });

    return npc;
  }

  async spawnNpcInZone(
    npcId: number,
    zone: string,
    x: number,
    y: number,
    z: number,
    heading: number = 0
  ): Promise<{ spawnGroup: SpawnGroup; spawnEntry: SpawnEntry; spawn2: Spawn2 }> {
    const nextSpawnGroupId = await this.db.getNextSpawnGroupId();

    // Create spawn group directly in database
    const spawnGroup: SpawnGroup = {
      id: nextSpawnGroupId,
      name: `LLM_Generated_${Date.now()}`,
      spawn_limit: 1,
      dist: 0,
      delay: 0,
      despawn: 0,
      despawn_timer: 100,
    };
    await this.db.insertSpawnGroup({
      id: nextSpawnGroupId,
      name: spawnGroup.name,
      spawn_limit: spawnGroup.spawn_limit,
      dist: spawnGroup.dist,
      delay: spawnGroup.delay,
      despawn: spawnGroup.despawn,
      despawn_timer: spawnGroup.despawn_timer,
    });

    // Create spawn entry (link NPC to group)
    const spawnEntry: SpawnEntry = {
      spawngroupID: nextSpawnGroupId,
      npcID: npcId,
      chance: 100,
    };
    await this.db.insertSpawnEntry(spawnEntry);

    // Create spawn2 (location in zone)
    const spawn2Id = await this.db.insertSpawn2({
      spawngroupID: nextSpawnGroupId,
      zone: zone,
      x: x,
      y: y,
      z: z,
      heading: heading,
      respawntime: 300, // 5 minutes
      variance: 0,
    });

    const spawn2: Spawn2 = {
      id: spawn2Id,
      spawngroupID: nextSpawnGroupId,
      zone: zone,
      x: x,
      y: y,
      z: z,
      heading: heading,
      respawntime: 300,
      variance: 0,
    };

    return {
      spawnGroup,
      spawnEntry,
      spawn2,
    };
  }

  generateLuaScript(npc: GeneratedNpc, npcId: number): string {
    if (!npc.dialogue) {
      return '';
    }

    let script = `-- Auto-generated Lua script for ${npc.name}
-- NPC ID: ${npcId}

function event_say(e)
  if e.message:findi("hail") then
    e.self:Say("${npc.dialogue.greeting.replace(/"/g, '\\"')}")
`;

    // Add keyword responses
    for (const [keyword, response] of Object.entries(npc.dialogue.keywords)) {
      script += `  elseif e.message:findi("${keyword}") then
    e.self:Say("${response.replace(/"/g, '\\"')}")
`;
    }

    script += `  end
end
`;

    return script;
  }

  async generateAndSpawn(
    description: string,
    zone: string,
    x: number,
    y: number,
    z: number
  ): Promise<NpcGenerationResult> {
    console.log(`Generating NPC from description: "${description}"`);

    // Generate NPC from description
    const generated = await this.generateNpc(description);
    console.log('Generated NPC:', generated);

    // Create in database
    const npc = await this.createNpcInDatabase(generated);
    console.log('Created NPC with ID:', npc.id);

    // Spawn in zone
    const spawnResult = await this.spawnNpcInZone(
      npc.id!,
      zone,
      x,
      y,
      z
    );
    console.log('Created spawn at:', { zone, x, y, z });

    // Generate Lua script
    const luaScript = this.generateLuaScript(generated, npc.id!);

    return {
      npc,
      spawnGroup: spawnResult.spawnGroup,
      spawnEntry: spawnResult.spawnEntry,
      spawn2: spawnResult.spawn2,
      luaScript,
    };
  }
}
