# Deployment

## GitHub Pages

1. Create a GitHub repository and push this folder to its `main` branch.
2. In repository Settings → Pages, set the source to **GitHub Actions**.
3. The included workflow runs `npm run check`, creates `dist/`, uploads the Pages artifact and deploys it.
4. The HTML uses relative asset paths so it works as a project site or a user site.

## Netlify

Use the included `netlify.toml`; build command: `npm run build`, publish directory: `dist`.

## Vercel

Use the included `vercel.json`; build command: `npm run build`, output directory: `dist`.

## Local production preview

```bash
npm run build
npm run preview
```

The IAM lab and SYSTEM FAILURE game are client-side simulations; no cloud credentials or external service connection is required.

## Memory challenge and source-code reward (v7.0.0)

The 20-tile game and source reward use the Node server routes in `server.mjs` (`/api/memory/start`, `/api/memory/guess`, and `/api/memory/reward`). Run the project with `npm run dev` or `npm start`. The source ZIP is stored in `private-rewards/`, is excluded from `dist/`, and direct `/private-rewards/*` requests are blocked. A static-only Netlify/Vercel publish of `dist/` does not execute these Node routes; use a Node-capable host or implement equivalent persistent serverless endpoints before enabling the live reward there.
