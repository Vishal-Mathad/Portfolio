import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { getMemorySecret, verifyMemorySession } from '../../lib/memory-session.js';
import { getRequestUrl, methodNotAllowed, sendJson } from '../../lib/vercel-http.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
  if (!getMemorySecret()) return sendJson(res, 503, { message: 'The memory challenge service is not configured yet.' });

  const token = getRequestUrl(req).searchParams.get('session');
  const session = verifyMemorySession(token);
  if (!session || !session.complete || session.failed) {
    return sendJson(res, 403, { message: 'Complete all 20 memory selections to unlock this reward.' });
  }

  try {
    // Vercel includes this private archive in this function bundle via vercel.json.
    const archivePath = path.join(process.cwd(), 'private-rewards', 'portfolio-source-code.zip');
    const archive = await readFile(archivePath);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Length', archive.length);
    res.setHeader('Content-Disposition', 'attachment; filename="vishal-mathad-portfolio-source.zip"');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    return res.end(archive);
  } catch (error) {
    console.error('Memory reward archive unavailable:', error);
    return sendJson(res, 500, { message: 'The source-code reward is temporarily unavailable.' });
  }
}
