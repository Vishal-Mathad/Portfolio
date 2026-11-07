import { createHmac, randomInt, timingSafeEqual } from 'node:crypto';

export const MEMORY_LEVELS = Object.freeze({ easy: 15000, medium: 12000, hard: 8000 });
export const MEMORY_SESSION_TTL_MS = 30 * 60 * 1000;

export function getMemorySecret() {
  const secret = process.env.MEMORY_SESSION_SECRET;
  return typeof secret === 'string' && secret.length >= 32 ? secret : null;
}

export function shuffledNumbers() {
  const values = Array.from({ length: 20 }, (_, index) => index + 1);
  for (let i = values.length - 1; i > 0; i -= 1) {
    const j = randomInt(i + 1);
    [values[i], values[j]] = [values[j], values[i]];
  }
  return values;
}

export function createMemorySession(level, now = Date.now()) {
  const previewMs = MEMORY_LEVELS[level];
  if (!previewMs) return null;
  return {
    version: 1,
    cells: shuffledNumbers(),
    next: 1,
    startedAt: now,
    expiresAt: now + MEMORY_SESSION_TTL_MS,
    previewMs,
    level,
    failed: false,
    complete: false
  };
}

export function signMemorySession(session, secret = getMemorySecret()) {
  if (!secret) throw new Error('MEMORY_SESSION_SECRET is not configured.');
  const encoded = Buffer.from(JSON.stringify(session)).toString('base64url');
  const signature = createHmac('sha256', secret).update(encoded).digest('base64url');
  return `${encoded}.${signature}`;
}

export function verifyMemorySession(token, secret = getMemorySecret(), now = Date.now()) {
  if (!secret || typeof token !== 'string' || token.length > 4096) return null;
  const separator = token.lastIndexOf('.');
  if (separator <= 0 || separator === token.length - 1) return null;
  const encoded = token.slice(0, separator);
  const suppliedSignature = token.slice(separator + 1);
  const expectedSignature = createHmac('sha256', secret).update(encoded).digest();
  let actualSignature;
  try { actualSignature = Buffer.from(suppliedSignature, 'base64url'); } catch { return null; }
  if (actualSignature.length !== expectedSignature.length || !timingSafeEqual(actualSignature, expectedSignature)) return null;

  try {
    const session = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
    const cellsAreValid = Array.isArray(session.cells)
      && session.cells.length === 20
      && session.cells.every(Number.isInteger)
      && new Set(session.cells).size === 20
      && session.cells.every(value => value >= 1 && value <= 20);
    if (session.version !== 1 || !cellsAreValid) return null;
    if (!Number.isInteger(session.next) || session.next < 1 || session.next > 21) return null;
    if (!Number.isFinite(session.startedAt) || !Number.isFinite(session.expiresAt) || now > session.expiresAt || session.expiresAt - session.startedAt > MEMORY_SESSION_TTL_MS) return null;
    if (!Object.hasOwn(MEMORY_LEVELS, session.level) || session.previewMs !== MEMORY_LEVELS[session.level]) return null;
    if (typeof session.failed !== 'boolean' || typeof session.complete !== 'boolean') return null;
    if (session.complete !== (session.next === 21) || (session.failed && session.complete)) return null;
    return session;
  } catch {
    return null;
  }
}
