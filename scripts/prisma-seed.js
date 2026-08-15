const { spawnSync } = require('child_process');
require('dotenv').config();

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

const res = spawnSync('npx', ['prisma', 'db', 'seed', '--schema', 'prisma/schema.prisma'], { stdio: 'inherit', shell: true });
if (res.status !== 0) process.exit(res.status);
