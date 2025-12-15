// MUD Text Interface for EQ Client
// Provides classic MUD-style text rendering

import { EQClient, Entity, ZoneInfo } from '../eq-client';
import { EventEmitter } from 'events';

// Race names
const RACES: { [key: number]: string } = {
  1: 'Human', 2: 'Barbarian', 3: 'Erudite', 4: 'Wood Elf',
  5: 'High Elf', 6: 'Dark Elf', 7: 'Half Elf', 8: 'Dwarf',
  9: 'Troll', 10: 'Ogre', 11: 'Halfling', 12: 'Gnome',
  128: 'Iksar', 130: 'Vah Shir', 330: 'Froglok', 522: 'Drakkin',
  // NPCs
  60: 'Skeleton', 63: 'Ghoul', 69: 'Spectre', 75: 'Zombie',
  77: 'Gnoll', 93: 'Rat', 94: 'Bat', 120: 'Wolf',
  // Many more...
};

// Class names
const CLASSES: { [key: number]: string } = {
  1: 'Warrior', 2: 'Cleric', 3: 'Paladin', 4: 'Ranger',
  5: 'Shadowknight', 6: 'Druid', 7: 'Monk', 8: 'Bard',
  9: 'Rogue', 10: 'Shaman', 11: 'Necromancer', 12: 'Wizard',
  13: 'Magician', 14: 'Enchanter', 15: 'Beastlord', 16: 'Berserker',
};

// Zone descriptions for flavor
const ZONE_DESCRIPTIONS: { [key: string]: string } = {
  qeynos: `The southern district of the great city of Qeynos stretches before you.
Cobblestone streets wind between sturdy stone buildings. Guards patrol the streets
keeping the peace. The smell of baking bread mingles with the salt air from the
nearby harbor.`,
  qeynos2: `The northern gates of Qeynos loom ahead. Merchants hawk their wares
from wooden stalls. The Temple of Life stands prominently, its white spires
reaching toward the sky.`,
  freporte: `The bustling port city of Freeport spreads around you. Ships creak
at their moorings while merchants haggle over exotic goods. The militia keeps
a watchful eye on the diverse crowd.`,
  befallen: `A chill runs down your spine as you enter this accursed crypt.
The walls drip with moisture and the air smells of decay. Undead horrors
lurk in every shadow.`,
  commons: `The East Commonlands stretch before you - a vast expanse of
rolling grasslands dotted with ancient ruins. Travelers make their way
along the well-worn paths.`,
  nektulos: `Dark trees loom overhead in Nektulos Forest. The canopy blocks
most sunlight, leaving the forest floor in perpetual twilight. Strange
sounds echo from the shadows.`,
};

export class MudInterface extends EventEmitter {
  private client: EQClient;
  private outputBuffer: string[] = [];
  private combatLog: string[] = [];

  constructor(client: EQClient) {
    super();
    this.client = client;
    this.setupClientEvents();
  }

  private setupClientEvents(): void {
    this.client.on('status', (msg) => {
      this.output(`\n[System] ${msg}`);
    });

    this.client.on('error', (msg) => {
      this.output(`\n[ERROR] ${msg}`, 'error');
    });

    this.client.on('zoneEnter', (zone: ZoneInfo) => {
      this.renderZoneEntry(zone);
    });

    this.client.on('spawn', (entity: Entity) => {
      if (entity.isNpc) {
        this.output(`\n[${entity.name} appears nearby]`, 'spawn');
      }
    });

    this.client.on('despawn', (entity: Entity) => {
      this.output(`\n[${entity.name} disappears]`, 'despawn');
    });

    this.client.on('damage', (info: any) => {
      const msg = `${info.source} hits ${info.target} for ${info.amount} damage!`;
      this.output(msg, 'combat');
      this.combatLog.push(msg);
      if (this.combatLog.length > 50) this.combatLog.shift();
    });

    this.client.on('death', (info: any) => {
      this.output(`\n*** ${info.victim} has been SLAIN by ${info.killer}! ***`, 'death');
    });

    this.client.on('chat', (msg: any) => {
      this.renderChat(msg);
    });

    this.client.on('target', (entity?: Entity) => {
      if (entity) {
        this.output(`\nYou target ${entity.name}.`);
        this.renderEntityInfo(entity);
      }
    });

    this.client.on('hpUpdate', (entity: Entity) => {
      // Could show health bars for current target
    });
  }

  private output(text: string, type: string = 'normal'): void {
    this.outputBuffer.push(text);
    this.emit('output', { text, type });
  }

  // ============= Rendering =============

  private renderZoneEntry(zone: ZoneInfo): void {
    const border = '═'.repeat(60);
    const description = ZONE_DESCRIPTIONS[zone.shortName] ||
      `You find yourself in ${zone.longName}.`;

    const output = `
╔${border}╗
║  ${zone.longName.toUpperCase().padEnd(58)}║
╠${border}╣
${this.wrapText(description, 60).map(line => `║  ${line.padEnd(58)}║`).join('\n')}
╚${border}╝
`;
    this.output(output, 'zone');
  }

