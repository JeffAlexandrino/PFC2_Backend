const { spawnSync } = require('child_process');
require('dotenv').config();

const url = process.env.DATABASE_URL;

console.log('DATABASE_URL existe:', !!url);
console.log('DATABASE_URL:', url ? '[CONFIGURADA]' : '[VAZIA]');

if (!url) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

console.log(
    'DATABASE_URL:',
    process.env.DATABASE_URL ? '[CONFIGURADA]' : '[NÃO CONFIGURADA]'
);

const res = spawnSync('npx', ['prisma', 'migrate', 'deploy'], { stdio: 'inherit', shell: true });
if (res.status !== 0) process.exit(res.status);

const gen = spawnSync('npx', ['prisma', 'generate'], { stdio: 'inherit', shell: true });
process.exit(gen.status);
