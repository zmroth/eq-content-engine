// Simple test to verify zone connection stays alive
import { EQClient } from './client/eq-client';
import dotenv from 'dotenv';

dotenv.config();

const client = new EQClient({
  loginHost: process.env.EQ_LOGIN_HOST || '127.0.0.1',
  loginPort: parseInt(process.env.EQ_LOGIN_PORT || '5998'),
  username: process.env.EQ_USERNAME || 'admin',
  password: process.env.EQ_PASSWORD || 'admin',
});

let startTime: number;
let zoneEnterTime: number | undefined;

client.on('status', (msg: string) => {
  const elapsed = startTime ? ((Date.now() - startTime) / 1000).toFixed(1) : '0.0';
  console.log(`[${elapsed}s] ${msg}`);
});

client.on('error', (err: string) => {
  console.error('ERROR:', err);
});

client.on('serverList', (servers: any[]) => {
  console.log('Servers:', servers.map((s: any) => s.name).join(', '));
  if (servers.length > 0) {
    console.log(`Selecting server: ${servers[0].name}...`);
    client.selectServer(1);
  }
});

client.on('characterList', (chars: any[]) => {
  console.log('Characters:', chars.map((c: any) => c.name).join(', '));
  if (chars.length > 0) {
    console.log(`Entering world as ${chars[0].name}...`);
    client.enterWorld(chars[0].name);
  }
});

client.on('zoneEnter', (zone: any) => {
  zoneEnterTime = Date.now();
  console.log(`\n*** ZONE ENTERED: ${zone?.zoneLongName || 'Unknown'} ***`);
  console.log('Monitoring connection - will report every 10 seconds...\n');
});

client.on('debug', (msg: string) => {
  // Log all zone opcodes to debug the connection
  if (msg.includes('Zone opcode') ||
      msg.includes('ClientReady') ||
      msg.includes('ReqClientSpawn') ||
      msg.includes('position') ||
      msg.includes('heartbeat') ||
      msg.includes('ZoneEntry') ||
      msg.includes('Profile') ||
      msg.includes('NewZone') ||
      msg.includes('safe') ||
      msg.includes('bind') ||
      msg.includes('Fallback') ||
      msg.includes('0920') ||
      msg.includes('SUSPICIOUS') ||
      msg.includes('ACK seq') ||
      msg.includes('Session') ||
      (msg.includes('[ZONE]') && msg.includes('APP opcode'))) {
    console.log('[DEBUG]', msg);
  }
});

async function main() {
  console.log('Starting zone connection test...');
  startTime = Date.now();

  try {
    await client.connect();
  } catch (err) {
    console.error('Connection failed:', err);
    process.exit(1);
  }

  // Status report every 10 seconds
  setInterval(() => {
    if (zoneEnterTime) {
      const inZoneFor = ((Date.now() - zoneEnterTime) / 1000).toFixed(0);
      console.log(`[STATUS] In zone for ${inZoneFor} seconds - connection alive!`);
    }
  }, 10000);

  // Exit after 120 seconds
  setTimeout(() => {
    if (zoneEnterTime) {
      const inZoneFor = ((Date.now() - zoneEnterTime) / 1000).toFixed(0);
      console.log(`\n*** SUCCESS: Stayed in zone for ${inZoneFor} seconds! ***`);
    } else {
      console.log('\n*** WARNING: Never entered zone ***');
    }
    client.disconnect();
    process.exit(0);
  }, 120000);
}

main();
