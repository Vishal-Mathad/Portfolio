const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

/* Editorial index loader: kinetic typography and mechanical progress rails. */
(() => {
  const loader = $('#loader'), count = $('#loader-count'), bar = $('#loader-bar');
  const stage = $('#loader-stage'), message = $('#loader-signal-message'), skip = $('#loader-skip');
  if (!loader || !count || !bar) return;
  let progress = 0, done = false, timer = 0;
  const started = performance.now();
  const messages = [
    'Indexing the workspace and loading components.',
    'Wiring interactions and project systems.',
    'Setting the visual grid and motion language.',
    'All systems indexed. Welcome in.'
  ];
  const labels = ['01 — INDEXING','02 — CONNECTING','03 — COMPOSING','04 — READY'];
  const paint = value => {
    progress = Math.min(100, value);
    count.textContent = `${Math.round(progress).toString().padStart(2, '0')}%`;
    bar.style.width = `${progress}%`;
    const phase = progress < 28 ? 0 : progress < 58 ? 1 : progress < 88 ? 2 : 3;
    if (stage) stage.textContent = labels[phase];
    if (message) message.textContent = messages[phase];
    $$('.loader-index-steps span').forEach((item, index) => {
      item.classList.toggle('is-active', index === phase);
      item.classList.toggle('is-done', index < phase || progress >= 100);
    });
  };
  const complete = () => {
    if (done) return;
    done = true; window.clearInterval(timer); paint(100);
    loader.classList.add('is-done'); document.body.classList.remove('is-loading'); document.body.classList.add('has-loaded');
    window.setTimeout(() => loader.remove(), 720);
  };
  skip?.addEventListener('click', complete);
  timer = window.setInterval(() => {
    if (done) return;
    const elapsed = performance.now() - started;
    const target = document.readyState === 'complete' ? (elapsed < 800 ? 88 : 100) : 82;
    paint(progress + Math.max(.55, (target - progress) * .075));
    if (progress >= 99.4 && document.readyState === 'complete' && elapsed > (reducedMotion ? 180 : 1750)) complete();
  }, 30);
  window.addEventListener('load', () => { if (progress > 80) paint(94); }, { once: true });
  window.setTimeout(() => { if (!done) complete(); }, 7000);
})();

/* Hero network: connected nodes, pulses and moving packets. */
(() => {
  const canvas = $('#network-canvas');
  const ctx = canvas?.getContext('2d', { alpha: true });
  if (!canvas || !ctx) return;
  let width = 0, height = 0, dpr = 1, frame = 0, raf = 0;
  let nodes = [];
  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    width = rect.width; height = rect.height; dpr = Math.min(window.devicePixelRatio || 1, 1.65);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const total = Math.max(22, Math.min(70, Math.round(width * height / 25000)));
    nodes = Array.from({ length: total }, (_, i) => ({
      x: Math.random() * width, y: Math.random() * height,
      vx: reducedMotion ? 0 : (Math.random() - .5) * .2,
      vy: reducedMotion ? 0 : (Math.random() - .5) * .2,
      pulse: i % 8 === 0, phase: Math.random() * Math.PI * 2
    }));
  };
  const draw = () => {
    if (document.hidden) { raf = requestAnimationFrame(draw); return; }
    ctx.clearRect(0, 0, width, height);
    const cx = width * .5, cy = height * .52, max = Math.min(180, width * .2), time = frame * .009;
    nodes.forEach(node => {
      node.x += node.vx; node.y += node.vy; node.phase += .01;
      if (node.x < -12) node.x = width + 12; if (node.x > width + 12) node.x = -12;
      if (node.y < -12) node.y = height + 12; if (node.y > height + 12) node.y = -12;
    });
    for (let i = 0; i < nodes.length; i += 1) {
      for (let j = i + 1; j < nodes.length; j += 1) {
        const a = nodes[i], b = nodes[j], distance = Math.hypot(a.x - b.x, a.y - b.y);
        if (distance < max) {
          ctx.strokeStyle = `rgba(255,116,66,${(1 - distance / max) * .19})`;
          ctx.lineWidth = .65; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
      const node = nodes[i], alpha = .24 + (Math.sin(node.phase) + 1) * .16;
      ctx.beginPath(); ctx.fillStyle = node.pulse ? `rgba(255,130,84,${alpha})` : `rgba(255,237,227,${alpha * .5})`;
      ctx.arc(node.x, node.y, node.pulse ? 2 : 1, 0, Math.PI * 2); ctx.fill();
      if (node.pulse) {
        ctx.beginPath(); ctx.strokeStyle = `rgba(255,111,57,${alpha * .45})`;
        ctx.arc(node.x, node.y, 5 + (Math.sin(node.phase) + 1) * 4, 0, Math.PI * 2); ctx.stroke();
      }
    }
    for (let k = 0; k < 5 && nodes.length > 12; k += 1) {
      const a = nodes[(k * 7 + 2) % nodes.length], b = nodes[(k * 7 + 11) % nodes.length];
      const t = (time * .16 + k * .21) % 1, x = a.x + (b.x - a.x) * t, y = a.y + (b.y - a.y) * t;
      const glow = ctx.createRadialGradient(x, y, 0, x, y, 12);
      glow.addColorStop(0, 'rgba(255,190,153,.85)'); glow.addColorStop(1, 'rgba(255,99,42,0)');
      ctx.fillStyle = glow; ctx.fillRect(x - 12, y - 12, 24, 24);
    }
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(width, height) * .34);
    glow.addColorStop(0, 'rgba(255,102,48,.08)'); glow.addColorStop(1, 'rgba(255,102,48,0)');
    ctx.fillStyle = glow; ctx.fillRect(0, 0, width, height);
    frame += 1; raf = requestAnimationFrame(draw);
  };
  resize();
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(canvas);
  else window.addEventListener('resize', resize, { passive: true });
  draw();
})();

