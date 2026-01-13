import './App.css'
import { FaGithub, FaLinkedin, FaEnvelope, FaJava, FaPython, FaReact, FaHtml5, FaCss3Alt, FaJsSquare } from 'react-icons/fa';
import { SiTypescript, SiFirebase, SiJson } from 'react-icons/si';
import { FaMoon, FaSun } from 'react-icons/fa';
import { useEffect, useRef, useState } from 'react';

function App() {
  const barRef = useRef(null);
  const lightRef = useRef(null);
  const mousePositionRef = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef(null);
  const [selectedExperience, setSelectedExperience] = useState(0);
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage or default to dark
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });
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

  // Fetch GitHub contributions
  useEffect(() => {
    const fetchContributions = async () => {
      try {
        const token = import.meta.env.VITE_GITHUB_TOKEN;
        const username = 'UlissesMolina';
        
        // Try GraphQL API (works with or without token for public data)
        // Get contributions for exactly 1 year (GitHub API limit)
        const toDate = new Date();
        toDate.setHours(23, 59, 59, 999); // End of today
        const fromDate = new Date();
        fromDate.setFullYear(fromDate.getFullYear() - 1);
        fromDate.setHours(0, 0, 0, 0); // Start of day
        // Don't add buffer - GitHub API requires exactly 1 year or less
        
        console.log(`Querying contributions from ${fromDate.toISOString()} to ${toDate.toISOString()}`);
        
        const query = `
          query($username: String!, $from: DateTime!, $to: DateTime!) {
            user(login: $username) {
              contributionsCollection(from: $from, to: $to) {
                contributionCalendar {
                  totalContributions
                  weeks {
                    contributionDays {
                      date
                      contributionCount
                      color
                    }
                  }
                }
              }
            }
          }
        `;

        // Require token for GraphQL API
        if (!token) {
          console.warn('GitHub token not found. Please add VITE_GITHUB_TOKEN to your .env file');
          // Fall through to use fallback method
        } else {
          const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          };

          try {
            const response = await fetch('https://api.github.com/graphql', {
              method: 'POST',
              headers: headers,
              body: JSON.stringify({
                query: query,
                variables: { 
                  username: username,
                  from: fromDate.toISOString(),
                  to: toDate.toISOString()
                }
              })
            });

            if (!response.ok) {
              throw new Error(`GraphQL API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            
            if (data.errors) {
              console.error('GraphQL errors:', data.errors);
              throw new Error(data.errors[0]?.message || 'GraphQL query failed');
            }
            
            if (data.data && data.data.user && data.data.user.contributionsCollection) {
              // Process GraphQL response - flatten weeks into days
              const weeks = data.data.user.contributionsCollection.contributionCalendar.weeks;
              const contributionsData = [];
              
              weeks.forEach(week => {
                week.contributionDays.forEach(day => {
                  contributionsData.push({
                    date: day.date,
                    count: day.contributionCount
                  });
                });
              });

              console.log(`Loaded ${contributionsData.length} days of contribution data`);
              console.log(`First date: ${contributionsData[0]?.date}, Last date: ${contributionsData[contributionsData.length - 1]?.date}`);
              console.log(`Total weeks from API: ${weeks.length}`);
              
              setContributions(contributionsData);
              setLoading(false);
              return;
            } else {
              throw new Error('Invalid GraphQL response structure');
            }
          } catch (graphqlError) {
            console.error('GraphQL API failed:', graphqlError);
            console.log('Falling back to public events API...');
            // Fall through to use fallback method
          }
        }

        // Fallback: Use public events API (works without token)
        const response = await fetch(`https://api.github.com/users/${username}/events/public?per_page=300`);
        if (!response.ok) throw new Error('Failed to fetch');
        
        const events = await response.json();
        
        // Process events to create contribution data
        const contributionMap = {};
        events.forEach(event => {
          const date = event.created_at.split('T')[0];
          contributionMap[date] = (contributionMap[date] || 0) + 1;
        });

        // Generate data from 1 year ago to today, organized by weeks starting Sunday
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const oneYearAgo = new Date(today);
        oneYearAgo.setFullYear(today.getFullYear() - 1);
        
        // Find the Sunday of the week containing oneYearAgo
        const startDate = new Date(oneYearAgo);
        const dayOfWeek = startDate.getDay();
        startDate.setDate(startDate.getDate() - dayOfWeek);
        startDate.setHours(0, 0, 0, 0);
        
        const contributionsData = [];
        const currentDate = new Date(startDate);
        
        // Generate all days from start date to today
        while (currentDate <= today) {
          const dateStr = currentDate.toISOString().split('T')[0];
          const count = contributionMap[dateStr] || 0;
          contributionsData.push({
            date: dateStr,
            count: count
          });
          currentDate.setDate(currentDate.getDate() + 1);
        }

        setContributions(contributionsData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching contributions:', error);
        // Fallback: generate empty calendar from 1 year ago to today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const oneYearAgo = new Date(today);
        oneYearAgo.setFullYear(today.getFullYear() - 1);
        
        const startDate = new Date(oneYearAgo);
        const dayOfWeek = startDate.getDay();
        startDate.setDate(startDate.getDate() - dayOfWeek);
        startDate.setHours(0, 0, 0, 0);
        
        const emptyData = [];
        const currentDate = new Date(startDate);
        
        while (currentDate <= today) {
          emptyData.push({ date: currentDate.toISOString().split('T')[0], count: 0 });
          currentDate.setDate(currentDate.getDate() + 1);
        }
        
        setContributions(emptyData);
        setLoading(false);
      }
    };

    fetchContributions();
  }, []);

  // Update theme in localStorage and apply to document
  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
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

    // Observe all sections
    sectionRefs.current.forEach(ref => {
      if (ref) observer.observe(ref);
    });

    return () => {
      sectionRefs.current.forEach(ref => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

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
        <header className="pt-16 pb-12">
          <div className="flex flex-col items-center gap-6">
            <div className="relative flex items-center justify-center w-full max-w-2xl">
              <h1 className={`text-3xl sm:text-4xl md:text-5xl font-light text-center transition-colors ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Ulisses Molina-Becerra
              </h1>
              <button
                onClick={toggleTheme}
                className={`absolute right-0 p-2 rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'text-gray-400 hover:text-white hover:bg-gray-800' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                }`}
                aria-label="Toggle theme"
              >
                {isDarkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
              </button>
            </div>
            <div className="flex gap-4">
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
              <a href="mailto:umolina2005your@email.com" className={`transition-colors duration-200 ${
                isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}>
                <FaEnvelope size={20} />
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
              I am currenlty a sophomore at Auburn University as a Software Engineering major. Welcome to my portfolio!
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
              <button
                onClick={() => setSelectedExperience(0)}
                className={`px-4 py-2 text-sm transition-all duration-200 ${
                  selectedExperience === 0
                    ? isDarkMode ? 'text-white border-b border-white' : 'text-gray-900 border-b border-gray-900'
                    : isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                OCV, LLC
              </button>
              <button
                onClick={() => setSelectedExperience(1)}
                className={`px-4 py-2 text-sm transition-all duration-200 ${
                  selectedExperience === 1
                    ? isDarkMode ? 'text-white border-b border-white' : 'text-gray-900 border-b border-gray-900'
                    : isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Room2Room Movers
              </button>
            </div>
            {/* Experience Content */}
            <div className="w-full max-w-2xl">
              {selectedExperience === 0 ? (
                <div className="text-center">
                  <div className="mb-3">
                    <h3 className={`text-base sm:text-lg font-light mb-1 transition-colors ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      Part-Time Software Engineering Intern
                    </h3>
                    <p className={`text-xs sm:text-sm mb-2 transition-colors ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-700'
                    }`}>
                      OCV, LLC | Opelika AL
                    </p>
                    <p className={`text-xs sm:text-sm transition-colors ${
                      isDarkMode ? 'text-gray-500' : 'text-gray-600'
                    }`}>
                      September 2025 - Present
                    </p>
                  </div>
                  <ul className={`list-none space-y-2 text-xs sm:text-sm text-left max-w-xl mx-auto transition-colors ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-700'
                  }`}>
                    <li>• Built and configured client mobile apps using OCV's proprietary platform and formatted JSON structures</li>
                    <li>• Implemented client requests by updating app content, configurations, and feature settings through internal tools</li>
                    <li>• Performed quality control (QC) testing to ensure app functionality and UI consistency before release</li>
                    <li>• Collaborated with developers, operations, and graphics teams to manage app updates and production issues</li>
                    <li>• Released and maintained iOS and Android apps on the App Store and Google Play Console, ensuring smooth deployment and version tracking</li>
                  </ul>
                </div>
              ) : (
                <div className="text-center">
                  <div className="mb-3">
                    <h3 className={`text-base sm:text-lg font-light mb-1 transition-colors ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      Part-Time Software Engineering Intern
                    </h3>
                    <p className={`text-xs sm:text-sm mb-2 transition-colors ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-700'
                    }`}>
                      Room2Room Movers | Auburn AL
                    </p>
                    <p className={`text-xs sm:text-sm transition-colors ${
                      isDarkMode ? 'text-gray-500' : 'text-gray-600'
                    }`}>
                      January 2026 - Present
                    </p>
                  </div>
                  <ul className={`list-none space-y-2 text-xs sm:text-sm text-left max-w-xl mx-auto transition-colors ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-700'
                  }`}>
                    <li>• Developed and maintained application features using React and TypeScript in a production codebase</li>
                    <li>• Implemented and updated Firebase-backed backend logic and API endpoints to support application functionality</li>
                    <li>• Worked with authentication, configuration data, and state management across frontend and backend</li>
                    <li>• Fixed bugs and improved code quality by debugging React hooks and shared application state</li>
                    <li>• Collaborated with engineers through Jira tickets, pull requests, and code reviews in an agile workflow</li>
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
              <div className="flex flex-col items-center">
                <FaJava className={`mb-1 transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} size={24} />
                <span className={`text-xs sm:text-sm transition-colors ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>Java</span>
              </div>
              <div className="flex flex-col items-center">
                <FaPython className={`mb-1 transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} size={24} />
                <span className={`text-xs sm:text-sm transition-colors ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>Python</span>
              </div>
              <div className="flex flex-col items-center">
                <FaReact className={`mb-1 transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} size={24} />
                <span className={`text-xs sm:text-sm transition-colors ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>React</span>
              </div>
              <div className="flex flex-col items-center">
                <SiTypescript className={`mb-1 transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} size={24} />
                <span className={`text-xs sm:text-sm transition-colors ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>TypeScript</span>
              </div>
              <div className="flex flex-col items-center">
                <SiFirebase className={`mb-1 transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} size={24} />
                <span className={`text-xs sm:text-sm transition-colors ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>Firebase</span>
              </div>
              <div className="flex flex-col items-center">
                <SiJson className={`mb-1 transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} size={24} />
                <span className={`text-xs sm:text-sm transition-colors ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>JSON</span>
              </div>
              <div className="flex flex-col items-center">
                <FaHtml5 className={`mb-1 transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} size={24} />
                <span className={`text-xs sm:text-sm transition-colors ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>HTML</span>
              </div>
              <div className="flex flex-col items-center">
                <FaCss3Alt className={`mb-1 transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} size={24} />
                <span className={`text-xs sm:text-sm transition-colors ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>CSS</span>
              </div>
              <div className="flex flex-col items-center">
                <FaJsSquare className={`mb-1 transition-colors ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} size={24} />
                <span className={`text-xs sm:text-sm transition-colors ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>JavaScript</span>
              </div>
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
              {/* Tiger Scheduler Project */}
              <div className={`group relative border-t pt-6 pb-4 transition-all duration-300 ${
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
                      Tiger Scheduler Course Auto-Register Tool
                    </h3>
                    <p className={`text-sm leading-relaxed transition-colors ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-700'
                    }`}>
                      A Python automation script that monitors course availability on Auburn University's TigerScheduler platform. Automatically checks for open seats every minute, filters courses, and handles auto-login and registration actions.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className={`text-xs px-2 py-1 border rounded transition-colors ${
                    isDarkMode 
                      ? 'text-gray-500 border-gray-800' 
                      : 'text-gray-600 border-gray-300'
                  }`}>Python</span>
                  <span className={`text-xs px-2 py-1 border rounded transition-colors ${
                    isDarkMode 
                      ? 'text-gray-500 border-gray-800' 
                      : 'text-gray-600 border-gray-300'
                  }`}>Selenium</span>
                  <span className={`text-xs px-2 py-1 border rounded transition-colors ${
                    isDarkMode 
                      ? 'text-gray-500 border-gray-800' 
                      : 'text-gray-600 border-gray-300'
                  }`}>Web Automation</span>
                </div>
                <div className="flex items-center gap-4">
                  <a 
                    href="https://github.com/UlissesMolina/Tiger-Scheduler-Course-Auto-Register-Tool" 
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
              {/* Portfolio Project */}
              <div className={`group relative border-t pt-6 pb-4 transition-all duration-300 ${
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
                      Personal Portfolio
                    </h3>
                    <p className={`text-sm leading-relaxed transition-colors ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-700'
                    }`}>
                      A modern, minimal portfolio website showcasing my experience, projects, and technical skills. Built with React and Vite, featuring a clean design with smooth animations and responsive layout.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className={`text-xs px-2 py-1 border rounded transition-colors ${
                    isDarkMode 
                      ? 'text-gray-500 border-gray-800' 
                      : 'text-gray-600 border-gray-300'
                  }`}>React</span>
                  <span className={`text-xs px-2 py-1 border rounded transition-colors ${
                    isDarkMode 
                      ? 'text-gray-500 border-gray-800' 
                      : 'text-gray-600 border-gray-300'
                  }`}>JavaScript</span>
                  <span className={`text-xs px-2 py-1 border rounded transition-colors ${
                    isDarkMode 
                      ? 'text-gray-500 border-gray-800' 
                      : 'text-gray-600 border-gray-300'
                  }`}>Tailwind CSS</span>
                  <span className={`text-xs px-2 py-1 border rounded transition-colors ${
                    isDarkMode 
                      ? 'text-gray-500 border-gray-800' 
                      : 'text-gray-600 border-gray-300'
                  }`}>Vite</span>
                </div>
                <div className="flex items-center gap-4">
                  <a 
                    href="https://github.com/UlissesMolina/Portfolio" 
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
              }`}>Loading contributions...</div>
            ) : (
              <div className="w-full relative z-20" style={{ overflowX: 'auto' }}>
                {(() => {
                  console.log(`Rendering calendar with ${contributions.length} days`);
                  
                  // Simple: group contributions into weeks (7 days each)
                  const weeks = [];
                  for (let i = 0; i < contributions.length; i += 7) {
                    weeks.push(contributions.slice(i, i + 7));
                  }
                  
                  console.log(`Grouped into ${weeks.length} weeks`);
                  
                  // Get today's date to determine last week
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const todayStr = today.toISOString().split('T')[0];
                  const todayDayOfWeek = today.getDay();
                  
                  // Month names
                  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                  let lastMonth = -1;
                  
                  return (
                    <>
                      {/* Month labels */}
                      <div className="flex gap-1 overflow-x-auto pb-2 px-2 mb-1 scrollbar-hide" style={{ minWidth: 'max-content' }}>
                        {weeks.map((week, weekIndex) => {
                          const firstDay = week[0];
                          if (!firstDay) return <div key={`month-${weekIndex}`} className="w-2.5 sm:w-3 flex-shrink-0" />;
                          
                          const date = new Date(firstDay.date);
                          const currentMonth = date.getMonth();
                          const isFirstWeekOfMonth = currentMonth !== lastMonth;
                          if (isFirstWeekOfMonth) lastMonth = currentMonth;
                          
                          return (
                            <div key={`month-${weekIndex}`} className={`flex items-start justify-center flex-shrink-0 ${isFirstWeekOfMonth ? 'min-w-[24px]' : 'w-2.5 sm:w-3'}`}>
                              {isFirstWeekOfMonth && (
                                <span className={`text-xs whitespace-nowrap transition-colors ${
                                  isDarkMode ? 'text-gray-500' : 'text-gray-600'
                                }`}>
                                  {monthNames[currentMonth]}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      {/* Calendar grid */}
                      <div className="flex gap-1 overflow-x-auto pb-4 px-2 pr-4 scrollbar-hide" style={{ minWidth: 'max-content' }}>
                        {weeks.map((week, weekIndex) => {
                          console.log(`Rendering week ${weekIndex + 1} of ${weeks.length}`);
                          const isLastWeek = weekIndex === weeks.length - 1;
                          const lastDay = week[week.length - 1];
                          const isCurrentWeek = lastDay && lastDay.date >= todayStr;
                          
                          // For last week, only show days up to today
                          const daysToShow = (isLastWeek && isCurrentWeek) ? todayDayOfWeek + 1 : week.length;
                          
                          return (
                            <div key={weekIndex} className="flex flex-col gap-1 flex-shrink-0">
                              {week.slice(0, daysToShow).map((day, dayIndex) => {
                                if (!day) return null;
                                
                                // Map contribution count to intensity
                                let intensity = 0;
                                if (day.count === 0) intensity = 0;
                                else if (day.count === 1) intensity = 1;
                                else if (day.count <= 3) intensity = 2;
                                else if (day.count <= 5) intensity = 3;
                                else intensity = 4;
                                
                                const colors = isDarkMode ? [
                                  'bg-gray-800 border border-gray-700',  // 0 contributions - lighter so visible
                                  'bg-gray-700',                          // 1 contribution
                                  'bg-gray-600',                          // 2-3 contributions
                                  'bg-gray-500',                          // 4-5 contributions
                                  'bg-gray-400'                           // 6+ contributions
                                ] : [
                                  'bg-gray-100 border border-gray-200',
                                  'bg-blue-200',
                                  'bg-blue-300',
                                  'bg-blue-400',
                                  'bg-blue-500'
                                ];
                                
                                return (
                                  <div
                                    key={`${weekIndex}-${dayIndex}`}
                                    className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded ${colors[intensity]} ${isDarkMode ? 'hover:ring-gray-500' : 'hover:ring-blue-400'} hover:ring-1 hover:scale-110 transition-all cursor-pointer`}
                                    title={`${day.count} contribution${day.count !== 1 ? 's' : ''} on ${new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                                  />
                                );
                              })}
                            </div>
                          );
                        })}
                      </div>
                    </>
                  );
                })()}
                <div className={`flex items-center justify-center gap-4 mt-6 text-xs transition-colors ${
                  isDarkMode ? 'text-gray-500' : 'text-gray-600'
                }`}>
                  <span className={isDarkMode ? 'text-gray-600' : 'text-gray-500'}>Less</span>
                  <div className="flex gap-1">
                    {isDarkMode ? (
                      <>
                        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-gray-800 border border-gray-700" />
                        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-gray-700" />
                        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-gray-600" />
                        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-gray-500" />
                        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-gray-400" />
                      </>
                    ) : (
                      <>
                        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-gray-100 border border-gray-200" />
                        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-blue-200" />
                        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-blue-300" />
                        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-blue-400" />
                        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-blue-500" />
                      </>
                    )}
                  </div>
                  <span className={isDarkMode ? 'text-gray-600' : 'text-gray-500'}>More</span>
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

