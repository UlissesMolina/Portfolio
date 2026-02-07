import './App.css'
import { useEffect, useRef, useState } from 'react';
import NavBar from './components/NavBar';
import Terminal from './components/Terminal';
import ProjectCard from './components/ProjectCard';
import RecentCommitsCard from './components/RecentCommitsCard';

const UPTIME_START = new Date('2025-01-15');

function getUptimeDays(start) {
  const now = new Date();
  return Math.floor((now - start) / (1000 * 60 * 60 * 24));
}

const GITHUB_USER = 'UlissesMolina';

function App() {
  const sectionRefs = useRef([]);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [time, setTime] = useState(() => new Date());
  const [commitsThisWeek, setCommitsThisWeek] = useState(null);
  const [expandedExpIndex, setExpandedExpIndex] = useState(null);
  const [activeSection, setActiveSection] = useState('');
  const [terminalFullscreen, setTerminalFullscreen] = useState(false);

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Live commit count for hero hook
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

  // Scroll spy for nav active state
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


  // Fullscreen: block page scroll, Escape to close
  useEffect(() => {
    if (!terminalFullscreen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') setTerminalFullscreen(false); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [terminalFullscreen]);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  // Scroll animations for sections
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

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const experiences = [
    {
      company: 'OCV, LLC',
      title: 'Part-Time Software Engineering Intern',
      location: 'Opelika AL',
      period: 'September 2025 - Present',
      logo: 'OCV', // initials or logo URL
      tech: ['JSON', 'iOS', 'Android', 'QC'],
      bullets: [
        '• Built and configured client mobile apps using OCV\'s proprietary platform and formatted JSON structures',
        '• Implemented client requests by updating app content, configurations, and feature settings through internal tools',
        '• Performed quality control (QC) testing to ensure app functionality and UI consistency before release',
        '• Collaborated with developers, operations, and graphics teams to manage app updates and production issues',
        '• Released and maintained iOS and Android apps on the App Store and Google Play Console, ensuring smooth deployment and version tracking',
      ],
    },
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
        '• Fixed bugs and improved code quality by debugging React hooks and shared application state',
        '• Collaborated with engineers through Jira tickets, pull requests, and code reviews in an agile workflow',
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
      featured: true,
      status: 'Status: ● Running',
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
      title: 'Personal Portfolio',
      description: 'A modern, minimal portfolio website showcasing my experience, projects, and technical skills. Built with React and Vite, featuring a clean design with smooth animations and responsive layout.',
      tags: ['React', 'JavaScript', 'Tailwind CSS', 'Vite'],
      githubUrl: 'https://github.com/UlissesMolina/Portfolio',
      demoUrl: null,
      media: { type: 'video', url: '/portfolio.mp4' },
      featured: false,
      snippet: `export default function App() {
  const [terminalFullscreen, setTerminalFullscreen] = useState(false)
  return (
    <>
      <Terminal
        onNavigateToSection={scrollToSection}
        onEnterFullscreen={() => setTerminalFullscreen(true)}
      />
      <Section $="work" />
      <Section $="projects" />
      <Section $="activity" />
    </>
  )
}`,
    },
  ];

  return (
    <div className={`relative min-h-screen font-sans transition-colors duration-300 ${
      isDarkMode ? 'bg-surface-grid' : 'bg-slate-100'
    }`}>
      <NavBar isDarkMode={isDarkMode} onToggleTheme={toggleTheme} activeSection={activeSection} />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-5 z-10 flex flex-col">
        {/* Terminal hero — minimal gap so sections feel like continuous output */}
        <header id="about" className="pt-12 pb-6 scroll-mt-[5rem]">
          <div
            className={terminalFullscreen
              ? 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75'
              : 'w-full max-w-3xl mx-auto'
            }
            onClick={terminalFullscreen ? () => setTerminalFullscreen(false) : undefined}
          >
            <div
              className={terminalFullscreen
                ? 'w-full max-w-3xl max-h-[80vh] flex flex-col rounded-xl overflow-hidden border border-surface-border shadow-2xl bg-surface-bg'
                : 'w-full'
              }
              onClick={terminalFullscreen ? (e) => e.stopPropagation() : undefined}
            >
              {terminalFullscreen && (
                <div className="flex items-center justify-end px-4 py-2 border-b border-surface-border bg-surface-card/80">
                  <button
                    type="button"
                    onClick={() => setTerminalFullscreen(false)}
                    className="text-ink-muted hover:text-ink font-mono text-sm"
                    aria-label="Close fullscreen"
                  >
                    esc
                  </button>
                </div>
              )}
              <div className={terminalFullscreen ? 'flex-1 min-h-0 flex flex-col' : ''}>
                <Terminal
                  isDarkMode={isDarkMode}
                  onNavigateToSection={scrollToSection}
                  onEnterFullscreen={() => setTerminalFullscreen(true)}
                  onExitFullscreen={() => setTerminalFullscreen(false)}
                  isFullscreen={terminalFullscreen}
                />
              </div>
            </div>
            {/* Mobile: tap commands so small screens can navigate without typing */}
            <div className="md:hidden mt-3 flex flex-wrap gap-2 justify-center">
              {[
                { label: 'work', id: 'experience' },
                { label: 'projects', id: 'projects' },
                { label: 'activity', id: 'contributions' },
                { label: 'contact', id: 'contact' },
              ].map(({ label, id }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => scrollToSection(id)}
                  className={`font-mono text-xs px-3 py-2 rounded-md border transition-colors ${
                    isDarkMode
                      ? 'border-surface-border text-ink-muted hover:border-accent/50 hover:text-accent'
                      : 'border-slate-300 text-slate-600 hover:border-accent hover:text-accent'
                  }`}
                >
                  $ {label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => window.open('/UlissesResume%20(5).pdf', '_blank')}
                className={`font-mono text-xs px-3 py-2 rounded-md border transition-colors ${
                  isDarkMode
                    ? 'border-surface-border text-ink-muted hover:border-accent/50 hover:text-accent'
                    : 'border-slate-300 text-slate-600 hover:border-accent hover:text-accent'
                }`}
              >
                $ resume
              </button>
            </div>
          </div>
        </header>
        {/* Visual connector: terminal output flows into sections */}
        <div className="w-full max-w-3xl mx-auto" aria-hidden>
          <div className={`h-6 w-px ml-[0.6rem] rounded-full animate-connector-flow ${
            isDarkMode ? 'bg-gradient-to-b from-accent/50 to-transparent' : 'bg-gradient-to-b from-accent/40 to-transparent'
          }`} />
        </div>
        <main className="flex flex-col gap-16 sm:gap-20">
          {/* Work — terminal-style header then timeline */}
          <section
            id="experience"
            ref={el => sectionRefs.current[0] = el}
            className="flex flex-col items-start w-full opacity-0"
          >
            <div className={`font-mono text-sm sm:text-base mb-2 ${isDarkMode ? 'text-ink' : 'text-slate-800'}`}>
              <div className="flex items-baseline gap-2">
                <span className="text-accent select-none">$</span>
                <span>work</span>
              </div>
              <div className={`pl-4 mt-0.5 ${isDarkMode ? 'text-ink-muted' : 'text-slate-500'}`}>→ work</div>
            </div>
            <div className={`w-full border-t mb-8 ${isDarkMode ? 'border-surface-border' : 'border-slate-200'}`} style={{ maxWidth: '32rem' }} />
            <div className="w-full max-w-2xl relative">
              <div className={`absolute left-[7px] top-4 bottom-4 w-0.5 rounded-full ${
                isDarkMode ? 'bg-accent/40' : 'bg-accent/30'
              }`} aria-hidden />
              {experiences.map((exp, index) => {
                const isExpanded = expandedExpIndex === index;
                const hasMore = exp.bullets.length > 1;
                return (
                  <div key={index} className="group/exp relative flex items-start gap-5 pb-10 last:pb-0">
                    <div className="relative z-10 flex w-4 flex-shrink-0 items-center justify-center pt-1">
                      <div className={`h-4 w-4 rounded-full border-2 animate-dot-pulse transition-all duration-200 group-hover/exp:scale-125 ${
                        isDarkMode ? 'bg-accent border-accent/60' : 'bg-accent border-accent/70'
                      }`} />
                    </div>
                    <div className={`flex-1 rounded-lg px-4 py-3 transition-all duration-200
                      ${isDarkMode
                        ? 'bg-surface-card border border-surface-border hover:border-accent/30'
                        : 'bg-white/80 border border-slate-200 hover:border-accent/40'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-xs font-semibold ${
                          isDarkMode ? 'bg-surface-border text-accent' : 'bg-accent/10 text-accent'
                        }`}>
                          {exp.logo}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className={`font-medium mb-0.5 flex items-center gap-2 transition-colors ${
                            isDarkMode ? 'text-ink' : 'text-slate-900'
                          }`}>
                            {exp.period.toLowerCase().includes('present') && (
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" aria-hidden title="Current role" />
                            )}
                            {exp.title}
                          </h3>
                          <p className={`text-sm mb-1 transition-colors ${
                            isDarkMode ? 'text-ink-muted' : 'text-slate-600'
                          }`}>
                            {exp.company} · {exp.location}
                          </p>
                          <p className={`text-xs font-mono mb-2 transition-colors ${
                            isDarkMode ? 'text-ink-dim' : 'text-slate-500'
                          }`}>
                            {exp.period}
                          </p>
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {exp.tech.map((t) => (
                              <span
                                key={t}
                                className={`text-[10px] px-2 py-0.5 rounded-full ${
                                  isDarkMode ? 'bg-surface-border text-accent/90' : 'bg-accent/10 text-accent'
                                }`}
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <ul className={`list-none space-y-1.5 text-xs sm:text-sm transition-colors ${
                        isDarkMode ? 'text-ink-muted' : 'text-slate-600'
                      }`}>
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
                                className={`text-xs font-medium transition-colors ${
                                  isDarkMode ? 'text-accent hover:text-accent-light' : 'text-accent hover:text-accent-dark'
                                }`}
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
          {/* Projects — terminal-style header */}
          <section
            id="projects"
            ref={el => sectionRefs.current[1] = el}
            className="flex flex-col items-start w-full opacity-0"
          >
            <div className={`font-mono text-sm sm:text-base mb-2 ${isDarkMode ? 'text-ink' : 'text-slate-800'}`}>
              <div className="flex items-baseline gap-2">
                <span className="text-accent select-none">$</span>
                <span>cat projects/</span>
              </div>
              <div className={`pl-4 mt-0.5 ${isDarkMode ? 'text-ink-muted' : 'text-slate-500'}`}>→ projects</div>
            </div>
            <div className={`w-full border-t mb-8 ${isDarkMode ? 'border-surface-border' : 'border-slate-200'}`} style={{ maxWidth: '32rem' }} />
            <div className="flex flex-col gap-6 w-full max-w-3xl">
              {projects.filter(p => p.featured).map((project, index) => (
                <ProjectCard
                  key={`f-${index}`}
                  project={project}
                  isDarkMode={isDarkMode}
                  roundedClass="rounded-xl"
                  featured={true}
                />
              ))}
              <div className="grid gap-5 grid-cols-1 sm:grid-cols-2">
                {projects.filter(p => !p.featured).map((project, index) => (
                  <ProjectCard
                    key={index}
                    project={project}
                    isDarkMode={isDarkMode}
                    roundedClass="rounded-lg"
                    featured={false}
                  />
                ))}
              </div>
            </div>
          </section>
          {/* Recent activity — styled as terminal log inside card */}
          <section
            id="contributions"
            ref={el => sectionRefs.current[2] = el}
            className="flex flex-col items-start w-full opacity-0"
          >
            <div className={`font-mono text-sm sm:text-base mb-2 ${isDarkMode ? 'text-ink' : 'text-slate-800'}`}>
              <div className="flex items-baseline gap-2">
                <span className="text-accent select-none">$</span>
                <span>tail -f activity.log</span>
              </div>
              <div className={`pl-4 mt-0.5 ${isDarkMode ? 'text-ink-muted' : 'text-slate-500'}`}>→ activity</div>
            </div>
            <div className={`w-full border-t mb-6 ${isDarkMode ? 'border-surface-border' : 'border-slate-200'}`} style={{ maxWidth: '32rem' }} />
            <div className="w-full max-w-xl">
              <RecentCommitsCard isDarkMode={isDarkMode} roundedClass="rounded-lg" />
            </div>
          </section>
        </main>
        {/* Contact — terminal-style header */}
        <footer
          id="contact"
          className={`w-full py-16 mt-8 flex flex-col items-center gap-8 border-t transition-colors scroll-mt-[5rem] ${
            isDarkMode ? 'border-surface-border' : 'border-slate-200'
          }`}
        >
          <div className={`font-mono text-sm sm:text-base text-center mb-2 ${isDarkMode ? 'text-ink' : 'text-slate-800'}`}>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-accent select-none">$</span>
              <span>open contact.txt</span>
            </div>
            <div className={`pl-4 mt-0.5 ${isDarkMode ? 'text-ink-muted' : 'text-slate-500'}`}>→ contact</div>
          </div>
          <div className={`w-full border-t mb-8 max-w-md ${isDarkMode ? 'border-surface-border' : 'border-slate-200'}`} />
          <p className={`font-mono text-sm sm:text-base text-center max-w-md transition-colors ${
            isDarkMode ? 'text-ink-muted' : 'text-slate-600'
          }`}>
            Available for part-time work.
            <br />
            <span className={isDarkMode ? 'text-ink' : 'text-slate-800'}>Let&apos;s build something.</span>
          </p>
          <a
            href="mailto:umolina2005@gmail.com"
            className={`text-lg sm:text-xl font-medium transition-colors hover:underline ${
              isDarkMode ? 'text-accent hover:text-accent-light' : 'text-accent hover:text-accent-dark'
            }`}
          >
            umolina2005@gmail.com
          </a>
          <div className="font-mono flex flex-col items-center gap-2 text-base sm:text-lg">
            <a
              href="https://github.com/UlissesMolina"
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-2 transition-colors hover:translate-x-1 ${
                isDarkMode ? 'text-ink-muted hover:text-accent' : 'text-slate-500 hover:text-accent'
              }`}
              aria-label="Open GitHub"
            >
              <span className="text-accent select-none">$</span>
              <span>open github</span>
            </a>
            <a
              href="https://www.linkedin.com/in/ulissesmolina"
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-2 transition-colors hover:translate-x-1 ${
                isDarkMode ? 'text-ink-muted hover:text-accent' : 'text-slate-500 hover:text-accent'
              }`}
              aria-label="Connect on LinkedIn"
            >
              <span className="text-accent select-none">$</span>
              <span>connect linkedin</span>
            </a>
            <a
              href="/UlissesResume%20(5).pdf"
              download="UlissesResume.pdf"
              className={`flex items-center gap-2 transition-colors hover:translate-x-1 ${
                isDarkMode ? 'text-ink-muted hover:text-accent' : 'text-slate-500 hover:text-accent'
              }`}
              aria-label="View resume"
            >
              <span className="text-accent select-none">$</span>
              <span>view resume</span>
            </a>
          </div>
          <span className={`text-[10px] font-mono tabular-nums transition-colors ${
            isDarkMode ? 'text-ink-dim' : 'text-slate-400'
          }`} title="Easter egg">
            Up {getUptimeDays(UPTIME_START)}d · {time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true })}
          </span>
        </footer>
      </div>
    </div>
  )
}

export default App