/* Resume-derived technology data. No extra frameworks are invented here. */
const techGroups = [
  { name: 'LANGUAGES', note: '01 / LANGUAGE', items: [
    ['C / C++', 'cplusplus', 'C++'], ['Python', 'python', 'PY'], ['JavaScript', 'javascript', 'JS'], ['Go', 'go', 'GO'], ['HCL', '', 'HCL'], ['HTML', 'html5', 'HTML'], ['CSS', 'css3', 'CSS']
  ]},
  { name: 'BACKEND & WEB', note: '02 / SERVICES', items: [
    ['Node.js', 'nodedotjs', 'NODE'], ['Express.js', 'express', 'EXP'], ['FastAPI', 'fastapi', 'API'], ['net/http', '', 'HTTP'], ['Kafka', 'apachekafka', 'KAFKA']
  ]},
  { name: 'DATABASES', note: '03 / PERSISTENCE', items: [
    ['SQL', '', 'SQL'], ['PostgreSQL', 'postgresql', 'PG'], ['MongoDB', 'mongodb', 'MDB']
  ]},
  { name: 'DEVOPS & CLOUD', note: '04 / INFRASTRUCTURE', items: [
    ['Linux', 'linux', 'LIN'], ['Docker', 'docker', 'DOC'], ['Kubernetes', 'kubernetes', 'K8S'], ['Jenkins', 'jenkins', 'JEN'], ['CI/CD', '', 'CI'], ['Terraform', 'terraform', 'TF'], ['AWS', 'amazonaws', 'AWS'], ['Prometheus', 'prometheus', 'PROM'], ['Grafana', 'grafana', 'GRAF']
  ]},
  { name: 'DEVELOPER TOOLS', note: '05 / WORKFLOW', items: [
    ['Git', 'git', 'GIT'], ['GitHub', 'github', 'GH'], ['Postman', 'postman', 'POST'], ['VS Code', 'visualstudiocode', 'VSC'], ['Figma', 'figma', 'FIG']
  ]},
  { name: 'PROJECT TOOLING', note: '06 / DELIVERY & IDENTITY', items: [
    ['React', 'react', 'RE'], ['Helm', 'helm', 'HELM'], ['GitHub Actions', 'githubactions', 'GHA'], ['Trivy', 'trivy', 'TRI'], ['GHCR', 'github', 'GHCR'], ['AWS OIDC', 'amazonaws', 'OIDC'], ['AWS SSM', 'amazonaws', 'SSM'], ['Boto3', 'boto3', 'B3'], ['SQLAlchemy', 'sqlalchemy', 'SQLA'], ['Alembic', '', 'ALEM'], ['Redis', 'redis', 'REDIS'], ['ARQ', '', 'ARQ'], ['JWT', 'jsonwebtokens', 'JWT']
  ]},
  { name: 'DATA & TESTING', note: '07 / MODEL & VALIDATION', items: [
    ['XGBoost', 'xgboost', 'XGB'], ['Scikit-learn', 'scikitlearn', 'SK'], ['SHAP', 'shap', 'SHAP'], ['Pytest', 'pytest', 'PYTEST'], ['Psycopg', '', 'PG']
  ]}
];
function techLogo(name, slug, short, dark = false) {
  const image = slug ? `<img src="https://cdn.simpleicons.org/${slug}/e7e4df" alt="" loading="lazy" decoding="async"><span class="tech-fallback" aria-hidden="true">${short}</span>` : `<span class="tech-fallback tech-fallback-visible" aria-hidden="true">${short}</span>`;
  return `<span class="${dark ? 'marquee-tech' : 'tech-item'}" title="${name}">${image}<span>${name}</span></span>`;
}
(() => {
  const wheelNodes = $('#tech-wheel-nodes');
  const detail = $('#tech-detail');
  const marquee = $('#tech-marquee-track');
  if (!wheelNodes || !detail || !marquee) return;
  const all = techGroups.flatMap(group => group.items);
  const logoMarkup = all.map(([name, slug, short]) => techLogo(name, slug, short, true)).join('');
  marquee.setAttribute('aria-hidden', 'true');
  marquee.innerHTML = logoMarkup + logoMarkup;

  const descriptions = [
    'The languages I use to build application logic, automation, web interfaces and infrastructure definitions.',
    'HTTP services, backend frameworks and event-streaming tools used to connect systems.',
    'Relational and document stores used for persistence, querying and application data.',
    'Operating environments, containers, orchestration, cloud infrastructure and observability.',
    'Version control, API inspection, development environments and design tools.',
    'Project-specific tools for identity governance, delivery automation, database migrations and cloud operations.',
    'Machine-learning, explainability and test tools used for transaction analysis and validation.'
  ];
  const wheelNames = ['LANGUAGES', 'BACKEND', 'DATABASES', 'CLOUD / DEVOPS', 'DEV TOOLS', 'PROJECT OPS', 'DATA / TEST'];
  const angles = techGroups.map((_, index) => -90 + index * (360 / techGroups.length));
  wheelNodes.innerHTML = techGroups.map((group, index) => `
    <button class="tech-category-node${index === 1 ? ' is-active' : ''}" type="button" role="tab"
      id="tech-tab-${index}" aria-selected="${index === 1 ? 'true' : 'false'}" aria-controls="tech-detail"
      data-tech-group="${index}" style="--angle:${angles[index]}deg;--counter-angle:${-angles[index]}deg">
      <span class="tech-category-index">0${index + 1}</span><b>${wheelNames[index]}</b><small>${String(group.items.length).padStart(2, '0')} TOOLS</small>
    </button>`).join('');

  const title = $('#tech-detail-title');
  const kicker = $('#tech-detail-kicker');
  const description = $('#tech-detail-description');
  const itemsRoot = $('#tech-detail-items');
  const count = $('#tech-detail-count');
  const centerCount = $('#tech-wheel-count');
  const centerName = $('#tech-wheel-active');
  const selectGroup = index => {
    const group = techGroups[index];
    if (!group) return;
    wheelNodes.querySelectorAll('.tech-category-node').forEach(button => {
      const selected = Number(button.dataset.techGroup) === index;
      button.classList.toggle('is-active', selected);
      button.setAttribute('aria-selected', String(selected));
      button.tabIndex = selected ? 0 : -1;
    });
    detail.classList.add('is-switching');
    window.setTimeout(() => {
      kicker.textContent = group.note;
      title.textContent = group.name.replaceAll('&', '&');
      description.textContent = descriptions[index];
      count.textContent = `${String(group.items.length).padStart(2, '0')} TECHNOLOGIES`;
      centerCount.textContent = String(group.items.length).padStart(2, '0');
      centerName.textContent = wheelNames[index];
      itemsRoot.innerHTML = group.items.map(([name, slug, short], itemIndex) => `<div class="tech-detail-item" style="--item-index:${itemIndex}">${techLogo(name, slug, short)}</div>`).join('');
      detail.classList.remove('is-switching');
    }, 130);
  };
  wheelNodes.querySelectorAll('.tech-category-node').forEach(button => {
    button.addEventListener('click', () => selectGroup(Number(button.dataset.techGroup)));
    button.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
      event.preventDefault();
      const direction = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1;
      const next = (Number(button.dataset.techGroup) + direction + techGroups.length) % techGroups.length;
      wheelNodes.querySelector(`[data-tech-group="${next}"]`)?.focus();
    });
  });
  document.addEventListener('error', event => {
    const image = event.target;
    if (image instanceof HTMLImageElement && image.closest('.tech-detail-item,.marquee-tech')) {
      image.style.display = 'none';
      const fallback = image.nextElementSibling;
      if (fallback) fallback.style.display = 'inline';
    }
  }, true);
  selectGroup(1);
})();

