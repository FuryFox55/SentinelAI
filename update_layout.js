const fs = require('fs');
const files = [
  'c:/Prototype/src/app/setup/page.tsx',
  'c:/Prototype/src/app/protection/page.tsx',
  'c:/Prototype/src/app/profile/page.tsx',
  'c:/Prototype/src/app/monitoring/page.tsx',
  'c:/Prototype/src/app/emergency/page.tsx',
  'c:/Prototype/src/app/dashboard/page.tsx',
  'c:/Prototype/src/app/command-center/page.tsx',
  'c:/Prototype/src/app/assistant/page.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/className=\"min-h-screen\b(?! w-full)/g, 'className=\"min-h-screen w-full');
  fs.writeFileSync(file, content);
});
console.log('Added w-full to root divs');
