import { useEffect, useRef, useState } from 'react';

const WELCOME = "Type 'help' to start.";

const ALIASES = { h: 'help', p: 'projects', s: 'skills', c: 'contact', r: 'resume' };

const HELP_OUTPUT = `Available commands:
  work       Jump to experience section
  projects  Jump to projects (alias: p)
  activity  Jump to recent activity
  contact   Jump to contact
  about     Learn about me
  open      Open link/project: open <name>
  skills    Tech stack (alias: s)
  resume    Download resume (alias: r)
  clear     Clear the screen
  fullscreen  Expand terminal (type exit to close)

  Try: work   projects   open github   fullscreen`;

const ABOUT_OUTPUT = `Software engineering student who automates bureaucracy.
Currently making Auburn's course registration suck less.
Auburn SWE · Open to part-time work.`;

const PROJECTS = {
  'tiger-scheduler': `Tiger Scheduler Course Auto-Register Tool

  A Python automation script that monitors course availability
  on Auburn's TigerScheduler. Checks for open seats, filters
  courses, handles auto-login and registration.

  Tech: Python, Selenium, Web Automation

  GitHub: https://github.com/UlissesMolina/Tiger-Scheduler-Course-Auto-Register-Tool`,
  portfolio: `Personal Portfolio

  This interactive terminal portfolio. Built with React and Vite,
  coral theme, automation vibes.

  Tech: React, JavaScript, Tailwind CSS, Vite

  GitHub: https://github.com/UlissesMolina/Portfolio`,
};

function parseInput(line) {
  const trimmed = line.trim();
  if (!trimmed) return { command: '', args: [] };
  const parts = trimmed.split(/\s+/);
  const command = parts[0].toLowerCase();
  const args = parts.slice(1);
  return { command: ALIASES[command] || command, args };
}

function execute(command, args) {
  switch (command) {
    case 'help':
      return HELP_OUTPUT;
    case 'about':
      return ABOUT_OUTPUT;
    case 'work':
      return null; // handler scrolls
    case 'projects':
      return `My projects:
  1. tiger-scheduler - Auto-registration tool for Auburn courses
  2. portfolio - This interactive site

Type 'open <project-name>' to learn more.`;
    case 'open': {
      const name = args[0]?.toLowerCase().replace(/_/g, '-');
      if (name === 'github') return null; // handler opens
      if (name === 'linkedin') return null; // handler opens
      if (name && PROJECTS[name]) return PROJECTS[name];
      return `Unknown project. Try: open tiger-scheduler  or  open portfolio`;
    }
    case 'connect': {
      if (args[0]?.toLowerCase() === 'linkedin') return null; // handler opens
      return `Usage: connect linkedin`;
    }
    case 'view':
      if (args[0]?.toLowerCase() === 'resume') return null; // handler opens
      return `Usage: view resume`;
    case 'skills':
      return `Languages: Java, Python, JavaScript, TypeScript
Frameworks: React, Firebase
Tools: HTML, CSS, JSON`;
    case 'contact':
      return `Email: umolina2005@gmail.com
GitHub: github.com/UlissesMolina
LinkedIn: linkedin.com/in/ulissesmolina`;
    case 'activity':
      return null; // handler scrolls
    case 'fullscreen':
    case 'expand':
      return null; // handler toggles
    case 'exit':
      return null; // handler closes fullscreen
    case 'resume':
      return null; // special: open PDF in handler
    case 'clear':
      return null; // special: caller clears history
    case 'ls':
      return `tiger-scheduler/   portfolio/`;
    case 'pwd':
      return `~/portfolio`;
    case 'sudo':
      return `Nice try 😏`;
    case 'rm':
      if (args[0] === '-rf' && (args[1] === '/' || args[1] === '*')) return `Nope, not today.`;
      return `Command not found: rm ${(args.join(' ') || '').trim()}. Type 'help' for available commands.`;
    default:
      return `Command not found: ${command}. Type 'help' for available commands.`;
  }
}

const NAV_COMMANDS = { about: 'about', work: 'experience', projects: 'projects', activity: 'contributions', contact: 'contact' };

