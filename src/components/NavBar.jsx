import { FaMoon, FaSun } from 'react-icons/fa';

export default function NavBar({ isDarkMode, onToggleTheme }) {
  const linkClass = `text-sm transition-colors ${
    isDarkMode ? 'text-teal-300/90 hover:text-teal-100' : 'text-slate-600 hover:text-slate-900'
  }`;
  const buttonClass = `p-1.5 rounded-md transition-colors ${
    isDarkMode
      ? 'text-teal-300/90 hover:text-teal-100 hover:bg-white/10'
      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/80'
  }`;

  return (
    <nav
      className={`sticky top-0 z-20 w-full border-b transition-colors duration-300 ${
        isDarkMode
          ? 'border-teal-900/30 bg-slate-950/90 backdrop-blur-sm'
          : 'border-teal-200/60 bg-slate-50/90 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-5 py-3 flex flex-wrap items-center justify-center gap-5 sm:gap-6">
        <a href="#experience" className={linkClass}>
          Experience
        </a>
        <a href="#tech-stack" className={linkClass}>
          Tech Stack
        </a>
        <a href="#projects" className={linkClass}>
          Projects
        </a>
        <a href="#contributions" className={linkClass}>
          Contributions
        </a>
        <button
          onClick={onToggleTheme}
          className={buttonClass}
          aria-label="Toggle theme"
        >
          {isDarkMode ? <FaSun size={16} /> : <FaMoon size={16} />}
        </button>
        <a href="/UlissesResume%20(5).pdf" download="UlissesResume.pdf" className={linkClass}>
          CV
        </a>
      </div>
    </nav>
  );
}
