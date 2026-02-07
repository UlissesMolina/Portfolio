import { useState, useEffect } from 'react';
import { FaMoon, FaSun, FaBars, FaTimes } from 'react-icons/fa';

export default function NavBar({ isDarkMode, onToggleTheme, activeSection = '' }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: '#experience', label: 'Work' },
    { href: '#projects', label: 'Projects' },
    { href: '#contact', label: 'Contact' },
  ];

  const linkClass = (id) => {
    const base = 'text-sm transition-colors duration-200';
    const active = id === activeSection;
    if (active) {
      return `${base} ${isDarkMode ? 'text-accent font-medium' : 'text-accent font-medium'}`;
    }
    return `${base} ${isDarkMode ? 'text-ink-muted hover:text-ink' : 'text-slate-600 hover:text-slate-900'}`;
  };

  const closeMobile = () => setMobileOpen(false);

  // Close on escape and when clicking a link (scroll)
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') closeMobile(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileOpen]);

  // Prevent body scroll when menu open on mobile
  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <nav
      className={`sticky top-0 z-30 w-full border-b transition-colors duration-300 ${
        isDarkMode
          ? 'border-surface-border bg-surface-bg/90 backdrop-blur-sm'
          : 'border-slate-200 bg-slate-50/95 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-5 py-2.5 flex items-center justify-between gap-4">
        <a
          href="#"
          onClick={closeMobile}
          className={`text-xs font-medium tracking-wide transition-colors shrink-0 ${
            isDarkMode ? 'text-ink-dim hover:text-accent' : 'text-slate-400 hover:text-accent'
          }`}
        >
          ulisses
        </a>

        {/* Desktop: inline links + resume + theme */}
        <div className="hidden md:flex flex-wrap items-center justify-center gap-6 sm:gap-8">
          {navLinks.map(({ href, label }) => (
            <a key={href} href={href} className={linkClass(href.slice(1))}>
              {label}
            </a>
          ))}
          <a
            href="/UlissesResume%20(5).pdf"
            download="UlissesResume.pdf"
            className={`text-sm font-medium transition-colors ${
              isDarkMode ? 'text-ink-muted hover:text-accent' : 'text-slate-600 hover:text-accent'
            }`}
          >
            Resume
          </a>
          <button
            onClick={onToggleTheme}
            className={`p-1.5 rounded transition-colors ${
              isDarkMode
                ? 'text-ink-muted hover:text-ink hover:bg-white/5'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/80'
            }`}
            aria-label="Toggle theme"
          >
            {isDarkMode ? <FaSun size={12} /> : <FaMoon size={12} />}
          </button>
        </div>

        {/* Mobile: hamburger + theme, then dropdown */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={onToggleTheme}
            className={`p-2 rounded transition-colors ${
              isDarkMode
                ? 'text-ink-muted hover:text-ink hover:bg-white/5'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/80'
            }`}
            aria-label="Toggle theme"
          >
            {isDarkMode ? <FaSun size={14} /> : <FaMoon size={14} />}
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`p-2 rounded transition-colors ${
              isDarkMode
                ? 'text-ink-muted hover:text-ink hover:bg-white/5'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/80'
            }`}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      <div
        className={`md:hidden overflow-hidden transition-[max-height] duration-300 ease-out ${
          mobileOpen ? 'max-h-64' : 'max-h-0'
        }`}
      >
        <div
          className={`border-t py-4 px-4 flex flex-col gap-0.5 ${
            isDarkMode ? 'border-surface-border bg-surface-bg/98' : 'border-slate-200 bg-slate-50/98'
          }`}
        >
          {navLinks.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              onClick={closeMobile}
              className={`py-3 px-3 rounded-lg text-base ${linkClass(href.slice(1))} ${
                isDarkMode ? 'hover:bg-white/5' : 'hover:bg-slate-200/60'
              }`}
            >
              {label}
            </a>
          ))}
          <a
            href="/UlissesResume%20(5).pdf"
            download="UlissesResume.pdf"
            onClick={closeMobile}
            className={`py-3 px-3 rounded-lg text-base font-medium transition-colors ${
              isDarkMode ? 'text-ink-muted hover:text-accent hover:bg-white/5' : 'text-slate-600 hover:text-accent hover:bg-slate-200/60'
            }`}
          >
            Resume
          </a>
        </div>
      </div>
    </nav>
  );
}