/* Technology globe — drag with mouse or touch to rotate the 3D-projected sphere. */
(() => {
  const canvas = $('#tech-globe');
  const ctx = canvas?.getContext('2d');
  if (!canvas || !ctx) return;
  let width = 0, height = 0, dpr = 1, rotation = 0, tilt = -.12, dragging = false, lastX = 0, lastY = 0, raf = 0;
  const points = Array.from({ length: 185 }, (_, index) => {
    const y = 1 - (index / 184) * 2;
    const radius = Math.sqrt(1 - y * y);
    const theta = Math.PI * (3 - Math.sqrt(5)) * index;
    return { x: Math.cos(theta) * radius, y, z: Math.sin(theta) * radius, hot: index % 14 === 0 };
  });
  const resize = () => {
    const rect = canvas.getBoundingClientRect(); width = rect.width; height = rect.height;
    dpr = Math.min(window.devicePixelRatio || 1, 1.5); canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  const draw = () => {
    ctx.clearRect(0, 0, width, height);
    const cx = width * .5, cy = height * .5, radius = Math.min(width * .37, height * .39);
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 1.4);
    glow.addColorStop(0, 'rgba(255,104,48,.18)'); glow.addColorStop(.65, 'rgba(255,93,39,.055)'); glow.addColorStop(1, 'rgba(255,93,39,0)');
    ctx.fillStyle = glow; ctx.fillRect(0, 0, width, height);
    ctx.beginPath(); ctx.strokeStyle = 'rgba(255,126,79,.36)'; ctx.lineWidth = 1; ctx.arc(cx, cy, radius, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.strokeStyle = 'rgba(255,255,255,.13)'; ctx.ellipse(cx, cy, radius, radius * .34, -.28, 0, Math.PI * 2); ctx.stroke();
    const cosR = Math.cos(rotation), sinR = Math.sin(rotation), cosT = Math.cos(tilt), sinT = Math.sin(tilt);
    const projected = points.map(point => {
      const x = point.x * cosR - point.z * sinR;
      const z0 = point.x * sinR + point.z * cosR;
      const y = point.y * cosT - z0 * sinT;
      const z = point.y * sinT + z0 * cosT;
      const perspective = 1.75 / (2.7 - z);
      return { x: cx + x * radius * perspective, y: cy + y * radius * perspective, z, hot: point.hot };
    }).sort((a, b) => a.z - b.z);
    projected.forEach((point, index) => {
      const alpha = .18 + (point.z + 1) * .31;
      ctx.beginPath(); ctx.fillStyle = point.hot ? `rgba(255,130,83,${alpha + .16})` : `rgba(241,238,232,${alpha})`;
      ctx.arc(point.x, point.y, point.hot ? 2.2 : 1.2 + (point.z + 1) * .65, 0, Math.PI * 2); ctx.fill();
      if (point.hot && index % 3 === 0) {
        ctx.beginPath(); ctx.strokeStyle = `rgba(255,109,57,${alpha * .5})`; ctx.arc(point.x, point.y, 5, 0, Math.PI * 2); ctx.stroke();
      }
    });
    if (!dragging && !reducedMotion && !document.hidden) rotation += .0018;
    raf = requestAnimationFrame(draw);
  };
  const down = event => { dragging = true; lastX = event.clientX; lastY = event.clientY; canvas.classList.add('is-dragging'); canvas.setPointerCapture?.(event.pointerId); };
  const move = event => {
    if (!dragging) return;
    const dx = event.clientX - lastX, dy = event.clientY - lastY;
    rotation += dx * .008; tilt = Math.max(-.72, Math.min(.72, tilt + dy * .006)); lastX = event.clientX; lastY = event.clientY;
  };
  const up = () => { dragging = false; canvas.classList.remove('is-dragging'); };
  canvas.addEventListener('pointerdown', down); canvas.addEventListener('pointermove', move); canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up); canvas.addEventListener('lostpointercapture', up);
  canvas.addEventListener('keydown', event => { if (event.key === 'ArrowLeft') rotation -= .15; if (event.key === 'ArrowRight') rotation += .15; if (event.key === 'ArrowUp') tilt = Math.max(-.72, tilt - .1); if (event.key === 'ArrowDown') tilt = Math.min(.72, tilt + .1); });
  resize(); if ('ResizeObserver' in window) new ResizeObserver(resize).observe(canvas); else window.addEventListener('resize', resize, { passive: true }); draw();
})();

