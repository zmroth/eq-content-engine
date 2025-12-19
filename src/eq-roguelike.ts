// EverQuest Roguelike Terminal Client
// Authentic classic EQ experience - full roguelike ASCII goodness
import * as blessed from 'blessed';
import * as fs from 'fs';
import * as zlib from 'zlib';
import { EQClient, Entity } from './client/eq-client';

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const config = {
  loginHost: '127.0.0.1',
  loginPort: 5998,
  username: 'admin',
  password: 'admin',
};

// Path to EQ maps (adjust for your setup)
const MAPS_PATH = '/home/zachroth/akk-stack/server/maps/legacy/base';

// ═══════════════════════════════════════════════════════════════════════════
// GLYPH SYSTEM - The soul of a roguelike
// ═══════════════════════════════════════════════════════════════════════════

const Glyphs = {
  // Player
  player: '@',

  // NPCs by type (determined from name patterns)
  npc: {
    merchant:    '$',
    banker:      'B',
    guard:       'G',
    guildmaster: 'T',
    trainer:     'T',
    soulbinder:  'S',
    priest:      'P',
    wizard:      'W',
    bartender:   '%',
    innkeeper:   'I',
    smith:       '&',
    pet:         'p',
    familiar:    'f',
    default:     'N',
  },

  // Players (other)
  pc: 'P',

  // Terrain
  terrain: {
    floor:      '.',
    wall:       '#',
    water:      '~',
    lava:       '=',
    void:       ' ',
    door:       '+',
    stairs_up:  '<',
    stairs_down: '>',
    zoneline:   '*',
  },

  // UI
  ui: {
    corner_tl: '╔', corner_tr: '╗', corner_bl: '╚', corner_br: '╝',
    h_line: '═', v_line: '║',
    t_left: '╠', t_right: '╣', t_top: '╦', t_bottom: '╩', cross: '╬',
    bar_full: '█', bar_half: '▓', bar_quarter: '░',
  },
};

// Color schemes
const Colors = {
  // Con colors (classic EQ)
  con: {
    impossible: 'red',        // 6+ levels above
    veryhard:   'red',        // 3-5 levels above
    hard:       'yellow',     // 1-2 levels above
    even:       'white',      // same level
    easy:       'blue',       // 1-3 levels below
    trivial:    'green',      // 4-10 levels below
    gray:       'gray',       // 10+ levels below
  },

  // NPC type colors
  npc: {
    merchant:    'yellow',
    banker:      'yellow',
    guard:       'cyan',
    guildmaster: 'magenta',
    trainer:     'magenta',
    soulbinder:  'cyan',
    pet:         'green',
    hostile:     'red',
    friendly:    'blue',
  },

  // UI colors
  ui: {
    border:   'blue',
    title:    'cyan',
    text:     'white',
    dim:      'gray',
    hp:       'red',
    mana:     'blue',
    stamina:  'yellow',
    exp:      'cyan',
  },
};

