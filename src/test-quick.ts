import { EQClient } from './client/eq-client';

const client = new EQClient({
  loginHost: '127.0.0.1',
  loginPort: 5998,
  username: 'admin',
  password: 'admin',
});

client.on('status', (m: string) => console.log('[STATUS]', m));
client.on('serverList', (s: any[]) => { if (s.length) client.selectServer(1); });
client.on('debug', (m: string) => {
  if (m.includes('[ZONE]') && (m.includes('ACK') || m.includes('Retry') || m.includes('seq='))) {
    console.log(m);
  }
});
client.on('playerProfile', (p: any) => { console.log('[PROFILE]', p.name); });

async function main() {
  await client.connect();
  await new Promise(r => setTimeout(r, 8000));
  console.log('Entering...');
  await client.enterWorld('Alexandros');
  await new Promise(r => setTimeout(r, 12000));
  process.exit(0);
}
main().catch(() => process.exit(1));