export default function Terminal({ isDarkMode, onNavigateToSection, onEnterFullscreen, onExitFullscreen, isFullscreen = false }) {
  const [history, setHistory] = useState([{ type: 'output', text: WELCOME }]);
  const [input, setInput] = useState('');
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const scrollContainerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [history]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length === 0) return;
      const nextIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex;
      setHistoryIndex(nextIndex);
      setInput(commandHistory[commandHistory.length - 1 - nextIndex] ?? '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex <= 0) {
        setHistoryIndex(-1);
        setInput('');
        return;
      }
      const nextIndex = historyIndex - 1;
      setHistoryIndex(nextIndex);
      setInput(commandHistory[commandHistory.length - 1 - nextIndex] ?? '');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const raw = input.trim();
    if (!raw) return;

    const { command, args } = parseInput(raw);
    let output = execute(command, args);

    if (command === 'clear') {
      setHistory([{ type: 'output', text: WELCOME }]);
      setInput('');
      setHistoryIndex(-1);
      return;
    }

    const sectionId = NAV_COMMANDS[command];
    if (sectionId && onNavigateToSection) {
      onNavigateToSection(sectionId);
      if (output == null) output = `→ ${command}`;
    } else if ((command === 'fullscreen' || command === 'expand') && onEnterFullscreen) {
      onEnterFullscreen();
      output = "Terminal expanded. Type 'exit' to close.";
    } else if (command === 'exit') {
      if (isFullscreen && onExitFullscreen) {
        onExitFullscreen();
        output = '→ back';
      } else if (output == null) output = "Not in fullscreen. Type 'fullscreen' to expand.";
    }

    if (command === 'resume') {
      window.open('/UlissesResume%20(5).pdf', '_blank');
      output = 'Opening resume...';
    } else if (command === 'open' && args[0]) {
      const name = args[0].toLowerCase().replace(/_/g, '-');
      if (name === 'github') {
        window.open('https://github.com/UlissesMolina', '_blank');
        output = 'Opening GitHub...';
      } else if (name === 'linkedin') {
        window.open('https://www.linkedin.com/in/ulissesmolina', '_blank');
        output = 'Opening LinkedIn...';
      }
    } else if (command === 'connect' && args[0]?.toLowerCase() === 'linkedin') {
      window.open('https://www.linkedin.com/in/ulissesmolina', '_blank');
      output = 'Opening LinkedIn...';
    } else if (command === 'view' && args[0]?.toLowerCase() === 'resume') {
      window.open('/UlissesResume%20(5).pdf', '_blank');
      output = 'Opening resume...';
    }

    if (output == null) output = '';

    setCommandHistory((prev) => [...prev, raw].slice(-50));
    setHistoryIndex(-1);

    setHistory((prev) => [
      ...prev,
      { type: 'command', text: raw },
      { type: 'output', text: output },
    ]);
    setInput('');
  };

  const textColor = isDarkMode ? 'text-ink' : 'text-slate-800';
  const mutedColor = isDarkMode ? 'text-ink-muted' : 'text-slate-500';
  const promptColor = 'text-accent';

  const focusInput = () => inputRef.current?.focus();

  return (
    <div
      role="application"
      aria-label="Terminal"
      onClick={focusInput}
      className={`font-mono overflow-hidden cursor-text ${
        isFullscreen
          ? `flex flex-col flex-1 min-h-0 text-base sm:text-lg ${isDarkMode ? 'bg-surface-bg' : 'bg-slate-900'}`
          : `rounded-lg text-sm sm:text-base ${isDarkMode ? 'bg-surface-bg' : 'bg-slate-900'} ${isDarkMode ? 'border border-white/[0.03]' : 'border border-black/[0.04]'}`
      }`}
      style={{ minHeight: isFullscreen ? undefined : '420px' }}
    >
      <div className="p-5 pb-3 flex flex-col h-full" onClick={focusInput}>
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto space-y-1 min-h-0"
        >
          {history.map((item, i) => (
            <div key={i} className="break-words">
              {item.type === 'command' ? (
                <div className="flex items-baseline gap-2">
                  <span className={promptColor} aria-hidden>$</span>
                  <span className={textColor}>{item.text}</span>
                </div>
              ) : (
                <pre className={`whitespace-pre-wrap pl-4 ${mutedColor} leading-relaxed`}>
                  {item.text}
                </pre>
              )}
            </div>
          ))}
          <form onSubmit={handleSubmit} className="flex items-baseline gap-2 pt-1">
            <span className={promptColor} aria-hidden>$</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className={`flex-1 min-w-0 bg-transparent border-none outline-none ${textColor} placeholder:opacity-50`}
              placeholder=""
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck="false"
              aria-label="Terminal input"
            />
          </form>
        </div>
      </div>
    </div>
  );
}