  private renderChat(msg: any): void {
    const channelNames: { [key: number]: string } = {
      0: 'Guild', 2: 'Group', 3: 'Shout', 4: 'Auction',
      5: 'OOC', 7: 'Tell', 8: 'Say', 15: 'Raid',
    };

    const channel = channelNames[msg.channel] || 'Unknown';
    let prefix = '';

    switch (msg.channel) {
      case 8: // Say
        prefix = `${msg.sender} says, '`;
        this.output(`\n${prefix}${msg.message}'`, 'say');
        break;
      case 3: // Shout
        prefix = `${msg.sender} shouts, '`;
        this.output(`\n${prefix}${msg.message}'`, 'shout');
        break;
      case 5: // OOC
        this.output(`\n[OOC] ${msg.sender}: ${msg.message}`, 'ooc');
        break;
      case 7: // Tell
        this.output(`\n${msg.sender} tells you, '${msg.message}'`, 'tell');
        break;
      case 2: // Group
        this.output(`\n[Group] ${msg.sender}: ${msg.message}`, 'group');
        break;
      default:
        this.output(`\n[${channel}] ${msg.sender}: ${msg.message}`);
    }
  }

  private renderEntityInfo(entity: Entity): void {
    const race = RACES[entity.race] || `Race ${entity.race}`;
    const class_ = entity.isNpc ? '' : ` ${CLASSES[entity.class_] || ''}`;
    const level = entity.level > 0 ? `Level ${entity.level}` : '';
    const health = this.renderHealthBar(entity.hp, entity.maxHp);

    const output = `
┌─────────────────────────────────────┐
│ ${entity.name.padEnd(35)} │
├─────────────────────────────────────┤
│ ${level} ${race}${class_}`.padEnd(38) + `│
│ ${health}`.padEnd(38) + `│
└─────────────────────────────────────┘`;

    this.output(output, 'info');
  }

  private renderHealthBar(current: number, max: number): string {
    const pct = max > 0 ? Math.floor((current / max) * 100) : 100;
    const filled = Math.floor(pct / 5);
    const empty = 20 - filled;
    return `HP: [${'█'.repeat(filled)}${'░'.repeat(empty)}] ${pct}%`;
  }

  // ============= Commands =============

  look(): void {
    const zone = this.client.getZone();
    if (!zone) {
      this.output('\nYou are nowhere.');
      return;
    }

    this.renderZoneEntry(zone);

    const nearby = this.client.getNearbyEntities(200);
    if (nearby.length > 0) {
      this.output('\nYou see:');
      for (const entity of nearby.slice(0, 15)) {
        const type = entity.isNpc ? '' : ' (Player)';
        const level = entity.level > 0 ? `[${entity.level}]` : '';
        this.output(`  ${level} ${entity.name}${type}`);
      }
    } else {
      this.output('\nThe area appears empty.');
    }

    this.renderMap();
  }

  who(): void {
    const entities = this.client.getEntities().filter(e => !e.isNpc);

    this.output('\n┌─────────────────────────────────────┐');
    this.output('│ PLAYERS IN ZONE                     │');
    this.output('├─────────────────────────────────────┤');

    if (entities.length === 0) {
      this.output('│ No other players nearby.            │');
    } else {
      for (const entity of entities) {
        const class_ = CLASSES[entity.class_] || '???';
        const line = ` ${entity.name} (${entity.level} ${class_})`;
        this.output(`│${line.padEnd(37)}│`);
      }
    }
    this.output('└─────────────────────────────────────┘');
  }

  consider(name: string): void {
    const entity = this.findEntity(name);
    if (!entity) {
      this.output(`\nYou don't see ${name} here.`);
      return;
    }

    this.renderEntityInfo(entity);

    // Con color based on level difference
    const myLevel = 1; // TODO: Get actual player level
    const diff = entity.level - myLevel;
    let con = 'even match';
    if (diff <= -6) con = 'like a sitting duck';
    else if (diff <= -3) con = 'like it would not be much of a challenge';
    else if (diff <= 0) con = 'like an even fight';
    else if (diff <= 2) con = 'like quite a gamble';
    else if (diff <= 5) con = 'like it would take a lot of luck';
    else con = 'like a certain death';

    this.output(`\n${entity.name} looks ${con}.`);
  }

  combat(): void {
    this.output('\n┌─────────────────────────────────────────────┐');
    this.output('│ COMBAT LOG                                  │');
    this.output('├─────────────────────────────────────────────┤');

    if (this.combatLog.length === 0) {
      this.output('│ No recent combat.                           │');
    } else {
      for (const line of this.combatLog.slice(-10)) {
        this.output(`│ ${line.substring(0, 43).padEnd(43)}│`);
      }
    }
    this.output('└─────────────────────────────────────────────┘');
  }

