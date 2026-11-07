import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = file => readFile(path.join(root, file), 'utf8');

test('the site has exactly the seven requested content sections', async () => {
  const html = await read('index.html');
  const ids = [...html.matchAll(/<section\b[^>]*\bid="([^"]+)"/g)].map(match => match[1]);
  assert.deepEqual(ids, ['home', 'projects', 'techstack', 'about', 'experience', 'fun', 'contact']);
  assert.doesNotMatch(html, /id="(?:intro|network|stack|capabilities|method|faq|more|work)"/);
});

test('navigation links point only to the requested sections', async () => {
  const html = await read('index.html');
  const nav = html.match(/<nav class="main-nav"[\s\S]*?<\/nav>/)?.[0] ?? '';
  for (const id of ['home', 'projects', 'techstack', 'about', 'experience', 'fun', 'contact']) assert.ok(nav.includes(`#${id}`));
  assert.equal((nav.match(/href="#/g) ?? []).length, 7);
});

test('only the four selected projects appear in the project grid', async () => {
  const html = await read('index.html');
  const grid = html.match(/<div class="project-grid"[\s\S]*?<\/div>\s*<div class="section-endline/)?.[0] ?? '';
  for (const id of ['k8s', 'iam', 'git', 'aml']) assert.ok(html.includes(`data-project="${id}"`));
  const cards = [...html.matchAll(/<article class="project-card/g)];
  assert.equal(cards.length, 4);
  assert.doesNotMatch(html, /NetScope|Chatty|Text2Image/i);
});

test('project dossiers contain details for the four selected projects only', async () => {
  const js = await read('app.js');
  for (const id of ['k8s', 'iam', 'git', 'aml']) assert.match(js, new RegExp(`${id}:\\s*\{`));
  assert.doesNotMatch(js, /netscope:|chatty:|text2image:/i);
});

test('technology groups include every technology in the resume', async () => {
  const js = await read('app.js');
  const expected = [
    'C / C++', 'Python', 'JavaScript', 'Go', 'HCL', 'HTML', 'CSS', 'Node.js', 'Express.js', 'FastAPI', 'net/http', 'Kafka',
    'SQL', 'PostgreSQL', 'MongoDB', 'Linux', 'Docker', 'Kubernetes', 'Jenkins', 'CI/CD', 'Terraform', 'AWS', 'Prometheus',
    'Grafana', 'Git', 'GitHub', 'Postman', 'VS Code', 'Figma', 'React', 'Helm', 'GitHub Actions', 'Trivy', 'GHCR', 'AWS OIDC', 'AWS SSM', 'Boto3', 'SQLAlchemy', 'Alembic', 'Redis', 'ARQ', 'JWT', 'XGBoost', 'Scikit-learn', 'SHAP', 'Pytest', 'Psycopg'
  ];
  for (const skill of expected) assert.ok(js.includes(`'${skill}'`), `missing resume skill ${skill}`);
  for (const foundation of ['Data Structures & Algorithms', 'Database Management System', 'Operating Systems', 'Computer Networks', 'Object Oriented Programming', 'System Design']) {
    assert.ok((await read('index.html')).includes(foundation));
  }
});

test('loader has an animated 0 to 100 percent counter', async () => {
  const html = await read('index.html'); const js = await read('app.js'); const css = await read('styles.css');
  assert.match(html, /id="loader-count"/); assert.match(html, /id="loader-bar"/);
  assert.match(html, /id="loader-stage"/); assert.match(html, /id="loader-signal-message"/); assert.match(html, /id="loader-skip"/);
  assert.match(js, /target - progress/); assert.match(js, /Math\.min\(100/);
  assert.match(js, /loader\.classList\.add\('is-done'\)/); assert.match(js, /skip\?\.addEventListener\('click', complete\)/);
  assert.match(html, /class="loader-index-shell"/); assert.match(css, /@keyframes indexRunner/); assert.match(css, /\.loader-index-brand/);
});

test('section changes use ordinary smooth scrolling and restrained reveal motion, without transition overlays', async () => {
  const html = await read('index.html'); const js = await read('app.js'); const css = await read('styles.css');
  assert.doesNotMatch(html, /transition-stage|transition-curtain|transition-soft-light|transition-grain/);
  assert.doesNotMatch(js, /scene-transition-in|scene-transition-out|const navigate = target/);
  assert.match(js, /IntersectionObserver/); assert.match(js, /setNav\(visible\.target\.id\)/);
  assert.match(css, /html\{scroll-behavior:smooth/); assert.match(css, /\.reveal\.is-visible/);
  assert.doesNotMatch(css, /@keyframes sceneVeil|@keyframes sceneContentArrive|@keyframes quietSectionHandoff/);
});

test('all sections have scroll reveal motion and reduced-motion fallbacks', async () => {
  const html = await read('index.html'); const js = await read('app.js'); const css = await read('styles.css');
  assert.ok((html.match(/class="[^"]*reveal/g) ?? []).length >= 15);
  assert.match(js, /revealItems/); assert.match(css, /\.reveal\.is-visible/); assert.match(css, /prefers-reduced-motion:reduce/);
});

test('technology stack is an interactive category orbit with keyboard navigation', async () => {
  const html = await read('index.html'); const js = await read('app.js'); const css = await read('styles.css');
  assert.match(html, /id="tech-wheel-nodes" role="tablist"/);
  assert.match(html, /id="tech-detail-items"/); assert.match(js, /data-tech-group/);
  assert.match(js, /aria-selected/); assert.match(js, /ArrowLeft/); assert.match(js, /ArrowRight/);
  assert.match(js, /selectGroup\(Number\(button\.dataset\.techGroup\)\)/);
  assert.match(css, /\.tech-wheel-ring\.ring-outer/); assert.match(css, /\.tech-category-node\.is-active/);
});

test('project cards respond to pointer movement and reset on exit', async () => {
  const html = await read('index.html'); const js = await read('app.js'); const css = await read('styles.css');
  assert.match(html, /data-tilt/); assert.match(js, /pointermove/); assert.doesNotMatch(js, /rotateX\(/); assert.match(js, /pointerleave/);
  assert.match(css, /\.project-card:hover/);
});

test('Fun section is a 20-tile memory challenge with ascending recall and a gated source reward', async () => {
  const html = await read('index.html'); const js = await read('app.js'); const css = await read('styles.css'); const server = await read('server.mjs');
  assert.match(html, /TRUST YOUR<br><em>MEMORY/); assert.match(html, /id="memory-game"/); assert.match(html, /shuffled board of 20 numbers/);
  for (const id of ['memory-board', 'memory-start', 'memory-restart', 'memory-timer', 'memory-progress', 'memory-download']) assert.ok(html.includes(`id="${id}"`));
  assert.match(html, /15 seconds|12 seconds|8 seconds|15 SEC|12 SEC|8 SEC/); assert.match(html, /complete portfolio source-code package/);
  assert.match(server, /Array\.from\(\{ length: 20 \}/); assert.match(js, /api\/memory\/start/); assert.match(js, /api\/memory\/guess/);
  assert.match(js, /nextNumber === 21/); assert.match(js, /api\/memory\/reward/); assert.match(js, /Wrong position/);
  assert.match(css, /\.memory-board/); assert.match(css, /\.memory-tile\.is-preview/); assert.match(css, /\.memory-tile\.is-wrong/); assert.match(css, /\.memory-slot/); assert.match(js, /renderReadyBoard/);
});

test('project cards are aligned, keyboard accessible and open details without hijacking embedded controls', async () => {
  const html = await read('index.html'); const js = await read('app.js'); const css = await read('styles.css');
  assert.equal((html.match(/class="project-card [^"]+" data-project=/g) || []).length, 4);
  assert.equal((html.match(/class="project-card [^"]+" data-project="[^"]+" data-tilt tabindex="0" role="group"/g) || []).length, 4);
  assert.match(js, /event\.target\.closest\('button,a,input,select,textarea/);
  assert.match(js, /event\.key === 'Enter' \|\| event\.key === ' '/);
  assert.match(css, /\.project-grid\{display:grid;grid-template-columns:repeat\(2,minmax\(0,1fr\)\);align-items:stretch/);
  assert.match(css, /\.project-info\{display:flex;flex:1;flex-direction:column/);
});
test('AML project computes its results from synthetic rows only after processing begins', async () => {
  const html = await read('index.html'); const js = await read('app.js'); const css = await read('styles.css');
  assert.match(html, /id="aml-run"/); assert.match(html, /id="aml-state"/); assert.match(html, /id="aml-count">—/); assert.match(html, /id="aml-risk">—/);
  assert.match(html, /id="aml-progress"/); assert.match(js, /Array\.from\(\{ length: 480 \}/); assert.match(js, /const threshold = \.52/);
  assert.match(js, /const updateResult = \(rows, processed, complete = false\)/); assert.match(js, /scored\.filter\(row => row\.score >= threshold\)/);
  assert.match(js, /visual\.addEventListener\('pointerenter'/); assert.match(js, /runButton\.addEventListener\('click', run\)/);
  assert.match(css, /\.aml-scan-progress/); assert.match(css, /\.visual-aml\.is-scanning/);
});

test('Git-over-SSH terminal types a session when hovered or focused', async () => {
  const html = await read('index.html'); const js = await read('app.js');
  assert.match(html, /data-git-demo/); assert.match(html, /HOVER TO START SESSION/);
  assert.match(js, /pointerenter/); assert.match(js, /focusin/); assert.match(js, /receiving objects: 100%/);
  assert.match(js, /write permission granted/); assert.match(js, /slice\(0, charIndex \+ 1\)/);
});

test('Kubernetes topology uses connected SVG edges and designed worker pod nodes', async () => {
  const html = await read('index.html'); const css = await read('styles.css');
  assert.match(html, /class="cluster-links"/); assert.equal((html.match(/class="cluster-link"/g) ?? []).length, 3);
  assert.equal((html.match(/class="pod pod-/g) ?? []).length, 3);
  assert.match(html, /worker-01/); assert.match(html, /worker-02/); assert.match(html, /worker-03/);
  assert.match(css, /\.pod-cube/); assert.match(css, /\.cluster-packet/);
});

test('technology category ring animates each category and expands its tools in the detail panel', async () => {
  const html = await read('index.html'); const js = await read('app.js'); const css = await read('styles.css');
  assert.match(html, /class="tech-wheel"/); assert.match(html, /class="tech-wheel-ring ring-outer"/);
  assert.match(js, /const descriptions = \[/); assert.match(js, /tech-detail-items/);
  assert.match(js, /tech-category-node/); assert.match(js, /tech-detail-items/);
  assert.match(css, /\.tech-wheel-nodes/); assert.match(css, /@keyframes techCircleIn/); assert.match(css, /border-radius:50%/);
});

test('hero no longer draws the diagonal beam into the VM core', async () => {
  const html = await read('index.html'); const css = await read('styles.css');
  assert.doesNotMatch(html, /class="hero-beam"/);
  assert.doesNotMatch(css, /\.hero-beam/);
});

test('experience and co-curricular facts are displayed without invented employment history', async () => {
  const html = await read('index.html');
  for (const fact of ['Secretary, Spiritual Club', '10+ EVENTS', '200+ STUDENTS', '1592', '400+', 'PMSS Scholarship', 'International Youth Summit']) assert.ok(html.includes(fact), `missing ${fact}`);
  assert.doesNotMatch(html, /Software Engineer Intern|Senior Engineer|years of professional experience/i);
});

test('contact section includes verified email, GitHub and resume', async () => {
  const html = await read('index.html');
  assert.match(html, /mailto:vishalmathad40@gmail\.com/); assert.match(html, /https:\/\/github\.com\/Vishal-Mathad/);
  assert.match(html, /public\/resume\.pdf/);
  const resume = await stat(path.join(root, 'public', 'resume.pdf')); assert.ok(resume.size > 10000);
});

test('responsive, keyboard and focus states are present', async () => {
  const html = await read('index.html'); const css = await read('styles.css'); const js = await read('app.js');
  assert.match(html, /Skip to content/); assert.match(html, /aria-expanded="false"/); assert.match(html, /aria-live="polite"/);
  assert.match(css, /@media\(max-width:760px\)/); assert.match(css, /:focus-visible/); assert.match(js, /event\.key === 'Escape'/);
});

test('section navigation uses native smooth scrolling and only subtle reveal transitions', async () => {
  const html = await read('index.html'); const js = await read('app.js'); const css = await read('styles.css');
  assert.doesNotMatch(html, /transition-stage|transition-curtain|transition-soft-light|transition-grain/);
  assert.doesNotMatch(js, /scene-transition-in|scene-transition-out|transitionTimer|const navigate = target/);
  assert.match(js, /IntersectionObserver/); assert.match(js, /setNav\(visible\.target\.id\)/);
  assert.match(css, /html\{scroll-behavior:smooth/); assert.match(css, /\.reveal\.is-visible/);
  assert.doesNotMatch(css, /sceneVeil|quietSectionHandoff|sceneContentArrive/);
});

test('hero contains the supplied 3D model without a welcome tag', async () => {
  const html = await read('index.html'); const model = await read('ghost-model.js'); const js = await read('app.js');
  assert.match(html, /id="hero-ghost-stage"/); assert.doesNotMatch(html, /Hey, welcome\./);
  assert.doesNotMatch(html, /hero-core|hero-welcome|VM<\/span>/);
  assert.match(html, /hero-orbit-ring ring-one/); assert.match(html, /hero-node node-a/); assert.match(html, /LIVE SIGNAL MAP/); assert.match(html, /id=\"network-canvas\"/);
  assert.match(model, /from 'three'/); assert.match(model, /OrbitControls/);
  assert.match(model, /makeGhostSurface/); assert.match(model, /makeInnerLining/);
  assert.match(model, /const \{ width: initialWidth, height: initialHeight \} = getStageSize\(\)/);
  assert.match(model, /renderer\.setSize\(initialWidth, initialHeight\)/);
});


test('3D robot import map is authorized by a request-scoped CSP nonce and the CDN module origin', async () => {
  const html = await read('index.html'); const server = await read('server.mjs'); const model = await read('ghost-model.js');
  assert.match(html, /type="importmap" nonce="__CSP_NONCE__"/);
  assert.match(html, /preconnect" href="https:\/\/cdn\.jsdelivr\.net/);
  assert.match(server, /randomBytes\(18\)\.toString\('base64'\)/);
  assert.match(server, /replaceAll\('__CSP_NONCE__', nonce\)/);
  assert.match(server, /script-src 'self' 'nonce-\$\{nonce\}' https:\/\/cdn\.jsdelivr\.net/);
  assert.doesNotMatch(server, /script-src 'self';/);
  assert.match(model, /initialTarget = new THREE\.Vector3\(0, 0\.90, 0\)/);
  assert.match(model, /stage\.dataset\.renderState = 'ready'/);
});

test('AML visualization updates scan progress, pipeline stages, bars and final alert on hover or replay', async () => {
  const html = await read('index.html'); const js = await read('app.js'); const css = await read('styles.css');
  assert.match(html, /id="aml-pipeline"/); assert.match(html, /FEATURES/); assert.match(html, /EXPLAIN/);
  assert.match(js, /pipeline\.forEach/); assert.match(js, /progress\.style\.width/); assert.match(js, /setBars\(scored\)/);
  assert.match(js, /visual\.dataset\.phase/); assert.match(js, /REPLAY ANALYSIS/);
  assert.match(css, /\.visual-aml\.is-scanning::before/); assert.match(css, /@keyframes amlSweep/);
});

test('project card hover remains a fixed size without scaling or positional lift', async () => {
  const js = await read('app.js'); const css = await read('styles.css');
  assert.doesNotMatch(js, /rotateX\(\$\{rotateX\}deg\)/);
  assert.doesNotMatch(js, /translateY\(-4px\)/);
  assert.match(css, /\.project-card:hover,\.project-card:focus-visible\{scale:1!important/);
});

test('IAM project is a compact interactive local access-review demo', async () => {
  const html = await read('index.html'); const js = await read('app.js'); const css = await read('styles.css');
  assert.match(html, /id="iam-lab"/); assert.match(html, /data-iam-principal="analyst"/);
  assert.match(html, /data-iam-principal="platform"/); assert.match(html, /data-iam-principal="runner"/);
  assert.match(html, /id="iam-risk-score"/); assert.match(html, /id="iam-access-label"/);
  assert.match(html, /data-iam-decision="keep"/); assert.match(html, /data-iam-decision="revoke"/);
  assert.doesNotMatch(html, /id="iam-permission-list"|id="iam-dry-run"|id="iam-request-approval"/);
  assert.match(js, /const records =/); assert.match(js, /ACCESS recorded for/); assert.match(js, /no AWS API call was made/);
  assert.match(css, /\.iam-quick-review/); assert.match(css, /\.iam-review-controls/); assert.match(css, /\.iam-review-feedback/);
});

test('project dialogs and game controls are wired to real actions', async () => {
  const html = await read('index.html'); const js = await read('app.js');
  assert.match(html, /<dialog class="project-dialog"/); assert.match(js, /showModal\(\)/); assert.match(js, /dialog\.close\(\)/);
  assert.match(js, /memory-restart/); assert.match(js, /chooseTile/); assert.match(js, /addEventListener\('click'/);
});

test('project previews remain aligned and source reward is server-gated until 20 correct selections', async () => {
  const html = await read('index.html'); const js = await read('app.js'); const css = await read('styles.css'); const server = await read('server.mjs');
  assert.match(html, /memory-download/); assert.match(html, /20 tiles|20 TILES/i);
  assert.match(js, /download\.href = `\/api\/memory\/reward/); assert.match(js, /newNumber|nextNumber/);
  assert.match(server, /session\.cells\[index\] !== session\.next/); assert.match(server, /session\.complete/);
  assert.match(server, /Complete all 20 memory selections to unlock this reward/);
  assert.match(server, /sourceRewardPath/); assert.ok(css.includes('.visual-aml .aml-chart-labels span:last-child { display:none;'));
  assert.match(css, /\.visual-iam \.iam-review-feedback/); assert.match(css, /\.project-card,\s*\.project-card:hover/);
  await assert.rejects(stat(path.join(root, 'public', 'rewards', 'vishal-portfolio-source-v6.8.0.zip')));
});


test('loader is a new editorial index animation using only the established orange, charcoal and ivory palette', async () => {
  const html = await read('index.html'); const js = await read('app.js'); const css = await read('styles.css');
  assert.match(html, /class=\"loader loader-index\"/);
  assert.match(html, /loader-index-runners/);
  assert.match(js, /Editorial index loader/);
  assert.match(js, /loader-index-steps/);
  assert.match(css, /\.loader-index-shell/);
  assert.match(css, /@keyframes indexRunner/);
  assert.doesNotMatch(html, /signal-orbit|loader-signal-core/);
  assert.doesNotMatch(css.slice(css.lastIndexOf('/* v6.9')), /#72e8a4|#79e9a1|#8ff0ad|#40ff97/);
});


test('hero uses supplied Three.js ghost model without a welcome tag and initializes renderer dimensions', async () => {
  const html = await read('index.html'); const js = await read('app.js'); const model = await read('ghost-model.js'); const build = await read('build.mjs');
  assert.match(html, /id="hero-ghost-stage"/);
  assert.doesNotMatch(html, /Hey, welcome\./);
  assert.match(html, /type="importmap"/);
  assert.doesNotMatch(html, /hero-core|hero-welcome|VM<\/span>/);
  assert.match(html, /hero-orbit-ring ring-one/); assert.match(html, /hero-node node-a/); assert.match(html, /LIVE SIGNAL MAP/); assert.match(html, /id=\"network-canvas\"/);
  assert.doesNotMatch(js, /VM navigation console|hero-core|hero-welcome/);
  assert.match(model, /from 'three'/); assert.match(model, /OrbitControls/);
  assert.match(model, /makeGhostSurface/); assert.match(model, /makeInnerLining/);
  assert.match(model, /const \{ width: initialWidth, height: initialHeight \} = getStageSize\(\)/);
  assert.match(model, /renderer\.setSize\(initialWidth, initialHeight\)/);
});

test('wide desktop layouts use the expanded content canvas and a balanced hero composition', async () => {
  const css = await read('styles.css');
  assert.match(css, /--max:1800px/);
  assert.match(css, /@media \(min-width: 1500px\)/);
  assert.match(css, /grid-template-columns: minmax\(0, 1\.12fr\) minmax\(0, \.88fr\)/);
  assert.match(css, /width: min\(100%, 700px\)/);
  assert.match(css, /@media \(min-width: 1500px\) and \(max-height: 820px\)/);
});


test('v7.5.3 aligns the foundations strip, widens IAM preview and prevents broken technology labels', async () => {
  const html = await read('index.html');
  const css = await read('styles.css');
  const js = await read('app.js');
  assert.match(html, /ENGINEERING FOUNDATIONS/);
  assert.match(html, /data-iam-principal="analyst"/);
  assert.match(js, /\['JavaScript', 'javascript', 'JS'\]/);
  assert.match(css, /\.tech-foundations\s*\{[^}]*align-items:\s*center/s);
  assert.match(css, /\.visual-iam \.iam-quick-review\s*\{\s*left:\s*4%;\s*right:\s*4%;/);
  assert.match(css, /\.tech-detail-item \.tech-item\s*\{[^}]*width:\s*90px;[^}]*overflow-wrap:\s*normal/s);
  assert.match(css, /\.tech-detail-item \.tech-item > span:last-child\s*\{[^}]*white-space:\s*nowrap/s);
});

test('v7.5.4 keeps previews, technology labels, foundations, education seal and achievements responsive', async () => {
  const html = await read('index.html');
  const css = await read('styles.css');
  assert.match(html, /class="project-visual visual-iam"/);
  assert.match(css, /\.visual-iam\s*\{[^}]*height:\s*350px\s*!important/s);
  assert.match(css, /\.visual-iam \.iam-quick-review\s*\{[^}]*left:\s*2\.5%;[^}]*right:\s*2\.5%/s);
  assert.match(css, /\.tech-detail-item \.tech-item > span:last-child\s*\{[^}]*white-space:\s*nowrap;[^}]*word-break:\s*keep-all/s);
  assert.match(css, /\.tech-foundations > div\s*\{[^}]*grid-template-columns:\s*repeat\(6,\s*minmax\(0,\s*1fr\)\)/s);
  assert.match(css, /\.about-seal small\s*\{[^}]*white-space:\s*nowrap/);
  assert.match(css, /\.highlight-row\s*\{[^}]*grid-template-columns:\s*36px minmax\(0, 1fr\) minmax\(86px, 112px\)/s);
  for (const breakpoint of ['1200px', '900px', '760px', '420px']) assert.ok(css.includes(`max-width: ${breakpoint}`), `missing ${breakpoint} responsive rules`);
});


test('v7.5.5 gives all project previews a shared near-square landscape proportion across breakpoints', async () => {
  const html = await read('index.html');
  const css = await read('styles.css');
  assert.equal((html.match(/class="project-visual visual-/g) || []).length, 4);
  assert.match(css, /\.project-grid\s*\{\s*--project-preview-height:\s*clamp\(370px,\s*24vw,\s*440px\)/s);
  assert.match(css, /\.project-grid \.project-visual\s*\{\s*flex:\s*0 0 var\(--project-preview-height\);\s*height:\s*var\(--project-preview-height\);\s*min-height:\s*var\(--project-preview-height\)/s);
  assert.match(css, /\.project-grid \.project-visual\.visual-iam\s*\{[^}]*height:\s*var\(--project-preview-height\)\s*!important/s);
  assert.match(css, /@media \(min-width: 761px\) and \(max-width: 1200px\)\s*\{\s*\.project-grid\s*\{\s*--project-preview-height:\s*clamp\(280px,\s*32vw,\s*384px\)/s);
  assert.match(css, /@media \(max-width: 760px\)\s*\{\s*\.project-grid\s*\{\s*--project-preview-height:\s*clamp\(260px,\s*56vw,\s*380px\)/s);
  assert.match(css, /@media \(max-width: 420px\)\s*\{\s*\.project-grid\s*\{\s*--project-preview-height:\s*260px/s);
  assert.match(css, /\.project-grid \.project-open\s*\{\s*margin-top:\s*auto/s);
  assert.match(css, /\.project-grid \.visual-iam \.iam-quick-review\s*\{\s*justify-content:\s*space-between/s);
});


test('v7.5.6 bounds robot zoom and keeps the hero responsive across laptop, tablet and phone widths', async () => {
  const model = await read('ghost-model.js');
  const css = await read('styles.css');
  assert.match(model, /controls\.zoomSpeed = 0\.42/);
  assert.match(model, /min: 6\.35, max: 8\.8/);
  assert.match(model, /min: 6\.2, max: 9\.0/);
  assert.match(model, /min: 6\.05, max: 9\.2/);
  assert.match(model, /min: 5\.85, max: 9\.5/);
  assert.match(model, /controls\.minDistance = zoomLimits\.min/);
  assert.match(model, /controls\.maxDistance = zoomLimits\.max/);
  assert.match(model, /controls\.update\(\)/);
  assert.match(css, /@media \(min-width: 1001px\) and \(max-width: 1499px\)/);
  assert.match(css, /@media \(min-width: 761px\) and \(max-width: 1000px\)/);
  assert.match(css, /@media \(min-width: 761px\) and \(max-width: 900px\)/);
  assert.match(css, /@media \(max-width: 760px\)/);
  assert.match(css, /@media \(max-width: 520px\)/);
  assert.match(css, /@media \(max-width: 380px\)/);
  assert.match(css, /grid-template-columns: minmax\(0, 1fr\)/);
});
