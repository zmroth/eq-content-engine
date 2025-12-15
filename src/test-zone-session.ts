// Zone Session Debug - Focus on session establishment
import { EQClient } from './client/eq-client';
import dotenv from 'dotenv';

dotenv.config();

const CONFIG = {
  loginHost: process.env.EQ_LOGIN_HOST || '127.0.0.1',
  loginPort: parseInt(process.env.EQ_LOGIN_PORT || '5998'),
  username: process.env.EQ_USERNAME || 'admin',
  password: process.env.EQ_PASSWORD || 'admin',
};

async function main() {
  console.log('Zone Session Debug Test');
  console.log('='.repeat(60));

  const client = new EQClient({
    loginHost: CONFIG.loginHost,
    loginPort: CONFIG.loginPort,
    username: CONFIG.username,
    password: CONFIG.password,
  });

  client.on('status', (msg: string) => {
    console.log(`[STATUS] ${msg}`);
  });

  client.on('debug', (msg: string) => {
    // Show session layer messages for zone
    if (msg.includes('[ZONE]')) {
      console.log(`${msg}`);
    }
    // Show key world messages
    if (msg.includes('Zone server info') || msg.includes('EnterWorld')) {
      console.log(`[DBG] ${msg}`);
    }
  });

  client.on('error', (msg: string) => {
    console.error(`[ERROR] ${msg}`);
  });

  client.on('serverList', () => {
    client.selectServer(1);
  });

  client.on('characterList', () => {
    setTimeout(() => {
      console.log('\n>>> ENTERING WORLD...');
      client.enterWorld('Alexandros');
    }, 500);
  });

  client.on('zoneServerInfo', (info: { ip: string; port: number }) => {
    console.log(`\n>>> ZONE INFO: ${info.ip}:${info.port}`);
  });

  client.on('zoneEnter', (zone: any) => {
    console.log(`\n>>> ENTERED ZONE: ${zone.longName || zone.shortName}`);
  });

  try {
    await client.connect();
    console.log('Connected.\n');

    await new Promise(resolve => setTimeout(resolve, 20000));

    console.log('\nDone.');
    client.disconnect();

  } catch (error) {
    console.error('Failed:', error);
    process.exit(1);
  }
}

main().catch(console.error);
