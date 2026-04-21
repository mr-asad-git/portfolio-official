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
/* =============================================
   CUSTOM SMOOTH SCROLL ENGINE
   (Native scroll-behavior:smooth breaks when
   overflow-x:hidden is on body — this RAF-based
   implementation works in all cases)
============================================= */
function easeInOutQuart(t) {
    return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
}

let _scrollRAF = null;

function smoothScrollTo(targetY, baseDuration) {
    if (_scrollRAF) cancelAnimationFrame(_scrollRAF);

    const startY = window.scrollY;
    const distance = targetY - startY;

    // Scale duration with distance — feels natural for both small + large jumps
    const duration = baseDuration || Math.min(1200, Math.max(500, Math.abs(distance) * 0.6));
    const startTime = performance.now();

    function tick(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        window.scrollTo(0, startY + distance * easeInOutQuart(progress));
        if (progress < 1) {
            _scrollRAF = requestAnimationFrame(tick);
        }
    }
    _scrollRAF = requestAnimationFrame(tick);
}

/* =============================================
   SMOOTH SCROLL — all anchor links
============================================= */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (!href || href === '#') {
            e.preventDefault();
            smoothScrollTo(0);
            return;
        }
        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            const navHeight = document.getElementById('nav').offsetHeight;
            const offset = Math.max(0, target.getBoundingClientRect().top + window.scrollY - navHeight + 76);
            smoothScrollTo(offset);
        }
    });
});

/* =============================================
   SCROLL TO TOP BUTTON
============================================= */
const sttBtn = document.getElementById('scroll-top');
const STT_THRESHOLD = 400;

window.addEventListener('scroll', () => {
    sttBtn.classList.toggle('stt-visible', window.scrollY > STT_THRESHOLD);
}, { passive: true });

sttBtn.addEventListener('click', () => {
    smoothScrollTo(0, 900);
});

/* =============================================
   ALL PROJECTS MODAL
============================================= */
let apmRenderer = null, apmScene = null, apmCam = null, apmAnimId = null;
let apmPts = null, apmLines = null, apmVelocities = [];

