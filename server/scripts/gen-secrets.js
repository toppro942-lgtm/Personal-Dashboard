import { randomBytes } from 'node:crypto';
import { createInterface } from 'node:readline/promises';
import { hashPasscode } from '../lib/crypto.js';

const rl = createInterface({ input: process.stdin, output: process.stdout });
const pass = (await rl.question('Passcode für das Dashboard: ')).trim();
rl.close();
if (pass.length < 8) { console.error('Mindestens 8 Zeichen.'); process.exit(1); }

console.log(`
# In .env übernehmen:
DASHBOARD_PASSCODE_HASH=${hashPasscode(pass)}
SESSION_SECRET=${randomBytes(32).toString('hex')}
TOKEN_KEY=${randomBytes(32).toString('hex')}
`);
