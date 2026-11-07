# Deployment

## GitHub Pages

1. Create a GitHub repository and push this folder to its `main` branch.
2. In repository Settings → Pages, set the source to **GitHub Actions**.
3. The included workflow runs `npm run check`, creates `dist/`, uploads the Pages artifact and deploys it.
4. The HTML uses relative asset paths so it works as a project site or a user site.

## Netlify

Use the included `netlify.toml`; build command: `npm run build`, publish directory: `dist`.

## Vercel

Use the included `vercel.json`; build command: `npm run build`, output directory: `dist`. The `/api/memory/*` routes are deployed as Vercel Node.js Functions, separately from the static files. The reward archive is bundled only into the reward function and is not copied into `dist/`.

Before deploying, generate a cryptographically random value of at least 32 characters with `openssl rand -hex 32`. Add it in Vercel → Project Settings → Environment Variables as `MEMORY_SESSION_SECRET`, scoped to Production. Do not commit the value or put it in frontend code. The serverless challenge uses signed, expiring session tokens so it does not depend on a serverless instance's in-memory state. After adding the variable, redeploy the project.

## Local production preview

```bash
npm run build
npm run preview
```

The IAM lab and SYSTEM FAILURE game are client-side simulations; no cloud credentials or external service connection is required.

## Memory challenge and source-code reward (v7.5.7)

Local development continues to use the in-process Node routes in `server.mjs`. Vercel uses the dedicated Node.js Functions in `api/memory/`. These hosted routes use HMAC-signed session tokens so progress can be validated across stateless function invocations without an in-memory session map. Configure `MEMORY_SESSION_SECRET` in Vercel Production environment variables before deploying. The source ZIP is stored in `private-rewards/`, excluded from `dist/`, and bundled only into the protected reward function; direct static access to `/private-rewards/*` is not available.
