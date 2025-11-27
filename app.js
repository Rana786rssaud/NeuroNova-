/* app.js — Neuronova site behavior & animations
   - Liquid background canvas
   - Dynamic load of Three.js and 3D hero (if present)
   - Scroll reveal (.fade-in -> .visible)
   - Smooth anchor links
   - Contact form demo handler
   - Admin counters animation
   - Small utilities
*/

(function () {
  'use strict';

  /* -----------------------
     Utilities
  ----------------------- */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const safeDo = (fn) => { try { fn(); } catch (e) { console.warn(e); } };

  /* -----------------------
     Liquid background (canvas)
     draws soft moving blobs for a premium feel
  ----------------------- */
  (function liquidBg() {
    // If CSS .liquid-bg exists we also add a canvas for subtle animated waves.
    const container = document.querySelector('.liquid-bg');
    if (!container) return;

    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.inset = '0';
    canvas.style.zIndex = '0';
    canvas.style.pointerEvents = 'none';
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    let w = canvas.width = innerWidth;
    let h = canvas.height = innerHeight;

    const blobs = [];
    const BLOB_COUNT = Math.max(3, Math.round((w * h) / 240000)); // scale with screen
    for (let i = 0; i < BLOB_COUNT; i++) {
      blobs.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 120 + Math.random() * 180,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        hue: 40 + Math.random() * 40, // gold-ish hues
      });
    }

    function resize() {
      w = canvas.width = innerWidth;
      h = canvas.height = innerHeight;
    }
    window.addEventListener('resize', resize, { passive: true });

    function draw() {
      ctx.clearRect(0, 0, w, h);

      // subtle dark backdrop
      ctx.fillStyle = 'rgba(8,6,8,0.12)';
      ctx.fillRect(0, 0, w, h);

      blobs.forEach((b, i) => {
        b.x += b.vx;
        b.y += b.vy;
        if (b.x < -b.r) b.x = w + b.r;
        if (b.x > w + b.r) b.x = -b.r;
        if (b.y < -b.r) b.y = h + b.r;
        if (b.y > h + b.r) b.y = -b.r;

        // radial gradient blob
        const g = ctx.createRadialGradient(b.x, b.y, b.r * 0.05, b.x, b.y, b.r);
        g.addColorStop(0, `hsla(${b.hue},70%,75%,0.09)`);
        g.addColorStop(0.35, `hsla(${b.hue},60%,65%,0.06)`);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // subtle moving lines/waves
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineWidth = 1;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        const amp = 12 + i * 6;
        const freq = 0.002 + i * 0.0014;
        const t = Date.now() * (0.0008 + i * 0.0004);
        ctx.strokeStyle = `rgba(212,180,90,${0.015 + i * 0.008})`;
        for (let x = 0; x < w; x += 14) {
          const y = h * (0.35 + i * 0.1) + Math.sin(x * freq + t) * amp;
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.globalCompositeOperation = 'source-over';

      requestAnimationFrame(draw);
    }

    draw();
  })();

  /* -----------------------
     Scroll reveal: add .visible to elements with .fade-in
  ----------------------- */
  (function scrollReveal() {
    const elems = $$('.fade-in');
    if (!elems.length) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add('visible');
          obs.unobserve(en.target);
        }
      });
    }, { threshold: 0.14 });
    elems.forEach(e => obs.observe(e));
  })();

  /* -----------------------
     Smooth Anchor Scrolling for local links
  ----------------------- */
  (function smoothAnchors() {
    document.addEventListener('click', (ev) => {
      const a = ev.target.closest('a[href^="#"]');
      if (!a) return;
      const href = a.getAttribute('href');
      if (href.length === 1) return; // '#'
      const target = document.querySelector(href);
      if (!target) return;
      ev.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  })();

  /* -----------------------
     Contact form demo handler
     (Replace with fetch/XHR to your backend)
  ----------------------- */
  (function contactFormHandler() {
    const forms = $$('form.contact-form, form#contactForm');
    if (!forms.length) return;
    forms.forEach((form) => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"], .btn-primary') || null;
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Sending...';
        }
        // gather basic fields
        const name = form.querySelector('input[type="text"], input[name="name"], #fname')?.value || 'Client';
        const email = form.querySelector('input[type="email"], #email')?.value || '';
        // simulated network delay
        setTimeout(() => {
          const statusNode = form.querySelector('#contactResp') || document.createElement('div');
          statusNode.className = statusNode.className || 'contact-status small';
          statusNode.textContent = `Thanks ${name}. Request received (demo). We will contact you at ${email || 'your email'}.`;
          if (!form.querySelector('#contactResp')) form.appendChild(statusNode);
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Send Message'; }
          form.reset();
        }, 900);
      });
    });
  })();

  /* -----------------------
     Admin counters (animate numeric values)
     Look for elements with ids: clientCount, modelCount, pendingCount, userCount, projectCount, revenue
  ----------------------- */
  (function adminCounters() {
    const animElems = [
      { id: 'clientCount', to: 23 },
      { id: 'modelCount', to: 12 },
      { id: 'pendingCount', to: 5 },
      { id: 'userCount', to: 124 },
      { id: 'projectCount', to: 23 },
      { id: 'revenue', to: 64500 } // display as number or with prefix
    ];
    animElems.forEach(obj => {
      const el = document.getElementById(obj.id);
      if (!el) return;
      const to = obj.to;
      let current = 0;
      const duration = 900; // ms
      const steps = Math.max(12, Math.round(duration / 24));
      const inc = to / steps;
      const fmt = (v) => {
        if (obj.id === 'revenue') return '₹' + Math.round(v).toLocaleString();
        return Math.round(v).toLocaleString();
      };
      const t = setInterval(() => {
        current += inc;
        if (current >= to) {
          el.textContent = fmt(to);
          clearInterval(t);
        } else {
          el.textContent = fmt(current);
        }
      }, Math.round(duration / steps));
    });
  })();

  /* -----------------------
     Mobile nav toggle (if nav layout needs it)
     Expects header nav structure similar to provided HTML
  ----------------------- */
  (function mobileNav() {
    // create a simple toggle button on small screens if needed
    const header = document.querySelector('header, .navbar');
    if (!header) return;
    const nav = header.querySelector('nav');
    if (!nav) return;
    const toggle = document.createElement('button');
    toggle.className = 'mobile-nav-toggle';
    toggle.setAttribute('aria-label', 'Toggle navigation');
    toggle.innerHTML = '☰';
    toggle.style.cssText = 'display:none;padding:8px;border-radius:8px;background:rgba(255,255,255,0.03);border:none;color:var(--muted);cursor:pointer';
    header.appendChild(toggle);
    function check() {
      if (window.innerWidth <= 900) {
        toggle.style.display = 'inline-block';
        nav.style.display = nav.classList.contains('open') ? 'flex' : 'none';
      } else {
        toggle.style.display = 'none';
        nav.style.display = 'flex';
      }
    }
    toggle.addEventListener('click', () => {
      nav.classList.toggle('open');
      nav.style.display = nav.classList.contains('open') ? 'flex' : 'none';
    });
    window.addEventListener('resize', check);
    check();
  })();

  /* -----------------------
     Optional Three.js 3D hero
     - Dynamically loads Three.js if not present
     - Creates a subtle rotating icosahedron when #hero-3d or canvas with id 'sphere3d' exists
  ----------------------- */
  (function hero3DLoader() {

    function initThree() {
      safeDo(() => {
        // find a canvas target. prefer "#sphere3d", fallback to element with id "hero-3d"
        const canvas = document.getElementById('sphere3d') || document.getElementById('hero-3d');
        if (!canvas) return;

        // Setup renderer (if the element is a canvas we'll use it)
        const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
        function resizeRenderer() {
          const w = canvas.clientWidth || window.innerWidth;
          const h = canvas.clientHeight || window.innerHeight;
          renderer.setSize(w, h, false);
        }
        resizeRenderer();

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(50, canvas.clientWidth / Math.max(1, canvas.clientHeight), 0.1, 1000);
        camera.position.z = 36;

        // Lights
        const amb = new THREE.AmbientLight(0xffffff, 0.35);
        scene.add(amb);
        const pl = new THREE.PointLight(0xffe7b5, 1.2);
        pl.position.set(50, 30, 30);
        scene.add(pl);

        // geometry - low poly neural node
        const geo = new THREE.IcosahedronGeometry(14, 2);
        const mat = new THREE.MeshStandardMaterial({
          color: 0xd4b45a,
          metalness: 0.5,
          roughness: 0.35,
          emissive: 0x3b2b10,
          emissiveIntensity: 0.02,
          transparent: true,
          opacity: 0.95,
        });
        const mesh = new THREE.Mesh(geo, mat);
        scene.add(mesh);

        // wireframe overlay
        const wire = new THREE.Mesh(geo.clone(), new THREE.MeshBasicMaterial({ color: 0xfff1c1, wireframe: true, opacity: 0.22, transparent: true }));
        scene.add(wire);

        // particles
        const partsGeo = new THREE.BufferGeometry();
        const count = 200;
        const pts = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
          pts[i * 3] = (Math.random() - 0.5) * 160;
          pts[i * 3 + 1] = (Math.random() - 0.5) * 40;
          pts[i * 3 + 2] = (Math.random() - 0.5) * 80;
        }
        partsGeo.setAttribute('position', new THREE.BufferAttribute(pts, 3));
        const pmat = new THREE.PointsMaterial({ size: 0.6, color: 0xffeaa0, opacity: 0.12, transparent: true });
        const parts = new THREE.Points(partsGeo, pmat);
        scene.add(parts);

        // controls: subtle auto-rotation only
        let t = 0;
        function animate() {
          t += 0.006;
          mesh.rotation.y = Math.sin(t * 0.3) * 0.18 + 0.2;
          mesh.rotation.x = Math.cos(t * 0.2) * 0.08;
          wire.rotation.y = mesh.rotation.y * 1.1;
          parts.rotation.y = t * 0.1;
          renderer.render(scene, camera);
          requestAnimationFrame(animate);
        }
        animate();

        // adapt on resize
        window.addEventListener('resize', () => {
          resizeRenderer();
          camera.aspect = canvas.clientWidth / Math.max(1, canvas.clientHeight);
          camera.updateProjectionMatrix();
        }, { passive: true });
      });
    }

    // If THREE is already present, init now
    if (window.THREE) {
      initThree();
      return;
    }

    // Otherwise, load it dynamically (unpkg)
    const scriptUrl = 'https://unpkg.com/three@0.150.0/build/three.min.js';
    const s = document.createElement('script');
    s.src = scriptUrl;
    s.onload = () => {
      // small delay to ensure lib ready
      setTimeout(initThree, 80);
    };
    s.onerror = () => {
      console.warn('Three.js failed to load — 3D hero will remain disabled.');
    };
    document.head.appendChild(s);
  })();

  /* -----------------------
     Tiny accessibility & polish
  ----------------------- */
  (function misc() {
    // add :focus visible class for keyboard focus outlines
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') document.documentElement.classList.add('show-focus');
    });
  })();

  /* -----------------------
     Done
  ----------------------- */
  // console.log('app.js loaded');
})();
