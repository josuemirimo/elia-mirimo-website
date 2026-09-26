/* ---- NAVBAR SCROLL ---- */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
});

/* ---- MOBILE MENU ---- */
document.getElementById('hamburgerBtn').addEventListener('click', () => {
  document.getElementById('mobileMenu').classList.add('open');
});
document.getElementById('menuClose').addEventListener('click', closeMobileMenu);
function closeMobileMenu() {
  document.getElementById('mobileMenu').classList.remove('open');
}

/* ---- TYPEWRITER ---- */
const phrases = [
  "Born to play the number 10.",
  "Vision. Creativity. Goals.",
  "From Rwamwanja to the world.",
  "Next generation talent — 2026.",
  "Give me the ball. I'll do the rest."
];
let phraseIdx = 0, charIdx = 0, deleting = false;
const tw = document.getElementById('typewriterSpan');
function typeLoop() {
  const phrase = phrases[phraseIdx];
  if (!deleting) {
    tw.textContent = phrase.slice(0, ++charIdx);
    if (charIdx === phrase.length) { deleting = true; setTimeout(typeLoop, 2200); return; }
  } else {
    tw.textContent = phrase.slice(0, --charIdx);
    if (charIdx === 0) { deleting = false; phraseIdx = (phraseIdx + 1) % phrases.length; }
  }
  setTimeout(typeLoop, deleting ? 38 : 58);
}
typeLoop();

/* ---- INTERSECTION OBSERVER ---- */
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      // Trigger skill bars
      if (e.target.id === 'skillBars' || e.target.querySelector('.skill-bar-fill')) {
        animateBars();
      }
      // Trigger counters
      e.target.querySelectorAll('.count-up').forEach(el => animateCount(el));
      // Animate SVG bars
      e.target.querySelectorAll('.animated-bar').forEach(animateSVGBar);
      // Animate radar
      if (e.target.querySelector('#radarPoly')) animateRadar();
    }
  });
}, { threshold: 0.15 });
reveals.forEach(r => observer.observe(r));

// Also observe hero count-ups
document.querySelectorAll('#hero .count-up').forEach(el => {
  const io = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) { animateCount(el); io.disconnect(); }
  }, { threshold: 0.5 });
  io.observe(el);
});

/* ---- COUNTER ---- */
function animateCount(el) {
  if (el.dataset.animated) return;
  el.dataset.animated = '1';
  const target = +el.dataset.target;
  const suffix = target >= 5 ? '+' : '';
  const dur = 1400, start = performance.now();
  function step(now) {
    const p = Math.min((now - start) / dur, 1);
    const ease = 1 - Math.pow(1 - p, 4);
    el.textContent = Math.floor(ease * target) + suffix;
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = target + suffix;
  }
  requestAnimationFrame(step);
}

/* ---- SKILL BARS ---- */
let barsAnimated = false;
function animateBars() {
  if (barsAnimated) return; barsAnimated = true;
  document.querySelectorAll('.skill-bar-fill').forEach((bar, i) => {
    setTimeout(() => { bar.style.width = bar.dataset.width + '%'; }, i * 120);
  });
}
// Observe stats section for bars
const statsSection = document.getElementById('stats');
const statsObs = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting) { animateBars(); statsObs.disconnect(); }
}, { threshold: 0.3 });
statsObs.observe(statsSection);

