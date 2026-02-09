import { useEffect, useLayoutEffect, useRef, useState } from 'react';

const WELCOME = "Type 'help' to start.";
const WHOAMI_OUTPUT = 'Ulisses Molina — Software Engineering Student';

const HELP_OUTPUT = `Available commands:
  about     Learn about me
  work      Jump to experience
  projects  View my projects
  contact   Get in touch
  resume    Download resume

  open github    Open GitHub profile
  open linkedin  Open LinkedIn

  clear     Clear the screen

Try: about, work, projects — or just scroll down ↓`;

const ABOUT_OUTPUT = `Software engineering student at Auburn University. Open to summer 2026 internships.`;

const PROJECTS = {
  'tiger-scheduler': `Tiger Scheduler Course Auto-Register Tool

  A Python automation script that monitors course availability
  on Auburn's TigerScheduler. Checks for open seats, filters
  courses, handles auto-login and registration.

  Tech: Python, Selenium, Web Automation

  GitHub: https://github.com/UlissesMolina/Tiger-Scheduler-Course-Auto-Register-Tool`,
  portfolio: `Personal Portfolio

  This interactive terminal portfolio. Built with React and Vite.

  Tech: React, JavaScript, Tailwind CSS, Vite

  GitHub: https://github.com/UlissesMolina/Portfolio`,
};

function parseInput(line) {
  const trimmed = line.trim();
  if (!trimmed) return { command: '', args: [] };
  const parts = trimmed.split(/\s+/);
  const command = parts[0].toLowerCase();
  const args = parts.slice(1);
  return { command, args };
}

function execute(command, args) {
  switch (command) {
    case 'help':
      return HELP_OUTPUT;
    case 'whoami':
      return WHOAMI_OUTPUT;
    case 'about':
      return ABOUT_OUTPUT;
    case 'work':
      return null;
    case 'projects':
      return `My projects:
  1. tiger-scheduler - Auto-registration tool for Auburn courses
  2. portfolio - This site

Type 'open <project-name>' to learn more.`;
    case 'open': {
      const name = args[0]?.toLowerCase().replace(/_/g, '-');
      if (name === 'github') return null;
      if (name === 'linkedin') return null;
      if (name && PROJECTS[name]) return PROJECTS[name];
      return `Unknown project. Try: open tiger-scheduler  or  open portfolio`;
    }
    case 'contact':
      return `Email: umolina2005@gmail.com
GitHub: github.com/UlissesMolina
LinkedIn: linkedin.com/in/ulissesmolina`;
    case 'activity':
    case 'resume':
    case 'clear':
      return null;
    case 'ls':
      return `tiger-scheduler/   portfolio/`;
    case 'pwd':
      return `/home/ulises/hopefully-your-future-company`;
    case 'sudo': {
      if (args[0] === 'rm' && args[1] === '-rf' && (args[2] === '/' || args[2] === '*')) return `Whoa there, calm down.`;
      return `Nice try`;
    }
    default:
      return `Command not found: ${command}. Type 'help' for available commands.`;
  }
}

const NAV_COMMANDS = { about: 'about', work: 'experience', projects: 'projects', activity: 'contributions', contact: 'contact' };

const BOOT_LINE_1 = '[●] Initializing portfolio...';
const BOOT_LINE_2 = '[●] Loading projects...';

export default function Terminal({ onNavigateToSection, konamiMessage, onKonamiShown }) {
  const [history, setHistory] = useState([{ type: 'output', text: BOOT_LINE_1 }]);
  const [input, setInput] = useState('');
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const scrollContainerRef = useRef(null);
  const inputRef = useRef(null);
  const bootTimeoutsRef = useRef([]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const t1 = setTimeout(() => {
      setHistory((prev) => [...prev, { type: 'output', text: BOOT_LINE_2 }]);
    }, 400);
    const t2 = setTimeout(() => {
      setHistory((prev) => [...prev, { type: 'output', text: WELCOME }]);
    }, 800);
    bootTimeoutsRef.current = [t1, t2];
    return () => bootTimeoutsRef.current.forEach(clearTimeout);
  }, []);

  useLayoutEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const scrollToBottom = () => {
      el.scrollTop = el.scrollHeight;
    };
    scrollToBottom();
    requestAnimationFrame(scrollToBottom);
  }, [history]);

  useEffect(() => {
    if (!konamiMessage) return;
    setHistory((prev) => [...prev, { type: 'output', text: konamiMessage }]);
    onKonamiShown?.();
  }, [konamiMessage, onKonamiShown]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length === 0) return;
      const nextIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex;
      setHistoryIndex(nextIndex);
      setInput(commandHistory[commandHistory.length - 1 - nextIndex] ?? '');
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex <= 0) {
        setHistoryIndex(-1);
        setInput('');
        return;
      }
      const nextIndex = historyIndex - 1;
      setHistoryIndex(nextIndex);
      setInput(commandHistory[commandHistory.length - 1 - nextIndex] ?? '');
      return;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const raw = input.trim();
    if (!raw) return;

    const { command, args } = parseInput(raw);
    let output = execute(command, args);

    if (command === 'clear') {
      setHistory([
        { type: 'output', text: BOOT_LINE_1 },
        { type: 'output', text: BOOT_LINE_2 },
        { type: 'output', text: WELCOME },
      ]);
      setInput('');
      return;
    }

    const sectionId = NAV_COMMANDS[command];
    if (sectionId && onNavigateToSection) {
      onNavigateToSection(sectionId);
      if (output == null) output = `→ ${command}`;
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

  const textColor = 'text-ink';
  const mutedColor = 'text-ink-muted';
  const promptColor = 'text-accent';
  const focusInput = () => inputRef.current?.focus();

  return (
    <div
      role="application"
      aria-label="Terminal"
      onClick={focusInput}
      className="font-mono overflow-hidden cursor-text rounded-lg text-sm sm:text-base bg-surface-bg border border-white/[0.03] h-full flex flex-col min-h-0"
      style={{ minHeight: '320px' }}
    >
      <div className="p-5 pb-3 flex flex-col flex-1 min-h-0" onClick={focusInput}>
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto overflow-x-hidden space-y-1 min-h-0 overscroll-behavior-contain"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {history.map((item, i) => (
            <div key={i} className="break-words">
              {item.type === 'command' ? (
                <div className="flex items-baseline gap-2">
                  <span className={promptColor} aria-hidden>$</span>
                  <span className={textColor}>{item.text}</span>
                </div>
              ) : (
                <pre className={`whitespace-pre-wrap pl-4 ${mutedColor} leading-relaxed`}>{item.text}</pre>
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
