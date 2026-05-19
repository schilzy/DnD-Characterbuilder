/**
 * D&D 5e Character Builder — API Server
 * ----------------------------------------
 * API-only server. Run this alongside 5etools' http-server.
 *
 * Usage:  node server.cjs [port]
 * Default port: 5051
 *
 * 5etools serves the page at  http://localhost:5050
 * This server provides the API at  http://localhost:5051
 *
 * API:
 *   GET    /api/characters          → list all saved characters
 *   POST   /api/characters/save     → save { name, data } → { filename }
 *   GET    /api/characters/:file    → load a specific file
 *   DELETE /api/characters/:file    → delete a character
 */

const http = require('http');
const fs   = require('fs');
const path = require('path');
const os   = require('os');
const url  = require('url');

const PORT     = parseInt(process.argv[2]) || 5051;
const CHAR_DIR = path.join(__dirname, 'characters');

if (!fs.existsSync(CHAR_DIR)) {
  fs.mkdirSync(CHAR_DIR, { recursive: true });
  console.log('Created characters/ directory at', CHAR_DIR);
}

function sendJSON(res, status, data) {
  const body = JSON.stringify(data, null, 2);
  res.writeHead(status, {
    'Content-Type':                'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods':'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers':'Content-Type',
    'Content-Length':              Buffer.byteLength(body),
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end',  () => resolve(body));
    req.on('error', reject);
  });
}

function safeName(raw) {
  return (raw || 'character')
    .replace(/[^a-zA-Z0-9 _\-]/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .slice(0, 80) || 'character';
}

async function handler(req, res) {
  const { pathname } = url.parse(req.url, true);
  const method = req.method.toUpperCase();

  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods':'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers':'Content-Type',
    });
    res.end();
    return;
  }

  if (pathname === '/api/characters' && method === 'GET') {
    try {
      const files = fs.readdirSync(CHAR_DIR)
        .filter(f => f.endsWith('.json'))
        .map(filename => {
          const stat = fs.statSync(path.join(CHAR_DIR, filename));
          let preview = { name: 'Unnamed', class: '—', race: '—', level: 1, background: '—' };
          try {
            const d = JSON.parse(fs.readFileSync(path.join(CHAR_DIR, filename), 'utf8'));
            preview = {
              name:       d.name                            || 'Unnamed',
              class:      d.class?.name  || d.class         || '—',
              race:       d.race?.name   || d.race          || '—',
              level:      d.level                           || 1,
              background: d.background?.name || d.background || '—',
            };
          } catch (_) {}
          return { filename, ...preview, savedAt: stat.mtime.toISOString(), sizeBytes: stat.size };
        })
        .sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
      sendJSON(res, 200, { characters: files });
    } catch (err) { sendJSON(res, 500, { error: err.message }); }
    return;
  }

  if (pathname === '/api/characters/save' && method === 'POST') {
    try {
      const payload  = JSON.parse(await readBody(req));
      const name     = safeName(payload.name || payload.data?.name || 'character');
      const data     = payload.data || payload;
      const ts       = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const filename = `${name}_${ts}.json`;
      fs.writeFileSync(path.join(CHAR_DIR, filename), JSON.stringify(data, null, 2), 'utf8');
      console.log('Saved:', filename);
      sendJSON(res, 200, { ok: true, filename });
    } catch (err) { sendJSON(res, 400, { error: err.message }); }
    return;
  }

  if (pathname.startsWith('/api/characters/') && method === 'GET') {
    const filename = path.basename(pathname);
    if (!filename.endsWith('.json')) { sendJSON(res, 400, { error: 'Must be .json' }); return; }
    const filepath = path.join(CHAR_DIR, filename);
    if (!fs.existsSync(filepath)) { sendJSON(res, 404, { error: 'Not found' }); return; }
    try {
      const raw = fs.readFileSync(filepath, 'utf8');
      res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      res.end(raw);
    } catch (err) { sendJSON(res, 500, { error: err.message }); }
    return;
  }

  if (pathname.startsWith('/api/characters/') && method === 'DELETE') {
    const filename = path.basename(pathname);
    if (!filename.endsWith('.json')) { sendJSON(res, 400, { error: 'Must be .json' }); return; }
    const filepath = path.join(CHAR_DIR, filename);
    if (!fs.existsSync(filepath)) { sendJSON(res, 404, { error: 'Not found' }); return; }
    try {
      fs.unlinkSync(filepath);
      console.log('Deleted:', filename);
      sendJSON(res, 200, { ok: true, deleted: filename });
    } catch (err) { sendJSON(res, 500, { error: err.message }); }
    return;
  }

  sendJSON(res, 404, { error: 'Unknown route: ' + pathname });
}

const server = http.createServer((req, res) => {
  handler(req, res).catch(err => {
    console.error('Unhandled error:', err);
    try { sendJSON(res, 500, { error: 'Internal server error' }); } catch (_) {}
  });
});

server.listen(PORT, '0.0.0.0', () => {
  const localIP = Object.values(os.networkInterfaces())
    .flat()
    .filter(i => i.family === 'IPv4' && !i.internal)
    .map(i => i.address)[0] || 'your-ip';

  console.log('\n🐉 Character Builder API Server');
  console.log(`   Local:   http://localhost:${PORT}/api/characters`);
  console.log(`   Network: http://${localIP}:${PORT}/api/characters`);
  console.log(`   Saving to: ${CHAR_DIR}`);
  console.log('\n   Keep this running alongside: npm run serve:dev');
  console.log('   Press Ctrl+C to stop\n');
});
