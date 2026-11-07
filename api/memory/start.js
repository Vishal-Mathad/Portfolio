import { createMemorySession, getMemorySecret, signMemorySession, MEMORY_LEVELS } from '../../lib/memory-session.js';
import { methodNotAllowed, readJsonBody, sendJson } from '../../lib/vercel-http.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  if (!getMemorySecret()) return sendJson(res, 503, { message: 'The memory challenge service is not configured yet. Please contact the site owner.' });

  try {
    const body = await readJsonBody(req);
    const level = body.level || 'easy';
    if (!Object.hasOwn(MEMORY_LEVELS, level)) return sendJson(res, 400, { message: 'Choose easy, medium, or hard.' });
    const session = createMemorySession(level);
    const sessionId = signMemorySession(session);
    return sendJson(res, 201, { sessionId, cells: session.cells, previewMs: session.previewMs, level: session.level });
  } catch (error) {
    console.error('Memory challenge start failed:', error);
    return sendJson(res, 400, { message: 'Could not initialize the memory challenge. Please try again.' });
  }
}
