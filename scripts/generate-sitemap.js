const fs = require('fs');
const path = require('path');

const baseUrl = 'https://cian0.github.io';

// Static pages to include
const staticPages = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/autospeechrecognition', priority: '0.8', changefreq: 'monthly' },
  { path: '/chess-game', priority: '0.8', changefreq: 'monthly' },
  { path: '/codecompletion', priority: '0.8', changefreq: 'monthly' },
  { path: '/compact-music-player', priority: '0.8', changefreq: 'monthly' },
  { path: '/embedding-generation', priority: '0.8', changefreq: 'monthly' },
  { path: '/emoji-platformer', priority: '0.8', changefreq: 'monthly' },
  { path: '/emoji-terrain-game', priority: '0.8', changefreq: 'monthly' },
  { path: '/emojiwars', priority: '0.8', changefreq: 'monthly' },
  { path: '/flames-game', priority: '0.8', changefreq: 'monthly' },
  { path: '/hello-world', priority: '0.8', changefreq: 'monthly' },
  { path: '/ping-pong', priority: '0.8', changefreq: 'monthly' },
  { path: '/retro-chat-connect', priority: '0.8', changefreq: 'monthly' },
  { path: '/retrospritesheeteditor', priority: '0.8', changefreq: 'monthly' },
  { path: '/rock-paper-scissors', priority: '0.8', changefreq: 'monthly' },
  { path: '/sentimentcheck', priority: '0.8', changefreq: 'monthly' },
  { path: '/snake-game', priority: '0.8', changefreq: 'monthly' },
  { path: '/telegrammessaging', priority: '0.8', changefreq: 'monthly' },
  { path: '/token-converter', priority: '0.8', changefreq: 'monthly' },
];

function generateSitemap() {
  const currentDate = new Date().toISOString().split('T')[0];
  
  let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
  sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  staticPages.forEach(page => {
    sitemap += '  <url>\n';
    sitemap += `    <loc>${baseUrl}${page.path}</loc>\n`;
    sitemap += `    <lastmod>${currentDate}</lastmod>\n`;
    sitemap += `    <changefreq>${page.changefreq}</changefreq>\n`;
    sitemap += `    <priority>${page.priority}</priority>\n`;
    sitemap += '  </url>\n';
  });

  sitemap += '</urlset>';

  const publicDir = path.join(__dirname, '..', 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap);
  console.log('✅ Sitemap generated successfully at public/sitemap.xml');
}

generateSitemap();
