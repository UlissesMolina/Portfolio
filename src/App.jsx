import './App.css'
import { useEffect, useRef, useState } from 'react';
import NavBar from './components/NavBar';
import Terminal from './components/Terminal';
import ProjectCard from './components/ProjectCard';
import RecentCommitsCard from './components/RecentCommitsCard';
import ParticleNetwork from './components/ParticleNetwork';

const GITHUB_USER = 'UlissesMolina';

function formatSessionTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const s = totalSeconds % 60;
  const m = Math.floor(totalSeconds / 60) % 60;
  const h = Math.floor(totalSeconds / 3600);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function App() {
  const sectionRefs = useRef([]);
  const sessionStartRef = useRef(Date.now());
  const [time, setTime] = useState(() => new Date());
  const [commitsThisWeek, setCommitsThisWeek] = useState(null);
  const [expandedExpIndex, setExpandedExpIndex] = useState(null);
  const [activeSection, setActiveSection] = useState('');
  const [loadingBarActive, setLoadingBarActive] = useState(false);
  const [theme, setTheme] = useState('coral');
  const [konamiMessage, setKonamiMessage] = useState(null);
  const [terminalOverlayOpen, setTerminalOverlayOpen] = useState(false);
  const [terminalOverlayClosing, setTerminalOverlayClosing] = useState(false);
  const [heroCardAnimated, setHeroCardAnimated] = useState(false);
  const terminalCloseTimeoutRef = useRef(null);

  const closeTerminalOverlay = () => {
    if (terminalOverlayClosing) return;
    setTerminalOverlayClosing(true);
    terminalCloseTimeoutRef.current = setTimeout(() => {
      setTerminalOverlayOpen(false);
      setTerminalOverlayClosing(false);
      terminalCloseTimeoutRef.current = null;
    }, 260);
  };

  const scrollToSection = (id) => {
    setLoadingBarActive(true);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!loadingBarActive) return;
    const t = setTimeout(() => setLoadingBarActive(false), 500);
    return () => clearTimeout(t);
  }, [loadingBarActive]);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const since = weekAgo.toISOString().split('T')[0];
    fetch(`https://api.github.com/repos/${GITHUB_USER}/Portfolio/commits?per_page=100&since=${weekAgo.toISOString()}`, {
      headers: { Accept: 'application/vnd.github.v3+json' },
    })
      .then((res) => res.ok ? res.json() : [])
      .then((data) => {
        if (!cancelled && Array.isArray(data)) setCommitsThisWeek(data.length);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const ids = ['about', 'experience', 'projects', 'contact'];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          if (ids.includes(id)) setActiveSection(id);
        });
      },
      { rootMargin: '-30% 0px -60% 0px', threshold: 0 }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);


  useEffect(() => {
    return () => {
      if (terminalCloseTimeoutRef.current) clearTimeout(terminalCloseTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const t = requestAnimationFrame(() => {
      setHeroCardAnimated(true);
    });
    return () => cancelAnimationFrame(t);
  }, []);

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme === 'monokai' ? 'coral' : theme);
  }, [theme]);

  const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  useEffect(() => {
    let idx = 0;
    const onKey = (e) => {
      const key = e.key.toLowerCase() === 'a' ? 'a' : e.key;
      if (key === KONAMI[idx]) {
        idx += 1;
        if (idx === KONAMI.length) {
          setKonamiMessage(" No way you tried the Konami code.");
          idx = 0;
        }
      } else {
        idx = 0;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in');
          entry.target.classList.remove('opacity-0');
        }
      });
    }, observerOptions);

    sectionRefs.current.forEach(ref => {
      if (ref) observer.observe(ref);
    });

    return () => {
      sectionRefs.current.forEach(ref => {
        if (ref) observer.unobserve(ref);
      });
      observer.disconnect();
    };
  }, []);

  const experiences = [
    {
      company: 'Room2Room Movers',
      title: 'Part-Time Software Engineering Intern',
      location: 'Auburn AL',
      period: 'January 2026 - Present',
      logo: 'R2R',
      tech: ['React', 'TypeScript', 'Firebase', 'Jira'],
      bullets: [
        '• Developed and maintained application features using React and TypeScript in a production codebase',
        '• Implemented and updated Firebase-backed backend logic and API endpoints to support application functionality',
        '• Worked with authentication, configuration data, and state management across frontend and backend',
        '• Collaborated with engineers through Jira tickets, pull requests, and code reviews in an agile workflow',
        '• Fixed bugs and improved code quality by debugging React hooks and shared application state',
      ],
    },
    {
      company: 'OCV, LLC',
      title: 'Part-Time Software Engineering Intern',
      location: 'Opelika AL',
      period: 'September 2025 - Present',
      logo: 'OCV',
      tech: ['JSON', 'iOS', 'Android', 'QC'],
      bullets: [
        '• Released and maintained iOS and Android apps on the App Store and Google Play Console, ensuring smooth deployment and version tracking',
        '• Built and configured client mobile apps using OCV\'s proprietary platform and formatted JSON structures',
        '• Implemented client requests by updating app content, configurations, and feature settings through internal tools',
        '• Performed quality control (QC) testing to ensure app functionality and UI consistency before release',
        '• Collaborated with developers, operations, and graphics teams to manage app updates and production issues',
      ],
    },
  ];

  const projects = [
    {
      title: 'Tiger Scheduler Course Auto-Register Tool',
      description: 'A Python automation script that monitors course availability on Auburn University\'s TigerScheduler platform. Automatically checks for open seats every minute, filters courses, and handles auto-login and registration actions.',
      tags: ['Python', 'Selenium', 'Web Automation'],
      githubUrl: 'https://github.com/UlissesMolina/Tiger-Scheduler-Course-Auto-Register-Tool',
      demoUrl: null,
      media: { type: 'video', url: '/script.mp4' },
      featured: false,
      snippet: `from selenium import webdriver

while True:
  seats = check_availability(course_id)
  if seats > 0:
    driver.find_element(By.ID, "register").click()
    register(course)
    send_notification()
  time.sleep(poll_interval)`,
    },
    {
      title: 'Clarity Finance',
      description: 'See your money clearly. Track your income, expenses, and savings in one place.',
      tags: ['React', 'TypeScript', 'CSS'],
      githubUrl: 'https://github.com/UlissesMolina/FinanceDashBoard',
      demoUrl: 'https://clarityfi.netlify.app/',
      media: null,
      featured: false,
      snippet: `function Dashboard() {
  const [data, setData] = useState<FinanceData | null>(null);
  useEffect(() => fetchFinanceData().then(setData), []);
  return (
    <div className="dashboard">
      <SummaryCards data={data} />
      <Charts data={data} />
    </div>
  ); }`,
    },
  ];

  return (
    <div className="relative min-h-screen font-sans transition-colors duration-300 bg-surface-grid">
      <ParticleNetwork />
      {loadingBarActive && <div className="load-bar" aria-hidden="true" />}
      <NavBar
        activeSection={activeSection}
        time={time}
        theme={theme}
        onThemeChange={setTheme}
      />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-5 z-10 flex flex-col">
        <header id="about" className="pt-12 pb-6 scroll-mt-[5rem]">
          <div className="w-full max-w-3xl mx-auto">
            <div className="max-w-3xl mx-auto mt-12 space-y-8">
              <div className={`bg-surface-bg border border-white/[0.03] rounded-lg p-8 ${heroCardAnimated ? 'animate-fade-in' : 'opacity-0'}`}>
                <h2 className="text-2xl font-bold text-ink mb-4">Ulisses Molina</h2>
                <p className="text-ink-muted text-lg mb-6">
                  Software Engineering @ Auburn University
                  <br />
                  Building tools with React, TypeScript, and Python.
                  <br />
                  Open to Summer 2026 SWE internships (full-stack, automation, web dev).
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => scrollToSection('experience')}
                    className="px-4 py-2 bg-accent/10 hover:bg-accent/20 text-accent rounded font-medium transition-colors"
                  >
                    View Work
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollToSection('projects')}
                    className="px-4 py-2 bg-accent/10 hover:bg-accent/20 text-accent rounded font-medium transition-colors"
                  >
                    See Projects
                  </button>
                  <button
                    type="button"
                    onClick={() => window.open('/uliResume.pdf', '_blank')}
                    className="px-4 py-2 bg-accent/10 hover:bg-accent/20 text-accent rounded font-medium transition-colors"
                  >
                    View Resume
                  </button>
                  <button
                    type="button"
                    onClick={() => setTerminalOverlayOpen(true)}
                    className="px-4 py-2 bg-accent/10 hover:bg-accent/20 text-accent rounded font-medium transition-colors flex items-center gap-2"
                    aria-label="Open terminal"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0" aria-hidden>
                      <path opacity="0.1" d="M3 8C3 6.11438 3 5.17157 3.58579 4.58579C4.17157 4 5.11438 4 7 4H12H17C18.8856 4 19.8284 4 20.4142 4.58579C21 5.17157 21 6.11438 21 8V12V16C21 17.8856 21 18.8284 20.4142 19.4142C19.8284 20 18.8856 20 17 20H12H7C5.11438 20 4.17157 20 3.58579 19.4142C3 18.8284 3 17.8856 3 16V12V8Z" fill="currentColor" />
                      <path d="M13 15H16" />
                      <path d="M8 15L10.5 12.5V12.5C10.7761 12.2239 10.7761 11.7761 10.5 11.5V11.5L8 9" />
                      <path d="M3 8C3 6.11438 3 5.17157 3.58579 4.58579C4.17157 4 5.11438 4 7 4H12H17C18.8856 4 19.8284 4 20.4142 4.58579C21 5.17157 21 6.11438 21 8V12V16C21 17.8856 21 18.8284 20.4142 19.4142C19.8284 20 18.8856 20 17 20H12H7C5.11438 20 4.17157 20 3.58579 19.4142C3 18.8284 3 17.8856 3 16V12V8Z" />
                    </svg>
                    Terminal
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>
        <main className="flex flex-col gap-16 sm:gap-20">
          <section
            id="experience"
            ref={el => sectionRefs.current[0] = el}
            className="flex flex-col items-start w-full opacity-0"
          >
            <div className={`font-mono text-sm sm:text-base mb-2 text-ink`}>
              <div className="flex items-baseline gap-2">
                <span className="text-accent select-none">$</span>
                <span>work</span>
              </div>
              <div className={`pl-4 mt-0.5 text-ink-muted`}>→ work</div>
            </div>
            <div className={`w-full border-t mb-8 border-surface-border`} style={{ maxWidth: '32rem' }} />
            <div className="w-full max-w-2xl">
              {experiences.map((exp, index) => {
                const isExpanded = expandedExpIndex === index;
                const hasMore = exp.bullets.length > 1;
                const isLast = index === experiences.length - 1;
                return (
                  <div key={index} className="group/exp relative flex items-stretch gap-5 pb-10 last:pb-0">
                    <div className="relative flex w-4 flex-shrink-0 flex-col items-center pt-1">
                      <div className="relative z-[2] h-4 w-4 rounded-full border-2 animate-dot-pulse transition-all duration-200 group-hover/exp:scale-125 bg-accent border-accent/60" />
                      {!isLast && (
                        <div className="timeline-connector z-0" aria-hidden />
                      )}
                    </div>
                    <div className={`flex-1 rounded-lg px-4 py-3 transition-all duration-200
                      bg-surface-card border border-surface-border hover:border-accent/30`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-xs font-semibold bg-surface-border text-accent">
                          {exp.logo}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className={`font-medium mb-0.5 flex items-center gap-2 transition-colors text-ink`}>
                            {exp.period.toLowerCase().includes('present') && (
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" aria-hidden title="Current role" />
                            )}
                            {exp.title}
                          </h3>
                          <p className={`text-sm mb-1 transition-colors text-ink-muted`}>
                            {exp.company} · {exp.location}
                          </p>
                          <p className={`text-xs font-mono mb-2 transition-colors text-ink-muted`}>
                            {exp.period}
                          </p>
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {exp.tech.map((t) => (
                              <span
                                key={t}
                                className="text-[10px] px-2 py-0.5 rounded-full bg-accent/15 text-accent-light"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <ul className="list-none space-y-1.5 text-xs sm:text-sm transition-colors text-ink-muted">
                        <li className="leading-snug">{exp.bullets[0]}</li>
                        {hasMore && (
                          <>
                            <div className={`expandable-content ${isExpanded ? 'expanded' : ''}`}>
                              <div>
                                {exp.bullets.slice(1).map((bullet, idx) => (
                                  <li key={idx} className="leading-snug pt-0.5">{bullet}</li>
                                ))}
                              </div>
                            </div>
                            <li>
                              <button
                                type="button"
                                onClick={() => setExpandedExpIndex(isExpanded ? null : index)}
                                className="text-xs font-medium transition-colors text-accent hover:text-accent-light"
                              >
                                {isExpanded ? 'Show less' : `${exp.bullets.length - 1} more`}
                              </button>
                            </li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
          <section
            id="projects"
            ref={el => sectionRefs.current[1] = el}
            className="flex flex-col items-start w-full opacity-0"
          >
            <div className={`font-mono text-sm sm:text-base mb-2 text-ink`}>
              <div className="flex items-baseline gap-2">
                <span className="text-accent select-none">$</span>
                <span>cat projects/</span>
              </div>
              <div className={`pl-4 mt-0.5 text-ink-muted`}>→ projects</div>
            </div>
            <div className={`w-full border-t mb-8 border-surface-border`} style={{ maxWidth: '32rem' }} />
            <div className="grid gap-5 w-full max-w-3xl grid-cols-1 sm:grid-cols-2">
              {projects.map((project, index) => (
                <ProjectCard
                  key={index}
                  project={project}
                  roundedClass="rounded-lg"
                  featured={project.featured}
                />
              ))}
            </div>
          </section>
          <section
            id="contributions"
            ref={el => sectionRefs.current[2] = el}
            className="flex flex-col items-start w-full opacity-0"
          >
            <div className={`font-mono text-sm sm:text-base mb-2 text-ink`}>
              <div className="flex items-baseline gap-2">
                <span className="text-accent select-none">$</span>
                <span>tail -f activity.log</span>
              </div>
              <div className={`pl-4 mt-0.5 text-ink-muted`}>→ activity</div>
            </div>
            <div className={`w-full border-t mb-6 border-surface-border`} style={{ maxWidth: '32rem' }} />
            <div className="w-full max-w-xl">
              <RecentCommitsCard theme={theme} roundedClass="rounded-lg" />
            </div>
          </section>
        </main>
        <footer
          id="contact"
          className="w-full py-16 mt-8 flex flex-col items-center gap-10 border-t transition-colors scroll-mt-[5rem] border-surface-border"
        >
          <div className="w-full max-w-md font-mono text-sm sm:text-base text-ink-muted">
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-accent select-none">&gt;</span>
              <span className="text-ink">contact</span>
            </div>
            <div className="pl-4 space-y-1.5">
              <p>Email: <a href="mailto:umolina2005@gmail.com" className="font-medium hover:underline text-accent hover:text-accent-light">umolina2005@gmail.com</a></p>
              <p>GitHub: <a href="https://github.com/UlissesMolina" target="_blank" rel="noopener noreferrer" className="font-medium hover:underline text-accent hover:text-accent-light">github.com/UlissesMolina</a></p>
              <p>LinkedIn: <a href="https://www.linkedin.com/in/ulissesmolina" target="_blank" rel="noopener noreferrer" className="font-medium hover:underline text-accent hover:text-accent-light">linkedin.com/in/ulissesmolina</a></p>
              <p>Resume: <a href="/uliResume.pdf" download="uliResume.pdf" className="font-medium hover:underline text-accent hover:text-accent-light">Resume (PDF)</a></p>
            </div>
          </div>
          <span className="text-[10px] font-mono tabular-nums transition-colors text-ink-dim" title="Visitor session">
            Session {formatSessionTime(time.getTime() - sessionStartRef.current)} · {time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true })}
          </span>
        </footer>
      </div>

      {terminalOverlayOpen && (
        <div
          className={`terminal-overlay ${terminalOverlayClosing ? 'terminal-overlay--closing' : ''}`}
          aria-modal="true"
          role="dialog"
          aria-label="Terminal overlay"
          onClick={closeTerminalOverlay}
        >
          <div
            className="terminal-overlay__panel bg-surface-bg border border-white/[0.08]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-end gap-2 px-4 py-2 border-b border-white/[0.06] bg-surface-bg/80">
              <button
                type="button"
                onClick={closeTerminalOverlay}
                className="font-mono text-xs px-3 py-1.5 rounded border border-surface-border text-ink-muted hover:border-accent/50 hover:text-accent transition-colors"
                aria-label="Close terminal"
              >
                Close
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-hidden" style={{ minHeight: '400px' }}>
              <Terminal
                onNavigateToSection={(id) => {
                  scrollToSection(id);
                  closeTerminalOverlay();
                }}
                konamiMessage={konamiMessage}
                onKonamiShown={() => setKonamiMessage(null)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App

