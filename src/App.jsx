import './App.css'
import { FaGithub, FaLinkedin, FaEnvelope, FaJava, FaPython, FaReact, FaHtml5, FaCss3Alt, FaJsSquare } from 'react-icons/fa';
import { useEffect, useRef } from 'react';

function App() {
  const barRef = useRef(null);

  // Clean highlight bar based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (barRef.current) {
        const scrollY = window.scrollY;
        const scrollHeight = document.body.scrollHeight - window.innerHeight;
        // Clamp highlight between 0 and 1
        const highlight = Math.min(1, Math.max(0, scrollY / scrollHeight));
        // Dynamic gradient: from blue to purple as you scroll
        barRef.current.style.background = `linear-gradient(to bottom,rgb(68, 68, 68) ${highlight * 100}%,rgb(255, 255, 255) 100%)`;
        barRef.current.style.boxShadow = 'none';
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative min-h-screen">
      {/* Responsive vertical gradient bar */}
      <div
        ref={barRef}
        className="fixed left-4 sm:left-16 md:left-64 top-0 h-full w-0.5 sm:w-0.5 md:w-0.5 rounded-full transition-all duration-300 z-10"
        style={{
          background: 'linear-gradient(to bottom,rgb(68, 68, 68) 0%,rgb(255, 255, 255) 100%)',
          boxShadow: 'none',
        }}
      />
      <header className="App-header">
        <div className="flex items-center justify-between mt-12 px-4 sm:px-8 md:px-20 animate-fade-in">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold text-white ml-8 sm:ml-16 md:ml-72">
            Ulisses Molina-Becerra
          </h1>
          <div className="flex gap-4 sm:gap-6 md:gap-6 mr-4 sm:mr-8 md:mr-16">
            <a href="https://github.com/UlissesMolina" target="_blank" rel="noopener noreferrer">
              <span className="border-2 border-white rounded-xl p-2 sm:p-3 flex items-center justify-center transition-colors duration-200 hover:border-gray-400">
                <FaGithub className="text-white" size={32} />
              </span>
            </a>
            <a href="https://www.linkedin.com/in/ulissesmolina" target="_blank" rel="noopener noreferrer">
              <span className="border-2 border-white rounded-xl p-2 sm:p-3 flex items-center justify-center transition-colors duration-200 hover:border-gray-400">
                <FaLinkedin className="text-white" size={32} />
              </span>
            </a>
            <a href="mailto:umolina2005your@email.com">
              <span className="border-2 border-white rounded-xl p-2 sm:p-3 flex items-center justify-center transition-colors duration-200 hover:border-gray-400">
                <FaEnvelope className="text-white" size={32} />
              </span>
            </a>
          </div>
        </div>
      </header>
      {/* About Me Section - left aligned */}
      <section className="flex flex-col items-start ml-4 sm:ml-16 md:ml-72 mb-16 mt-16 sm:mb-24 sm:mt-32">
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-6 sm:mb-10">About Me</h2>
        <p className="text-lg sm:text-2xl md:text-3xl text-gray-200 max-w-xs sm:max-w-2xl text-left mb-12 sm:mb-24">
          I am a passionate developer with a love for building modern web applications. I enjoy learning new technologies and solving challenging problems. Welcome to my portfolio!
        </p>
      </section>
      {/* Tech Stack Section - left aligned under name */}
      <section className="flex flex-col items-start ml-4 sm:ml-16 md:ml-72 mb-16 sm:mb-24">
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-6 sm:mb-10">Tech Stack</h2>
        <div className="flex flex-wrap gap-6 sm:gap-10 md:gap-16">
          <div className="flex flex-col items-center">
            <span className="border-2 border-white rounded-xl p-3 sm:p-6 flex items-center justify-center mb-2">
              <FaJava className="text-white" size={40} />
            </span>
            <span className="text-lg sm:text-2xl text-white mt-2">Java</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="border-2 border-white rounded-xl p-3 sm:p-6 flex items-center justify-center mb-2">
              <FaPython className="text-white" size={40} />
            </span>
            <span className="text-lg sm:text-2xl text-white mt-2">Python</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="border-2 border-white rounded-xl p-3 sm:p-6 flex items-center justify-center mb-2">
              <FaReact className="text-white" size={40} />
            </span>
            <span className="text-lg sm:text-2xl text-white mt-2">React</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="border-2 border-white rounded-xl p-3 sm:p-6 flex items-center justify-center mb-2">
              <FaHtml5 className="text-white" size={40} />
            </span>
            <span className="text-lg sm:text-2xl text-white mt-2">HTML</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="border-2 border-white rounded-xl p-3 sm:p-6 flex items-center justify-center mb-2">
              <FaCss3Alt className="text-white" size={40} />
            </span>
            <span className="text-lg sm:text-2xl text-white mt-2">CSS</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="border-2 border-white rounded-xl p-3 sm:p-6 flex items-center justify-center mb-2">
              <FaJsSquare className="text-white" size={40} />
            </span>
            <span className="text-lg sm:text-2xl text-white mt-2">JavaScript</span>
          </div>
        </div>
      </section>
      {/* Projects Section - vertical layout, left aligned */}
      <section className="flex flex-col items-start ml-4 sm:ml-16 md:ml-72">
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-8 sm:mb-16">Projects</h2>
        <div className="flex flex-col gap-10 sm:gap-16 md:gap-20 w-full max-w-xs sm:max-w-2xl px-2 sm:px-4">
          {/* Project Card 1 */}
          <div className="bg-zinc-800 rounded-xl p-6 sm:p-10 md:p-16 shadow-lg mb-8 sm:mb-12">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold text-white mb-4 sm:mb-8">Project One</h3>
            <p className="text-base sm:text-xl md:text-2xl text-gray-300 mb-4 sm:mb-8">A brief description of the first project goes here. Highlight the main features and technologies used.</p>
            <a href="#" className="text-blue-400 hover:underline text-lg sm:text-2xl">View Project</a>
          </div>
          {/* Project Card 2 */}
          <div className="bg-zinc-800 rounded-xl p-6 sm:p-10 md:p-16 shadow-lg mb-8 sm:mb-12">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold text-white mb-4 sm:mb-8">Project Two</h3>
            <p className="text-base sm:text-xl md:text-2xl text-gray-300 mb-4 sm:mb-8">A brief description of the second project goes here. Highlight the main features and technologies used.</p>
            <a href="#" className="text-blue-400 hover:underline text-lg sm:text-2xl">View Project</a>
          </div>
          {/* Add more project cards as needed */}
        </div>
      </section>
      {/* Footer */}
      <footer className="w-full py-6 sm:py-10 mt-16 sm:mt-32 flex justify-center items-center bg-zinc-900 border-t border-zinc-800">
        <span className="text-gray-400 text-base sm:text-lg">&copy; {new Date().getFullYear()} Ulisses Molina-Becerra. All rights reserved.</span>
      </footer>
    </div>
  )
}

export default App

