import { useEffect, useRef, useState } from 'react';

const WELCOME = "Type 'help' to start.";
const WHOAMI_OUTPUT = 'Ulisses Molina — Software Engineering Student';
const ALIASES = { h: 'help', p: 'projects', s: 'skills', c: 'contact', r: 'resume' };

// Commands that can be tab-completed (full names only; aliases complete to full name)
const TAB_COMPLETE_COMMANDS = [
  'help', 'about', 'work', 'projects', 'activity', 'contact', 'open',
  'skills', 'resume', 'clear', 'whoami', 'ls', 'pwd', 'sudo', 'rm', 'connect', 'view',
  'vim', 'exit', 'git', 'cowsay', 'fortune', 'man', 'pip', 'brew', 'npm', 'sl', 'echo',
  'wordle', 'wordplay', 'puzzle',
];

// 5-letter words for wordle easter egg (common, easy to guess)
const WORDLE_WORDS = [
  'crane', 'slice', 'wordy', 'theme', 'batch', 'light', 'might', 'first', 'could', 'would',
  'right', 'think', 'other', 'their', 'there', 'these', 'about', 'which', 'great', 'after',
  'where', 'every', 'never', 'world', 'still', 'while', 'place', 'point', 'thing', 'today',
  'react', 'build', 'stack', 'debug', 'merge', 'patch', 'scope', 'query', 'fetch', 'parse',
];

function getWordleFeedback(guess, target) {
  const g = guess.toLowerCase();
  const t = target.toLowerCase();
  const result = [];
  const used = {};
  for (let i = 0; i < 5; i++) {
    if (g[i] === t[i]) result[i] = '🟩';
    else result[i] = null;
  }
  const targetCount = {};
  for (let i = 0; i < 5; i++) {
    if (result[i] !== '🟩') targetCount[t[i]] = (targetCount[t[i]] || 0) + 1;
  }
  for (let i = 0; i < 5; i++) {
    if (result[i] === '🟩') continue;
    if (targetCount[g[i]] > 0) {
      result[i] = '🟨';
      targetCount[g[i]]--;
    } else result[i] = '⬜';
  }
  return result.join('');
}

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

  whoami   Show name and role
  wordle    Play a quick word game (5 letters, 6 tries)
  Try: work   projects   open github   wordle
  Try some classic unix commands too (ls, pwd, sudo...)`;

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
    case 'whoami':
      return WHOAMI_OUTPUT;
    case 'about':
      return ABOUT_OUTPUT;
    case 'work':
      return null;
    case 'projects':
      return `My projects:
  1. tiger-scheduler - Auto-registration tool for Auburn courses
  2. portfolio - This interactive site

