const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', 'src', 'generated', 'prisma');
const dest = path.join(__dirname, '..', 'dist', 'src', 'generated', 'prisma');

fs.mkdirSync(dest, { recursive: true });
fs.cpSync(src, dest, { recursive: true });
console.log('Prisma client copied to dist/');
