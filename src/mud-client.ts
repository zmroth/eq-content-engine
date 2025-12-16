// MUD-style text interface for EverQuest
import * as readline from 'readline';
import { EQClient } from './client/eq-client';

const config = {
  loginHost: '127.0.0.1',
  loginPort: 5998,
  username: 'admin',
  password: 'admin',
};

class MUDClient {
  private client: EQClient;
  private rl: readline.Interface;
  private currentCharacter: string = '';
  private inGame: boolean = false;
  private spawns: Map<number, any> = new Map();
  private targetId: number = 0;

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

    this.client.on('error', (err: Error) => {
      this.print('[ERROR] ' + err.message);
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
      this.print('[PROFILE] ' + profile.name + ' - Level ' + profile.level + ' ' + this.getClassName(profile.class_) + ' ' + this.getRaceName(profile.race));
      this.currentCharacter = profile.name;
    });

    this.client.on('zoneEnter', (zone: any) => {
      this.print('\n*** You have entered ' + zone.longName + ' ***\n');
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
      case 'help': case '?': this.showHelp(); break;
      case 'quit': case 'exit': process.exit(0);
      case 'play': await this.enterWorld(args); break;
      case 'look': case 'l': this.look(args); break;
      case 'who': this.who(); break;
      case 'spawns': this.listSpawns(); break;
      case 'target': case 'tar': this.target(args); break;
      case 'say': this.print('You say, "' + args + '"'); break;
      case 'shout': this.print('You shout, "' + args + '"'); break;
      case 'ooc': this.print('[OOC] You: ' + args); break;
      default: this.print('Unknown command: ' + cmd);
    }
  }

  private showHelp(): void {
    this.print('\n=== MUD Commands ===');
    this.print('  play <name>  - Enter world with character');
    this.print('  look         - Look around');
    this.print('  who          - List players');
    this.print('  spawns       - List all spawns');
    this.print('  target <n>   - Target a spawn');
    this.print('  say <msg>    - Say something');
    this.print('  shout <msg>  - Shout');
    this.print('  ooc <msg>    - OOC chat');
    this.print('  help         - Show this');
    this.print('  quit         - Exit');
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
      const npcs = all.filter(s => s.isNPC);
      const pcs = all.filter(s => !s.isNPC && s.name !== this.currentCharacter);
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
    const pcs = Array.from(this.spawns.values()).filter(s => !s.isNPC);
    this.print('\n=== Players ===');
    if (!pcs.length) this.print('Nobody here.');
    else pcs.forEach(p => this.print('  ' + p.name + ' Lv' + (p.level || '?')));
  }

  private listSpawns(): void {
    const all = Array.from(this.spawns.values());
    this.print('\n=== Spawns (' + all.length + ') ===');
    all.slice(0, 20).forEach(s => this.print('  ' + (s.isNPC ? '[NPC]' : '[PC]') + ' ' + s.name));
    if (all.length > 20) this.print('  ...and ' + (all.length - 20) + ' more');
  }

  private target(name: string): void {
    if (!name) { this.print(this.targetId ? 'Target: ' + this.spawns.get(this.targetId)?.name : 'No target'); return; }
    const spawn = Array.from(this.spawns.values()).find(s => s.name.toLowerCase().includes(name.toLowerCase()));
    if (spawn) { this.targetId = spawn.id; this.print('Targeting ' + spawn.name); }
    else this.print('Not found: ' + name);
  }

  async start(): Promise<void> {
    console.log('\n=== EverQuest MUD Client ===\n');
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
