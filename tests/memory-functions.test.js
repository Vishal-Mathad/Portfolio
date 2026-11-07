import test from 'node:test';
import assert from 'node:assert/strict';
import startHandler from '../api/memory/start.js';
import guessHandler from '../api/memory/guess.js';
import rewardHandler from '../api/memory/reward.js';
import { createMemorySession, signMemorySession, verifyMemorySession } from '../lib/memory-session.js';

const TEST_SECRET = 'test-memory-secret-0123456789abcdef0123456789abcdef';

function mockResponse() {
  return {
    statusCode: 200,
    headers: {},
    body: undefined,
    status(code) { this.statusCode = code; return this; },
    setHeader(key, value) { this.headers[key.toLowerCase()] = value; return this; },
    json(value) { this.body = value; return this; },
    end(value) { this.body = value; return this; }
  };
}

function request(method, url, body = {}) {
  return { method, url, body, headers: { host: 'portfolio.test' } };
}

test('Vercel memory start returns a shuffled board and signed session token', async () => {
  process.env.MEMORY_SESSION_SECRET = TEST_SECRET;
  const res = mockResponse();
  await startHandler(request('POST', '/api/memory/start', { level: 'hard' }), res);
  assert.equal(res.statusCode, 201);
  assert.equal(res.body.previewMs, 8000);
  assert.equal(new Set(res.body.cells).size, 20);
  assert.deepEqual([...res.body.cells].sort((a, b) => a - b), Array.from({ length: 20 }, (_, i) => i + 1));
  const decoded = verifyMemorySession(res.body.sessionId);
  assert.equal(decoded.level, 'hard');
  assert.equal(decoded.next, 1);
});

test('Vercel memory guess refuses early selections and signs each successful next state', async () => {
  process.env.MEMORY_SESSION_SECRET = TEST_SECRET;
  const session = createMemorySession('hard', Date.now());
  const token = signMemorySession(session);
  const early = mockResponse();
  await guessHandler(request('POST', '/api/memory/guess', { sessionId: token, index: session.cells.indexOf(1) }), early);
  assert.equal(early.statusCode, 425);
  assert.equal(early.body.reason, 'too-early');

  session.startedAt -= session.previewMs + 10;
  session.expiresAt = session.startedAt + 30 * 60 * 1000;
  let nextToken = signMemorySession(session);
  let latest;
  for (let number = 1; number <= 20; number += 1) {
    const state = verifyMemorySession(nextToken);
    const res = mockResponse();
    await guessHandler(request('POST', '/api/memory/guess', { sessionId: nextToken, index: state.cells.indexOf(number) }), res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.correct, true);
    assert.equal(res.body.complete, number === 20);
    nextToken = res.body.sessionId;
    latest = res.body;
  }
  assert.equal(latest.next, 21);
  assert.equal(verifyMemorySession(nextToken).complete, true);
});

test('wrong Vercel memory guess signs a failed session that cannot unlock the reward', async () => {
  process.env.MEMORY_SESSION_SECRET = TEST_SECRET;
  const session = createMemorySession('easy', Date.now() - 16000);
  const wrongIndex = session.cells.indexOf(session.cells.find(value => value !== 1));
  const res = mockResponse();
  await guessHandler(request('POST', '/api/memory/guess', { sessionId: signMemorySession(session), index: wrongIndex }), res);
  assert.equal(res.body.correct, false);
  assert.equal(verifyMemorySession(res.body.sessionId).failed, true);

  const reward = mockResponse();
  await rewardHandler(request('GET', `/api/memory/reward?session=${encodeURIComponent(res.body.sessionId)}`), reward);
  assert.equal(reward.statusCode, 403);
});

test('Vercel reward endpoint returns the private ZIP only for a completed signed session', async () => {
  process.env.MEMORY_SESSION_SECRET = TEST_SECRET;
  const session = createMemorySession('easy', Date.now() - 16000);
  session.next = 21;
  session.complete = true;
  const token = signMemorySession(session);
  const res = mockResponse();
  await rewardHandler(request('GET', `/api/memory/reward?session=${encodeURIComponent(token)}`), res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.headers['content-type'], 'application/zip');
  assert.ok(Buffer.isBuffer(res.body));
  assert.ok(res.body.length > 10000);
});

test('Vercel memory routes return JSON when the signing secret is missing', async () => {
  const previous = process.env.MEMORY_SESSION_SECRET;
  delete process.env.MEMORY_SESSION_SECRET;
  const res = mockResponse();
  await startHandler(request('POST', '/api/memory/start', { level: 'easy' }), res);
  assert.equal(res.statusCode, 503);
  assert.match(res.body.message, /not configured/i);
  if (previous) process.env.MEMORY_SESSION_SECRET = previous;
});

test('browser refreshes the signed session token after each correct selection and guards non-JSON responses', async () => {
  const { readFile } = await import('node:fs/promises');
  const source = await readFile(new URL('../app.js', import.meta.url), 'utf8');
  assert.match(source, /if \(data\.sessionId\) sessionId = data\.sessionId/);
  assert.match(source, /const readApiJson = async response/);
  assert.match(source, /did not return JSON/);
});

test('Vercel configuration deploys the three memory API functions and bundles the private reward only with its endpoint', async () => {
  const { readFile } = await import('node:fs/promises');
  const config = JSON.parse(await readFile(new URL('../vercel.json', import.meta.url), 'utf8'));
  assert.equal(config.framework, null);
  assert.equal(config.outputDirectory, 'dist');
  assert.equal(config.rewrites, undefined);
  assert.equal(config.functions['api/memory/reward.js'].includeFiles, 'private-rewards/portfolio-source-code.zip');
  for (const route of ['start', 'guess', 'reward']) {
    const routeFile = new URL(`../api/memory/${route}.js`, import.meta.url);
    const { stat } = await import('node:fs/promises');
    assert.ok((await stat(routeFile)).isFile());
  }
});
