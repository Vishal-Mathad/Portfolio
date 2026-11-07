import http from 'node:http';
import { randomUUID, randomInt, randomBytes } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile, stat } from 'node:fs/promises';

const root = path.dirname(fileURLToPath(import.meta.url));
const useDist = process.argv.includes('--dist');
const serveRoot = useDist ? path.join(root, 'dist') : root;
const port = Number(process.env.PORT || 4173);
const memorySessions = new Map();
const sourceRewardPath = path.join(root, 'private-rewards', 'portfolio-source-code.zip');
const sendJson = (res, status, payload) => {
  const body = Buffer.from(JSON.stringify(payload));
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Content-Length': body.length, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
  res.end(body);
};
const readJson = async req => {
  let raw = '';
  for await (const chunk of req) { raw += chunk; if (raw.length > 4096) throw new Error('Request too large'); }
  return raw ? JSON.parse(raw) : {};
};
const shuffledNumbers = () => {
  const values = Array.from({ length: 20 }, (_, index) => index + 1);
  for (let i = values.length - 1; i > 0; i--) { const j = randomInt(i + 1); [values[i], values[j]] = [values[j], values[i]]; }
  return values;
};
const mimeTypes = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=utf-8', '.json': 'application/json; charset=utf-8'
};
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', 'http://localhost');
    let pathname = decodeURIComponent(url.pathname);
    if (pathname === '/api/memory/start' && req.method === 'POST') {
      const now = Date.now();
      for (const [id, session] of memorySessions) if (now - session.startedAt > 30 * 60 * 1000) memorySessions.delete(id);
      const { level = 'easy' } = await readJson(req);
      const levelTimes = { easy: 15000, medium: 12000, hard: 8000 };
      if (!(level in levelTimes)) { sendJson(res, 400, { message: 'Choose easy, medium, or hard.' }); return; }
      const sessionId = randomUUID(); const cells = shuffledNumbers(); const previewMs = levelTimes[level];
      memorySessions.set(sessionId, { cells, next: 1, startedAt: now, previewMs, level, failed: false, complete: false });
      sendJson(res, 201, { sessionId, cells, previewMs, level }); return;
    }
    if (pathname === '/api/memory/guess' && req.method === 'POST') {
      const { sessionId, index } = await readJson(req); const session = memorySessions.get(sessionId);
      if (!session || session.failed || session.complete || !Number.isInteger(index) || index < 0 || index >= 20) { sendJson(res, 403, { correct: false, message: 'Invalid or inactive memory session.' }); return; }
      if (Date.now() - session.startedAt < session.previewMs) { sendJson(res, 425, { correct: false, reason: 'too-early', message: 'The preview is still active.' }); return; }
      if (session.cells[index] !== session.next) { session.failed = true; sendJson(res, 200, { correct: false, complete: false, message: 'Incorrect position. Session terminated.' }); return; }
      session.next += 1; session.complete = session.next === 21; sendJson(res, 200, { correct: true, complete: session.complete, next: session.next }); return;
    }
    if (pathname === '/api/memory/reward' && req.method === 'GET') {
      const session = memorySessions.get(url.searchParams.get('session') || '');
      if (!session || !session.complete || session.failed) { res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' }).end('Complete all 20 memory selections to unlock this reward.'); return; }
      const archive = await readFile(sourceRewardPath);
      res.writeHead(200, { 'Content-Type': 'application/zip', 'Content-Length': archive.length, 'Content-Disposition': 'attachment; filename="vishal-mathad-portfolio-source.zip"', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
      res.end(archive); return;
    }
    if (pathname.startsWith('/private-rewards/')) { res.writeHead(404).end('Not found'); return; }
    if (pathname.startsWith('/api/')) { res.writeHead(404).end('Not found'); return; }
    if (pathname === '/') pathname = '/index.html';
    const filePath = path.resolve(serveRoot, `.${pathname}`);
    if (!filePath.startsWith(serveRoot + path.sep) && filePath !== path.join(serveRoot, 'index.html')) {
      res.writeHead(403).end('Forbidden'); return;
    }
    const info = await stat(filePath);
    if (!info.isFile()) { res.writeHead(404).end('Not found'); return; }
    const body = await readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    // The inline import map needs a fresh nonce, while Three.js and OrbitControls
    // are served as ES modules from jsDelivr. Keep the CSP strict without
    // enabling unrestricted inline scripts.
    const nonce = randomBytes(18).toString('base64');
    const responseBody = ext === '.html'
      ? Buffer.from(body.toString('utf8').replaceAll('__CSP_NONCE__', nonce))
      : body;
    res.writeHead(200, {
      'Content-Type': mimeTypes[ext] || 'application/octet-stream', 'Content-Length': responseBody.length,
      'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      'Content-Security-Policy': `default-src 'self'; script-src 'self' 'nonce-${nonce}' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https://cdn.simpleicons.org; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'`,
      'Cache-Control': ext === '.pdf' || ext === '.svg' ? 'public, max-age=3600' : 'no-cache'
    });
    res.end(responseBody);
  } catch (error) {
    res.writeHead(error.code === 'ENOENT' ? 404 : 500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(error.code === 'ENOENT' ? 'Not found' : 'Server error');
  }
});
server.listen(port, '0.0.0.0', () => console.log(`Portfolio ${useDist ? 'preview' : 'development'} server running at http://localhost:${port}`));
