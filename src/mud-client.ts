// MUD-style text interface for EverQuest
// The dopest headless EQ client - play the whole game without a GUI!
import * as readline from 'readline';
import * as fs from 'fs';
import { EQClient } from './client/eq-client';

const config = {
  loginHost: '127.0.0.1',
  loginPort: 5998,
  username: 'admin',
  password: 'admin',
};

// ANSI color codes for terminal styling
const C = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

class MUDClient {
  private client: EQClient;
  private rl: readline.Interface;
  private currentCharacter: string = '';
  private playerLevel: number = 1;
  private playerClass: number = 1;
  private playerRace: number = 1;
  private inGame: boolean = false;
  private spawns: Map<number, any> = new Map();
  private targetId: number = 0;
  private zoneName: string = 'Unknown';

  constructor() {
    this.client = new EQClient(config);
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.client.on('status', (msg: string) => {
      this.print('[STATUS] ' + msg);
    });

    this.client.on('error', (err: Error | string) => {
      const msg = typeof err === 'string' ? err : (err?.message || String(err));
      this.print(`${C.red}[ERROR] ${msg}${C.reset}`);
    });

    this.client.on('debug', (msg: string) => {
      // Show important debug messages
      if (msg.includes('Found player') || msg.includes('Player position')) {
        this.print(`${C.cyan}[DEBUG] ${msg}${C.reset}`);
      }
    });

    this.client.on('serverList', (servers: any[]) => {
      this.print('\n=== Server List ===');
      servers.forEach((s, i) => {
        this.print('  ' + (i + 1) + '. ' + s.name);
      });
      if (servers.length > 0) {
        this.print('Auto-selecting server 1...');
        this.client.selectServer(1);
      }
    });

    this.client.on('playerProfile', (profile: any) => {
      this.playerLevel = profile.level;
      this.playerClass = profile.class_;
      this.playerRace = profile.race;
      this.currentCharacter = profile.name;
      this.print(`${C.cyan}${C.bright}[PROFILE]${C.reset} ${profile.name} - Level ${profile.level} ${this.getClassName(profile.class_)} ${this.getRaceName(profile.race)}`);
    });

    this.client.on('zoneEnter', (zone: any) => {
      this.zoneName = zone.longName || zone.shortName || 'Unknown Zone';
      this.print(`\n${C.green}${C.bright}*** You have entered ${this.zoneName} ***${C.reset}\n`);
      this.inGame = true;
    });

    this.client.on('spawn', (spawn: any) => {
      this.spawns.set(spawn.id, spawn);
      this.print(spawn.name + ' appears nearby.');
    });

    this.client.on('despawn', (id: number) => {
      const spawn = this.spawns.get(id);
      if (spawn) {
        this.print(spawn.name + ' has left.');
        this.spawns.delete(id);
      }
    });

    this.client.on('chat', (msg: any) => {
      this.print('[' + msg.channel.toUpperCase() + '] ' + msg.from + ': ' + msg.message);
    });
  }

  private print(msg: string): void {
    process.stdout.write('\r\x1b[K');
    console.log(msg);
    if (this.inGame) this.rl.prompt(true);
  }

  private getClassName(id: number): string {
    const c: Record<number, string> = {1:'Warrior',2:'Cleric',3:'Paladin',4:'Ranger',5:'SK',6:'Druid',7:'Monk',8:'Bard',9:'Rogue',10:'Shaman',11:'Necro',12:'Wizard',13:'Mage',14:'Enchanter',15:'Beast',16:'Berserker'};
    return c[id] || 'Class' + id;
  }

  private getRaceName(id: number): string {
    const r: Record<number, string> = {1:'Human',2:'Barbarian',3:'Erudite',4:'Wood Elf',5:'High Elf',6:'Dark Elf',7:'Half Elf',8:'Dwarf',9:'Troll',10:'Ogre',11:'Halfling',12:'Gnome',128:'Iksar',130:'Vah Shir'};
    return r[id] || 'Race' + id;
  }

  private async handleCommand(input: string): Promise<void> {
    const parts = input.trim().split(/\s+/);
    if (!parts[0]) return;
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1).join(' ');

