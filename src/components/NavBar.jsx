import { useState, useEffect } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';

const THEMES = [
  { id: 'coral', label: 'Coral' },
  { id: 'matrix', label: 'Matrix' },
  { id: 'dracula', label: 'Dracula' },
];

export default function NavBar({ activeSection = '', time, theme = 'coral', onThemeChange }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [navAnimated, setNavAnimated] = useState(false);
  const clockStr = time ? time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }) : '--:--:--';

  useEffect(() => {
    const frame = requestAnimationFrame(() => setNavAnimated(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const navLinks = [
    { href: '#experience', label: 'Work' },
    { href: '#projects', label: 'Projects' },
    { href: '#contact', label: 'Contact' },
  ];

  const linkClass = (id) => {
    const base = 'text-sm font-medium transition-colors duration-200 px-2 py-1 rounded hover:underline underline-offset-2';
    const active = id === activeSection;
    if (active) return `${base} text-accent`;
    return `${base} text-ink-muted hover:text-ink`;
  };

  const closeMobile = () => setMobileOpen(false);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') closeMobile(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileOpen]);

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <nav className={`sticky top-0 z-30 w-full border-b border-surface-border bg-surface-bg/90 backdrop-blur-sm transition-colors duration-300 ${navAnimated ? 'animate-nav-slide-in' : 'opacity-0 -translate-y-full'}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-5 py-2.5 flex items-center justify-between gap-4">
        <a
          href="#"
          onClick={closeMobile}
          className="text-base sm:text-lg font-mono font-semibold tracking-wide transition-colors shrink-0 hover:underline underline-offset-2 flex items-baseline gap-0.5 text-ink hover:text-accent animate-nav-link-in"
        >
          <span className="text-accent">$</span> ulisses@molina <span className="text-ink-dim">~</span>
        </a>

        <div className="hidden md:flex flex-wrap items-center justify-center gap-6 sm:gap-8">
          {navLinks.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className={`${linkClass(href.slice(1))} animate-nav-link-in`}
            >
              {label}
            </a>
          ))}
          <a
            href="/uliResume.pdf"
            download="uliResume.pdf"
            className="text-sm font-medium transition-colors px-2 py-1 rounded hover:underline underline-offset-2 text-ink-muted hover:text-accent animate-nav-link-in"
          >
            Resume
          </a>
          <span className="text-xs font-mono tabular-nums text-ink-dim animate-nav-link-in" aria-hidden>
            {clockStr}
          </span>
          {onThemeChange && (
            <select
              value={theme}
              onChange={(e) => onThemeChange(e.target.value)}
              className="text-xs font-mono rounded px-2 py-1 border cursor-pointer border-surface-border text-ink bg-surface-card hover:text-accent focus:border-accent animate-nav-link-in"
              aria-label="Accent theme"
            >
              {THEMES.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          )}
        </div>

        <div className="flex md:hidden items-center gap-2">
          {onThemeChange && (
            <select
              value={theme}
              onChange={(e) => onThemeChange(e.target.value)}
              className="text-xs font-mono rounded px-2 py-1 border border-surface-border text-ink bg-surface-card"
              aria-label="Accent theme"
            >
              {THEMES.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          )}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded transition-colors text-ink-muted hover:text-ink hover:bg-white/5"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
          </button>
        </div>
      </div>

      <div
          className={`md:hidden overflow-hidden transition-[max-height] duration-300 ease-out ${mobileOpen ? 'max-h-64' : 'max-h-0'}`}
      >
        <div className="border-t py-4 px-4 flex flex-col gap-0.5 border-surface-border bg-surface-bg/98">
          {navLinks.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              onClick={closeMobile}
              className={`py-3 px-3 rounded-lg text-base ${linkClass(href.slice(1))} hover:bg-white/5`}
            >
              {label}
            </a>
          ))}
          <a
            href="/uliResume.pdf"
            download="uliResume.pdf"
            onClick={closeMobile}
            className="py-3 px-3 rounded-lg text-base font-medium transition-colors hover:underline underline-offset-2 text-ink-muted hover:text-accent hover:bg-white/5"
          >
            Resume
          </a>
        </div>
      </div>
    </nav>
  );
}
