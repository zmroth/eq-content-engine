// Verbose connection test with full flow
import { EQClient } from './client/eq-client';

const config = {
  loginHost: '127.0.0.1',
  loginPort: 5998,
  username: 'admin',
  password: 'admin',
};

async function main() {
  const client = new EQClient(config);

  client.on('debug', (msg: string) => {
    console.log('[DEBUG]', msg.substring(0, 200));
  });

  client.on('error', (err: Error) => {
    console.error('[ERROR]', err.message);
  });

  client.on('status', (msg: string) => {
    console.log('[STATUS]', msg);
  });

  client.on('serverList', (servers: any[]) => {
    console.log('[SERVERS]', servers.map((s: any) => `${s.id}: ${s.name}`).join(', '));
    if (servers.length > 0) {
      console.log('Selecting first server...');
      client.selectServer(1);
    }
  });

  try {
    console.log('Connecting...');
    await client.connect();
    console.log('Connected!');

    // Wait for world connection to establish
    await new Promise(r => setTimeout(r, 6000));

    const chars = client.getCharacters();
    console.log('\n=== CHARACTERS ===');
    console.log('Count:', chars.length);
    for (const c of chars) {
      console.log(`  ${c.name} (level ${c.level})`);
    }

    if (chars.length > 0) {
      console.log('\n=== ENTERING WORLD ===');
      console.log('Character:', chars[0].name);
      await client.enterWorld(chars[0].name);

      // Wait for zone data
      await new Promise(r => setTimeout(r, 8000));
    }
  } catch (err) {
    console.error('Error:', err);
  }
  process.exit(0);
}

main();
