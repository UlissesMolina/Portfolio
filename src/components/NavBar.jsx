import { FaMoon, FaSun } from 'react-icons/fa';

export default function NavBar({ isDarkMode, onToggleTheme, activeSection = '' }) {
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

  return (
    <nav
      className={`sticky top-0 z-20 w-full border-b transition-colors duration-300 ${
        isDarkMode
          ? 'border-surface-border bg-surface-bg/90 backdrop-blur-sm'
          : 'border-slate-200 bg-slate-50/95 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-5 py-2.5 flex items-center justify-between gap-4">
        <a
          href="#"
          className={`text-xs font-medium tracking-wide transition-colors ${
            isDarkMode ? 'text-ink-dim hover:text-accent' : 'text-slate-400 hover:text-accent'
          }`}
        >
          ulisses
        </a>
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8">
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
      </div>
    </nav>
  );
}
