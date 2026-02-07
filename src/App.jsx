import './App.css'
import { FaGithub, FaLinkedin, FaEnvelope, FaJava, FaPython, FaReact, FaHtml5, FaCss3Alt, FaJsSquare, FaDownload } from 'react-icons/fa';
import { SiTypescript, SiFirebase, SiJson } from 'react-icons/si';
import { useEffect, useRef, useState } from 'react';
import NavBar from './components/NavBar';
import ProjectCard from './components/ProjectCard';
import RecentCommitsCard from './components/RecentCommitsCard';

function App() {
  const barRef = useRef(null);
  const lightRef = useRef(null);
  const mousePositionRef = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const sectionRefs = useRef([]);

  // Optimized mouse tracking for background light effect
  useEffect(() => {
    const updateLightPosition = () => {
      if (lightRef.current) {
        const { x, y } = mousePositionRef.current;
        // Use transform for better performance (hardware accelerated)
        lightRef.current.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      }
      animationFrameRef.current = null;
    };

    const handleMouseMove = (e) => {
      // Update ref immediately (no re-render)
      mousePositionRef.current = { x: e.clientX, y: e.clientY };
      
      // Only schedule one animation frame at a time
      if (!animationFrameRef.current) {
        animationFrameRef.current = requestAnimationFrame(updateLightPosition);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Clean highlight bar based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (barRef.current) {
        const scrollY = window.scrollY;
        const scrollHeight = document.body.scrollHeight - window.innerHeight;
        // Clamp highlight between 0 and 1
        const highlight = Math.min(1, Math.max(0, scrollY / scrollHeight));
        // Dynamic gradient based on theme
        if (isDarkMode) {
          barRef.current.style.background = `linear-gradient(to bottom,rgba(20,80,90,0.5) ${highlight * 100}%,rgba(150,230,240,0.35) 100%)`;
        } else {
          barRef.current.style.background = `linear-gradient(to bottom,rgba(100,200,210,0.5) ${highlight * 100}%,rgba(15,60,70,0.4) 100%)`;
        }
        barRef.current.style.boxShadow = 'none';
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isDarkMode]);


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
          const h2 = entry.target.querySelector('h2');
          if (h2) h2.classList.add('animate-section-heading');
        }
      });
    }, observerOptions);

    // Observe all sections: Experience, Tech Stack, Projects, Contributions
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

  // Data arrays for rendering
  const techStack = [
    { icon: FaJava, name: 'Java' },
    { icon: FaPython, name: 'Python' },
    { icon: FaReact, name: 'React' },
    { icon: SiTypescript, name: 'TypeScript' },
    { icon: SiFirebase, name: 'Firebase' },
    { icon: SiJson, name: 'JSON' },
    { icon: FaHtml5, name: 'HTML' },
    { icon: FaCss3Alt, name: 'CSS' },
    { icon: FaJsSquare, name: 'JavaScript' },
  ];

  const experiences = [
    {
      company: 'OCV, LLC',
      title: 'Part-Time Software Engineering Intern',
      location: 'Opelika AL',
      period: 'September 2025 - Present',
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
      media: { type: 'video', url: '/script.mp4' },
    },
    {
      title: 'Personal Portfolio',
      description: 'A modern, minimal portfolio website showcasing my experience, projects, and technical skills. Built with React and Vite, featuring a clean design with smooth animations and responsive layout.',
      tags: ['React', 'JavaScript', 'Tailwind CSS', 'Vite'],
      githubUrl: 'https://github.com/UlissesMolina/Portfolio',
      media: { type: 'video', url: '/portfolio.mp4' },
    },
  ];

  return (
    <div className={`relative min-h-screen overflow-hidden font-sans transition-colors duration-300 ${
      isDarkMode ? 'bg-slate-950' : 'bg-slate-50'
    }`}>
      {/* Background light effect that follows mouse (soft, easy on the eyes) */}
      <div
        ref={lightRef}
        className="mouse-light fixed pointer-events-none z-0"
        style={{
          width: '800px',
          height: '800px',
          background: isDarkMode 
            ? 'radial-gradient(circle, rgba(100, 200, 220, 0.028) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(50, 120, 140, 0.022) 0%, transparent 70%)',
          left: '0px',
          top: '0px',
          willChange: 'transform',
        }}
      />
      {/* Vertical gradient bar */}
      <div
        ref={barRef}
        className="fixed right-0 top-0 h-full w-0.5 transition-all duration-300 z-10"
        style={{ boxShadow: 'none' }}
      />
      <NavBar isDarkMode={isDarkMode} onToggleTheme={toggleTheme} />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-5 z-10">
        {/* Hero: name + socials (only place name appears) */}
        <header className="pt-10 pb-8 flex flex-col items-center gap-4">
          <h1 className={`font-serif text-3xl sm:text-4xl md:text-5xl font-medium text-center transition-colors animate-hero-heading ${
            isDarkMode ? 'text-slate-50' : 'text-slate-900'
          }`}>
            Ulisses Molina-Becerra
          </h1>
          <p className={`text-sm sm:text-base max-w-2xl text-center leading-relaxed transition-colors ${
            isDarkMode ? 'text-slate-400' : 'text-slate-600'
          }`}>
            Sophomore at Auburn University · Software Engineering · Full-stack 
          </p>
          <div className="flex gap-4 items-center justify-center animate-fade-in-up opacity-0" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
            <a href="https://github.com/UlissesMolina" target="_blank" rel="noopener noreferrer" className={`transition-colors duration-200 ${
              isDarkMode ? 'text-teal-400/80 hover:text-teal-300' : 'text-slate-500 hover:text-slate-800'
            }`}>
              <FaGithub size={20} />
            </a>
            <a href="https://www.linkedin.com/in/ulissesmolina" target="_blank" rel="noopener noreferrer" className={`transition-colors duration-200 ${
              isDarkMode ? 'text-teal-400/80 hover:text-teal-300' : 'text-slate-500 hover:text-slate-800'
            }`}>
              <FaLinkedin size={20} />
            </a>
            <a href="mailto:umolina2005@gmail.com" className={`transition-colors duration-200 ${
              isDarkMode ? 'text-teal-400/80 hover:text-teal-300' : 'text-slate-500 hover:text-slate-800'
            }`}>
              <FaEnvelope size={20} />
            </a>
          </div>
        </header>
        <main className="flex flex-col gap-12 sm:gap-16">
          {/* Experience Section — vertical timeline with sidebar + circles */}
          <section
            id="experience"
            ref={el => sectionRefs.current[0] = el}
            className="flex flex-col items-center w-full"
          >
            <h2 className={`font-serif text-xl sm:text-2xl font-medium mb-8 transition-colors ${
              isDarkMode ? 'text-teal-100/90' : 'text-slate-800'
            }`}>Experience</h2>
            <div className="w-full max-w-2xl relative">
              {/* Vertical line: center at 6px so circles (w-3, center 6px) sit on it */}
              <div className={`absolute left-[5px] top-3 bottom-3 w-0.5 rounded-full ${
                isDarkMode ? 'bg-teal-800/50' : 'bg-teal-300/60'
              }`} aria-hidden />
              {experiences.map((exp, index) => (
                <div key={index} className="group/exp relative flex items-center gap-6 pb-10 last:pb-0">
                  {/* Timeline circle: 12px column so circle center aligns with line center (6px) */}
                  <div className="relative z-10 flex w-3 flex-shrink-0 items-center justify-center">
                    <div className={`h-3 w-3 rounded-full border-2 transition-transform duration-200 group-hover/exp:scale-125 ${
                      isDarkMode 
                        ? 'bg-teal-500/90 border-teal-400/60' 
                        : 'bg-teal-400 border-teal-500/80'
                    }`} />
                  </div>
                  {/* Content: hover animation */}
                  <div className={`flex-1 pt-0.5 rounded-lg px-4 py-3 transition-all duration-200 cursor-default
                    hover:scale-[1.01] hover:-translate-y-0.5
                    ${isDarkMode
                      ? 'bg-teal-950/20 border border-teal-900/30 hover:border-teal-700/50 hover:shadow-md hover:shadow-teal-950/30'
                      : 'bg-teal-50/80 border border-teal-200/80 hover:border-teal-300 hover:shadow-md hover:shadow-slate-200/50'
                    }`}
                  >
                    <h3 className={`font-medium mb-0.5 transition-colors ${
                      isDarkMode ? 'text-slate-50' : 'text-slate-900'
                    }`}>
                      {exp.title}
                    </h3>
                    <p className={`text-sm mb-1 transition-colors ${
                      isDarkMode ? 'text-teal-300/80' : 'text-slate-600'
                    }`}>
                      {exp.company} · {exp.location}
                    </p>
                    <p className={`text-xs mb-3 transition-colors ${
                      isDarkMode ? 'text-teal-400/50' : 'text-slate-500'
                    }`}>
                      {exp.period}
                    </p>
                    <ul className={`list-none space-y-1.5 text-xs sm:text-sm transition-colors ${
                      isDarkMode ? 'text-slate-300/70' : 'text-slate-600'
                    }`}>
                      {exp.bullets.map((bullet, idx) => (
                        <li key={idx} className="leading-snug">{bullet}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </section>
          {/* Tech Stack Section */}
          <section
            id="tech-stack"
            ref={el => sectionRefs.current[1] = el}
            className="flex flex-col items-center"
          >
            <h2 className={`font-serif text-xl sm:text-2xl font-medium mb-6 transition-colors ${
              isDarkMode ? 'text-teal-100/90' : 'text-slate-800'
            }`}>Tech Stack</h2>
            <div className="flex flex-wrap justify-center gap-5 sm:gap-6">
              {techStack.map((tech, index) => {
                const Icon = tech.icon;
                return (
                  <div
                    key={index}
                    className={`flex flex-col items-center px-3 py-2 rounded-lg transition-all duration-200 ${
                      isDarkMode ? 'text-teal-300/80 hover:bg-teal-950/30' : 'text-slate-600 hover:bg-teal-100/60'
                    } hover:scale-125 hover:-translate-y-1 cursor-default`}
                  >
                    <Icon className="mb-1 transition-transform duration-200" size={22} />
                    <span className="text-xs sm:text-sm">{tech.name}</span>
                  </div>
                );
              })}
            </div>
          </section>
          {/* Projects Section */}
          <section
            id="projects"
            ref={el => sectionRefs.current[2] = el}
            className="flex flex-col items-center w-full"
          >
            <h2 className={`font-serif text-xl sm:text-2xl font-medium mb-6 transition-colors ${
              isDarkMode ? 'text-teal-100/90' : 'text-slate-800'
            }`}>Projects</h2>
            <div className="grid gap-4 w-full max-w-3xl sm:grid-cols-2">
              {projects.map((project, index) => (
                <ProjectCard key={index} project={project} isDarkMode={isDarkMode} />
              ))}
            </div>
          </section>
          {/* Recent Commits card */}
          <section
            id="contributions"
            ref={el => sectionRefs.current[3] = el}
            className="flex flex-col items-center w-full"
          >
            <h2 className={`font-serif text-xl sm:text-2xl font-medium mb-6 transition-colors ${
              isDarkMode ? 'text-teal-100/90' : 'text-slate-800'
            }`}>Recent Commits</h2>
            <RecentCommitsCard isDarkMode={isDarkMode} />
          </section>
        </main>
        {/* Footer */}
        <footer className={`w-full py-8 mt-12 flex justify-center items-center border-t transition-colors ${
          isDarkMode ? 'border-teal-900/30' : 'border-teal-200/60'
        }`}>
          <span className={`text-xs sm:text-sm transition-colors ${
            isDarkMode ? 'text-slate-500' : 'text-slate-500'
          }`}>&copy; {new Date().getFullYear()} Ulisses Molina-Becerra</span>
        </footer>
      </div>
    </div>
  )
}

export default App

