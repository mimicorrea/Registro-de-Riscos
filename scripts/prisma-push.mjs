import { readFileSync, existsSync } from 'fs';
import { spawnSync } from 'child_process';
import path from 'path';

const envPath = path.join(process.cwd(), '.env.local');
if (!existsSync(envPath)) {
  console.error('.env.local não encontrado');
  process.exit(1);
}

const content = readFileSync(envPath, 'utf8');
const match = content.match(/^DATABASE_URL=(.+)$/m);
if (!match) {
  console.error('DATABASE_URL não encontrada');
  process.exit(1);
}

let url = match[1].trim().replace(/^["']|["']$/g, '');
if (process.argv.includes('--direct')) {
  url = url.replace('-pooler', '');
  console.log('Usando conexão direta (sem pooler)...');
}

process.env.DATABASE_URL = url;

const result = spawnSync('npx', ['prisma', 'db', 'push'], {
  stdio: 'inherit',
  shell: true,
  env: process.env,
});

process.exit(result.status ?? 1);
