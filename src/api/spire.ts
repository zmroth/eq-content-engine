import http from 'http';

interface NpcType {
  id?: number;
  name: string;
  lastname?: string;
  level: number;
  race: number;
  class: number;
  bodytype?: number;
  hp?: number;
  mana?: number;
  gender?: number;
  texture?: number;
  helmtexture?: number;
  size?: number;
  hp_regen_rate?: number;
  mana_regen_rate?: number;
  loottable_id?: number;
  merchant_id?: number;
  npc_spells_id?: number;
  npc_faction_id?: number;
  mindmg?: number;
  maxdmg?: number;
  attack_speed?: number;
  special_abilities?: string;
  aggroradius?: number;
  face?: number;
  luclin_hairstyle?: number;
  luclin_haircolor?: number;
  luclin_eyecolor?: number;
  luclin_eyecolor2?: number;
  luclin_beardcolor?: number;
  luclin_beard?: number;
  armortint_id?: number;
  armortint_red?: number;
  armortint_green?: number;
  armortint_blue?: number;
  d_melee_texture1?: number;
  d_melee_texture2?: number;
  prim_melee_type?: number;
  sec_melee_type?: number;
  runspeed?: number;
  findable?: number;
  trackable?: number;
  npc_aggro?: number;
  spawn_limit?: number;
  attack_delay?: number;
  STR?: number;
  STA?: number;
  DEX?: number;
  AGI?: number;
  _INT?: number;
  WIS?: number;
  CHA?: number;
  see_invis?: number;
  see_invis_undead?: number;
  see_hide?: number;
  see_improved_hide?: number;
  qglobal?: number;
  AC?: number;
  slow_mitigation?: number;
  maxlevel?: number;
  scalerate?: number;
  private_corpse?: number;
  unique_spawn_by_name?: number;
  underwater?: number;
  isquest?: number;
  emoteid?: number;
  spellscale?: number;
  healscale?: number;
  raid_target?: number;
  chesttexture?: number;
  armtexture?: number;
  bracertexture?: number;
  handtexture?: number;
  legtexture?: number;
  feettexture?: number;
  light?: number;
  walkspeed?: number;
  combat_hp_regen?: number;
  combat_mana_regen?: number;
  aggro_pc?: number;
  ignore_despawn?: number;
  show_name?: number;
  untargetable?: number;
  skip_global_loot?: number;
  rare_spawn?: number;
  stuck_behavior?: number;
  flymode?: number;
  always_aggro?: number;
  exp_mod?: number;
}

interface SpawnGroup {
  id?: number;
  name: string;
  spawn_limit?: number;
  dist?: number;
  max_x?: number;
  min_x?: number;
  max_y?: number;
  min_y?: number;
  delay?: number;
  mindelay?: number;
  despawn?: number;
  despawn_timer?: number;
  rand_spawns?: number;
  rand_respawntime?: number;
  rand_variance?: number;
  rand_condition_?: number;
  wp_spawns?: number;
}

interface SpawnEntry {
  spawngroupID: number;
  npcID: number;
  chance: number;
  condition_value_filter?: number;
  min_expansion?: number;
  max_expansion?: number;
  content_flags?: string;
  content_flags_disabled?: string;
}

interface Spawn2 {
  id?: number;
  spawngroupID: number;
  zone: string;
  x: number;
  y: number;
  z: number;
  heading: number;
  respawntime: number;
  variance?: number;
  pathgrid?: number;
  _condition?: number;
  cond_value?: number;
  enabled?: number;
  animation?: number;
  boot_respawntime?: number;
  clear_timer_onboot?: number;
  boot_variance?: number;
  force_z?: number;
  min_expansion?: number;
  max_expansion?: number;
  content_flags?: string;
  content_flags_disabled?: string;
}

