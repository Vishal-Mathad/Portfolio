import { cp, mkdir, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(root, 'dist');
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
for (const entry of ['index.html', 'styles.css', 'app.js', 'ghost-model.js', 'favicon.svg', 'og-preview.svg', 'robots.txt', '_headers', 'public']) {
  await cp(path.join(root, entry), path.join(out, entry), { recursive: true });
}
const resume = await stat(path.join(out, 'public', 'resume.pdf'));
if (resume.size < 10000) throw new Error('Resume PDF is missing or unexpectedly small.');
console.log(`Production site created at ${out}`);
