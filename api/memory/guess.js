import { getMemorySecret, signMemorySession, verifyMemorySession } from '../../lib/memory-session.js';
import { methodNotAllowed, readJsonBody, sendJson } from '../../lib/vercel-http.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  if (!getMemorySecret()) return sendJson(res, 503, { correct: false, message: 'The memory challenge service is not configured yet. Please contact the site owner.' });

  try {
    const { sessionId, index } = await readJsonBody(req);
    const session = verifyMemorySession(sessionId);
    if (!session || session.failed || session.complete || !Number.isInteger(index) || index < 0 || index >= 20) {
      return sendJson(res, 403, { correct: false, message: 'This memory session is invalid or has expired. Restart the challenge.' });
    }
    if (Date.now() - session.startedAt < session.previewMs) {
      return sendJson(res, 425, { correct: false, reason: 'too-early', message: 'The preview is still active.' });
    }
    if (session.cells[index] !== session.next) {
      const failed = { ...session, failed: true };
      return sendJson(res, 200, { correct: false, complete: false, sessionId: signMemorySession(failed), message: 'Incorrect position. Session terminated.' });
    }

    const updated = { ...session, next: session.next + 1 };
    updated.complete = updated.next === 21;
    const updatedSessionId = signMemorySession(updated);
    return sendJson(res, 200, { correct: true, complete: updated.complete, next: updated.next, sessionId: updatedSessionId });
  } catch (error) {
    console.error('Memory challenge guess failed:', error);
    return sendJson(res, 400, { correct: false, message: 'Could not validate that selection. Restart the challenge.' });
  }
}
