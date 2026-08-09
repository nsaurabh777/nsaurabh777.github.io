(() => {
    'use strict';

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    /* ---------------------------------------------------------
       Footer year
       --------------------------------------------------------- */
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    /* ---------------------------------------------------------
       Scroll progress bar
       --------------------------------------------------------- */
    const progressBar = document.getElementById('progressBar');
    function updateProgress() {
        const doc = document.documentElement;
        const scrollTop = doc.scrollTop || document.body.scrollTop;
        const height = doc.scrollHeight - doc.clientHeight;
        const pct = height > 0 ? (scrollTop / height) * 100 : 0;
        if (progressBar) progressBar.style.width = pct + '%';
    }

    /* ---------------------------------------------------------
       Nav: scrolled state, active link, mobile toggle
       --------------------------------------------------------- */
    const nav = document.getElementById('siteNav');
    const navToggle = document.getElementById('navToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const navLinks = Array.from(document.querySelectorAll('[data-nav]'));

    function updateNavScrolled() {
        if (!nav) return;
        nav.classList.toggle('scrolled', window.scrollY > 24);
    }

    if (navToggle && mobileMenu) {
        navToggle.addEventListener('click', () => {
            const isOpen = mobileMenu.classList.toggle('open');
            navToggle.setAttribute('aria-expanded', String(isOpen));
        });

        mobileMenu.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('open');
                navToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    const sections = navLinks
        .map((link) => document.querySelector(link.getAttribute('href')))
        .filter(Boolean);

    if (sections.length) {
        const navObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    const id = '#' + entry.target.id;
                    navLinks.forEach((link) => {
                        link.classList.toggle('active', link.getAttribute('href') === id);
                    });
                });
            },
            { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
        );
        sections.forEach((section) => navObserver.observe(section));
    }

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            updateNavScrolled();
            updateProgress();
            ticking = false;
        });
    }, { passive: true });

    updateNavScrolled();
    updateProgress();

    /* ---------------------------------------------------------
       Scroll reveal
       --------------------------------------------------------- */
    const revealEls = Array.from(document.querySelectorAll('.reveal'));
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
        revealEls.forEach((el) => el.classList.add('is-visible'));
    } else {
        revealEls.forEach((el, i) => {
            const group = el.closest('[data-reveal-group]');
            const stagger = group ? Array.from(group.querySelectorAll('.reveal')).indexOf(el) : i % 6;
            el.style.setProperty('--stagger', stagger);
        });

        const revealObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        revealObserver.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.14, rootMargin: '0px 0px -60px 0px' }
        );
        revealEls.forEach((el) => revealObserver.observe(el));
    }

    /* ---------------------------------------------------------
       Animated counters
       --------------------------------------------------------- */
    const counters = Array.from(document.querySelectorAll('[data-counter]'));
    function animateCounter(el) {
        const target = parseFloat(el.dataset.counter);
        const suffix = el.dataset.suffix || '';
        if (prefersReducedMotion || !isFinite(target)) {
            el.textContent = target + suffix;
            return;
        }
        const duration = 1400;
        const start = performance.now();
        function tick(now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const value = Math.round(target * eased);
            el.textContent = value + suffix;
            if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }

    if (counters.length) {
        const counterObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        animateCounter(entry.target);
                        counterObserver.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.6 }
        );
        counters.forEach((el) => counterObserver.observe(el));
    }

    /* ---------------------------------------------------------
       Project card cursor spotlight
       --------------------------------------------------------- */
    if (canHover && !prefersReducedMotion) {
        document.querySelectorAll('.project-card').forEach((card) => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                card.style.setProperty('--mx', ((e.clientX - rect.left) / rect.width) * 100 + '%');
                card.style.setProperty('--my', ((e.clientY - rect.top) / rect.height) * 100 + '%');
            });
        });

        document.querySelectorAll('.skill-card, .timeline-card').forEach((card) => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const px = (e.clientX - rect.left) / rect.width - 0.5;
                const py = (e.clientY - rect.top) / rect.height - 0.5;
                card.style.transform = `perspective(800px) rotateX(${(-py * 4).toFixed(2)}deg) rotateY(${(px * 4).toFixed(2)}deg) translateY(-2px)`;
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }

    /* ---------------------------------------------------------
       Project card flip
       --------------------------------------------------------- */
    document.querySelectorAll('.project-card').forEach((card) => {
        function toggleFlip() {
            const flipped = card.classList.toggle('flipped');
            card.setAttribute('aria-pressed', String(flipped));
        }
        card.addEventListener('click', toggleFlip);
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleFlip();
            }
        });
    });

    /* ---------------------------------------------------------
       Hero network canvas
       --------------------------------------------------------- */
    const canvas = document.getElementById('networkCanvas');
    if (canvas && canvas.getContext) {
        const ctx = canvas.getContext('2d');
        let width, height, dpr;
        let nodes = [];
        let pointer = { x: null, y: null };
        let rafId = null;
        let visible = true;
        let offsetX = 0;
        let offsetY = 0;

        const NODE_COUNT_BASE = 70;
        const LINK_DIST = 130;
        const ACCENT = '61, 90, 254';
        const PARALLAX_MAX = 18;
        const PARALLAX_EASE = 0.06;

        function resize() {
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            width = canvas.offsetWidth;
            height = canvas.offsetHeight;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            const area = width * height;
            const count = Math.max(24, Math.min(NODE_COUNT_BASE, Math.round(area / 16000)));
            nodes = Array.from({ length: count }, () => ({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.28,
                vy: (Math.random() - 0.5) * 0.28,
                r: Math.random() * 1.6 + 0.6,
            }));
        }

        function step() {
            const targetX = pointer.x !== null ? ((pointer.x / width) - 0.5) * 2 * PARALLAX_MAX : 0;
            const targetY = pointer.y !== null ? ((pointer.y / height) - 0.5) * 2 * PARALLAX_MAX : 0;
            offsetX += (targetX - offsetX) * PARALLAX_EASE;
            offsetY += (targetY - offsetY) * PARALLAX_EASE;
            canvas.style.transform = `translate3d(${offsetX.toFixed(2)}px, ${offsetY.toFixed(2)}px, 0)`;

            ctx.clearRect(0, 0, width, height);

            nodes.forEach((n) => {
                n.x += n.vx;
                n.y += n.vy;
                if (n.x < 0 || n.x > width) n.vx *= -1;
                if (n.y < 0 || n.y > height) n.vy *= -1;

                if (pointer.x !== null) {
                    const dx = n.x - pointer.x;
                    const dy = n.y - pointer.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 120 && dist > 0.01) {
                        const force = (120 - dist) / 120 * 0.03;
                        n.x += (dx / dist) * force;
                        n.y += (dy / dist) * force;
                    }
                }
            });

            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const a = nodes[i], b = nodes[j];
                    const dx = a.x - b.x, dy = a.y - b.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < LINK_DIST) {
                        ctx.strokeStyle = `rgba(${ACCENT}, ${(1 - dist / LINK_DIST) * 0.35})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.stroke();
                    }
                }
            }

            nodes.forEach((n) => {
                ctx.beginPath();
                ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${ACCENT}, 0.75)`;
                ctx.fill();
            });

            if (visible) rafId = requestAnimationFrame(step);
        }

        function drawStatic() {
            ctx.clearRect(0, 0, width, height);
            nodes.forEach((n) => {
                ctx.beginPath();
                ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${ACCENT}, 0.5)`;
                ctx.fill();
            });
        }

        resize();
        if (prefersReducedMotion) {
            drawStatic();
        } else {
            step();
        }

        window.addEventListener('resize', () => {
            resize();
            if (prefersReducedMotion) drawStatic();
        });

        window.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            if (e.clientY > rect.bottom) {
                pointer.x = null;
                pointer.y = null;
                return;
            }
            pointer.x = e.clientX - rect.left;
            pointer.y = e.clientY - rect.top;
        });

        document.addEventListener('visibilitychange', () => {
            visible = document.visibilityState === 'visible';
            if (visible && !prefersReducedMotion) step();
            else if (rafId) cancelAnimationFrame(rafId);
        });
    }
})();