Type 'open <project-name>' to learn more.`;
    case 'open': {
      const name = args[0]?.toLowerCase().replace(/_/g, '-');
      if (name === 'github') return null;
      if (name === 'linkedin') return null;
      if (name && PROJECTS[name]) return PROJECTS[name];
      return `Unknown project. Try: open tiger-scheduler  or  open portfolio`;
    }
    case 'connect':
      if (args[0]?.toLowerCase() === 'linkedin') return null;
      return `Usage: connect linkedin`;
    case 'view':
      if (args[0]?.toLowerCase() === 'resume') return null;
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
    case 'resume':
    case 'clear':
      return null;
    case 'ls':
      return `tiger-scheduler/   portfolio/`;
    case 'pwd':
      return `/home/ulises/hopefully-your-future-company`;
    case 'sudo': {
      if (args[0] === 'rm' && args[1] === '-rf' && (args[2] === '/' || args[2] === '*')) return `Whoa there, calm down.`;
      return `Nice try `;
    }
    case 'rm':
      if (args[0] === '-rf' && (args[1] === '/' || args[1] === '*')) return `Nope, not today.`;
      return `Command not found: rm ${(args.join(' ') || '').trim()}. Type 'help' for available commands.`;
    case 'vim':
      return `You are now stuck in vim. Type :q! to escape... just kidding, there's no escape.\n\n(Actually type :q or :q! to exit.)`;
    case ':q':
    case ':q!':
      return `You escaped. Welcome back.`;
    case 'exit':
      return `Nice try. You're here forever. (Just kidding — use the clear command.)`;
    case '^c':
      return `Process killed... your boredom, hopefully.`;
    case 'chmod':
      if (args[0] === '777') return `Giving everyone permissions to view my code. Bold move.`;
      return `Usage: chmod <mode> <file> (try chmod 777 for a surprise)`;
    case 'man': {
      const topic = args[0]?.toLowerCase() || '';
      const manPages = { work: 'experience', projects: 'projects', contact: 'contact', about: 'about', activity: 'activity' };
      const section = manPages[topic] || topic;
      return `MAN(1)                    Portfolio Manual                    MAN(1)\n\nNAME\n  ${section} — section of this portfolio\n\nSYNOPSIS\n  Scroll up and use the nav, or type '${topic}' in the terminal.\n\nSEE ALSO\n  help(1), whoami(1)`;
    }
    case 'git': {
      const sub = args[0]?.toLowerCase();
      if (sub === 'gud') return `Already am. (github.com/UlissesMolina)`;
      if (sub === 'blame') return `Blaming past me for this bug...`;
      if (sub === 'push' && args[1] === '--force') return `Forcing my way into your company.`;
      if (sub === 'commit') return `The most common commit message in history.`;
      if (sub === 'log') return `Use the 'activity' section or GitHub for the real log.`;
      if (sub === 'rebase') return `Rewriting history... if only I could do this with my GPA.`;
      return `Try: git gud, git blame, git push --force, git rebase`;
    }
    case 'pip':
      if (args[0] === 'install' && args[1] === 'motivation') return `Successfully installed motivation==0.1.0 (expires in 2 hours)`;
      return `Usage: pip install <package> (try pip install motivation)`;
    case 'brew':
      if (args[0] === 'install' && args[1] === 'social-life') return `Warning: Conflicts with software-engineering`;
      return `Usage: brew install <formula> (try brew install social-life)`;
    case 'npm':
      if (args[0] === 'install' && (args[1] === 'girlfriend' || args[1] === 'motivation')) return `npm ERR! 404 Not Found. (Relatable.)`;
      return `Usage: npm install <pkg>`;
    case 'ps':
      if (args[0] === 'aux') return `procrastination.exe   ...  running\nimposter-syndrome    ...  running\ncoffee-addiction      ...  running`;
      return `PID  TTY  TIME  CMD\n  1  ??   0:00  portfolio`;
    case 'top':
      return `Top skill: Googling error messages.`;
    case 'htop':
      return `CPU: 100% talent, 0% available time\nMem: 8G used, 0K free.`;
    case 'df':
      if (args[0] === '-h') return `Disk space: 10% motivation, 90% Stack Overflow tabs.`;
      return `Filesystem  Size  Used  Avail\n/dev/sda1   100%  motivation  StackOverflow`;
    case 'free':
      return `Sorry, I'm not free. But my code is open source.`;
    case 'ping':
      if (args[0]?.includes('google')) return `PONG! ... wait, wrong game.`;
      return `PONG!`;
    case 'curl':
      return `Curling... not my hair, just APIs.`;
    case 'ssh':
      return `Secure Shell? More like Secure Shell Scripts.`;
    case 'ifconfig':
    case 'ipconfig':
      return `Connected to: The Matrix.`;
    case 'sl':
      return `  ___       ___  ___  ___  \n / __|     / __|| __|| __| \n \\__ \\    | (__ | _| | _|  \n |___/     \\___||___||___| \n (You meant 'ls'. Classic.)`;
    case 'cowsay': {
      const msg = args.join(' ') || 'Hire me?';
      const len = Math.min(msg.length, 40);
      const border = '-'.repeat(len + 2);
      return ` ${border}\n< ${msg.slice(0, 40)}${msg.length > 40 ? '...' : ''} >\n ${border}\n        \\   ^__^\n         \\  (oo)\\_______\n            (__)\\       )\\/\\\n                ||----w |\n                ||     ||`;
    }
    case 'fortune': {
      const fortunes = [
        'The best code is no code. The second best is readable code.',
        'I would love to change the world, but they won\'t give me the source code.',
        'Software Engineering: where "it works on my machine" meets "we need it in prod."',
        'Auburn SWE. Open to Summer 2026 internships.',
      ];
      return fortunes[Math.floor(Math.random() * fortunes.length)];
    }
    case 'hack':
      return `Hacking the mainframe... [##########] 100%\nJust kidding. I follow OWASP guidelines.`;
    case 'cat':
      if (args[0]?.toLowerCase()?.includes('resume')) return `%PDF-1.4 garbage binary...\n\nUse the 'resume' command instead.`;
      return `cat: ${args[0] || 'missing file'}: No such file`;
    case 'nano':
      return `Real developers use vim. (Start the editor war.)`;
    case 'emacs':
      return `Vim is better. Fight me.`;
    case 'alias':
      if (args.join(' ').includes('please')) return `Politeness appreciated but not required.`;
      return `alias: usage alias name=value`;
    case 'echo':
      if (args[0] === '$PATH' || args[0] === '$path') return `/home/ulises/skills:/usr/bin/talent:/var/hire-me`;
      return args.join(' ') || '';
    case 'wordle':
    case 'wordplay':
    case 'puzzle':
      return null; /* handled in handleSubmit: starts inline game */
    default:
      return `Command not found: ${command}. Type 'help' for available commands.`;
  }
}