// Classic EQ consider messages
const ConMessages = {
  impossible: [
    "What would you like your tombstone to say?",
    "This creature would take an army to defeat!",
  ],
  veryhard: [
    "You would take a severe beating from this creature!",
    "This creature looks pretty scary.",
  ],
  hard: [
    "This creature looks tough!",
  ],
  even: [
    "Looks like a fair fight!",
    "You could probably win this fight.",
  ],
  easy: [
    "This creature doesn't look so tough.",
  ],
  trivial: [
    "This creature is no match for you!",
    "What a wimp! You could kill it in your sleep.",
  ],
  gray: [
    "This creature would be a waste of time to fight.",
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// ZONE GEOMETRY PARSER
// ═══════════════════════════════════════════════════════════════════════════

interface MapFace {
  x1: number; y1: number; z1: number;
  x2: number; y2: number; z2: number;
  x3: number; y3: number; z3: number;
}

interface ZoneGeometry {
  faces: MapFace[];
  bounds: {
    minX: number; maxX: number;
    minY: number; maxY: number;
    minZ: number; maxZ: number;
  };
  // Pre-computed 2D wall segments for rendering
  walls: { x1: number; y1: number; x2: number; y2: number; z: number }[];
  floors: { x: number; y: number; z: number }[];
}

function loadZoneGeometry(zoneName: string): ZoneGeometry | null {
  const mapPath = `${MAPS_PATH}/${zoneName}.map`;

  try {
    if (!fs.existsSync(mapPath)) {
      return null;
    }

    const data = fs.readFileSync(mapPath);
    const compressed = data.slice(12);
    const decompressed = zlib.inflateSync(compressed);

    const faceCount = decompressed.readUInt32LE(0);
    const faces: MapFace[] = [];
    const walls: { x1: number; y1: number; x2: number; y2: number; z: number }[] = [];
    const floors: { x: number; y: number; z: number }[] = [];

    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;

    let offset = 40;

    for (let i = 0; i < faceCount && offset + 36 <= decompressed.length; i++) {
      const x1 = decompressed.readFloatLE(offset);
      const y1 = decompressed.readFloatLE(offset + 4);
      const z1 = decompressed.readFloatLE(offset + 8);
      const x2 = decompressed.readFloatLE(offset + 12);
      const y2 = decompressed.readFloatLE(offset + 16);
      const z2 = decompressed.readFloatLE(offset + 20);
      const x3 = decompressed.readFloatLE(offset + 24);
      const y3 = decompressed.readFloatLE(offset + 28);
      const z3 = decompressed.readFloatLE(offset + 32);

      // Filter invalid coords
      const coords = [x1, y1, z1, x2, y2, z2, x3, y3, z3];
      if (coords.every(c => c > -50000 && c < 50000 && !isNaN(c))) {
        faces.push({ x1, y1, z1, x2, y2, z2, x3, y3, z3 });

        // Update bounds
        minX = Math.min(minX, x1, x2, x3);
        maxX = Math.max(maxX, x1, x2, x3);
        minY = Math.min(minY, y1, y2, y3);
        maxY = Math.max(maxY, y1, y2, y3);
        minZ = Math.min(minZ, z1, z2, z3);
        maxZ = Math.max(maxZ, z1, z2, z3);

        // Detect walls vs floors based on Z variance
        const zVariance = Math.max(
          Math.abs(z1 - z2),
          Math.abs(z2 - z3),
          Math.abs(z3 - z1)
        );

        const avgZ = (z1 + z2 + z3) / 3;

        if (zVariance > 10) {
          // Wall - store edge segments
          walls.push({ x1, y1, x2, y2, z: avgZ });
          walls.push({ x1: x2, y1: y2, x2: x3, y2: y3, z: avgZ });
          walls.push({ x1: x3, y1: y3, x2: x1, y2: y1, z: avgZ });
        } else {
          // Floor - store centroid
          floors.push({
            x: (x1 + x2 + x3) / 3,
            y: (y1 + y2 + y3) / 3,
            z: avgZ,
          });
        }
      }

      offset += 36;
    }

    return {
      faces,
      bounds: { minX, maxX, minY, maxY, minZ, maxZ },
      walls,
      floors,
    };
  } catch (e) {
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// NPC TYPE DETECTION
// ═══════════════════════════════════════════════════════════════════════════

function getNpcType(name: string): keyof typeof Glyphs.npc {
  const n = name.toLowerCase();

  if (/merchant|vendor|trader|shopkeep|supplier/.test(n)) return 'merchant';
  if (/banker/.test(n)) return 'banker';
  if (/guard|watchman|soldier|sentinel|protector/.test(n)) return 'guard';
  if (/guildmaster/.test(n)) return 'guildmaster';
  if (/trainer|master/.test(n)) return 'trainer';
  if (/soulbinder/.test(n)) return 'soulbinder';
  if (/priest|cleric|healer/.test(n)) return 'priest';
  if (/wizard|mage|sorcerer/.test(n)) return 'wizard';
  if (/bartender|barkeep/.test(n)) return 'bartender';
  if (/innkeeper/.test(n)) return 'innkeeper';
  if (/smith|forge|armor|weapon/.test(n)) return 'smith';
  if (/pet|warder|companion/.test(n)) return 'pet';
  if (/familiar/.test(n)) return 'familiar';

  return 'default';
}

function getConLevel(targetLevel: number, playerLevel: number): keyof typeof Colors.con {
  const diff = targetLevel - playerLevel;

  if (diff >= 6) return 'impossible';
  if (diff >= 3) return 'veryhard';
  if (diff >= 1) return 'hard';
  if (diff >= -2) return 'even';
  if (diff >= -5) return 'easy';
  if (diff >= -10) return 'trivial';
  return 'gray';
}

// ═══════════════════════════════════════════════════════════════════════════
// ROGUELIKE CLIENT
// ═══════════════════════════════════════════════════════════════════════════

class EQRoguelike {
  private client: EQClient;
  private screen: blessed.Widgets.Screen;

  // UI Widgets
  private mapBox!: blessed.Widgets.BoxElement;
  private statsBox!: blessed.Widgets.BoxElement;
  private targetBox!: blessed.Widgets.BoxElement;
  private nearbyBox!: blessed.Widgets.BoxElement;
  private spellBar!: blessed.Widgets.BoxElement;
  private logBox!: blessed.Widgets.BoxElement;
  private inputBox!: blessed.Widgets.TextboxElement;
  private statusLine!: blessed.Widgets.BoxElement;

  // Game state
  private state: 'connecting' | 'servers' | 'characters' | 'zoning' | 'playing' = 'connecting';
  private characters: any[] = [];
  private spawns: Map<number, Entity> = new Map();
  private targetId: number = 0;
  private player = { x: 0, y: 0, z: 0, heading: 0 };
  private zoneName: string = 'Unknown';
  private zoneShort: string = '';
  private zoneGeometry: ZoneGeometry | null = null;

  // Character info
  private charName: string = '';
  private charLevel: number = 1;
  private charClass: number = 1;
  private charRace: number = 1;
  private hp: number = 100;
  private maxHp: number = 100;
  private mana: number = 100;
  private maxMana: number = 100;
  private stamina: number = 100;
  private maxStamina: number = 100;

  // Combat state
  private autoAttack: boolean = false;
  private isSitting: boolean = false;
  private combatLog: string[] = [];

  // Map viewport
  private viewScale: number = 8;

  // Spell bar
  private spells: (string | null)[] = ['Minor Heal', 'Light Heal', 'Cure Poison', 'SoW', 'Gate', null, null, null];

  // Game time (simulated)
  private gameTime = { hour: 9, minute: 0 };
  private isNight = false;

  constructor() {
    this.client = new EQClient(config);
    this.screen = blessed.screen({
      smartCSR: true,
      title: 'EverQuest Roguelike',
      fullUnicode: true,
    });

    this.createUI();
    this.setupEventHandlers();
    this.setupKeyBindings();
    this.startGameLoop();
  }

  // ═══════════════════════════════════════════════════════════════════════
  // UI CREATION
  // ═══════════════════════════════════════════════════════════════════════

  private createUI(): void {
    // Main map panel (left side, takes most of screen)
    this.mapBox = blessed.box({
      parent: this.screen,
      top: 0,
      left: 0,
      width: '60%',
      height: '70%',
      border: { type: 'line' },
      style: {
        border: { fg: 'blue' },
      },
      label: ' {cyan-fg}{bold}Zone{/bold}{/cyan-fg} ',
      tags: true,
    });

    // Character stats panel (top right)
    this.statsBox = blessed.box({
      parent: this.screen,
      top: 0,
      left: '60%',
      width: '40%',
      height: '30%',
      border: { type: 'line' },
      style: {
        border: { fg: 'blue' },
      },
      label: ' {cyan-fg}{bold}Character{/bold}{/cyan-fg} ',
      tags: true,
    });

    // Target panel (middle right)
    this.targetBox = blessed.box({
      parent: this.screen,
      top: '30%',
      left: '60%',
      width: '40%',
      height: '20%',
      border: { type: 'line' },
      style: {
        border: { fg: 'blue' },
      },
      label: ' {cyan-fg}{bold}Target{/bold}{/cyan-fg} ',
      tags: true,
    });

    // Nearby list (bottom right)
    this.nearbyBox = blessed.box({
      parent: this.screen,
      top: '50%',
      left: '60%',
      width: '40%',
      height: '20%',
      border: { type: 'line' },
      style: {
        border: { fg: 'blue' },
      },
      label: ' {cyan-fg}{bold}Nearby{/bold}{/cyan-fg} ',
      tags: true,
      scrollable: true,
    });

    // Spell bar (below map)
    this.spellBar = blessed.box({
      parent: this.screen,
      top: '70%',
      left: 0,
      width: '60%',
      height: 3,
      border: { type: 'line' },
      style: {
        border: { fg: 'blue' },
      },
      tags: true,
    });

    // Combat log / messages
    this.logBox = blessed.box({
      parent: this.screen,
      top: '73%',
      left: 0,
      width: '100%',
      height: '22%',
      border: { type: 'line' },
      style: {
        border: { fg: 'blue' },
      },
      label: ' {cyan-fg}{bold}Messages{/bold}{/cyan-fg} ',
      tags: true,
      scrollable: true,
      alwaysScroll: true,
    });

    // Status/help line
    this.statusLine = blessed.box({
      parent: this.screen,
      bottom: 0,
      left: 0,
      width: '100%',
      height: 1,
      style: {
        fg: 'gray',
        bg: 'black',
      },
      tags: true,
    });

    this.updateStatusLine();
  }

  // ═══════════════════════════════════════════════════════════════════════
  // EVENT HANDLERS
  // ═══════════════════════════════════════════════════════════════════════

  private setupEventHandlers(): void {
    this.client.on('status', (msg: string) => {
      this.log(`{yellow-fg}${msg}{/yellow-fg}`);
    });

    this.client.on('error', (err: any) => {
      this.log(`{red-fg}Error: ${err?.message || err}{/red-fg}`);
    });

    this.client.on('serverList', (servers: any[]) => {
      this.log('{cyan-fg}Received server list{/cyan-fg}');
      this.state = 'servers';
      // Auto-select first server
      setTimeout(() => {
        if (servers.length > 0) {
          this.log('Auto-selecting server...');
          this.client.selectServer(1);
        }
      }, 500);
    });

    this.client.on('characterList', (chars: any[]) => {
      this.characters = chars;
      this.state = 'characters';
      this.showCharacterSelect();
    });

    this.client.on('playerProfile', (profile: any) => {
      this.charName = profile.name;
      this.charLevel = profile.level;
      this.charClass = profile.class_;
      this.charRace = profile.race;
      this.log(`{green-fg}Profile loaded: ${profile.name} Level ${profile.level}{/green-fg}`);

      // Profile received = we're in the zone, transition to playing
      if (this.state === 'zoning') {
        this.state = 'playing';
        this.zoneName = 'Zone';  // Will be updated by zoneEnter if it fires
        this.log(`{green-fg}{bold}*** Entering world ***{/bold}{/green-fg}`);
        this.mapBox.setLabel(` {cyan-fg}{bold}${this.zoneName}{/bold}{/cyan-fg} `);
      }
    });

    this.client.on('zoneEnter', (zone: any) => {
      this.zoneName = zone.longName || zone.shortName || 'Unknown';
      this.zoneShort = zone.shortName || '';
      this.state = 'playing';
      this.spawns.clear();

      // Try to load zone geometry
      if (this.zoneShort) {
        this.zoneGeometry = loadZoneGeometry(this.zoneShort);
        if (this.zoneGeometry) {
          this.log(`{cyan-fg}Loaded zone geometry: ${this.zoneGeometry.faces.length} faces{/cyan-fg}`);
        }
      }

      this.log('');
      this.log(`{green-fg}{bold}*** You have entered ${this.zoneName} ***{/bold}{/green-fg}`);
      this.log(`{yellow-fg}You will return to your bind point when you die.{/yellow-fg}`);
      this.log('');

      this.mapBox.setLabel(` {cyan-fg}{bold}${this.zoneName}{/bold}{/cyan-fg} `);
    });

    this.client.on('spawn', (spawn: Entity) => {
      this.spawns.set(spawn.id, spawn);
    });

    this.client.on('despawn', (entity: Entity) => {
      this.spawns.delete(entity.id);
      if (this.targetId === entity.id) {
        this.targetId = 0;
        this.autoAttack = false;
        this.log('{gray-fg}Your target has been lost.{/gray-fg}');
      }
    });

    this.client.on('position', (pos: any) => {
      this.player = pos;
    });

    this.client.on('chat', (msg: any) => {
      this.handleChat(msg);
    });

    this.client.on('damage', (dmg: any) => {
      if (dmg.target === this.charName) {
        this.log(`{red-fg}${dmg.source} hits YOU for ${dmg.amount} damage!{/red-fg}`);
      } else if (dmg.source === this.charName) {
        this.log(`{white-fg}You hit ${dmg.target} for ${dmg.amount} damage.{/white-fg}`);
      }
    });

    this.client.on('death', (death: any) => {
      if (death.victim === this.charName) {
        this.log('');
        this.log(`{red-fg}{bold}You have been slain by ${death.killer}!{/bold}{/red-fg}`);
        this.autoAttack = false;
      } else {
        this.log(`{gray-fg}${death.victim} has been slain by ${death.killer}.{/gray-fg}`);
      }
    });
  }

  private handleChat(msg: any): void {
    switch (msg.channel) {
      case 0: // Say
        this.log(`{white-fg}${msg.sender} says, '${msg.message}'{/white-fg}`);
        break;
      case 1: // Tell
        this.log(`{magenta-fg}${msg.sender} tells you, '${msg.message}'{/magenta-fg}`);
        break;
      case 2: // Group
        this.log(`{cyan-fg}${msg.sender} tells the group, '${msg.message}'{/cyan-fg}`);
        break;
      case 5: // Shout
        this.log(`{red-fg}${msg.sender} shouts, '${msg.message}'{/red-fg}`);
        break;
      case 7: // OOC
        this.log(`{green-fg}${msg.sender} says out of character, '${msg.message}'{/green-fg}`);
        break;
      default:
        this.log(`[${msg.channel}] ${msg.sender}: ${msg.message}`);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // KEY BINDINGS
  // ═══════════════════════════════════════════════════════════════════════

  private setupKeyBindings(): void {
    // Quit
    this.screen.key(['C-c', 'q'], () => {
      process.exit(0);
    });

    // Character select (number keys)
    this.screen.key(['1', '2', '3', '4', '5', '6', '7', '8', '9'], (ch) => {
      if (this.state === 'characters') {
        const num = parseInt(ch);
        if (num >= 1 && num <= this.characters.length) {
          this.enterWorld(this.characters[num - 1].name);
        }
      } else if (this.state === 'playing') {
        // Spell keys
        this.castSpell(parseInt(ch) - 1);
      }
    });

    // Movement (WASD + vim keys + arrows)
    this.screen.key(['w', 'k', 'up'], () => this.move(0, 1));
    this.screen.key(['s', 'j', 'down'], () => this.move(0, -1));
    this.screen.key(['a', 'h', 'left'], () => this.move(-1, 0));
    this.screen.key(['d', 'l', 'right'], () => this.move(1, 0));

    // Diagonal movement
    this.screen.key(['y'], () => this.move(-1, 1));  // NW
    this.screen.key(['u'], () => this.move(1, 1));   // NE
    this.screen.key(['b'], () => this.move(-1, -1)); // SW
    this.screen.key(['n'], () => this.move(1, -1));  // SE

    // Targeting
    this.screen.key(['tab', 't'], () => this.cycleTarget());
    this.screen.key(['S-tab', 'T'], () => this.cycleTarget(true));

    // Combat
    this.screen.key(['space'], () => this.toggleAutoAttack());
    this.screen.key(['c'], () => this.consider());

    // Interaction
    this.screen.key(['H'], () => this.hail());
    this.screen.key(['S-s'], () => this.toggleSit());

    // Look
    this.screen.key(['x'], () => this.look());

    // Map zoom
    this.screen.key(['=', '+'], () => { this.viewScale = Math.max(4, this.viewScale - 1); });
    this.screen.key(['-', '_'], () => { this.viewScale = Math.min(20, this.viewScale + 1); });

    // Help
    this.screen.key(['?', 'f1'], () => this.showHelp());
  }

  // ═══════════════════════════════════════════════════════════════════════
  // GAME LOOP
  // ═══════════════════════════════════════════════════════════════════════

  private startGameLoop(): void {
    setInterval(() => {
      if (this.state !== 'playing') return;

      // Update position from client
      const pos = this.client.getPosition();
      if (pos) this.player = pos;

      // Game time progression
      this.gameTime.minute++;
      if (this.gameTime.minute >= 60) {
        this.gameTime.minute = 0;
        this.gameTime.hour = (this.gameTime.hour + 1) % 24;
      }
      this.isNight = this.gameTime.hour < 6 || this.gameTime.hour >= 20;

      // Render
      this.render();
    }, 100);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // RENDERING
  // ═══════════════════════════════════════════════════════════════════════

  private render(): void {
    this.renderMap();
    this.renderStats();
    this.renderTarget();
    this.renderNearby();
    this.renderSpellBar();
    this.updateStatusLine();
    this.screen.render();
  }

  private renderMap(): void {
    const width = (this.mapBox.width as number) - 2;
    const height = (this.mapBox.height as number) - 2;
    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);

    // Create map buffer
    const buffer: string[][] = [];
    for (let y = 0; y < height; y++) {
      buffer[y] = [];
      for (let x = 0; x < width; x++) {
        buffer[y][x] = this.isNight ? ' ' : '{gray-fg}.{/gray-fg}';
      }
    }

    // Render zone geometry (walls)
    if (this.zoneGeometry) {
      this.zoneGeometry.walls.forEach(wall => {
        // Only render walls near player's Z level
        if (Math.abs(wall.z - this.player.z) > 50) return;

        const sx1 = Math.floor((wall.x1 - this.player.x) / this.viewScale) + centerX;
        const sy1 = Math.floor((wall.y1 - this.player.y) / this.viewScale) + centerY;
        const sx2 = Math.floor((wall.x2 - this.player.x) / this.viewScale) + centerX;
        const sy2 = Math.floor((wall.y2 - this.player.y) / this.viewScale) + centerY;

        // Simple line drawing
        this.drawLine(buffer, sx1, sy1, sx2, sy2, '{gray-fg}#{/gray-fg}', width, height);
      });
    }

    // Render spawns
    this.spawns.forEach((spawn, id) => {
      const sx = Math.floor((spawn.x - this.player.x) / this.viewScale) + centerX;
      const sy = centerY - Math.floor((spawn.y - this.player.y) / this.viewScale);

      if (sx >= 0 && sx < width && sy >= 0 && sy < height) {
        const isTarget = id === this.targetId;
        let glyph: string;
        let color: string;

        if (spawn.isNpc) {
          const npcType = getNpcType(spawn.name);
          glyph = Glyphs.npc[npcType];

          // Color by con level
          const conLevel = getConLevel(spawn.level || 1, this.charLevel);
          color = Colors.con[conLevel];

          // Override color for special NPCs
          if (npcType === 'merchant' || npcType === 'banker') {
            color = 'yellow';
          } else if (npcType === 'guard') {
            color = 'cyan';
          }
        } else {
          glyph = Glyphs.pc;
          color = 'blue';
        }

        if (isTarget) {
          buffer[sy][sx] = `{inverse}{${color}-fg}${glyph}{/${color}-fg}{/inverse}`;
        } else {
          buffer[sy][sx] = `{${color}-fg}${glyph}{/${color}-fg}`;
        }
      }
    });

    // Render player at center
    buffer[centerY][centerX] = '{bold}{green-fg}@{/green-fg}{/bold}';

    // Convert buffer to string
    const content = buffer.map(row => row.join('')).join('\n');
    this.mapBox.setContent(content);

    // Update label with compass
    const compass = this.getCompass();
    const timeStr = this.getTimeString();
    this.mapBox.setLabel(` {cyan-fg}{bold}${this.zoneName}{/bold}{/cyan-fg} ${timeStr} ${compass} `);
  }

  private drawLine(buffer: string[][], x1: number, y1: number, x2: number, y2: number, char: string, width: number, height: number): void {
    // Bresenham's line algorithm
    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);
    const sx = x1 < x2 ? 1 : -1;
    const sy = y1 < y2 ? 1 : -1;
    let err = dx - dy;

    let x = x1;
    let y = y1;

    for (let i = 0; i < 100; i++) { // Limit iterations
      if (x >= 0 && x < width && y >= 0 && y < height) {
        buffer[y][x] = char;
      }

      if (x === x2 && y === y2) break;

      const e2 = 2 * err;
      if (e2 > -dy) { err -= dy; x += sx; }
      if (e2 < dx) { err += dx; y += sy; }
    }
  }

  private renderStats(): void {
    const lines: string[] = [];

    lines.push(`{bold}{white-fg}${this.charName}{/white-fg}{/bold}`);
    lines.push(`{gray-fg}Level ${this.charLevel} ${this.getClassName(this.charClass)} ${this.getRaceName(this.charRace)}{/gray-fg}`);
    lines.push('');

    // HP bar
    lines.push(`HP  ${this.renderBar(this.hp, this.maxHp, 15, 'red')}`);

    // Mana bar (if caster)
    if (this.isCasterClass()) {
      lines.push(`MP  ${this.renderBar(this.mana, this.maxMana, 15, 'blue')}`);
    }

    // Stamina
    lines.push(`STA ${this.renderBar(this.stamina, this.maxStamina, 15, 'yellow')}`);

    lines.push('');

    // Status
    let status = '';
    if (this.autoAttack) status += '{red-fg}[COMBAT]{/red-fg} ';
    if (this.isSitting) status += '{cyan-fg}[SITTING]{/cyan-fg} ';
    if (!status) status = '{green-fg}[STANDING]{/green-fg}';
    lines.push(status);

    // Location
    lines.push('');
    lines.push(`{gray-fg}Loc: ${this.player.x.toFixed(0)}, ${this.player.y.toFixed(0)}, ${this.player.z.toFixed(0)}{/gray-fg}`);

    this.statsBox.setContent(lines.join('\n'));
  }

  private renderBar(current: number, max: number, width: number, color: string): string {
    const filled = Math.floor((current / max) * width);
    const empty = width - filled;
    const pct = Math.floor((current / max) * 100);

    return `{${color}-fg}${'█'.repeat(filled)}{/${color}-fg}{gray-fg}${'░'.repeat(empty)}{/gray-fg} ${pct}%`;
  }

  private renderTarget(): void {
    const target = this.spawns.get(this.targetId);

    if (!target) {
      this.targetBox.setContent('{gray-fg}No target{/gray-fg}');
      return;
    }

    const conLevel = getConLevel(target.level || 1, this.charLevel);
    const conColor = Colors.con[conLevel];

    const dist = Math.sqrt(
      Math.pow(target.x - this.player.x, 2) +
      Math.pow(target.y - this.player.y, 2)
    );

    const lines: string[] = [];
    lines.push(`{${conColor}-fg}{bold}${target.name}{/bold}{/${conColor}-fg}`);
    lines.push(`{gray-fg}Level ${target.level || '??'}{/gray-fg}`);
    lines.push(`{gray-fg}Distance: ${dist.toFixed(0)}{/gray-fg}`);
    lines.push('');
    lines.push(this.renderBar(target.hp || 100, target.maxHp || 100, 15, 'red'));

    this.targetBox.setContent(lines.join('\n'));
  }

  private renderNearby(): void {
    const nearby = Array.from(this.spawns.values())
      .map(s => ({
        ...s,
        dist: Math.sqrt(Math.pow(s.x - this.player.x, 2) + Math.pow(s.y - this.player.y, 2))
      }))
      .filter(s => s.dist < 200 && s.dist > 0)
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 10);

    const lines: string[] = [];

    nearby.forEach(npc => {
      const isTarget = npc.id === this.targetId;
      const conLevel = getConLevel(npc.level || 1, this.charLevel);
      const conColor = Colors.con[conLevel];
      const prefix = isTarget ? '{yellow-fg}>{/yellow-fg}' : ' ';
      const name = npc.name.substring(0, 15).padEnd(15);

      lines.push(`${prefix}{${conColor}-fg}${name}{/${conColor}-fg} ${npc.dist.toFixed(0).padStart(4)}`);
    });

    if (lines.length === 0) {
      lines.push('{gray-fg}Nothing nearby{/gray-fg}');
    }

    this.nearbyBox.setContent(lines.join('\n'));
  }

  private renderSpellBar(): void {
    let bar = '';

    for (let i = 0; i < 8; i++) {
      const spell = this.spells[i];
      if (spell) {
        bar += `{cyan-fg}[${i + 1}:${spell.substring(0, 3)}]{/cyan-fg} `;
      } else {
        bar += `{gray-fg}[${i + 1}: ]{/gray-fg} `;
      }
    }

    this.spellBar.setContent(bar);
  }

  private updateStatusLine(): void {
    if (this.state === 'playing') {
      this.statusLine.setContent(
        ' {gray-fg}WASD:Move Tab:Target Space:Attack C:Con H:Hail S:Sit 1-8:Spells +/-:Zoom ?:Help{/gray-fg}'
      );
    } else if (this.state === 'characters') {
      this.statusLine.setContent(
        ' {gray-fg}Press 1-9 to select character{/gray-fg}'
      );
    } else {
      this.statusLine.setContent(
        ' {gray-fg}Connecting...{/gray-fg}'
      );
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // ACTIONS
  // ═══════════════════════════════════════════════════════════════════════

  private move(dx: number, dy: number): void {
    if (this.state !== 'playing') return;
    if (this.isSitting) {
      this.log('{yellow-fg}You cannot move while sitting!{/yellow-fg}');
      return;
    }

    const moveSpeed = 15;
    this.player.x += dx * moveSpeed;
    this.player.y += dy * moveSpeed;

    this.client.move(this.player.x, this.player.y, this.player.z);
  }

  private cycleTarget(reverse: boolean = false): void {
    if (this.state !== 'playing') return;

    const entities = Array.from(this.spawns.values())
      .map(s => ({
        ...s,
        dist: Math.sqrt(Math.pow(s.x - this.player.x, 2) + Math.pow(s.y - this.player.y, 2))
      }))
      .filter(s => s.dist < 200)
      .sort((a, b) => a.dist - b.dist);

    if (entities.length === 0) {
      this.log('{gray-fg}No targets nearby.{/gray-fg}');
      return;
    }

    const currentIdx = entities.findIndex(e => e.id === this.targetId);
    let nextIdx: number;

    if (reverse) {
      nextIdx = currentIdx <= 0 ? entities.length - 1 : currentIdx - 1;
    } else {
      nextIdx = (currentIdx + 1) % entities.length;
    }

    this.targetId = entities[nextIdx].id;
    const target = entities[nextIdx];
    this.log(`Targeting ${target.name}`);
  }

  private toggleAutoAttack(): void {
    if (this.state !== 'playing') return;

    if (!this.targetId) {
      this.log('{yellow-fg}You must have a target to attack.{/yellow-fg}');
      return;
    }

    const target = this.spawns.get(this.targetId);
    if (!target) return;

    this.autoAttack = !this.autoAttack;

    if (this.autoAttack) {
      if (this.isSitting) {
        this.isSitting = false;
        this.log('{yellow-fg}You stand up.{/yellow-fg}');
      }
      this.log(`{red-fg}You begin attacking ${target.name}!{/red-fg}`);
    } else {
      this.log('{yellow-fg}Auto attack off.{/yellow-fg}');
    }
  }

  private consider(): void {
    if (this.state !== 'playing') return;

    const target = this.spawns.get(this.targetId);
    if (!target) {
      this.log('{yellow-fg}You must first select a target.{/yellow-fg}');
      return;
    }

    const conLevel = getConLevel(target.level || 1, this.charLevel);
    const conColor = Colors.con[conLevel];
    const messages = ConMessages[conLevel];
    const message = messages[Math.floor(Math.random() * messages.length)];

    this.log(`{${conColor}-fg}${message}{/${conColor}-fg}`);
  }

  private hail(): void {
    if (this.state !== 'playing') return;

    const target = this.spawns.get(this.targetId);
    if (!target) {
      this.log('{yellow-fg}You must first select a target.{/yellow-fg}');
      return;
    }

    this.client.say(`Hail, ${target.name}`);
    this.log(`{white-fg}You say, 'Hail, ${target.name}'{/white-fg}`);

    // Simulated NPC response
    setTimeout(() => {
      const npcType = getNpcType(target.name);
      let response = 'Well met, traveler.';

      if (npcType === 'merchant') response = 'Greetings! Care to see my [wares]?';
      else if (npcType === 'guard') response = 'Keep the peace, citizen.';
      else if (npcType === 'guildmaster') response = 'Ready to [train]?';
      else if (npcType === 'banker') response = 'I can hold your [coins] for safekeeping.';

      this.log(`{yellow-fg}${target.name} says, '${response}'{/yellow-fg}`);
    }, 300);
  }

  private toggleSit(): void {
    if (this.state !== 'playing') return;

    if (this.autoAttack) {
      this.log('{yellow-fg}You cannot sit while attacking!{/yellow-fg}');
      return;
    }

    this.isSitting = !this.isSitting;

    if (this.isSitting) {
      this.log('{yellow-fg}You sit down and begin to rest.{/yellow-fg}');
      if (this.isCasterClass()) {
        this.log('{cyan-fg}You begin to meditate.{/cyan-fg}');
      }
    } else {
      this.log('{yellow-fg}You stand up.{/yellow-fg}');
    }
  }

  private look(): void {
    if (this.state !== 'playing') return;

    const target = this.spawns.get(this.targetId);
    if (target) {
      this.log(`{cyan-fg}You look at ${target.name}.{/cyan-fg}`);
      this.log(`{gray-fg}Level: ${target.level || '??'}{/gray-fg}`);
      this.log(`{gray-fg}Location: (${target.x.toFixed(0)}, ${target.y.toFixed(0)}, ${target.z.toFixed(0)}){/gray-fg}`);
    } else {
      this.log('{cyan-fg}You survey your surroundings...{/cyan-fg}');
      this.log(`{gray-fg}Zone: ${this.zoneName}{/gray-fg}`);
      this.log(`{gray-fg}Spawns: ${this.spawns.size}{/gray-fg}`);
    }
  }

  private castSpell(slot: number): void {
    if (this.state !== 'playing') return;

    const spell = this.spells[slot];
    if (!spell) {
      this.log('{gray-fg}No spell memorized in that slot.{/gray-fg}');
      return;
    }

    this.log(`{cyan-fg}You begin casting ${spell}...{/cyan-fg}`);

    setTimeout(() => {
      this.log(`{cyan-fg}Your ${spell} spell takes effect.{/cyan-fg}`);

      if (spell.includes('Heal')) {
        this.hp = Math.min(this.maxHp, this.hp + 50);
        this.log(`{green-fg}You have been healed.{/green-fg}`);
      }
    }, 1000);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // UI SCREENS
  // ═══════════════════════════════════════════════════════════════════════

  private showCharacterSelect(): void {
    this.logBox.setContent('');

    this.log('');
    this.log('{yellow-fg}{bold}╔══════════════════════════════════╗{/bold}{/yellow-fg}');
    this.log('{yellow-fg}{bold}║       SELECT A CHARACTER         ║{/bold}{/yellow-fg}');
    this.log('{yellow-fg}{bold}╚══════════════════════════════════╝{/bold}{/yellow-fg}');
    this.log('');

    this.characters.forEach((char, i) => {
      const className = this.getClassName(char.class_);
      const raceName = this.getRaceName(char.race);
      this.log(`  {yellow-fg}[${i + 1}]{/yellow-fg} {bold}${char.name}{/bold} - Lv${char.level} ${raceName} ${className}`);
    });

    this.log('');
    this.log('{gray-fg}Press 1-9 to select{/gray-fg}');

    this.screen.render();
  }

  private showHelp(): void {
    this.log('');
    this.log('{cyan-fg}{bold}═══════════════════════════════════════════════{/bold}{/cyan-fg}');
    this.log('{cyan-fg}{bold}              EVERQUEST ROGUELIKE              {/bold}{/cyan-fg}');
    this.log('{cyan-fg}{bold}═══════════════════════════════════════════════{/bold}{/cyan-fg}');
    this.log('');
    this.log('{yellow-fg}Movement:{/yellow-fg}');
    this.log('  WASD / hjkl / Arrows - Move');
    this.log('  y u b n              - Diagonals');
    this.log('');
    this.log('{yellow-fg}Combat:{/yellow-fg}');
    this.log('  Tab     - Cycle targets');
    this.log('  Space   - Toggle auto-attack');
    this.log('  c       - Consider target');
    this.log('  1-8     - Cast spell');
    this.log('');
    this.log('{yellow-fg}Interaction:{/yellow-fg}');
    this.log('  H       - Hail target');
    this.log('  S       - Sit/Stand');
    this.log('  x       - Look/Examine');
    this.log('');
    this.log('{yellow-fg}Map:{/yellow-fg}');
    this.log('  + / -   - Zoom in/out');
    this.log('');
    this.log('{yellow-fg}System:{/yellow-fg}');
    this.log('  q / C-c - Quit');
    this.log('  ?       - This help');
    this.log('');
  }

  private enterWorld(name: string): void {
    this.state = 'zoning';
    this.charName = name;
    this.log(`{green-fg}Entering world as ${name}...{/green-fg}`);
    this.client.enterWorld(name);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // UTILITIES
  // ═══════════════════════════════════════════════════════════════════════

  private log(msg: string): void {
    this.combatLog.push(msg);
    if (this.combatLog.length > 100) this.combatLog.shift();

    this.logBox.setContent(this.combatLog.join('\n'));
    this.logBox.setScrollPerc(100);
    this.screen.render();
  }

  private getCompass(): string {
    const heading = ((this.player.heading % 360) + 360) % 360;
    const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const idx = Math.round(heading / 45) % 8;
    return `{yellow-fg}[${dirs[idx]}]{/yellow-fg}`;
  }

  private getTimeString(): string {
    const hour = this.gameTime.hour % 12 || 12;
    const ampm = this.gameTime.hour >= 12 ? 'PM' : 'AM';
    const icon = this.isNight ? '☽' : '☀';
    return `{gray-fg}${icon} ${hour}:${this.gameTime.minute.toString().padStart(2, '0')}${ampm}{/gray-fg}`;
  }

  private isCasterClass(): boolean {
    return [2, 3, 4, 5, 6, 8, 10, 11, 12, 13, 14, 15].includes(this.charClass);
  }

  private getClassName(id: number): string {
    const classes: Record<number, string> = {
      1: 'Warrior', 2: 'Cleric', 3: 'Paladin', 4: 'Ranger',
      5: 'Shadow Knight', 6: 'Druid', 7: 'Monk', 8: 'Bard',
      9: 'Rogue', 10: 'Shaman', 11: 'Necromancer', 12: 'Wizard',
      13: 'Magician', 14: 'Enchanter', 15: 'Beastlord', 16: 'Berserker',
    };
    return classes[id] || 'Adventurer';
  }

  private getRaceName(id: number): string {
    const races: Record<number, string> = {
      1: 'Human', 2: 'Barbarian', 3: 'Erudite', 4: 'Wood Elf',
      5: 'High Elf', 6: 'Dark Elf', 7: 'Half Elf', 8: 'Dwarf',
      9: 'Troll', 10: 'Ogre', 11: 'Halfling', 12: 'Gnome',
      128: 'Iksar', 130: 'Vah Shir',
    };
    return races[id] || 'Unknown';
  }

  // ═══════════════════════════════════════════════════════════════════════
  // STARTUP
  // ═══════════════════════════════════════════════════════════════════════

  async start(): Promise<void> {
    // Show title
    this.log('');
    this.log('{cyan-fg}{bold}╔════════════════════════════════════════════════════╗{/bold}{/cyan-fg}');
    this.log('{cyan-fg}{bold}║         EVERQUEST ROGUELIKE TERMINAL CLIENT        ║{/bold}{/cyan-fg}');
    this.log('{cyan-fg}{bold}║     Experience Norrath like it\'s 1999 (kinda)      ║{/bold}{/cyan-fg}');
    this.log('{cyan-fg}{bold}╚════════════════════════════════════════════════════╝{/bold}{/cyan-fg}');
    this.log('');
    this.log('{gray-fg}Connecting to EverQuest server...{/gray-fg}');

    this.screen.render();

    try {
      await this.client.connect();
    } catch (err: any) {
      this.log(`{red-fg}Failed to connect: ${err.message}{/red-fg}`);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════

const roguelike = new EQRoguelike();
roguelike.start().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
