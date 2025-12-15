import { GameState, PlayerState, NpcInfo } from './state';
import { NpcGenerator } from '../content/npc-generator';

export interface CommandResult {
  success: boolean;
  message: string;
  data?: any;
}

export class CommandParser {
  private state: GameState;
  private npcGenerator: NpcGenerator;

  constructor(state: GameState, npcGenerator: NpcGenerator) {
    this.state = state;
    this.npcGenerator = npcGenerator;
  }

  async execute(playerId: string, input: string): Promise<CommandResult> {
    const parts = input.trim().split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    const player = this.state.getPlayer(playerId);
    if (!player) {
      return { success: false, message: 'No active session. Connect first.' };
    }

    switch (command) {
      case 'look':
      case 'l':
        return this.look(player);

      case 'goto':
        return this.goto(player, args);

      case 'zone':
        return this.zone(player, args);

      case 'zones':
        return this.listZones();

      case 'hail':
        return this.hail(player, args);

      case 'say':
        return this.say(player, args.join(' '));

      case 'loc':
      case 'location':
        return this.location(player);

      case 'npcs':
        return this.listNpcs(player);

      case 'spawn':
        return this.spawn(player, args);

      case 'generate':
        return this.generate(args);

      case 'help':
      case '?':
        return this.help();

      default:
        return { success: false, message: `Unknown command: ${command}. Type 'help' for commands.` };
    }
  }

  private async look(player: PlayerState): Promise<CommandResult> {
    const zoneInfo = await this.state.getZoneInfo(player.zone);
    const zoneName = zoneInfo?.long_name || player.zone;

    const npcs = await this.state.getNpcsNearPlayer(player.id, 200);

    let message = `\n=== ${zoneName} ===\n`;
    message += `Location: (${Math.round(player.x)}, ${Math.round(player.y)}, ${Math.round(player.z)})\n\n`;

    if (npcs.length === 0) {
      message += 'The area appears empty.\n';
    } else {
      message += 'You see:\n';
      for (const npc of npcs.slice(0, 10)) {
        const distance = Math.round(Math.sqrt(
          Math.pow(npc.x - player.x, 2) +
          Math.pow(npc.y - player.y, 2) +
          Math.pow(npc.z - player.z, 2)
        ));
        message += `  ${npc.name} (Level ${npc.level}) - ${distance}m away\n`;
      }
      if (npcs.length > 10) {
        message += `  ...and ${npcs.length - 10} more\n`;
      }
    }

    return { success: true, message, data: { zone: player.zone, npcs } };
  }

  private async goto(player: PlayerState, args: string[]): Promise<CommandResult> {
    if (args.length < 3) {
      return { success: false, message: 'Usage: goto <x> <y> <z>' };
    }

    const x = parseFloat(args[0]);
    const y = parseFloat(args[1]);
    const z = parseFloat(args[2]);

    if (isNaN(x) || isNaN(y) || isNaN(z)) {
      return { success: false, message: 'Invalid coordinates. Use: goto <x> <y> <z>' };
    }

    this.state.movePlayer(player.id, x, y, z);
    return { success: true, message: `Moved to (${x}, ${y}, ${z})` };
  }

  private async zone(player: PlayerState, args: string[]): Promise<CommandResult> {
    if (args.length < 1) {
      return { success: false, message: 'Usage: zone <zonename>' };
    }

    const zoneName = args[0].toLowerCase();
    const success = await this.state.movePlayerToZone(player.id, zoneName);

    if (!success) {
      return { success: false, message: `Unknown zone: ${zoneName}. Type 'zones' to list available zones.` };
    }

    const updatedPlayer = this.state.getPlayer(player.id)!;
    const zoneInfo = await this.state.getZoneInfo(zoneName);

    return {
      success: true,
      message: `\nZoning to ${zoneInfo?.long_name || zoneName}...\nYou arrive at (${Math.round(updatedPlayer.x)}, ${Math.round(updatedPlayer.y)}, ${Math.round(updatedPlayer.z)})`
    };
  }

  private async listZones(): Promise<CommandResult> {
    const zones = await this.state.listZones();

    let message = '\n=== Available Zones ===\n';
    for (const zone of zones.slice(0, 30)) {
      message += `  ${(zone as any).short_name}: ${(zone as any).long_name}\n`;
    }
    if (zones.length > 30) {
      message += `  ...and ${zones.length - 30} more\n`;
    }

    return { success: true, message };
  }

