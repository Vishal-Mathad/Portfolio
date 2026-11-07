# Release v7.5.7 — Vercel Memory Challenge API

- Added Vercel Node.js Functions for memory challenge start, guess validation and reward download.
- Added HMAC-signed, expiring session tokens so the game state can be verified across stateless serverless invocations without an external database.
- The browser now refreshes its token after every correct guess and reports a clear JSON/API error instead of exposing an HTML-to-JSON parse failure.
- Configured Vercel to bundle the private source ZIP only with the reward function; it remains excluded from the static `dist/` output.
- Added automated route tests for start, preview lockout, full completion, failed runs, secret configuration and protected reward download.
- Required Vercel Production environment variable: `MEMORY_SESSION_SECRET` (random, at least 32 characters).