/* ---- SVG BAR ANIMATION ---- */
function animateSVGBar(rect) {
  if (rect.dataset.animated) return;
  rect.dataset.animated = '1';
  const targetH = +rect.dataset.h;
  const dur = 1200, start = performance.now();
  function step(now) {
    const p = Math.min((now - start) / dur, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    const h = ease * targetH;
    rect.setAttribute('height', h);
    rect.setAttribute('y', 156 - h);
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* ---- RADAR ANIMATION ---- */
let radarAnimated = false;
function animateRadar() {
  if (radarAnimated) return; radarAnimated = true;
  const poly = document.getElementById('radarPoly');
  const dur = 1400, start = performance.now();
  // Final points (scale values to radar, cx=130, cy=130, r=100)
  // 6 attributes at angles 270,330,30,90,150,210 deg
  // Values: 92,88,85,80,87,90 → r_i = val/100 * 100
  const vals = [92, 88, 85, 80, 87, 90];
  const angles = [-90, -30, 30, 90, 150, 210].map(a => a * Math.PI / 180);
  function pointsAt(t) {
    return vals.map((v, i) => {
      const r = (v / 100) * 100 * t;
      const x = 130 + r * Math.cos(angles[i]);
      const y = 130 + r * Math.sin(angles[i]);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
  }
  function step(now) {
    const p = Math.min((now - start) / dur, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    poly.setAttribute('points', pointsAt(ease));
    poly.setAttribute('fill', `rgba(0,240,255,${0.08 * ease})`);
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
// Observe stats section for radar
const radarObs = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting) { animateRadar(); radarObs.disconnect(); }
}, { threshold: 0.3 });
radarObs.observe(statsSection);

/* ---- 3D TILT ---- */
document.querySelectorAll('.tilt-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;
    const rx = -(y / r.height) * 12;
    const ry = (x / r.width) * 12;
    card.style.transform = `perspective(600px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(4px)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(600px) rotateX(0) rotateY(0) translateZ(0)';
    card.style.transition = 'transform 0.5s ease';
  });
  card.addEventListener('mouseenter', () => { card.style.transition = 'transform 0.1s ease'; });
});

/* ---- PARALLAX HERO GLOW ---- */
document.addEventListener('mousemove', e => {
  const glow = document.querySelector('.hero-glow');
  if (!glow) return;
  const x = (e.clientX / window.innerWidth - 0.5) * 40;
  const y = (e.clientY / window.innerHeight - 0.5) * 20;
  glow.style.transform = `translateX(calc(-50% + ${x}px)) translateY(${y}px)`;
});

/* ---- VIDEO FIRST-FRAME POSTERS ---- */
// Mobile browsers may show a black frame when a video has no poster image.
// Capture the first available frame so every video has a useful thumbnail.
document.querySelectorAll('.gallery-item video').forEach(video => {
  if (video.getAttribute('poster')) return;

  const createPoster = () => {
    if (!video.videoWidth || !video.videoHeight) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (!context) return;

    const drawPoster = () => {
      try {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        video.poster = canvas.toDataURL('image/jpeg', 0.82);
      } catch (error) {
        // Keep the native video frame as the fallback if poster capture is unavailable.
      }
    };

    if (video.duration > 0) {
      const targetTime = Math.min(0.1, video.duration / 2);
      const onSeeked = () => {
        drawPoster();
        video.removeEventListener('seeked', onSeeked);
      };
      video.addEventListener('seeked', onSeeked, { once: true });
      try { video.currentTime = targetTime; } catch (error) { drawPoster(); }
    } else {
      drawPoster();
    }
  };

  if (video.readyState >= 2) createPoster();
  else video.addEventListener('loadeddata', createPoster, { once: true });
});

/* ---- INTERACTIVE SECTION BUBBLES ---- */
const bubblePalettes = [
  ['#00f0ff', '#7c3aed', '#10b981'],
  ['#7c3aed', '#ec4899', '#00f0ff'],
  ['#00f0ff', '#10b981', '#f59e0b'],
  ['#f59e0b', '#ec4899', '#7c3aed'],
  ['#10b981', '#00f0ff', '#7c3aed'],
  ['#ec4899', '#00f0ff', '#f59e0b']
];
const bubbleShapes = ['', 'is-ring', 'is-pitch', 'is-pill', 'is-blink', 'is-football', 'is-blink is-icon', 'is-icon'];
const bubbleIcons = ['goal', 'trophy', 'medal', 'circle-dot'];
const bubblePositions = [
  ['12%', '24%'], ['84%', '18%'], ['76%', '78%'], ['28%', '86%'],
  ['52%', '52%'], ['92%', '62%'], ['8%', '72%'], ['45%', '14%']
];

document.querySelectorAll('section').forEach((section, sectionIndex) => {
  const layer = document.createElement('div');
  layer.className = 'section-bubble-layer';
  layer.setAttribute('aria-hidden', 'true');

  const palette = bubblePalettes[sectionIndex % bubblePalettes.length];
  bubblePositions.forEach(([left, top], bubbleIndex) => {
    const bubble = document.createElement('span');
    bubble.className = `section-bubble ${bubbleShapes[bubbleIndex]}`;
    bubble.style.setProperty('--bubble-color', palette[bubbleIndex % palette.length]);
    bubble.style.setProperty('--bubble-left', left);
    bubble.style.setProperty('--bubble-top', top);
    bubble.style.setProperty('--bubble-size', `${70 + ((sectionIndex + bubbleIndex) % 4) * 28}px`);
    bubble.style.setProperty('--bubble-duration', `${11 + ((sectionIndex + bubbleIndex) % 5)}s`);
    bubble.style.setProperty('--bubble-delay', `${-((sectionIndex * 0.7 + bubbleIndex * 1.4) % 8)}s`);
    if (bubble.classList.contains('is-icon')) {
      const icon = document.createElement('i');
      icon.dataset.lucide = bubbleIcons[(sectionIndex + bubbleIndex) % bubbleIcons.length];
      icon.setAttribute('aria-hidden', 'true');
      bubble.appendChild(icon);
    }
    layer.appendChild(bubble);
  });

  section.prepend(layer);

  const moveBubbles = event => {
    const rect = section.getBoundingClientRect();
    const point = event.touches?.[0] || event;
    const x = ((point.clientX - rect.left) / rect.width - 0.5) * 24;
    const y = ((point.clientY - rect.top) / rect.height - 0.5) * 20;
    layer.style.setProperty('--pointer-x', `${x.toFixed(1)}px`);
    layer.style.setProperty('--pointer-y', `${y.toFixed(1)}px`);
  };

  section.addEventListener('pointermove', moveBubbles, { passive: true });
  section.addEventListener('pointerleave', () => {
    layer.style.setProperty('--pointer-x', '0px');
    layer.style.setProperty('--pointer-y', '0px');
  });
});

/* ---- CONTACT FORM ---- */
function getField(id) { return document.getElementById(id); }

function setErr(id, msg) {
  const el = document.getElementById('err-' + id);
  const input = getField('f-' + id);
  if (el) el.textContent = msg;
  if (input) input.classList.toggle('has-error', !!msg);
}

function validate() {
  let ok = true;
  const name  = getField('f-name').value.trim();
  const email = getField('f-email').value.trim();
  const type  = getField('f-type').value;
  const msg   = getField('f-msg').value.trim();
  setErr('name',  ''); setErr('email', ''); setErr('type', ''); setErr('msg', '');
  if (!name)  { setErr('name',  'Please enter your name.'); ok = false; }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setErr('email', 'Please enter a valid email.'); ok = false; }
  if (!type)  { setErr('type',  'Please select an enquiry type.'); ok = false; }
  if (!msg || msg.length < 10) { setErr('msg', 'Please write at least a short message.'); ok = false; }
  return ok;
}

async function handleSubmit() {
  if (!validate()) return;
  const btn     = document.getElementById('submitBtn');
  const btnText = document.getElementById('btnText');
  const spinner = document.getElementById('btnSpinner');
  const errBanner = document.getElementById('formError');
  errBanner.style.display = 'none';
  btn.disabled = true;
  btnText.style.display = 'none';
  spinner.style.display = 'inline-block';

  const name  = getField('f-name').value.trim();
  const org   = getField('f-org').value.trim();
  const email = getField('f-email').value.trim();
  const type  = getField('f-type').value;
  const msg   = getField('f-msg').value.trim();

  const html = `
    <div style="font-family:sans-serif;max-width:560px;color:#111;">
      <div style="background:#080c14;padding:20px 24px;border-radius:8px 8px 0 0;">
        <h2 style="color:#00f0ff;margin:0;font-size:18px;">New Scouting Enquiry — Elia Mirimo</h2>
      </div>
      <div style="background:#f8fafc;padding:24px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px;">
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:8px 0;color:#64748b;width:130px;">Name</td><td style="padding:8px 0;font-weight:600;">${name}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b;">Organisation</td><td style="padding:8px 0;">${org || '—'}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b;">Email</td><td style="padding:8px 0;"><a href="mailto:${email}">${email}</a></td></tr>
          <tr><td style="padding:8px 0;color:#64748b;">Enquiry Type</td><td style="padding:8px 0;font-weight:600;color:#7c3aed;">${type}</td></tr>
        </table>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0;">
        <p style="color:#64748b;font-size:13px;margin:0 0 8px;">Message</p>
        <p style="font-size:14px;line-height:1.7;margin:0;">${msg.replace(/\n/g,'<br>')}</p>
        <div style="margin-top:20px;padding:12px 16px;background:#eff6ff;border-radius:6px;font-size:12px;color:#1e40af;">
          Submitted via <strong>eliamirimo.vercel.app</strong> · ${new Date().toUTCString()}
        </div>
      </div>
    </div>`;

  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        organisation: org,
        email,
        enquiryType: type,
        message: msg
      })
    });

    if (res.ok) {
      document.getElementById('formBody').style.display    = 'none';
      document.getElementById('formSuccess').style.display = 'block';
    } else {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || `Status ${res.status}`);
    }
  } catch (err) {
    errBanner.textContent = `Could not send your message: ${err.message}. Please try again or contact us directly.`;
    errBanner.style.display = 'block';
    btn.disabled = false;
    btnText.style.display = 'inline';
    spinner.style.display  = 'none';
  }
}

function resetForm() {
  ['f-name','f-org','f-email','f-type','f-msg'].forEach(id => { getField(id).value = ''; });
  document.getElementById('formSuccess').style.display = 'none';
  document.getElementById('formBody').style.display    = 'block';
  const btn = document.getElementById('submitBtn');
  btn.disabled = false;
  document.getElementById('btnText').style.display   = 'inline';
  document.getElementById('btnSpinner').style.display = 'none';
}

/* ---- SECTION SCROLL ANIMATION ---- */
const sectionEls = document.querySelectorAll('.section-animate, .section-animate-left, .section-animate-right');
const sectionObs = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // Slight stagger based on index so multiple elements don't all fire at once
      const delay = entry.target.dataset.delay || 0;
      setTimeout(() => entry.target.classList.add('in-view'), delay);
      sectionObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
sectionEls.forEach((el, i) => {
  el.dataset.delay = i * 60;
  sectionObs.observe(el);
});