  renderMap(): void {
    const pos = this.client.getPosition();
    const nearby = this.client.getNearbyEntities(300);

    const width = 40;
    const height = 15;
    const scale = 20;

    // Initialize map
    const map: string[][] = [];
    for (let y = 0; y < height; y++) {
      map[y] = [];
      for (let x = 0; x < width; x++) {
        map[y][x] = '·';
      }
    }

    // Draw border
    for (let x = 0; x < width; x++) {
      map[0][x] = '─';
      map[height - 1][x] = '─';
    }
    for (let y = 0; y < height; y++) {
      map[y][0] = '│';
      map[y][width - 1] = '│';
    }
    map[0][0] = '┌';
    map[0][width - 1] = '┐';
    map[height - 1][0] = '└';
    map[height - 1][width - 1] = '┘';

    // Center of map
    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);

    // Plot entities
    for (const entity of nearby) {
      const relX = Math.round((entity.x - pos.x) / scale) + centerX;
      const relY = Math.round((entity.y - pos.y) / scale) + centerY;

      if (relX > 0 && relX < width - 1 && relY > 0 && relY < height - 1) {
        let symbol = 'n';
        if (!entity.isNpc) symbol = 'P';
        else if (entity.name.toLowerCase().includes('guard')) symbol = 'G';
        else if (entity.name.toLowerCase().includes('merchant')) symbol = 'M';
        else if (entity.level > 30) symbol = 'N';
        map[relY][relX] = symbol;
      }
    }

    // Player at center
    map[centerY][centerX] = '@';

    // Compass
    map[1][centerX] = 'N';
    map[height - 2][centerX] = 'S';
    map[centerY][2] = 'W';
    map[centerY][width - 3] = 'E';

    // Render
    this.output('\n' + map.map(row => row.join('')).join('\n'));
    this.output('\nLegend: @ You  P Player  G Guard  M Merchant  n NPC  N Elite');
  }

  inventory(): void {
    this.output('\n[Inventory display not yet implemented]');
  }

  help(): void {
    const help = `
╔═══════════════════════════════════════════════════════════════════╗
║                     EQ MUD COMMANDS                               ║
╠═══════════════════════════════════════════════════════════════════╣
║  MOVEMENT & EXPLORATION                                           ║
║    look, l        - Look around, see nearby entities              ║
║    map, m         - Show ASCII map                                ║
║    who            - Show players in zone                          ║
║    con <name>     - Consider an entity's difficulty               ║
║                                                                   ║
║  COMBAT                                                           ║
║    target <name>  - Target an entity                              ║
║    attack, a      - Toggle auto-attack                            ║
║    combat, c      - Show combat log                               ║
║                                                                   ║
║  COMMUNICATION                                                    ║
║    say <msg>      - Say something nearby                          ║
║    shout <msg>    - Shout to the zone                             ║
║    ooc <msg>      - Out of character chat                         ║
║    tell <n> <msg> - Send private message                          ║
║                                                                   ║
║  OTHER                                                            ║
║    inv            - Show inventory                                ║
║    help           - Show this help                                ║
║    quit           - Disconnect                                    ║
╚═══════════════════════════════════════════════════════════════════╝`;
    this.output(help);
  }

  // ============= Utility =============

  private findEntity(name: string): Entity | undefined {
    const lower = name.toLowerCase();
    for (const entity of this.client.getEntities()) {
      if (entity.name.toLowerCase().includes(lower)) {
        return entity;
      }
    }
    return undefined;
  }

  private wrapText(text: string, width: number): string[] {
    const words = text.split(/\s+/);
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      if (currentLine.length + word.length + 1 <= width) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  }

  // ============= Command Processing =============

  processCommand(input: string): void {
    const parts = input.trim().split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1).join(' ');

    switch (cmd) {
      case 'look':
      case 'l':
        this.look();
        break;

      case 'map':
      case 'm':
        this.renderMap();
        break;

      case 'who':
      case 'w':
        this.who();
        break;

      case 'con':
      case 'consider':
        if (args) this.consider(args);
        else this.output('\nConsider who?');
        break;

      case 'target':
      case 't':
        if (args) {
          const entity = this.client.targetByName(args);
          if (!entity) this.output(`\nYou don't see ${args} here.`);
        } else {
          this.output('\nTarget who?');
        }
        break;

      case 'attack':
      case 'a':
        this.client.attack(true);
        break;

      case 'stop':
        this.client.attack(false);
        break;

      case 'combat':
      case 'c':
        this.combat();
        break;

      case 'say':
      case "'":
        if (args) this.client.say(args);
        break;

      case 'shout':
        if (args) this.client.shout(args);
        break;

      case 'ooc':
        if (args) this.client.ooc(args);
        break;

      case 'tell':
        const tellParts = args.split(/\s+/);
        if (tellParts.length >= 2) {
          this.client.tell(tellParts[0], tellParts.slice(1).join(' '));
        }
        break;

      case 'inv':
      case 'inventory':
        this.inventory();
        break;

      case 'help':
      case 'h':
      case '?':
        this.help();
        break;

      case 'quit':
      case 'exit':
        this.client.disconnect();
        break;

      default:
        if (input.trim()) {
          this.output(`\nUnknown command: ${cmd}. Type 'help' for commands.`);
        }
    }
  }
}