const NAV_COMMANDS = { about: 'about', work: 'experience', projects: 'projects', activity: 'contributions', contact: 'contact' };

const BOOT_LINE_1 = '[●] Initializing portfolio...';
const BOOT_LINE_2 = '[●] Loading projects...';

export default function Terminal({ isDarkMode, onNavigateToSection, konamiMessage, onKonamiShown }) {
  const [history, setHistory] = useState([{ type: 'output', text: BOOT_LINE_1 }]);
  const [input, setInput] = useState('');
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [wordleGame, setWordleGame] = useState(null); // { target, attempts, guesses: [{ word, feedback }] }
  const scrollContainerRef = useRef(null);
  const inputRef = useRef(null);
  const bootTimeoutsRef = useRef([]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Short boot animation: first line already shown, then second line, then welcome
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

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [history]);

  // Konami: append message to terminal when triggered from App
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
    if (e.key === 'Tab') {
      e.preventDefault();
      const first = input.trimStart().split(/\s+/)[0]?.toLowerCase() || '';
      if (!first) return;
      const matches = TAB_COMPLETE_COMMANDS.filter((c) => c.startsWith(first));
      if (matches.length === 1) {
        const rest = input.trimStart().split(/\s+/).slice(1).join(' ');
        setInput(rest ? `${matches[0]} ${rest}` : matches[0]);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const raw = input.trim();
    if (!raw) return;

    // --- Wordle game active: treat input as guess or quit ---
    if (wordleGame) {
      const quit = /^(quit|exit|q)$/i.test(raw);
      if (quit) {
        setHistory((prev) => [
          ...prev,
          { type: 'command', text: raw },
          { type: 'output', text: `Game ended. The word was: ${wordleGame.target.toUpperCase()}` },
        ]);
        setWordleGame(null);
        setCommandHistory((prev) => [...prev, raw].slice(-50));
        setHistoryIndex(-1);
        setInput('');
        return;
      }
      if (raw.length === 5 && /^[a-zA-Z]+$/.test(raw)) {
        const guess = raw.toLowerCase();
        const feedback = getWordleFeedback(guess, wordleGame.target);
        const newGuesses = [...wordleGame.guesses, { word: guess, feedback }];
        const won = guess === wordleGame.target;
        const attemptsLeft = wordleGame.attempts - 1;
        const lost = !won && attemptsLeft === 0;

        const lines = [
          { type: 'command', text: raw },
          { type: 'output', text: feedback },
        ];
        if (won) {
          lines.push({ type: 'output', text: 'You got it! 🎉' });
          setWordleGame(null);
        } else if (lost) {
          lines.push({ type: 'output', text: `The word was: ${wordleGame.target.toUpperCase()}` });
          setWordleGame(null);
        } else {
          lines.push({ type: 'output', text: `${attemptsLeft} attempt${attemptsLeft === 1 ? '' : 's'} remaining.\n\n_ _ _ _ _` });
          setWordleGame({ ...wordleGame, attempts: attemptsLeft, guesses: newGuesses });
        }
        setCommandHistory((prev) => [...prev, raw].slice(-50));
        setHistoryIndex(-1);
        setHistory((prev) => [...prev, ...lines]);
        setInput('');
        return;
      }
      setHistory((prev) => [
        ...prev,
        { type: 'command', text: raw },
        { type: 'output', text: 'Enter a 5-letter word. (type quit to exit)' },
      ]);
      setInput('');
      return;
    }

    const { command, args } = parseInput(raw);
    let output = execute(command, args);

    // --- Start Wordle from command ---
    if ((command === 'wordle' || command === 'wordplay' || command === 'puzzle') && output == null) {
      const target = WORDLE_WORDS[Math.floor(Math.random() * WORDLE_WORDS.length)];
      setWordleGame({ target, attempts: 6, guesses: [] });
      setCommandHistory((prev) => [...prev, raw].slice(-50));
      setHistoryIndex(-1);
      setHistory((prev) => [
        ...prev,
        { type: 'command', text: raw },
        { type: 'output', text: 'Guess the 5-letter word. 6 attempts remaining.\n\n_ _ _ _ _' },
      ]);
      setInput('');
      return;
    }

    if (command === 'clear') {
      setWordleGame(null);
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
      className={`font-mono overflow-hidden cursor-text rounded-lg text-sm sm:text-base ${
        isDarkMode ? 'bg-surface-bg border border-white/[0.03]' : 'bg-slate-900 border border-black/[0.04]'
      }`}
      style={{ minHeight: '420px' }}
    >
      <div className="p-5 pb-3 flex flex-col h-full" onClick={focusInput}>
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto space-y-1 min-h-0">
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