  private async hail(player: PlayerState, args: string[]): Promise<CommandResult> {
    if (args.length < 1) {
      const npcs = await this.state.getNpcsNearPlayer(player.id, 50);
      if (npcs.length === 0) {
        return { success: false, message: 'No one nearby to hail.' };
      }
      // Hail the closest NPC
      return { success: true, message: `You hail ${npcs[0].name}.\n${npcs[0].name} regards you indifferently.` };
    }

    const targetName = args.join(' ').toLowerCase();
    const npcs = await this.state.getNpcsNearPlayer(player.id, 100);
    const target = npcs.find(n => n.name.toLowerCase().includes(targetName));

    if (!target) {
      return { success: false, message: `You don't see ${args.join(' ')} nearby.` };
    }

    return {
      success: true,
      message: `You hail ${target.name}.\n${target.name} says, 'Hail, adventurer.'`,
      data: { npc: target }
    };
  }

  private say(player: PlayerState, text: string): CommandResult {
    if (!text) {
      return { success: false, message: 'Usage: say <message>' };
    }
    return { success: true, message: `You say, '${text}'` };
  }

  private location(player: PlayerState): CommandResult {
    return {
      success: true,
      message: `Zone: ${player.zone}\nLocation: (${Math.round(player.x)}, ${Math.round(player.y)}, ${Math.round(player.z)})`
    };
  }

  private async listNpcs(player: PlayerState): Promise<CommandResult> {
    const npcs = await this.state.getNpcsInZone(player.zone);

    let message = `\n=== NPCs in ${player.zone} ===\n`;
    for (const npc of npcs.slice(0, 20)) {
      message += `  [${npc.id}] ${npc.name} (Lvl ${npc.level}) at (${Math.round(npc.x)}, ${Math.round(npc.y)}, ${Math.round(npc.z)})\n`;
    }
    if (npcs.length > 20) {
      message += `  ...and ${npcs.length - 20} more\n`;
    }

    return { success: true, message };
  }

  private async spawn(player: PlayerState, args: string[]): Promise<CommandResult> {
    if (args.length < 1) {
      return { success: false, message: 'Usage: spawn <npc description>' };
    }

    const description = args.join(' ');

    try {
      const result = await this.npcGenerator.generateAndSpawn(
        description,
        player.zone,
        player.x,
        player.y,
        player.z
      );

      let message = `\n=== NPC Spawned ===\n`;
      message += `Name: ${result.npc.name}\n`;
      message += `Level: ${result.npc.level}\n`;
      message += `ID: ${result.npc.id}\n`;
      message += `Location: ${player.zone} (${Math.round(player.x)}, ${Math.round(player.y)}, ${Math.round(player.z)})\n`;

      if (result.luaScript) {
        message += `\nDialogue script generated. Use #repop to see the NPC in-game.`;
      }

      return { success: true, message, data: result };
    } catch (error) {
      return { success: false, message: `Failed to spawn NPC: ${error}` };
    }
  }

  private async generate(args: string[]): Promise<CommandResult> {
    if (args.length < 1) {
      return { success: false, message: 'Usage: generate <npc description>' };
    }

    const description = args.join(' ');

    try {
      const npc = await this.npcGenerator.generateNpc(description);

      let message = `\n=== Generated NPC (Preview) ===\n`;
      message += `Name: ${npc.name}`;
      if (npc.lastname) message += ` ${npc.lastname}`;
      message += `\n`;
      message += `Level: ${npc.level}\n`;
      message += `Race: ${npc.race} | Class: ${npc.class}\n`;
      message += `HP: ${npc.hp} | Mana: ${npc.mana}\n`;
      message += `Merchant: ${npc.isMerchant} | Quest Giver: ${npc.isQuestGiver}\n`;
      message += `\nDescription: ${npc.description}\n`;

      if (npc.dialogue) {
        message += `\nDialogue:\n`;
        message += `  Greeting: "${npc.dialogue.greeting}"\n`;
        message += `  Keywords: ${Object.keys(npc.dialogue.keywords).join(', ')}\n`;
      }

      message += `\nUse 'spawn <description>' to create this NPC in the world.`;

      return { success: true, message, data: npc };
    } catch (error) {
      return { success: false, message: `Failed to generate NPC: ${error}` };
    }
  }

  private help(): CommandResult {
    const message = `
=== MUD Interface Commands ===

Navigation:
  look, l          - Describe your surroundings
  loc, location    - Show your current coordinates
  goto <x> <y> <z> - Teleport to coordinates
  zone <name>      - Teleport to a zone
  zones            - List available zones

Interaction:
  hail [name]      - Hail an NPC
  say <message>    - Speak in the zone
  npcs             - List NPCs in current zone

Content Creation:
  generate <desc>  - Preview an LLM-generated NPC
  spawn <desc>     - Generate and spawn an NPC at your location

Other:
  help, ?          - Show this help message
`;
    return { success: true, message };
  }
}
