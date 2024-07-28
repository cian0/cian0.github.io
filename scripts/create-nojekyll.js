const fs = require('fs');
const path = require('path');

const outDir = path.join(process.cwd(), 'out');
const noJekyllPath = path.join(outDir, '.nojekyll');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

fs.writeFileSync(noJekyllPath, '');
console.log('.nojekyll file created successfully');