/* Reveal choreography for every section. */
(() => {
  const revealItems = $$('.reveal');
  if (!('IntersectionObserver' in window) || reducedMotion) { revealItems.forEach(item => item.classList.add('is-visible')); return; }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible'); observer.unobserve(entry.target);
    });
  }, { threshold: .12, rootMargin: '0px 0px -6% 0px' });
  revealItems.forEach(item => observer.observe(item));
})();

/* Section navigation: native smooth scrolling with a restrained active-link indicator.
   Sections reveal through the shared .reveal observer; no full-screen curtain or beam is used. */
(() => {
  const sections = $$('main > section[data-scene]');
  const navLinks = $$('.main-nav a[href^="#"]');
  const setNav = id => navLinks.forEach(link => link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`));
  if (!sections.length) return;
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setNav(visible.target.id);
    }, { rootMargin: '-22% 0px -58% 0px', threshold: [0, .12, .28, .48, .68] });
    sections.forEach(section => observer.observe(section));
  } else {
    const update = () => {
      const marker = window.innerHeight * .42;
      const current = sections.find(section => {
        const rect = section.getBoundingClientRect();
        return rect.top <= marker && rect.bottom > marker;
      });
      if (current) setNav(current.id);
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
  }
  if (location.hash) setNav(location.hash.slice(1));
  else setNav('home');
})();

/* Header state and mobile navigation. */
(() => {
  const header = $('#site-header'), toggle = $('#menu-toggle'), nav = $('#main-nav');
  const update = () => header?.classList.toggle('is-scrolled', window.scrollY > 24);
  update(); window.addEventListener('scroll', update, { passive: true });
  const close = () => { nav?.classList.remove('is-open'); toggle?.setAttribute('aria-expanded', 'false'); toggle?.setAttribute('aria-label', 'Open navigation'); };
  toggle?.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open)); toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation'); nav?.classList.toggle('is-open', open);
  });
  nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', close));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') close(); });
})();

/* Keep project cards optically crisp: no 3D transforms on text-bearing surfaces. */
(() => {
  $$('[data-tilt]').forEach(card => {
    card.addEventListener('pointermove', () => card.classList.add('is-pointer-over'));
    card.addEventListener('pointerleave', () => card.classList.remove('is-pointer-over'));
  });
})();


/* Git-over-SSH terminal: replay a command session on hover or keyboard focus. */
(() => {
  const visual = $('.visual-git');
  const terminalWindow = $('[data-git-demo]');
  const terminal = $('#git-terminal');
  if (!visual || !terminalWindow || !terminal) return;
  const script = [
    { text: '$ ssh git@localhost', kind: 'command' },
    { text: 'authenticated · public key accepted', kind: 'muted' },
    { text: '$ git clone git@localhost:workspace/engine.git', kind: 'command' },
    { text: 'receiving objects: 100% (42/42), done.', kind: 'ok' },
    { text: '$ git push origin main', kind: 'command' },
    { text: 'remote: checking WRITE permission…', kind: 'muted' },
    { text: 'remote: write permission granted', kind: 'ok' },
    { text: 'branch main → origin/main · up to date', kind: 'ok' }
  ];
  let timer = 0;
  let runId = 0;
  const clear = () => {
    window.clearTimeout(timer);
    runId += 1;
    return runId;
  };
  const start = () => {
    const currentRun = clear();
    terminal.replaceChildren();
    const cursor = document.createElement('p');
    cursor.className = 'terminal-cursor';
    cursor.textContent = '▍';
    terminal.append(cursor);
    let lineIndex = 0;
    let charIndex = 0;
    let line = null;
    const type = () => {
      if (currentRun !== runId) return;
      if (lineIndex >= script.length) {
        cursor.textContent = 'SESSION COMPLETE · HOVER TO REPLAY';
        cursor.className = 'terminal-complete';
        return;
      }
      const item = script[lineIndex];
      if (!line) {
        line = document.createElement('p');
        line.className = `terminal-line terminal-${item.kind}`;
        terminal.insertBefore(line, cursor);
        charIndex = 0;
      }
      if (charIndex < item.text.length) {
        line.textContent = item.text.slice(0, charIndex + 1);
        charIndex += 1;
        timer = window.setTimeout(type, item.kind === 'command' ? 24 : 12);
      } else {
        line = null;
        lineIndex += 1;
        timer = window.setTimeout(type, item.kind === 'command' ? 300 : 190);
      }
    };
    type();
  };
  visual.addEventListener('pointerenter', start);
  terminalWindow.addEventListener('focusin', start);
})();

/* AML analysis: the displayed result is computed from a generated synthetic sample.
   Nothing is populated as a result until a scan actually processes the rows. */
(() => {
  const visual = $('.visual-aml');
  const runButton = $('#aml-run');
  const state = $('#aml-state');
  const count = $('#aml-count');
  const risk = $('#aml-risk');
  const alertBox = $('#aml-alert');
  const alertText = $('#aml-alert-text');
  const bars = $$('#aml-bars i');
  const pipeline = $$('#aml-pipeline span');
  const progress = $('#aml-progress');
  const progressTrack = $('#aml-progress-track');
  const datasetLabel = $('#aml-dataset-label');
  if (!visual || !runButton || !state || !count || !risk || !alertBox || !alertText || !bars.length || !progress || !progressTrack) return;

  // Deterministic synthetic data so every visitor can replay the same transparent demo.
  const pseudo = seed => {
    const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
    return value - Math.floor(value);
  };
  const sample = Array.from({ length: 480 }, (_, index) => {
    const structuring = index % 31 === 0 ? .96 : pseudo(index + 11) * .2;
    const layering = index % 47 === 0 ? .94 : pseudo(index + 83) * .18;
    const roundTrip = index % 67 === 0 ? .97 : pseudo(index + 171) * .16;
    const velocity = .12 + pseudo(index + 251) * .42;
    const sharedBeneficiary = index % 39 === 0 ? .9 : pseudo(index + 397) * .22;
    const score = Math.min(.995, .43 * structuring + .38 * layering + .4 * roundTrip + .13 * velocity + .12 * sharedBeneficiary);
    const reason = structuring > .8 ? 'STRUCTURING' : layering > .8 ? 'LAYERING' : roundTrip > .8 ? 'ROUND TRIPPING' : 'VELOCITY PATTERN';
    return { score, reason };
  });
  const batchSize = 80;
  const threshold = .52;
  let timer = 0;
  let runId = 0;

  const setStage = index => {
    pipeline.forEach((step, stepIndex) => step.classList.toggle('is-current', stepIndex === index));
    visual.dataset.phase = String(index);
  };
  const setBars = rows => {
    const bins = Array.from({ length: bars.length }, () => 0);
    rows.forEach(row => { bins[Math.min(bins.length - 1, Math.floor(row.score * bins.length))] += 1; });
    const peak = Math.max(1, ...bins);
    bars.forEach((bar, index) => {
      const height = rows.length ? Math.max(5, (bins[index] / peak) * 94) : 0;
      bar.style.setProperty('--bar', `${height}%`);
    });
  };
  const showIdle = () => {
    state.textContent = 'READY TO ANALYSE';
    count.textContent = '—';
    risk.textContent = '—';
    datasetLabel.textContent = 'SYNTHETIC DEMO / NO RESULT YET';
    progress.style.width = '0%';
    progressTrack.setAttribute('aria-valuenow', '0');
    bars.forEach(bar => bar.style.setProperty('--bar', '0%'));
    alertBox.dataset.level = 'idle';
    alertText.innerHTML = 'AWAITING ANALYSIS<br><small>RUN TO FIND PATTERNS</small>';
    setStage(0);
  };
  const updateResult = (rows, processed, complete = false) => {
    const scored = rows.slice(0, processed);
    const flagged = scored.filter(row => row.score >= threshold);
    const sorted = scored.map(row => row.score).sort((a, b) => a - b);
    const p95 = sorted.length ? sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * .95))] : 0;
    const counts = flagged.reduce((acc, row) => { acc[row.reason] = (acc[row.reason] || 0) + 1; return acc; }, {});
    const primaryReason = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'NO MATERIAL PATTERN';
    count.textContent = processed.toLocaleString('en-IN');
    risk.textContent = processed ? p95.toFixed(2) : '—';
    datasetLabel.textContent = `${flagged.length.toLocaleString('en-IN')} FLAGGED / ${processed.toLocaleString('en-IN')} ROWS`;
    const percent = Math.round((processed / rows.length) * 100);
    progress.style.width = `${percent}%`;
    progressTrack.setAttribute('aria-valuenow', String(percent));
    setBars(scored);
    if (complete) {
      const rate = flagged.length / Math.max(1, processed);
      const level = rate >= .08 || p95 >= .82 ? 'high' : rate >= .035 || p95 >= .68 ? 'medium' : 'low';
      state.textContent = 'ANALYSIS COMPLETE';
      alertBox.dataset.level = level;
      alertText.innerHTML = `${primaryReason}<br><small>${flagged.length} FLAGS · ${level.toUpperCase()} RISK</small>`;
      setStage(3);
    } else {
      const stageIndex = processed < rows.length * .25 ? 0 : processed < rows.length * .5 ? 1 : processed < rows.length * .78 ? 2 : 3;
      state.textContent = ['INGESTING ROWS', 'BUILDING FEATURES', 'SCORING PATTERNS', 'EXPLAINING ALERTS'][stageIndex];
      alertBox.dataset.level = 'idle';
      alertText.innerHTML = `${flagged.length} CANDIDATES<br><small>SCORING IN PROGRESS</small>`;
      setStage(stageIndex);
    }
  };
  const run = () => {
    window.clearTimeout(timer);
    runId += 1;
    const current = runId;
    visual.classList.add('is-scanning');
    visual.classList.remove('is-flagged');
    runButton.disabled = true;
    runButton.innerHTML = 'ANALYSING <i></i>';
    state.textContent = 'INGESTING ROWS';
    count.textContent = '0';
    risk.textContent = '—';
    datasetLabel.textContent = '0 / 480 SYNTHETIC ROWS';
    progress.style.width = '0%';
    progressTrack.setAttribute('aria-valuenow', '0');
    setBars([]);
    alertBox.dataset.level = 'idle';
    alertText.innerHTML = 'BUILDING SAMPLE<br><small>WAIT FOR SCORING</small>';
    setStage(0);
    let cursor = 0;
    const step = () => {
      if (current !== runId) return;
      cursor = Math.min(sample.length, cursor + batchSize);
      updateResult(sample, cursor, cursor === sample.length);
      if (cursor < sample.length) {
        timer = window.setTimeout(step, 460);
      } else {
        visual.classList.remove('is-scanning');
        visual.classList.add('is-flagged');
        runButton.disabled = false;
        runButton.innerHTML = 'REPLAY ANALYSIS <b>↻</b>';
      }
    };
    timer = window.setTimeout(step, 360);
  };
  runButton.addEventListener('click', run);
  visual.addEventListener('pointerenter', () => { if (!visual.classList.contains('is-scanning')) run(); });
  visual.addEventListener('focusin', () => { if (!visual.classList.contains('is-scanning')) run(); });
  visual.addEventListener('pointermove', event => {
    const rect = visual.getBoundingClientRect();
    visual.style.setProperty('--aml-x', `${((event.clientX - rect.left) / rect.width) * 100}%`);
    visual.style.setProperty('--aml-y', `${((event.clientY - rect.top) / rect.height) * 100}%`);
  });
  showIdle();
})();

/* Compact IAM access-review interaction: select a principal and record a simulated decision. */
(() => {
  const root = $('#iam-lab');
  if (!root) return;
  const records = {
    analyst: { name: 'maya.analyst', type: 'IAM USER · FINANCE', avatar: 'MA', risk: 42, access: 'S3 reports · Read + IAM PassRole', note: 'Elevated: role-passing permission exceeds analyst duties.' },
    platform: { name: 'platform-admin', type: 'ASSUMED ROLE · PLATFORM', avatar: 'PA', risk: 86, access: 'EC2 admin · IAM policy attachment · S3 full access', note: 'Critical: broad administrative privileges across services.' },
    runner: { name: 'ci-deployer', type: 'SERVICE PRINCIPAL · CI/CD', avatar: 'CI', risk: 67, access: 'ECR push · EKS describe · PassRole', note: 'High: deployment identity can pass a privileged role.' }
  };
  let selected = 'analyst';
  const $r = selector => $(selector, root);
  const log = text => { const node = $r('#iam-audit-log'); node.textContent = text; node.classList.remove('is-updated'); void node.offsetWidth; node.classList.add('is-updated'); };
  const render = () => {
    const item = records[selected];
    $r('#iam-selected-name').textContent = item.name;
    $r('#iam-selected-type').textContent = item.type;
    $r('#iam-avatar').textContent = item.avatar;
    $r('#iam-risk-score').textContent = String(item.risk).padStart(2, '0');
    $r('#iam-access-label').textContent = item.access;
    $r('#iam-risk-note').textContent = item.note;
    $r('#iam-review-count').textContent = `${Object.keys(records).indexOf(selected)+1}`.padStart(2,'0') + ' / 03';
    $$('[data-iam-principal]', root).forEach(button => {
      const active = button.dataset.iamPrincipal === selected;
      button.classList.toggle('is-active', active); button.setAttribute('aria-pressed', String(active));
    });
  };
  $$('[data-iam-principal]', root).forEach(button => button.addEventListener('click', () => {
    selected = button.dataset.iamPrincipal; render(); log(`Review opened for ${records[selected].name}. Choose KEEP or REVOKE to record a decision.`);
  }));
  $$('[data-iam-decision]', root).forEach(button => button.addEventListener('click', () => {
    const action = button.dataset.iamDecision;
    $$('[data-iam-decision]', root).forEach(item => item.classList.toggle('is-selected', item === button));
    log(`${action.toUpperCase()} ACCESS recorded for ${records[selected].name}. Demo decision saved locally; no AWS API call was made.`);
  }));
  render();
})();

/* Project detail dialog, driven by the four selected project records. */
const projects = {
  k8s: {
    category: '01 / PLATFORM ENGINEERING · SEP 2026', title: 'Chaos-Driven Self-Healing Kubernetes Platform',
    description: 'A chaos engineering platform with a Go controller and Node.js/Express workload to exercise recovery under controlled failures.',
    points: ['Injects pod eviction, application health failure, readiness failure, latency and CPU stress scenarios.', 'Uses Kubernetes probes, resource limits, rolling updates, a PodDisruptionBudget and HPA autoscaling from 3–6 replicas at 60% CPU.', 'Automates tests, static analysis, Trivy scanning and commit-tagged GHCR images with AWS OIDC and SSM deployment workflow.'],
    stack: ['Go', 'Node.js', 'Docker', 'Kubernetes / KIND', 'Helm', 'Prometheus', 'Grafana', 'GitHub Actions', 'AWS']
  },
  iam: {
    category: '02 / CLOUD SECURITY · SEP 2026', title: 'IAM Access Governance Platform',
    description: 'An AWS IAM governance platform for inventory, effective-permission analysis, access review and approval-gated remediation.',
    points: ['Ingests users, groups, roles, policies and trust relationships through Boto3; models effective permissions and flags risky privileges.', 'Supports review campaigns, Keep/Revoke decisions, remediation planning, approvals, dry-runs and explicit IAM mutations.', 'Verifies changes after execution and records audit events; background jobs run through Redis and ARQ.'],
    stack: ['FastAPI', 'PostgreSQL', 'AWS IAM', 'Boto3', 'Redis', 'ARQ', 'React', 'SQLAlchemy', 'Alembic']
  },
  git: {
    category: '03 / DEVELOPER TOOLING · OCT 2026', title: 'Git Hosting Server over SSH',
    description: 'A local Git hosting server in Go that exposes native Git operations over SSH with PostgreSQL-backed identity and repository access control.',
    points: ['Supports native clone, fetch, pull and push with users, SSH keys, repositories and READ/WRITE permissions.', 'Uses strict Git command allowlisting, repository-name validation, symlink-aware path confinement and direct subprocess execution.', 'Implements connection-scoped cancellation, structured logging and CLI administration, with security, fuzz, concurrency and acceptance tests.'],
    stack: ['Go', 'PostgreSQL', 'SSH', 'Git', 'crypto/ssh']
  },
  aml: {
    category: '04 / DATA & MACHINE LEARNING · JUL 2026', title: 'Anti-Money-Laundering Monitor',
    description: 'A transaction monitoring engine that scores synthetic banking activity and explains why a transaction was flagged.',
    points: ['Processes 100K+ synthetic transactions with injected structuring, layering and round-tripping patterns.', 'Uses chronological train/test splitting, class-imbalance handling and alert-volume-based threshold selection to reduce leakage.', 'Applies SHAP explanations, analyst feedback tracking and adaptive alert-threshold retuning through a secure REST API.'],
    stack: ['Python', 'FastAPI', 'PostgreSQL', 'XGBoost', 'Scikit-learn', 'SHAP', 'JWT', 'Pytest']
  }
};
(() => {
  const dialog = $('#project-dialog'); if (!dialog) return;
  const openProject = key => {
    const project = projects[key]; if (!project) return;
    $('#dialog-kicker').textContent = project.category;
    $('#dialog-title').textContent = project.title;
    $('#dialog-description').textContent = project.description;
    $('#dialog-points').innerHTML = project.points.map(point => `<p>${point}</p>`).join('');
    $('#dialog-stack').innerHTML = project.stack.map(item => `<span>${item}</span>`).join('');
    dialog.showModal();
  };
  $$('[data-project-open]').forEach(button => button.addEventListener('click', event => { event.stopPropagation(); openProject(button.dataset.projectOpen); }));
  $$('[data-project]').forEach(card => {
    card.addEventListener('click', event => {
      if (event.target.closest('button,a,input,select,textarea,[contenteditable="true"]')) return;
      openProject(card.dataset.project);
    });
    card.addEventListener('keydown', event => {
      if ((event.key === 'Enter' || event.key === ' ') && event.target === card) {
        event.preventDefault(); openProject(card.dataset.project);
      }
    });
  });
  dialog.querySelector('.dialog-close')?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
})();

/* Memory protocol: remember the shuffled 1–20 layout, then select positions in ascending order. */
(() => {
  const root = $('#memory-game');
  if (!root) return;
  const $game = selector => $(selector, root);
  const board = $game('#memory-board');
  const startButton = $game('#memory-start');
  const restartButton = $game('#memory-restart');
  const download = $game('#memory-download');
  const status = $game('#memory-status');
  const timerLabel = $game('#memory-timer');
  const phaseLabel = $game('#memory-phase');
  const progressLabel = $game('#memory-progress');
  const progressBar = $game('#memory-progress-bar');
  const instructions = $game('#memory-instructions');
  const result = $game('#memory-result');
  let sessionId = '', cells = [], nextNumber = 1, timer = null, phase = 'idle', deadline = 0, selectedLevel = 'easy', previewMs = 15000;
  const levelButtons = $$('[data-level]', root);
  levelButtons.forEach(button => button.addEventListener('click', () => {
    if (['preview','recall','starting'].includes(phase)) return;
    selectedLevel = button.dataset.level;
    levelButtons.forEach(item => { const active = item === button; item.classList.toggle('is-selected', active); item.setAttribute('aria-pressed', String(active)); });
    timerLabel.textContent = ({easy:'15.0s',medium:'12.0s',hard:'8.0s'})[selectedLevel];
    phaseLabel.textContent = `${selectedLevel.toUpperCase()} difficulty`;
  }));
  const setStatus = (label, state = '') => { status.innerHTML = `<i></i> ${label}`; status.dataset.state = state; };
  const setProgress = () => { progressLabel.textContent = `${String(nextNumber - 1).padStart(2, '0')} / 20`; progressBar.style.width = `${(nextNumber - 1) * 5}%`; };
  const stopTimer = () => { if (timer) window.clearInterval(timer); timer = null; };
  const renderBoard = preview => {
    board.replaceChildren();
    cells.forEach((number, index) => {
      const tile = document.createElement('button');
      tile.type = 'button'; tile.className = `memory-tile${preview ? ' is-preview' : ''}`;
      tile.dataset.index = String(index); tile.textContent = preview ? String(number) : 'VM';
      tile.setAttribute('aria-label', preview ? `Position ${index + 1}, number ${number}` : `Hidden tile ${index + 1}`);
      tile.addEventListener('click', () => chooseTile(index, tile)); board.append(tile);
    });
  };
  const beginRecall = () => {
    if (phase !== 'preview') return;
    stopTimer(); phase = 'recall'; phaseLabel.textContent = 'Recall sequence: 1 → 20'; timerLabel.textContent = 'GO';
    instructions.textContent = 'The numbers are hidden. Select the tile that contained 1, then 2, then 3… A wrong answer ends the run.';
    setStatus('RECALL ACTIVE', 'active'); renderBoard(false);
  };
  const updateTimer = () => { const remaining = Math.max(0, deadline - performance.now()); timerLabel.textContent = `${(remaining / 1000).toFixed(1)}s`; if (remaining <= 0) beginRecall(); };
  const endRun = message => {
    stopTimer(); phase = 'failed'; phaseLabel.textContent = 'Protocol failed'; timerLabel.textContent = '00.0s'; instructions.textContent = message;
    setStatus('SESSION TERMINATED', 'error'); [...board.children].forEach(tile => { tile.disabled = true; tile.classList.add('is-disabled'); });
    restartButton.hidden = false; startButton.hidden = true;
  };
  const unlock = () => {
    stopTimer(); phase = 'complete'; phaseLabel.textContent = 'All 20 positions verified'; timerLabel.textContent = 'CLEAR';
    instructions.textContent = 'Perfect recall. All 20 numbers were selected in order. Your source-code reward is now authorized.';
    setStatus('SOURCE VAULT UNLOCKED', 'success'); result.hidden = false;
    $game('#memory-result-title').textContent = '20 / 20 · PERFECT RECALL';
    $game('#memory-result-copy').textContent = 'You completed the entire memory protocol without a mistake. The complete portfolio source-code package is now available below.';
    download.href = `/api/memory/reward?session=${encodeURIComponent(sessionId)}`; download.hidden = false;
    restartButton.hidden = false; startButton.hidden = true;
    [...board.children].forEach(tile => { tile.disabled = true; tile.classList.add('is-complete'); });
  };
  const chooseTile = async (index, tile) => {
    if (phase !== 'recall' || tile.disabled) return;
    tile.disabled = true;
    try {
      const response = await fetch('/api/memory/guess', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId, index }) });
      const data = await response.json();
      if (!response.ok) { if (data.reason === 'too-early') { tile.disabled = false; return; } tile.classList.add('is-wrong'); endRun(data.message || 'Incorrect tile. The session has ended.'); return; }
      if (!data.correct) { tile.classList.add('is-wrong'); endRun('Wrong position. The protocol has terminated. Restart and try to remember the complete board.'); return; }
      tile.textContent = String(nextNumber); tile.classList.add('is-correct'); tile.setAttribute('aria-label', `Correct: ${nextNumber}`);
      nextNumber += 1; setProgress();
      if (data.complete && nextNumber === 21) unlock();
      else { phaseLabel.textContent = `Correct · next number ${nextNumber}`; setStatus('RECALL ACTIVE', 'active'); }
    } catch {
      tile.disabled = false; instructions.textContent = 'Could not reach the challenge server. Run the portfolio with npm run dev or npm start to play and unlock the reward.'; setStatus('SERVER UNAVAILABLE', 'error');
    }
  };
  const start = async () => {
    stopTimer(); result.hidden = true; download.hidden = true; download.removeAttribute('href'); startButton.hidden = true; restartButton.hidden = true;
    nextNumber = 1; sessionId = ''; cells = []; phase = 'starting'; phaseLabel.textContent = 'Generating random board'; timerLabel.textContent = ({easy:'15.0s',medium:'12.0s',hard:'8.0s'})[selectedLevel];
    progressLabel.textContent = '00 / 20'; progressBar.style.width = '0%'; instructions.textContent = 'Preparing your randomized memory board…'; setStatus('INITIALIZING', 'active'); board.replaceChildren();
    try {
      const response = await fetch('/api/memory/start', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ level: selectedLevel }) }); const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Could not start challenge.');
      sessionId = data.sessionId; cells = data.cells; phase = 'preview'; phaseLabel.textContent = 'Memorize every position';
      previewMs = data.previewMs;
      instructions.textContent = `You have ${previewMs / 1000} seconds. Memorize where each number is. The board will flip automatically.`; setStatus(`PREVIEW / ${previewMs / 1000} SECONDS`, 'active');
      renderBoard(true); deadline = performance.now() + previewMs; updateTimer(); timer = window.setInterval(updateTimer, 50);
    } catch (error) {
      phase = 'idle'; phaseLabel.textContent = 'Challenge unavailable'; instructions.textContent = `${error.message} Start the site using npm run dev so the reward can be validated securely.`;
      setStatus('SERVER UNAVAILABLE', 'error'); startButton.hidden = false;
    }
  };
  const renderReadyBoard = () => {
    board.replaceChildren();
    for (let index = 0; index < 20; index += 1) {
      const slot = document.createElement('div');
      slot.className = 'memory-slot'; slot.setAttribute('aria-hidden', 'true');
      slot.innerHTML = `<span>${String(index + 1).padStart(2, '0')}</span>`; board.append(slot);
    }
  };
  startButton.addEventListener('click', start); restartButton.addEventListener('click', start); setProgress(); renderReadyBoard();
})();