function initApmScene() {
    const canvas = document.getElementById('apm-canvas');
    if (!canvas || apmRenderer) return;

    const isDark = html.getAttribute('data-theme') === 'dark';
    const W = canvas.offsetWidth || canvas.parentElement.offsetWidth;
    const H = canvas.offsetHeight || canvas.parentElement.offsetHeight;

    apmRenderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    apmRenderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    apmRenderer.setSize(W, H);

    apmScene = new THREE.Scene();
    apmCam = new THREE.PerspectiveCamera(60, W / H, 0.1, 100);
    apmCam.position.z = 5;

    /* --- Particles --- */
    const COUNT = Math.min(160, Math.floor(W * 0.22));
    const pos = new Float32Array(COUNT * 3);
    apmVelocities = [];

    const spread = { x: Math.max(8, W / 80), y: Math.max(4, H / 80) };

    for (let i = 0; i < COUNT; i++) {
        pos[i * 3] = (Math.random() - 0.5) * spread.x;
        pos[i * 3 + 1] = (Math.random() - 0.5) * spread.y;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 2;
        apmVelocities.push(
            (Math.random() - 0.5) * 0.006,
            (Math.random() - 0.5) * 0.004,
            0
        );
    }

    const ptGeo = new THREE.BufferGeometry();
    ptGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

    const ptMat = new THREE.PointsMaterial({
        size: 0.065,
        color: isDark ? 0x00f5ff : 0x0ea5e9,
        transparent: true,
        opacity: isDark ? 0.9 : 0.75,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });

    apmPts = new THREE.Points(ptGeo, ptMat);
    apmScene.add(apmPts);

    /* --- Connection lines (pre-allocated buffer) --- */
    const MAX_SEGS = COUNT * 12;
    const linePos = new Float32Array(MAX_SEGS * 6);
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3));
    lineGeo.setDrawRange(0, 0);

    const lineMat = new THREE.LineBasicMaterial({
        color: isDark ? 0x00f5ff : 0x0ea5e9,
        transparent: true,
        opacity: isDark ? 0.18 : 0.12,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });

    apmLines = new THREE.LineSegments(lineGeo, lineMat);
    apmScene.add(apmLines);

    const CONNECT_DIST = 2.2;
    const halfX = spread.x / 2;
    const halfY = spread.y / 2;

    function tick() {
        apmAnimId = requestAnimationFrame(tick);
        const pa = apmPts.geometry.attributes.position.array;

        /* Move & bounce particles */
        for (let i = 0; i < COUNT; i++) {
            pa[i * 3] += apmVelocities[i * 3];
            pa[i * 3 + 1] += apmVelocities[i * 3 + 1];
            if (Math.abs(pa[i * 3]) > halfX) apmVelocities[i * 3] *= -1;
            if (Math.abs(pa[i * 3 + 1]) > halfY) apmVelocities[i * 3 + 1] *= -1;
        }
        apmPts.geometry.attributes.position.needsUpdate = true;

        /* Rebuild connection lines */
        const la = apmLines.geometry.attributes.position.array;
        let li = 0;

        for (let i = 0; i < COUNT; i++) {
            for (let j = i + 1; j < COUNT; j++) {
                const dx = pa[i * 3] - pa[j * 3];
                const dy = pa[i * 3 + 1] - pa[j * 3 + 1];
                const dz = pa[i * 3 + 2] - pa[j * 3 + 2];
                if (dx * dx + dy * dy + dz * dz < CONNECT_DIST * CONNECT_DIST) {
                    if (li + 6 > la.length) break;
                    la[li++] = pa[i * 3]; la[li++] = pa[i * 3 + 1]; la[li++] = pa[i * 3 + 2];
                    la[li++] = pa[j * 3]; la[li++] = pa[j * 3 + 1]; la[li++] = pa[j * 3 + 2];
                }
            }
        }
        for (let k = li; k < Math.min(li + 6, la.length); k++) la[k] = 0;
        apmLines.geometry.attributes.position.needsUpdate = true;
        apmLines.geometry.setDrawRange(0, li / 3);

        apmRenderer.render(apmScene, apmCam);
    }
    tick();

    /* Resize observer keeps canvas in sync with the hero container */
    const ro = new ResizeObserver(() => {
        const cw = canvas.parentElement.offsetWidth;
        const ch = canvas.parentElement.offsetHeight;
        apmRenderer.setSize(cw, ch);
        apmCam.aspect = cw / ch;
        apmCam.updateProjectionMatrix();
    });
    ro.observe(canvas.parentElement);
    canvas._apmRO = ro;
}

function disposeApmScene() {
    if (apmAnimId) { cancelAnimationFrame(apmAnimId); apmAnimId = null; }
    const canvas = document.getElementById('apm-canvas');
    if (canvas && canvas._apmRO) { canvas._apmRO.disconnect(); canvas._apmRO = null; }
    if (apmPts) { apmPts.geometry.dispose(); apmPts.material.dispose(); apmPts = null; }
    if (apmLines) { apmLines.geometry.dispose(); apmLines.material.dispose(); apmLines = null; }
    if (apmRenderer) { apmRenderer.dispose(); apmRenderer = null; }
    apmScene = null; apmCam = null; apmVelocities = [];
}

function openAllProjects() {
    const modal = document.getElementById('all-projects-modal');
    modal.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => modal.classList.add('apm-open'));
    setTimeout(initApmScene, 280);
}

function closeAllProjects() {
    const modal = document.getElementById('all-projects-modal');
    modal.classList.remove('apm-open');
    document.body.style.overflow = '';
    disposeApmScene();
    setTimeout(() => modal.setAttribute('hidden', ''), 480);
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('all-projects-btn').addEventListener('click', openAllProjects);
    document.getElementById('apm-close').addEventListener('click', closeAllProjects);
    document.getElementById('apm-backdrop').addEventListener('click', closeAllProjects);

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && !document.getElementById('all-projects-modal').hasAttribute('hidden')) {
            closeAllProjects();
        }
    });

    /* Re-tint constellation when theme toggles while modal is open */
    toggle.addEventListener('click', () => {
        if (document.getElementById('all-projects-modal').hasAttribute('hidden')) return;
        disposeApmScene();
        setTimeout(initApmScene, 60);
    });

    /* Cursor hover state on modal elements */
    document.querySelectorAll('.apm-work-card,.apm-pc,.apm-close,.view-all-btn').forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('ch'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('ch'));
    });
});

