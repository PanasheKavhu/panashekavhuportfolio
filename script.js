// Theme toggle (dark by default, choice remembered)
const themeToggle = document.getElementById('themeToggle');
themeToggle.addEventListener('click', () => {
    const root = document.documentElement;
    const next = root.dataset.theme === 'light' ? 'dark' : 'light';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) {}
});

// Mobile menu
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');

function setMenu(open) {
    navLinks.classList.toggle('is-open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
}

menuToggle.addEventListener('click', () => setMenu(!navLinks.classList.contains('is-open')));
navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
document.addEventListener('click', e => {
    if (!navLinks.contains(e.target) && !menuToggle.contains(e.target)) setMenu(false);
});

// Reveal sections as they scroll into view
const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealEls.forEach(el => revealObserver.observe(el));

    // Highlight the nav link for the section in view
    const links = new Map([...navLinks.querySelectorAll('a')].map(a => [a.getAttribute('href').slice(1), a]));
    const sectionObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            const link = links.get(entry.target.id);
            if (link) link.classList.toggle('is-active', entry.isIntersecting);
        });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('main section[id]').forEach(s => sectionObserver.observe(s));
} else {
    revealEls.forEach(el => el.classList.add('is-visible'));
}

// Cursor spotlight on cards (pointer devices only)
if (window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('pointermove', e => {
            const r = card.getBoundingClientRect();
            card.style.setProperty('--mx', `${e.clientX - r.left}px`);
            card.style.setProperty('--my', `${e.clientY - r.top}px`);
        });
    });
}

// Stacked project cards: shrink and dim each card as the next one slides over it
const stackCards = [...document.querySelectorAll('.projects.stack .project')];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
if (stackCards.length > 1 && !reduceMotion.matches) {
    let ticking = false;
    const update = () => {
        ticking = false;
        stackCards.forEach((card, i) => {
            const next = stackCards[i + 1];
            if (!next) return;
            const a = card.getBoundingClientRect();
            const b = next.getBoundingClientRect();
            const covered = Math.min(Math.max(1 - (b.top - a.top) / a.height, 0), 1);
            card.style.transform = `scale(${1 - covered * 0.06})`;
            card.style.filter = `brightness(${1 - covered * 0.35})`;
        });
    };
    const onScroll = () => {
        if (!ticking) { ticking = true; requestAnimationFrame(update); }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
}

document.getElementById('year').textContent = new Date().getFullYear();
