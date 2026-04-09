/* =============================================
   THEME SYSTEM
============================================= */
const html = document.documentElement;
const toggle = document.getElementById('theme-toggle');
const stored = localStorage.getItem('theme') || 'light';
html.setAttribute('data-theme', stored);
toggle.textContent = stored === 'dark' ? '☀️' : '🌙';

toggle.addEventListener('click', () => {
    const next = html.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    html.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    toggle.textContent = next === 'dark' ? '☀️' : '🌙';
    /* Rebuild galaxy with new colour scheme */
    rebuildGalaxy();
});

/* =============================================
   THREE.JS GALAXY
============================================= */
const canvas = document.getElementById('galaxy');
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
renderer.setSize(innerWidth, innerHeight);

const scene = new THREE.Scene();
const cam = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 100);
cam.position.set(0, 0.5, 3.5);

let galaxyPts = null;

function rebuildGalaxy() {
    if (galaxyPts) { galaxyPts.geometry.dispose(); galaxyPts.material.dispose(); scene.remove(galaxyPts); }

    const dark = html.getAttribute('data-theme') === 'dark';
    const COUNT = innerWidth < 768 ? 6000 : 14000;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(COUNT * 3);
    const col = new Float32Array(COUNT * 3);

    const cIn = new THREE.Color(dark ? '#00f5ff' : '#0ea5e9');
    const cOut = new THREE.Color(dark ? '#7c3aed' : '#8b5cf6');

    for (let i = 0; i < COUNT; i++) {
        const i3 = i * 3, r = Math.random() * 7;
        const ba = (i % 4) / 4 * Math.PI * 2, sa = r * 1.3;
        const rp = 3, rn = .25;
        const rx = Math.pow(Math.random(), rp) * (Math.random() < .5 ? 1 : -1) * rn * r;
        const ry = Math.pow(Math.random(), rp) * (Math.random() < .5 ? 1 : -1) * rn * r;
        const rz = Math.pow(Math.random(), rp) * (Math.random() < .5 ? 1 : -1) * rn * r;
        pos[i3] = Math.cos(ba + sa) * r + rx;
        pos[i3 + 1] = ry * 0.25;
        pos[i3 + 2] = Math.sin(ba + sa) * r + rz;
        const mc = cIn.clone().lerp(cOut, r / 7);
        col[i3] = mc.r; col[i3 + 1] = mc.g; col[i3 + 2] = mc.b;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));

    const mat = new THREE.PointsMaterial({
        size: 0.009, sizeAttenuation: true, depthWrite: false,
        blending: THREE.AdditiveBlending, vertexColors: true,
        transparent: true, opacity: dark ? 0.85 : 0.7
    });
    galaxyPts = new THREE.Points(geo, mat);
    galaxyPts.rotation.x = 0.35;
    scene.add(galaxyPts);
}

rebuildGalaxy();

let mx = 0, my = 0;
document.addEventListener('mousemove', e => { mx = (e.clientX / innerWidth - .5) * .4; my = (e.clientY / innerHeight - .5) * .4; });

const clk = new THREE.Clock();
(function tick() {
    requestAnimationFrame(tick);
    if (!galaxyPts) return;
    galaxyPts.rotation.y = clk.getElapsedTime() * .045;
    cam.position.x += (mx - cam.position.x) * .025;
    cam.position.y += (-my - cam.position.y) * .025;
    cam.lookAt(scene.position);
    renderer.render(scene, cam);
})();

window.addEventListener('resize', () => {
    renderer.setSize(innerWidth, innerHeight);
    cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix();
});

/* =============================================
   CUSTOM CURSOR
============================================= */
const cur = document.getElementById('cur'), curR = document.getElementById('cur-r');
let cx = 0, cy = 0, rx = 0, ry = 0;
document.addEventListener('mousemove', e => { cx = e.clientX; cy = e.clientY; });
(function ac() {
    requestAnimationFrame(ac);
    rx += (cx - rx) * .12; ry += (cy - ry) * .12;
    cur.style.left = cx + 'px'; cur.style.top = cy + 'px';
    curR.style.left = rx + 'px'; curR.style.top = ry + 'px';
})();
document.querySelectorAll('a,button,.pj-img-wrap,.hi,.tl-card,.ct-m,.sk-cat').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('ch'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('ch'));
});

/* =============================================
   LOADER
============================================= */
window.addEventListener('load', () => {
    setTimeout(() => document.getElementById('loader').classList.add('gone'), 1700);
});

/* =============================================
   TYPING EFFECT
============================================= */
const phrases = ['Frontend Developer', 'React Specialist', 'UI/UX Engineer', 'Problem Solver'];
let pi = 0, ci = 0, del = false;
const tyEl = document.getElementById('typed');
function ty() {
    const p = phrases[pi];
    if (!del) { tyEl.textContent = p.slice(0, ++ci); if (ci === p.length) { del = true; setTimeout(ty, 2200); return; } }
    else { tyEl.textContent = p.slice(0, --ci); if (ci === 0) { del = false; pi = (pi + 1) % phrases.length; } }
    setTimeout(ty, del ? 55 : 105);
}
ty();

/* =============================================
   SCROLL REVEALS
============================================= */
const rvObs = new IntersectionObserver(e => { e.forEach(x => { if (x.isIntersecting) x.target.classList.add('on'); }); }, { threshold: .1, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.rv').forEach(el => rvObs.observe(el));

/* =============================================
   SKILL BARS
============================================= */
const skObs = new IntersectionObserver(e => { e.forEach(x => { if (x.isIntersecting) { x.target.style.transform = `scaleX(${x.target.dataset.w})`; skObs.unobserve(x.target); } }); }, { threshold: .5 });
document.querySelectorAll('.sk-b').forEach(b => skObs.observe(b));

/* =============================================
   COUNTERS
============================================= */
const ctObs = new IntersectionObserver(e => { e.forEach(x => { if (x.isIntersecting) { const el = x.target, tgt = parseInt(el.dataset.t); let n = 0; const s = tgt / 30; const t = setInterval(() => { n += s; if (n >= tgt) { el.textContent = tgt + '+'; clearInterval(t); } else { el.textContent = Math.floor(n) + '+'; } }, 55); ctObs.unobserve(el); } }); }, { threshold: .5 });
document.querySelectorAll('.st-num').forEach(el => ctObs.observe(el));

/* =============================================
   NAV
============================================= */
const navEl = document.getElementById('nav');
const navAs = document.querySelectorAll('.n-links a');
const secs = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
    let cur = ''; secs.forEach(s => { if (scrollY >= s.offsetTop - 220) cur = s.id; });
    navAs.forEach(a => a.classList.toggle('act', a.getAttribute('href') === '#' + cur));
    navEl.classList.toggle('scrolled', scrollY > 60);
}, { passive: true });
document.getElementById('n-ham').addEventListener('click', () => navEl.classList.toggle('open'));
navAs.forEach(a => a.addEventListener('click', () => navEl.classList.remove('open')));

/* =============================================
   CONTACT FORM
============================================= */
document.getElementById('cf').addEventListener('submit', e => {
    e.preventDefault();
    const btn = e.target.querySelector('.f-sub');
    btn.textContent = 'Message Sent ✓';
    btn.style.background = 'linear-gradient(135deg,#10b981,#059669)';
    btn.style.boxShadow = '0 4px 18px rgba(16,185,129,.4)';
    setTimeout(() => { btn.textContent = 'Send Message →'; btn.style.background = ''; btn.style.boxShadow = ''; e.target.reset(); }, 3200);
});