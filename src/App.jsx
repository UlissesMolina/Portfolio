import './App.css'
import { FaGithub, FaLinkedin, FaEnvelope, FaJava, FaPython, FaReact, FaHtml5, FaCss3Alt, FaJsSquare, FaDownload } from 'react-icons/fa';
import { SiTypescript, SiFirebase, SiJson } from 'react-icons/si';
import { FaMoon, FaSun } from 'react-icons/fa';
import { useEffect, useRef, useState, useMemo } from 'react';

function App() {
  const barRef = useRef(null);
  const lightRef = useRef(null);
  const mousePositionRef = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef(null);
  const [selectedExperience, setSelectedExperience] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [contributions, setContributions] = useState({});
  const [loading, setLoading] = useState(true);
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
          barRef.current.style.background = `linear-gradient(to bottom,rgb(68, 68, 68) ${highlight * 100}%,rgb(255, 255, 255) 100%)`;
        } else {
          barRef.current.style.background = `linear-gradient(to bottom,rgb(200, 200, 200) ${highlight * 100}%,rgb(50, 50, 50) 100%)`;
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
        }
      });
    }, observerOptions);

    // Observe all sections: About, Experience, Tech Stack, Projects, Contributions
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

  // Fetch GitHub contributions - uses GraphQL API for private repos if token available
  useEffect(() => {
    const fetchContributions = async () => {
      setLoading(true);
      try {
        const username = 'UlissesMolina';
        const token = import.meta.env.VITE_GITHUB_TOKEN;
        const contributionData = {};
        
        const today = new Date();
        const oneYearAgo = new Date(today);
        oneYearAgo.setFullYear(today.getFullYear() - 1);
        oneYearAgo.setHours(0, 0, 0, 0);

        // Try GraphQL API first (includes private repos if token is provided)
        if (token) {
          try {
            const query = `
              query($username: String!, $from: DateTime!, $to: DateTime!) {
                user(login: $username) {
                  contributionsCollection(from: $from, to: $to) {
                    contributionCalendar {
                      weeks {
                        contributionDays {
                          date
                          contributionCount
                        }
                      }
                    }
                  }
                }
              }
            `;

            const response = await fetch('https://api.github.com/graphql', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                query,
                variables: {
                  username,
                  from: oneYearAgo.toISOString(),
                  to: today.toISOString(),
                },
              }),
            });

            const data = await response.json();
            
            if (data.errors) {
              throw new Error(data.errors[0].message);
            }

            if (data.data?.user?.contributionsCollection?.contributionCalendar?.weeks) {
              data.data.user.contributionsCollection.contributionCalendar.weeks.forEach(week => {
                week.contributionDays.forEach(day => {
                  contributionData[day.date] = day.contributionCount;
                });
              });
              
              setContributions(contributionData);
              setLoading(false);
              return; // Successfully fetched, exit early
            }
          } catch (error) {
            console.error('GraphQL API failed, falling back to public API:', error);
            // Fall through to public API fallback
          }
        }

        // Fallback to public events API (public repos only)
        let page = 1;
        let hasMore = true;
        const maxPages = 10;
        
        while (hasMore && page <= maxPages) {
          const response = await fetch(
            `https://api.github.com/users/${username}/events/public?per_page=100&page=${page}`
          );
          
          if (!response.ok) break;
          
          const events = await response.json();
          if (events.length === 0) {
            hasMore = false;
            break;
          }
          
          events.forEach(event => {
            if (event.created_at) {
              const date = event.created_at.split('T')[0];
              contributionData[date] = (contributionData[date] || 0) + 1;
            }
          });
          
          page++;
        }

        setContributions(contributionData);
      } catch (error) {
        console.error('Error fetching contributions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContributions();
  }, []);

  // Generate calendar weeks - memoized for performance
  const calendarWeeks = useMemo(() => {
    const weeks = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    oneYearAgo.setDate(oneYearAgo.getDate() - 1); // Go back one more day to ensure full year
    
    // Find the Sunday before or on oneYearAgo
    const startDate = new Date(oneYearAgo);
    const dayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek);
    startDate.setHours(0, 0, 0, 0);

    const currentDate = new Date(startDate);
    const endDate = new Date(today);
    endDate.setHours(23, 59, 59, 999);

    while (currentDate <= endDate) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        if (currentDate <= endDate) {
          const dateStr = currentDate.toISOString().split('T')[0];
          week.push({
            date: dateStr,
            count: contributions[dateStr] || 0,
          });
          currentDate.setDate(currentDate.getDate() + 1);
        }
      }
      if (week.length > 0) {
        weeks.push(week);
      }
    }

    return weeks;
  }, [contributions]);

  // Get contribution color - using green shades like GitHub
  const getContributionColor = (count) => {
    if (count === 0) {
      return isDarkMode 
        ? 'bg-gray-800 border border-gray-700' 
        : 'bg-gray-100 border border-gray-200';
    } else if (count <= 2) {
      return isDarkMode ? 'bg-green-800' : 'bg-green-200';
    } else if (count <= 5) {
      return isDarkMode ? 'bg-green-700' : 'bg-green-300';
    } else if (count <= 10) {
      return isDarkMode ? 'bg-green-600' : 'bg-green-400';
    } else {
      return isDarkMode ? 'bg-green-500' : 'bg-green-500';
    }
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
    },
    {
      title: 'Personal Portfolio',
      description: 'A modern, minimal portfolio website showcasing my experience, projects, and technical skills. Built with React and Vite, featuring a clean design with smooth animations and responsive layout.',
      tags: ['React', 'JavaScript', 'Tailwind CSS', 'Vite'],
      githubUrl: 'https://github.com/UlissesMolina/Portfolio',
    },
  ];

  // Get month labels - memoized for performance
  const monthLabels = useMemo(() => {
    const labels = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let lastMonth = -1;

    calendarWeeks.forEach((week, weekIndex) => {
      if (week.length > 0) {
        const firstDay = new Date(week[0].date);
        const month = firstDay.getMonth();
        const day = firstDay.getDate();

        if (month !== lastMonth && day <= 7) {
          labels.push({ weekIndex, month: months[month] });
          lastMonth = month;
        }
      }
    });

    return labels;
  }, [calendarWeeks]);

  return (
    <div className={`relative min-h-screen overflow-hidden transition-colors duration-300 ${
      isDarkMode ? 'bg-zinc-950' : 'bg-white'
    }`}>
      {/* Background light effect that follows mouse */}
      <div
        ref={lightRef}
        className="mouse-light fixed pointer-events-none z-0"
        style={{
          width: '800px',
          height: '800px',
          background: isDarkMode 
            ? 'radial-gradient(circle, rgba(255, 255, 255, 0.04) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(128, 128, 128, 0.04) 0%, transparent 70%)',
          left: '0px',
          top: '0px',
          willChange: 'transform',
        }}
      />
      {/* Minimal vertical gradient bar */}
      <div
        ref={barRef}
        className="fixed right-0 top-0 h-full w-0.5 transition-all duration-300 z-10"
        style={{
          boxShadow: 'none',
        }}
      />
      <div className="relative max-w-4xl mx-auto px-6 sm:px-8 z-10">
        <header className="relative pt-16 pb-12">
          <button
            onClick={toggleTheme}
            className={`absolute top-0 right-0 hidden md:block p-2 rounded-lg transition-colors ${
              isDarkMode 
                ? 'text-gray-400 hover:text-white hover:bg-gray-800' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
            }`}
            aria-label="Toggle theme"
          >
            {isDarkMode ? <FaSun size={18} /> : <FaMoon size={18} />}
          </button>
          <div className="flex flex-col items-center gap-6">
            <h1 className={`text-3xl sm:text-4xl md:text-5xl font-light text-center transition-colors ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Ulisses Molina-Becerra
            </h1>
            <div className="flex gap-4 items-center flex-wrap justify-center">
              <a href="https://github.com/UlissesMolina" target="_blank" rel="noopener noreferrer" className={`transition-colors duration-200 ${
                isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}>
                <FaGithub size={20} />
              </a>
              <a href="https://www.linkedin.com/in/ulissesmolina" target="_blank" rel="noopener noreferrer" className={`transition-colors duration-200 ${
                isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}>
                <FaLinkedin size={20} />
              </a>
              <a href="mailto:umolina2005@gmail.com" className={`transition-colors duration-200 ${
                isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}>
                <FaEnvelope size={20} />
              </a>
              <button
                onClick={toggleTheme}
                className={`md:hidden p-2 rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'text-gray-400 hover:text-white hover:bg-gray-800' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                }`}
                aria-label="Toggle theme"
              >
                {isDarkMode ? <FaSun size={18} /> : <FaMoon size={18} />}
              </button>
              <a 
                href="/resume.pdf" 
                download
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
                  isDarkMode 
                    ? 'text-gray-300 bg-gray-800 hover:bg-gray-700 border border-gray-700' 
                    : 'text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300'
                }`}
              >
                <FaDownload size={16} />
                <span>Download CV</span>
              </a>
            </div>
          </div>
        </header>
        <main className="flex flex-col gap-12 sm:gap-16">
          {/* About Me Section */}
          <section 
            ref={el => sectionRefs.current[0] = el}
            className="flex flex-col items-center text-center opacity-0"
          >
            <h2 className={`text-xl sm:text-2xl font-light mb-4 transition-colors ${
              isDarkMode ? 'text-gray-300' : 'text-gray-800'
            }`}>About Me</h2>
            <p className={`text-sm sm:text-base max-w-2xl transition-colors ${
              isDarkMode ? 'text-gray-400' : 'text-gray-700'
            }`}>
              I am currently a sophomore at Auburn University as a Software Engineering major. Interested in full-stack development and quantitative finance. 
            </p>
          </section>
          {/* Experience Section */}
          <section 
            ref={el => sectionRefs.current[1] = el}
            className="flex flex-col items-center w-full opacity-0"
          >
            <h2 className={`text-xl sm:text-2xl font-light mb-6 transition-colors ${
              isDarkMode ? 'text-gray-300' : 'text-gray-800'
            }`}>Experience</h2>
            {/* Toggle Switch */}
            <div className="flex items-center gap-3 mb-6">
              {experiences.map((exp, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedExperience(index)}
                  className={`px-4 py-2 text-sm transition-all duration-200 ${
                    selectedExperience === index
                      ? isDarkMode ? 'text-white border-b border-white' : 'text-gray-900 border-b border-gray-900'
                      : isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {exp.company}
                </button>
              ))}
            </div>
            {/* Experience Content */}
            <div className="w-full max-w-2xl">
              {experiences[selectedExperience] && (
                <div className="text-center">
                  <div className="mb-3">
                    <h3 className={`text-base sm:text-lg font-light mb-1 transition-colors ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {experiences[selectedExperience].title}
                    </h3>
                    <p className={`text-xs sm:text-sm mb-2 transition-colors ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-700'
                    }`}>
                      {experiences[selectedExperience].company} | {experiences[selectedExperience].location}
                    </p>
                    <p className={`text-xs sm:text-sm transition-colors ${
                      isDarkMode ? 'text-gray-500' : 'text-gray-600'
                    }`}>
                      {experiences[selectedExperience].period}
                    </p>
                  </div>
                  <ul className={`list-none space-y-2 text-xs sm:text-sm text-left max-w-xl mx-auto transition-colors ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-700'
                  }`}>
                    {experiences[selectedExperience].bullets.map((bullet, idx) => (
                      <li key={idx}>{bullet}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
          {/* Tech Stack Section */}
          <section 
            ref={el => sectionRefs.current[2] = el}
            className="flex flex-col items-center opacity-0"
          >
            <h2 className={`text-xl sm:text-2xl font-light mb-6 transition-colors ${
              isDarkMode ? 'text-gray-300' : 'text-gray-800'
            }`}>Tech Stack</h2>
            <div className="flex flex-wrap justify-center gap-6 sm:gap-8">
              {techStack.map((tech, index) => {
                const Icon = tech.icon;
                return (
                  <div key={index} className="flex flex-col items-center">
                    <Icon className={`mb-1 transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} size={24} />
                    <span className={`text-xs sm:text-sm transition-colors ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>{tech.name}</span>
                  </div>
                );
              })}
            </div>
          </section>
          {/* Projects Section */}
          <section 
            ref={el => sectionRefs.current[3] = el}
            className="flex flex-col items-center w-full opacity-0"
          >
            <h2 className={`text-xl sm:text-2xl font-light mb-8 transition-colors ${
              isDarkMode ? 'text-gray-300' : 'text-gray-800'
            }`}>Projects</h2>
            <div className="flex flex-col gap-8 w-full max-w-3xl">
              {projects.map((project, index) => (
                <div key={index} className={`group relative border-t pt-6 pb-4 transition-all duration-300 ${
                  isDarkMode 
                    ? 'border-gray-800 hover:border-gray-700' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <h3 className={`text-lg sm:text-xl font-light mb-2 transition-colors ${
                        isDarkMode 
                          ? 'text-white group-hover:text-gray-200' 
                          : 'text-gray-900 group-hover:text-gray-800'
                      }`}>
                        {project.title}
                      </h3>
                      <p className={`text-sm leading-relaxed transition-colors ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-700'
                      }`}>
                        {project.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    {project.tags.map((tag, tagIndex) => (
                      <span key={tagIndex} className={`text-xs px-2 py-1 border rounded transition-colors ${
                        isDarkMode 
                          ? 'text-gray-500 border-gray-800' 
                          : 'text-gray-600 border-gray-300'
                      }`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-4">
                    <a 
                      href={project.githubUrl} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-xs transition-colors flex items-center gap-1 ${
                        isDarkMode 
                          ? 'text-gray-500 hover:text-gray-300' 
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      <FaGithub size={14} />
                      Code
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>
          {/* GitHub Contributions Section */}
          <section 
            ref={el => sectionRefs.current[4] = el}
            className="flex flex-col items-center w-full opacity-0"
          >
            <h2 className={`text-xl sm:text-2xl font-light mb-8 transition-colors ${
              isDarkMode ? 'text-gray-300' : 'text-gray-800'
            }`}>GitHub Contributions</h2>
            {loading ? (
              <div className={`text-sm transition-colors ${
                isDarkMode ? 'text-gray-500' : 'text-gray-500'
              }`}>Loading...</div>
            ) : (
              <div className="w-full overflow-x-auto pb-4 scrollbar-hide">
                <div className="flex flex-col gap-0.5" style={{ minWidth: 'max-content' }}>
                  {/* Month labels */}
                  <div className="flex gap-0.5 mb-2 px-2" style={{ minWidth: 'max-content' }}>
                    {(() => {
                      const labels = new Array(calendarWeeks.length).fill('');
                      
                      monthLabels.forEach(label => {
                        labels[label.weekIndex] = label.month;
                      });
                      
                      return labels.map((month, idx) => (
                        <div
                          key={idx}
                          className={`text-xs transition-colors w-2.5 sm:w-3 flex items-start justify-center flex-shrink-0 ${
                            isDarkMode ? 'text-gray-500' : 'text-gray-600'
                          }`}
                        >
                          {month && <span className="whitespace-nowrap">{month}</span>}
                        </div>
                      ));
                    })()}
                  </div>
                  {/* Calendar grid */}
                  <div className="flex gap-0.5 px-2" style={{ minWidth: 'max-content' }}>
                    {calendarWeeks.map((week, weekIndex) => (
                      <div key={weekIndex} className="flex flex-col gap-0.5 flex-shrink-0">
                        {week.map((day, dayIndex) => {
                          const date = new Date(day.date);
                          const formattedDate = date.toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          });
                          return (
                            <div
                              key={`${weekIndex}-${dayIndex}`}
                              className={`w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-sm transition-all cursor-pointer group relative ${getContributionColor(day.count)} ${
                                isDarkMode ? 'hover:ring-green-500' : 'hover:ring-green-400'
                              } hover:ring-1 hover:scale-110`}
                            >
                              <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none ${
                                isDarkMode 
                                  ? 'bg-gray-800 text-gray-300 border border-gray-700' 
                                  : 'bg-white text-gray-800 border border-gray-300 shadow-lg'
                              }`}>
                                {day.count} contribution{day.count !== 1 ? 's' : ''} on {formattedDate}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                  {/* Legend */}
                  <div className="flex items-center justify-center gap-4 mt-6 text-xs">
                    <span className={`transition-colors ${
                      isDarkMode ? 'text-gray-600' : 'text-gray-500'
                    }`}>Less</span>
                    <div className="flex gap-0.5">
                      <div className={`w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-sm ${
                        isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-gray-100 border border-gray-200'
                      }`}></div>
                      <div className={`w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-sm ${
                        isDarkMode ? 'bg-green-800' : 'bg-green-200'
                      }`}></div>
                      <div className={`w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-sm ${
                        isDarkMode ? 'bg-green-700' : 'bg-green-300'
                      }`}></div>
                      <div className={`w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-sm ${
                        isDarkMode ? 'bg-green-600' : 'bg-green-400'
                      }`}></div>
                      <div className={`w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-sm ${
                        isDarkMode ? 'bg-green-500' : 'bg-green-500'
                      }`}></div>
                    </div>
                    <span className={`transition-colors ${
                      isDarkMode ? 'text-gray-600' : 'text-gray-500'
                    }`}>More</span>
                  </div>
                </div>
              </div>
            )}
          </section>
        </main>
        {/* Footer */}
        <footer className={`w-full py-8 mt-12 flex justify-center items-center border-t transition-colors ${
          isDarkMode ? 'border-gray-900' : 'border-gray-300'
        }`}>
          <span className={`text-xs sm:text-sm transition-colors ${
            isDarkMode ? 'text-gray-500' : 'text-gray-500'
          }`}>&copy; {new Date().getFullYear()} Ulisses Molina-Becerra</span>
        </footer>
      </div>
    </div>
  )
}

export default App

