import { RealMudServer } from './mud/bridge';

const PORT = 8766; // Different port from content MUD
const ZONE = 'qeynos';

console.log('Starting EQ MUD Bridge Server...\n');

const server = new RealMudServer(PORT, ZONE);

process.on('SIGINT', () => {
  console.log('\nShutting down...');
  server.close();
  process.exit(0);
});

console.log('Waiting for game events...');
console.log('Connect to ws://localhost:8766 and play in your EQ client.\n');