interface Item {
  id?: number;
  name: string;
  aagi?: number;
  ac?: number;
  accuracy?: number;
  acha?: number;
  adex?: number;
  aint?: number;
  asta?: number;
  astr?: number;
  attack?: number;
  augrestrict?: number;
  augslot1type?: number;
  augslot2type?: number;
  augslot3type?: number;
  augslot4type?: number;
  augslot5type?: number;
  augslot6type?: number;
  augtype?: number;
  avoidance?: number;
  awis?: number;
  classes?: number;
  color?: number;
  damage?: number;
  delay?: number;
  elemdmgtype?: number;
  elemdmgamt?: number;
  hp?: number;
  mana?: number;
  endur?: number;
  icon?: number;
  idfile?: string;
  itemclass?: number;
  itemtype?: number;
  light?: number;
  lore?: string;
  magic?: number;
  material?: number;
  maxcharges?: number;
  nodrop?: number;
  norent?: number;
  price?: number;
  races?: number;
  range?: number;
  regen?: number;
  manaregen?: number;
  slots?: number;
  weight?: number;
  stackable?: number;
  stacksize?: number;
  proceffect?: number;
  proctype?: number;
  proclevel?: number;
  worneffect?: number;
  worntype?: number;
  wornlevel?: number;
  clickeffect?: number;
  clicktype?: number;
  clicklevel?: number;
  focuseffect?: number;
  focustype?: number;
  focuslevel?: number;
  scrolleffect?: number;
  scrolltype?: number;
  scrolllevel?: number;
  bardtype?: number;
  bardvalue?: number;
  book?: number;
  casttime?: number;
  casttime_?: number;
  charmfile?: string;
  charmfileid?: string;
  combateffects?: string;
  extradmgskill?: number;
  extradmgamt?: number;
  faction_amt1?: number;
  faction_amt2?: number;
  faction_amt3?: number;
  faction_amt4?: number;
  faction_mod1?: number;
  faction_mod2?: number;
  faction_mod3?: number;
  faction_mod4?: number;
  filename?: string;
  fulfilment?: number;
  haste?: number;
  healamt?: number;
  spelldmg?: number;
  clairvoyance?: number;
  backstabdmg?: number;
  elitematerial?: number;
  heroic_str?: number;
  heroic_int?: number;
  heroic_wis?: number;
  heroic_agi?: number;
  heroic_dex?: number;
  heroic_sta?: number;
  heroic_cha?: number;
  heroic_mr?: number;
  heroic_fr?: number;
  heroic_cr?: number;
  heroic_dr?: number;
  heroic_pr?: number;
  heroic_svcorrup?: number;
  reqlevel?: number;
  reclevel?: number;
  recskill?: number;
  bardeffect?: number;
  bardeffecttype?: number;
  bardlevel?: number;
  bardlevel2?: number;
  bardunk1?: number;
  bardunk2?: number;
  bardunk3?: number;
  bardunk4?: number;
  bardunk5?: number;
  bardunk7?: number;
  cr?: number;
  dr?: number;
  fr?: number;
  mr?: number;
  pr?: number;
  svcorruption?: number;
  purity?: number;
  dsmitigation?: number;
  ldonsold?: number;
  ldonsoldcount?: number;
  ldonsoldstat?: number;
  ldonsoldstatmod?: number;
  ldonsoldstatval?: number;
  bagsize?: number;
  bagslots?: number;
  bagtype?: number;
  bagwr?: number;
  benefitflag?: number;
  tradeskills?: number;
  favor?: number;
  guildfavor?: number;
  pointtype?: number;
  potionbelt?: number;
  potionbeltslots?: number;
  questitemflag?: number;
  recastdelay?: number;
  recasttype?: number;
  ldonprice?: number;
  ldontheme?: number;
  ldonsellbackrate?: number;
  scriptfileid?: number;
  expendablearrow?: number;
  powersourcecapacity?: number;
  bardactive?: number;
  fitsize?: number;
  updated?: string;
  created?: string;
  submitter?: string;
  verified?: string;
  serialized?: string;
  serialization?: string;
  source?: string;
  lorefile?: string;
  npc_price?: number;
  merchant_price_adjustment?: number;
  minstatus?: number;
  evolvinglevel?: number;
  max_level?: number;
}

export class SpireClient {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://127.0.0.1:3000/api/v1') {
    this.baseUrl = baseUrl;
  }

  private async request<T>(method: string, path: string, body?: any): Promise<T> {
    const url = new URL(path, this.baseUrl);

    return new Promise((resolve, reject) => {
      const options = {
        hostname: url.hostname,
        port: url.port || 80,
        path: url.pathname,
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error(`Failed to parse response: ${data}`));
          }
        });
      });

      req.on('error', reject);

      if (body) {
        req.write(JSON.stringify(body));
      }
      req.end();
    });
  }

  // NPC Types
  async createNpcType(npc: NpcType): Promise<NpcType> {
    return this.request<NpcType>('POST', '/npc_type', npc);
  }

  async getNpcType(id: number): Promise<NpcType> {
    return this.request<NpcType>('GET', `/npc_type/${id}`);
  }

  async listNpcTypes(where?: string, limit?: number): Promise<NpcType[]> {
    let path = '/npc_types';
    const params: string[] = [];
    if (where) params.push(`where=${encodeURIComponent(where)}`);
    if (limit) params.push(`limit=${limit}`);
    if (params.length) path += '?' + params.join('&');
    return this.request<NpcType[]>('GET', path);
  }

  async updateNpcType(id: number, npc: Partial<NpcType>): Promise<NpcType> {
    return this.request<NpcType>('PATCH', `/npc_type/${id}`, npc);
  }

  async deleteNpcType(id: number): Promise<void> {
    return this.request<void>('DELETE', `/npc_type/${id}`);
  }

  // Spawn Groups
  async createSpawnGroup(group: SpawnGroup): Promise<SpawnGroup> {
    return this.request<SpawnGroup>('POST', '/spawngroup', group);
  }

  async getSpawnGroup(id: number): Promise<SpawnGroup> {
    return this.request<SpawnGroup>('GET', `/spawngroup/${id}`);
  }

  // Spawn Entries (link NPC to spawn group)
  async createSpawnEntry(entry: SpawnEntry): Promise<SpawnEntry> {
    return this.request<SpawnEntry>('POST', '/spawnentry', entry);
  }

  // Spawn2 (spawn location in zone)
  async createSpawn2(spawn: Spawn2): Promise<Spawn2> {
    return this.request<Spawn2>('POST', '/spawn_2', spawn);
  }

  async listSpawn2(zone: string): Promise<Spawn2[]> {
    return this.request<Spawn2[]>('GET', `/spawn_2s?where=zone__${zone}`);
  }

  // Items
  async createItem(item: Item): Promise<Item> {
    return this.request<Item>('POST', '/item', item);
  }

  async getItem(id: number): Promise<Item> {
    return this.request<Item>('GET', `/item/${id}`);
  }

  async listItems(where?: string, limit?: number): Promise<Item[]> {
    let path = '/items';
    const params: string[] = [];
    if (where) params.push(`where=${encodeURIComponent(where)}`);
    if (limit) params.push(`limit=${limit}`);
    if (params.length) path += '?' + params.join('&');
    return this.request<Item[]>('GET', path);
  }

  // Zones
  async listZones(): Promise<any[]> {
    return this.request<any[]>('GET', '/zones?limit=1000');
  }

  async getZone(shortName: string): Promise<any> {
    return this.request<any>('GET', `/zones?where=short_name__${shortName}`);
  }
}

export type { NpcType, SpawnGroup, SpawnEntry, Spawn2, Item };
