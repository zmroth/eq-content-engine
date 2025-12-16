import { EQClient } from './client/eq-client';

const client = new EQClient({
  loginHost: '127.0.0.1',
  loginPort: 5998,
  username: 'admin',
  password: 'admin',
});

client.on('status', (m: string) => console.log('[STATUS]', m));
client.on('serverList', (s: any[]) => { if (s.length) client.selectServer(1); });

const seenOpcodes = new Set<string>();
client.on('debug', (m: string) => {
  if (m.includes('[ZONE]') && m.includes('Session')) {
    console.log('[ZONE-SESSION]', m);
  }
  if (m.includes('Zone opcode:')) {
    const match = m.match(/0x[0-9a-f]+/);
    const op = match ? match[0] : null;
    if (op && !seenOpcodes.has(op)) {
      seenOpcodes.add(op);
      console.log('[OPCODE]', m);
    }
  }
  if (m.includes('Sending OP_')) console.log('[OUT]', m);
});

client.on('playerProfile', (p: any) => console.log('[PROFILE]', p.name));
client.on('zoneEnter', (z: any) => console.log('[ZONE]', z.longName));
client.on('spawn', (s: any) => console.log('[SPAWN]', s.name));

async function main() {
  await client.connect();
  console.log('Waiting for char list (15s)...');
  await new Promise(r => setTimeout(r, 15000));
  console.log('Entering as Alexandros...');
  await client.enterWorld('Alexandros');
  console.log('Waiting for zone (25s)...');
  await new Promise(r => setTimeout(r, 25000));
  console.log('Opcodes seen:', [...seenOpcodes]);
  process.exit(0);
}
main().catch(e => { console.log('Error:', e.message); process.exit(1); });
