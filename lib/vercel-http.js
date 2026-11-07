export function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  if (typeof res.status === 'function' && typeof res.json === 'function') {
    res.status(status);
    res.setHeader?.('Cache-Control', 'no-store');
    res.setHeader?.('X-Content-Type-Options', 'nosniff');
    return res.json(payload);
  }
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.end(body);
}

export async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return req.body ? JSON.parse(req.body) : {};
  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 4096) throw new Error('Request body is too large.');
  }
  return raw ? JSON.parse(raw) : {};
}

export function methodNotAllowed(res, allowed) {
  res.setHeader('Allow', allowed.join(', '));
  return sendJson(res, 405, { message: `Method not allowed. Use ${allowed.join(' or ')}.` });
}

export function getRequestUrl(req) {
  return new URL(req.url || '/', `https://${req.headers?.host || 'localhost'}`);
}
