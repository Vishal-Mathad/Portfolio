# Test report — v7.5.7

## Automated checks

- `npm run check` — passed.
- JavaScript syntax checks for the browser app, local server, build script, shared API helpers and all three Vercel function handlers — passed.
- Node test suite — 42 tests passed, 0 failed.
- `npm run build` — passed; static output generated in `dist/`.
- `vercel.json` JSON parse — passed.
- Private source archive ZIP integrity — passed.

## Memory API coverage

- Challenge start returns a randomized permutation of 1–20 and a signed session token.
- Difficulty preview durations are applied and early guesses are rejected.
- Every correct guess returns a refreshed signed token; completing all 20 produces an unlockable state.
- An incorrect guess creates a failed state that cannot unlock the reward.
- Missing `MEMORY_SESSION_SECRET` returns a JSON 503 response rather than an HTML fallback.
- Reward endpoint serves the private ZIP only for a valid, completed, unexpired signed session.

## Deployment requirements

Set `MEMORY_SESSION_SECRET` as a Vercel Production environment variable. Generate a value with `openssl rand -hex 32`. The archive is included only in the reward function using `includeFiles` and remains outside `dist/`.

A deployed Vercel browser-level smoke test still needs to be performed after the environment variable is configured and the new deployment is Ready.
