# Vishal Mathad — Engineering at the Edge

A responsive portfolio for backend, systems, cloud and platform engineering. The site uses a small Node.js server and loads its interactive 3D hero model with Three.js as an ES module from jsDelivr. Release **7.5.7** adds Vercel serverless support for the signed memory-challenge API while preserving the responsive layout and bounded 3D robot zoom.

## Sections

1. **Home** — animated network field, centred interactive 3D red robot, orbital rings and live signal labels.
2. **Projects** — Kubernetes self-healing platform, IAM access governance, Git hosting over SSH, and AML transaction monitor.
3. **Tech Stack** — seven circular category controls with resume-derived technologies and logo badges.
4. **About Me** — education and profile.
5. **Experience & Co-curricular** — Spiritual Club leadership, chess and other resume-listed activities.
6. **Fun** — Hacker Terminal, a four-mission simulated command-line challenge.
7. **Contact Me** — verified email, GitHub and resume.

## Interactive experiences

- **Boot loader:** a kinetic editorial index screen with oversized typography, staged initialization rows, moving orange progress runners and a 0–100% counter. It uses charcoal, ivory and orange only; reduced-motion preferences are respected.
- **3D hero robot:** a custom hollow Three.js character with a visible inner lining, two eyes, bounded orbit controls and resize-aware rendering. Scroll/pinch zoom has a safe camera-distance range that prevents the shell from growing beyond the stage; drag-to-rotate remains enabled.
- **IAM governance lab:** switch between three synthetic principals, toggle effective permissions, watch the risk score recalculate, select Keep/Revoke, run a dry-run, request approval and execute a local verification simulation. It does not call AWS or mutate any cloud account.
- **Hacker Terminal:** complete four sandboxed missions using `scan`, `connect analyst@10.0.0.7`, `sudo -l` and `cat /var/lab/flag.txt`. Includes command feedback, hints, help, clear, score tracking, progress and restart. Completing all four missions (1,000 XP) generates a downloadable Operator Clearance Dossier with the mission audit trail, verified flag and printable achievement certificate. The website source bundle is not exposed as an in-game reward. Commands are interpreted locally and never reach a real shell or network.
- Project cards use equal-height visual panels and aligned content, open project dossiers from the card surface or View Project action, and support keyboard activation. Embedded IAM and AML controls remain independently interactive.
- Kubernetes topology animates controller-to-worker connections; Git-over-SSH types a terminal session on hover/focus; AML calculates its result from 480 synthetic rows after the scan starts.
- Technology categories are circular and support keyboard navigation. The technology globe supports pointer/touch dragging.
- Reduced-motion preferences are respected and controls remain keyboard accessible.

## Run locally

Requires Node.js 20 or newer and a browser with WebGL support. Three.js is loaded from jsDelivr, so the browser needs access to that CDN when opening the portfolio.

```bash
npm install
npm run check
npm run build
npm run dev
```

Open `http://localhost:4173`.

Preview the production build with:

```bash
npm run preview
```

## Validation

`npm run check` runs JavaScript syntax checks and the Node test suite. `npm run build` copies the static site and resume to `dist/`. The regression suite validates section structure, projects, resume-derived technology content, loader states, IAM review interactions, Hacker Terminal mission, command and reward-generation mechanics, calculated AML output, Git terminal replay, Kubernetes connections, responsive and accessibility hooks.

**Simulation boundary:** IAM principal data and Hacker Terminal command simulation are local synthetic demos. They do not make live AWS, Kubernetes, database or production infrastructure changes.

See [TEST-REPORT.md](./TEST-REPORT.md) and [DEPLOYMENT.md](./DEPLOYMENT.md).

## Memory challenge

The Fun section contains a 5×4 randomized memory board with Easy (15 seconds), Medium (12 seconds), and Hard (8 seconds) preview levels. Visitors memorize the positions of 1–20, then select the tiles in ascending order. One wrong selection ends the run. Completing all 20 unlocks the complete source-code ZIP through server-validated Node API routes. Local development uses `server.mjs`; Vercel uses signed, expiring session tokens in the Node.js Functions under `api/memory/`. Configure the `MEMORY_SESSION_SECRET` Production environment variable in Vercel before deploying. The private reward archive is bundled only with the reward function and excluded from static `dist/` output.
