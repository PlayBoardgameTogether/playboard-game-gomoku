import { Buffer } from 'node:buffer';
import { URL } from 'node:url';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { zipSync } from 'fflate';

const base = new URL('../game-packages/gomoku/', import.meta.url);
const files = {};
const descriptor = JSON.parse(await readFile(new URL('game.json', base), 'utf8'));
descriptor.presentation = {};
for (const kind of ['icon', 'cover', 'background']) {
  const png = await readFile(new URL('../game-packages/gomoku/art/' + kind + '.png', import.meta.url));
  if (png.length > 320 * 1024) throw new Error(kind + ' exceeds artwork limit');
  descriptor.presentation[kind] = 'data:image/png;base64,' + png.toString('base64');
}
files['game.json'] = Buffer.from(JSON.stringify(descriptor));
files['server.js'] = await readFile(new URL('server.txt', base));
const client = await readFile(new URL('client.html', base), 'utf8');
if (!client.includes('__GOMOKU_BACKGROUND__')) throw new Error('Missing background placeholder');
files['client.html'] = Buffer.from(client.replace('__GOMOKU_BACKGROUND__', descriptor.presentation.background));
const output = new URL('../dist/game-packages/gomoku-1.0.4.zip', import.meta.url);
await mkdir(new URL('.', output), { recursive: true });
const bytes = zipSync(files, { mtime: new Date('2026-10-04T00:00:00Z'), level: 9 });
await writeFile(output, bytes);
console.log(`Gomoku ZIP: ${output.pathname} (${bytes.length} bytes)`);