    switch (cmd) {
      // Navigation & Info
      case 'help': case '?': this.showHelp(); break;
      case 'quit': case 'exit': process.exit(0);
      case 'play': await this.enterWorld(args); break;
      case 'look': case 'l': this.look(args); break;
      case 'loc': case 'location': this.showLocation(); break;
      case 'map': this.showMap(); break;
      case 'htmlmap': this.generateHtmlMap(); break;
      case 'nearby': this.showNearby(parseInt(args) || 500); break;

      // Targeting & Combat
      case 'target': case 'tar': this.target(args); break;
      case 'con': case 'consider': this.consider(args); break;
      case 'attack': case 'a': this.attack(); break;

      // Social
      case 'who': this.who(); break;
      case 'spawns': this.listSpawns(); break;
      case 'say': case "'": this.print(`${C.white}You say, "${args}"${C.reset}`); break;
      case 'shout': this.print(`${C.red}You shout, "${args}"${C.reset}`); break;
      case 'ooc': this.print(`${C.green}[OOC] ${this.currentCharacter}: ${args}${C.reset}`); break;

      // Character Info
      case 'stats': case 'stat': this.showStats(); break;
      case 'inv': case 'inventory': this.showInventory(); break;

      // Movement shortcuts
      case 'n': case 'north': this.move('north'); break;
      case 's': case 'south': this.move('south'); break;
      case 'e': case 'east': this.move('east'); break;
      case 'w': case 'west': this.move('west'); break;
      case 'u': case 'up': this.move('up'); break;
      case 'd': case 'down': this.move('down'); break;
      case 'walk': case 'go': this.walkTo(args); break;

      default: this.print(`${C.dim}Unknown command: ${cmd}. Type 'help' for commands.${C.reset}`);
    }
  }

  private showHelp(): void {
    this.print(`\n${C.cyan}${C.bright}╔══════════════════════════════════════════════════════════╗${C.reset}`);
    this.print(`${C.cyan}${C.bright}║           EverQuest MUD - Command Reference              ║${C.reset}`);
    this.print(`${C.cyan}${C.bright}╠══════════════════════════════════════════════════════════╣${C.reset}`);
    this.print(`${C.yellow}  GETTING STARTED${C.reset}`);
    this.print(`    play <name|#>  Enter world with character`);
    this.print(`    quit/exit      Exit the game`);
    this.print(`${C.yellow}  NAVIGATION${C.reset}`);
    this.print(`    look [name]    Look around or examine something`);
    this.print(`    loc            Show your coordinates (x, y, z)`);
    this.print(`    map            ASCII map of the zone`);
    this.print(`    htmlmap        Generate interactive HTML map`);
    this.print(`    nearby [dist]  List spawns within distance`);
    this.print(`    n/s/e/w/u/d    Move in a direction`);
    this.print(`    walk <target>  Walk toward a target`);
    this.print(`${C.yellow}  TARGETING & COMBAT${C.reset}`);
    this.print(`    target <name>  Target an NPC or player`);
    this.print(`    con [name]     Consider target's difficulty`);
    this.print(`    attack         Attack your target`);
    this.print(`${C.yellow}  CHARACTER${C.reset}`);
    this.print(`    stats          Show your character stats`);
    this.print(`    inv            Show inventory`);
    this.print(`    who            List players in zone`);
    this.print(`    spawns         List all NPCs`);
    this.print(`${C.yellow}  COMMUNICATION${C.reset}`);
    this.print(`    say <msg>      Say something nearby`);
    this.print(`    shout <msg>    Shout to the zone`);
    this.print(`    ooc <msg>      Out-of-character chat`);
    this.print(`${C.cyan}${C.bright}╚══════════════════════════════════════════════════════════╝${C.reset}`);
  }

  private async enterWorld(name: string): Promise<void> {
    const chars = this.client.getCharacters();
    if (chars.length === 0) {
      this.print('No characters. Wait for list to load.');
      return;
    }
    const num = parseInt(name);
    let char = (!isNaN(num) && num >= 1 && num <= chars.length) 
      ? chars[num - 1] 
      : chars.find(c => c.name.toLowerCase() === name.toLowerCase());
    if (!char) { this.print('Character not found: ' + name); return; }
    this.currentCharacter = char.name;
    this.inGame = true;
    this.print('Entering world as ' + char.name + '...');
    await this.client.enterWorld(char.name);
  }

  private look(target?: string): void {
    if (!target) {
      this.print('\nYou look around...');
      const all = Array.from(this.spawns.values());
      if (all.length === 0) { this.print('Nothing here.'); return; }
      const npcs = all.filter(s => s.isNpc);
      const pcs = all.filter(s => !s.isNpc && s.name !== this.currentCharacter);
      if (pcs.length) this.print('Players: ' + pcs.map(p => p.name).join(', '));
      if (npcs.length) this.print('NPCs: ' + npcs.slice(0,10).map(n => n.name).join(', ') + (npcs.length > 10 ? '...' : ''));
    } else {
      const spawn = Array.from(this.spawns.values()).find(s => s.name.toLowerCase().includes(target.toLowerCase()));
      if (spawn) {
        this.print('\n' + spawn.name);
        this.print('  Level: ' + (spawn.level || '?'));
      } else this.print('Not found: ' + target);
    }
  }

  private who(): void {
    const pcs = Array.from(this.spawns.values()).filter(s => !s.isNpc);
    this.print('\n=== Players ===');
    if (!pcs.length) this.print('Nobody here.');
    else pcs.forEach(p => this.print('  ' + p.name + ' Lv' + (p.level || '?')));
  }

  private listSpawns(): void {
    const all = Array.from(this.spawns.values());
    this.print('\n=== Spawns (' + all.length + ') ===');
    all.slice(0, 20).forEach(s => this.print('  ' + (s.isNpc ? '[NPC]' : '[PC]') + ' ' + s.name));
    if (all.length > 20) this.print('  ...and ' + (all.length - 20) + ' more');
  }

  private target(name: string): void {
    if (!name) { this.print(this.targetId ? 'Target: ' + this.spawns.get(this.targetId)?.name : 'No target'); return; }
    const spawn = Array.from(this.spawns.values()).find(s => s.name.toLowerCase().includes(name.toLowerCase()));
    if (spawn) { this.targetId = spawn.id; this.print('Targeting ' + spawn.name); }
    else this.print('Not found: ' + name);
  }

  private showLocation(): void {
    const pos = this.client.getPosition();
    this.print(`\nYour location: (${pos.x.toFixed(1)}, ${pos.y.toFixed(1)}, ${pos.z.toFixed(1)})`);
    this.print(`Heading: ${pos.heading}`);

    if (this.targetId) {
      const target = this.spawns.get(this.targetId);
      if (target) {
        const dx = target.x - pos.x;
        const dy = target.y - pos.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        this.print(`Distance to ${target.name}: ${dist.toFixed(0)} units`);
      }
    }
  }

  private showNearby(maxDist: number): void {
    const pos = this.client.getPosition();
    const all = Array.from(this.spawns.values());

    // Calculate distances
    const withDist = all.map(s => ({
      ...s,
      dist: Math.sqrt(Math.pow(s.x - pos.x, 2) + Math.pow(s.y - pos.y, 2))
    })).filter(s => s.dist <= maxDist && s.dist > 0)
      .sort((a, b) => a.dist - b.dist);

    this.print(`\n=== Nearby (within ${maxDist} units) ===`);
    if (withDist.length === 0) {
      this.print('Nobody nearby.');
    } else {
      withDist.slice(0, 15).forEach(s => {
        const dir = this.getDirection(pos.x, pos.y, s.x, s.y);
        this.print(`  ${s.name} - ${s.dist.toFixed(0)} units ${dir}`);
      });
      if (withDist.length > 15) this.print(`  ...and ${withDist.length - 15} more`);
    }
  }

  private getDirection(x1: number, y1: number, x2: number, y2: number): string {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;

    if (angle >= -22.5 && angle < 22.5) return 'East';
    if (angle >= 22.5 && angle < 67.5) return 'NE';
    if (angle >= 67.5 && angle < 112.5) return 'North';
    if (angle >= 112.5 && angle < 157.5) return 'NW';
    if (angle >= 157.5 || angle < -157.5) return 'West';
    if (angle >= -157.5 && angle < -112.5) return 'SW';
    if (angle >= -112.5 && angle < -67.5) return 'South';
    if (angle >= -67.5 && angle < -22.5) return 'SE';
    return '';
  }

  private showMap(): void {
    const all = Array.from(this.spawns.values()).filter(s => s.x !== 0 || s.y !== 0);
    if (all.length === 0) {
      this.print('No spawn coordinates available.');
      return;
    }

    const pos = this.client.getPosition();

    // Calculate bounds
    const xs = all.map(s => s.x);
    const ys = all.map(s => s.y);
    const zs = all.map(s => s.z || 0);
    const minX = Math.min(...xs, pos.x);
    const maxX = Math.max(...xs, pos.x);
    const minY = Math.min(...ys, pos.y);
    const maxY = Math.max(...ys, pos.y);
    const minZ = Math.min(...zs, pos.z);
    const maxZ = Math.max(...zs, pos.z);

    // Create ASCII map (60x25 chars)
    const width = 60;
    const height = 25;
    const map: string[][] = [];
    for (let y = 0; y < height; y++) {
      map[y] = new Array(width).fill(' ');
    }

    // Scale coordinates to map
    const scaleX = (width - 1) / (maxX - minX || 1);
    const scaleY = (height - 1) / (maxY - minY || 1);

    // Z-level characters: lower = . , ground = - , higher = ^
    const getZChar = (z: number, isNpc: boolean): string => {
      const playerZ = pos.z || 0;
      const diff = z - playerZ;
      if (Math.abs(diff) < 20) return isNpc ? '*' : 'o';  // Same level
      if (diff < -20) return isNpc ? ',' : '.';  // Below (basement)
      return isNpc ? '^' : 'A';  // Above (upstairs)
    };

    // Plot spawns with Z-level indication
    all.forEach(s => {
      const mx = Math.floor((s.x - minX) * scaleX);
      const my = height - 1 - Math.floor((s.y - minY) * scaleY);
      if (mx >= 0 && mx < width && my >= 0 && my < height) {
        map[my][mx] = getZChar(s.z || 0, s.isNpc);
      }
    });

    // Plot player position
    const px = Math.floor((pos.x - minX) * scaleX);
    const py = height - 1 - Math.floor((pos.y - minY) * scaleY);
    if (px >= 0 && px < width && py >= 0 && py < height) {
      map[py][px] = '@';
    }

    // Print map with colors
    this.print(`\n${C.cyan}╔${'═'.repeat(width)}╗${C.reset}`);
    map.forEach(row => this.print(`${C.cyan}║${C.reset}${row.join('')}${C.cyan}║${C.reset}`));
    this.print(`${C.cyan}╚${'═'.repeat(width)}╝${C.reset}`);
    this.print(`${C.dim}Legend: @ You | * NPC (same floor) | ^ above | , below | o/A players${C.reset}`);
    this.print(`${C.dim}X: ${minX.toFixed(0)} to ${maxX.toFixed(0)} | Y: ${minY.toFixed(0)} to ${maxY.toFixed(0)} | Z: ${minZ.toFixed(0)} to ${maxZ.toFixed(0)}${C.reset}`);
    this.print(`${C.dim}Your Z: ${pos.z.toFixed(0)}${C.reset}`);
  }

  private consider(name?: string): void {
    let spawn: any;
    if (name) {
      spawn = Array.from(this.spawns.values()).find(s => s.name.toLowerCase().includes(name.toLowerCase()));
      if (spawn) {
        this.targetId = spawn.id;
      }
    } else {
      spawn = this.spawns.get(this.targetId);
    }

    if (!spawn) {
      this.print('You must target something first.');
      return;
    }

    const levelDiff = (spawn.level || 1) - this.playerLevel;
    let conColor: string;
    let conText: string;

    if (levelDiff >= 5) {
      conColor = C.red;
      conText = 'looks like certain death!';
    } else if (levelDiff >= 3) {
      conColor = C.red;
      conText = 'would be a very difficult fight.';
    } else if (levelDiff >= 1) {
      conColor = C.yellow;
      conText = 'would be a tough fight.';
    } else if (levelDiff >= -2) {
      conColor = C.white;
      conText = 'looks like an even match.';
    } else if (levelDiff >= -5) {
      conColor = C.blue;
      conText = 'would be an easy fight.';
    } else if (levelDiff >= -10) {
      conColor = C.green;
      conText = 'is no threat to you.';
    } else {
      conColor = C.dim;
      conText = 'is beneath your notice.';
    }

    this.print(`${conColor}${spawn.name} ${conText}${C.reset} (Level ${spawn.level || '?'})`);
  }

  private attack(): void {
    const target = this.spawns.get(this.targetId);
    if (!target) {
      this.print('You have no target.');
      return;
    }
    // Simulated attack - would need actual combat packets
    this.print(`${C.red}You begin attacking ${target.name}!${C.reset}`);
    this.print(`${C.dim}(Combat system not yet connected to server)${C.reset}`);
  }

  private showStats(): void {
    this.print(`\n${C.cyan}${C.bright}╔═══════════════════════════════╗${C.reset}`);
    this.print(`${C.cyan}${C.bright}║      Character Stats          ║${C.reset}`);
    this.print(`${C.cyan}${C.bright}╠═══════════════════════════════╣${C.reset}`);
    this.print(`${C.cyan}║${C.reset} Name:  ${C.bright}${this.currentCharacter}${C.reset}`);
    this.print(`${C.cyan}║${C.reset} Level: ${C.bright}${this.playerLevel}${C.reset}`);
    this.print(`${C.cyan}║${C.reset} Class: ${C.bright}${this.getClassName(this.playerClass)}${C.reset}`);
    this.print(`${C.cyan}║${C.reset} Race:  ${C.bright}${this.getRaceName(this.playerRace)}${C.reset}`);
    this.print(`${C.cyan}║${C.reset} Zone:  ${C.bright}${this.zoneName}${C.reset}`);
    const pos = this.client.getPosition();
    this.print(`${C.cyan}║${C.reset} Loc:   ${C.dim}(${pos.x.toFixed(0)}, ${pos.y.toFixed(0)}, ${pos.z.toFixed(0)})${C.reset}`);
    this.print(`${C.cyan}${C.bright}╚═══════════════════════════════╝${C.reset}`);
  }

  private showInventory(): void {
    this.print(`\n${C.yellow}=== Inventory ===${C.reset}`);
    this.print(`${C.dim}(Inventory system not yet connected to server)${C.reset}`);
  }

  private move(direction: string): void {
    const moveDistance = 50; // units per move
    const pos = this.client.getPosition();
    let dx = 0, dy = 0, dz = 0;

    switch (direction) {
      case 'north': dy = moveDistance; break;
      case 'south': dy = -moveDistance; break;
      case 'east': dx = moveDistance; break;
      case 'west': dx = -moveDistance; break;
      case 'up': dz = moveDistance; break;
      case 'down': dz = -moveDistance; break;
    }

    this.print(`${C.dim}You move ${direction}...${C.reset}`);
    this.print(`${C.dim}(Movement packets not yet implemented - current loc: ${pos.x.toFixed(0)}, ${pos.y.toFixed(0)}, ${pos.z.toFixed(0)})${C.reset}`);
  }

  private walkTo(targetName: string): void {
    if (!targetName) {
      this.print('Walk to what?');
      return;
    }

    const spawn = Array.from(this.spawns.values()).find(s =>
      s.name.toLowerCase().includes(targetName.toLowerCase())
    );

    if (!spawn) {
      this.print(`Can't find "${targetName}".`);
      return;
    }

    const pos = this.client.getPosition();
    const dx = spawn.x - pos.x;
    const dy = spawn.y - pos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const dir = this.getDirection(pos.x, pos.y, spawn.x, spawn.y);

    this.print(`${C.dim}You start walking toward ${spawn.name} (${dist.toFixed(0)} units ${dir})...${C.reset}`);
    this.print(`${C.dim}(Auto-walk not yet implemented)${C.reset}`);
  }

  private generateHtmlMap(): void {
    const all = Array.from(this.spawns.values());
    const pos = this.client.getPosition();

    const spawnsJson = JSON.stringify(all.map(s => ({
      name: s.name,
      x: s.x || 0,
      y: s.y || 0,
      z: s.z || 0,
      level: s.level,
      isNpc: s.isNpc,
    })));

    const html = `<!DOCTYPE html>
<html><head><title>${this.zoneName} Map</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:system-ui;background:#1a1a2e;color:#e0e0e0;overflow:hidden}
#c{position:absolute;cursor:grab}
#c:active{cursor:grabbing}
#info{position:absolute;top:10px;left:10px;background:rgba(0,0,0,0.8);padding:15px;border-radius:8px;border:1px solid #00d4ff}
h1{font-size:1.2rem;color:#00d4ff;margin-bottom:10px}
.s{padding:3px 0;font-size:0.9rem}
#tip{position:absolute;background:rgba(0,0,0,0.9);border:1px solid #00d4ff;padding:8px;border-radius:4px;display:none;pointer-events:none}
</style></head><body>
<canvas id="c"></canvas>
<div id="info">
<h1>🗺️ ${this.zoneName}</h1>
<div class="s">Spawns: ${all.length}</div>
<div class="s">Player: ${this.currentCharacter}</div>
<div class="s">Scroll to zoom, drag to pan</div>
</div>
<div id="tip"></div>
<script>
const sp=${spawnsJson};
const pp={x:${pos.x},y:${pos.y}};
const c=document.getElementById('c'),x=c.getContext('2d');
let sc=0.1,ox=pp.x,oy=pp.y,dr=false,ds={x:0,y:0};
function rs(){c.width=innerWidth;c.height=innerHeight;dw()}
function w2s(wx,wy){return{x:c.width/2+(wx-ox)*sc,y:c.height/2-(wy-oy)*sc}}
function dw(){
x.fillStyle='#0a0a15';x.fillRect(0,0,c.width,c.height);
x.strokeStyle='rgba(50,50,70,0.3)';x.lineWidth=1;
for(let i=-10000;i<10000;i+=500){const p=w2s(i,0);x.beginPath();x.moveTo(p.x,0);x.lineTo(p.x,c.height);x.stroke()}
for(let i=-10000;i<10000;i+=500){const p=w2s(0,i);x.beginPath();x.moveTo(0,p.y);x.lineTo(c.width,p.y);x.stroke()}
sp.forEach(s=>{if(!s.x&&!s.y)return;const p=w2s(s.x,s.y);x.fillStyle=s.isNpc?'#ff6b6b':'#4ecdc4';x.beginPath();x.arc(p.x,p.y,5,0,Math.PI*2);x.fill();if(sc>0.05){x.fillStyle='rgba(255,255,255,0.7)';x.font='10px sans-serif';x.fillText(s.name,p.x+7,p.y+3)}});
const p=w2s(pp.x,pp.y);x.fillStyle='#00d4ff';x.shadowColor='#00d4ff';x.shadowBlur=15;x.beginPath();x.arc(p.x,p.y,8,0,Math.PI*2);x.fill();x.shadowBlur=0;x.font='bold 12px sans-serif';x.fillText('YOU',p.x+10,p.y+4)}
c.onwheel=e=>{e.preventDefault();sc*=e.deltaY>0?0.9:1.1;sc=Math.max(0.01,Math.min(1,sc));dw()};
c.onmousedown=e=>{dr=true;ds={x:e.clientX,y:e.clientY}};
c.onmousemove=e=>{if(dr){ox-=(e.clientX-ds.x)/sc;oy+=(e.clientY-ds.y)/sc;ds={x:e.clientX,y:e.clientY};dw()}};
c.onmouseup=()=>dr=false;
onresize=rs;rs();
</script></body></html>`;

    const outputPath = '/home/zachroth/eq-content-engine/live-map.html';
    fs.writeFileSync(outputPath, html);
    this.print(`${C.green}HTML map saved to: ${outputPath}${C.reset}`);
    this.print(`${C.dim}Open in browser to view interactive map!${C.reset}`);
  }

  async start(): Promise<void> {
    console.log(`\n${C.cyan}${C.bright}╔════════════════════════════════════════════════════════════╗${C.reset}`);
    console.log(`${C.cyan}${C.bright}║         EverQuest MUD Client - Headless Edition            ║${C.reset}`);
    console.log(`${C.cyan}${C.bright}║     Play the whole game without a GUI!                     ║${C.reset}`);
    console.log(`${C.cyan}${C.bright}╚════════════════════════════════════════════════════════════╝${C.reset}\n`);
    this.print('Connecting...');
    try {
      await this.client.connect();
      this.print('Waiting for character list...');
      for (let i = 0; i < 30; i++) {
        await new Promise(r => setTimeout(r, 500));
        const chars = this.client.getCharacters();
        if (chars.length > 0) {
          this.print('\n=== Characters ===');
          chars.forEach((c, i) => this.print('  ' + (i+1) + '. ' + c.name + ' Lv' + c.level + ' ' + this.getClassName(c.class_)));
          this.print('\nType: play <number> or play <name>');
          break;
        }
      }
      this.rl.setPrompt('> ');
      this.rl.prompt();
      this.rl.on('line', async (line: string) => { await this.handleCommand(line); this.rl.prompt(); });
      this.rl.on('close', () => process.exit(0));
    } catch (err) { this.print('Failed: ' + (err as Error).message); process.exit(1); }
  }
}

new MUDClient().start();
