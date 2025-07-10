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
      {/* Move the vertical bar more to the right (from left-20 to left-64) */}
      <div
        ref={barRef}
        className="fixed left-64 top-0 h-full w-0.5 rounded-full transition-all duration-300"
        style={{
          background: 'linear-gradient(to bottom, #f4f4f5 0%, #d4d4d8 100%)',
          boxShadow: 'none',
        }}
      />
      <header className="App-header">
        {/* Center name and icons horizontally, keep them close together */}
        <div className="flex items-center justify-between mt-12 animate-fade-in">
          <h1 className="text-6xl font-semibold text-white ml-72">
            Ulisses Molina-Becerra
          </h1>
          <div className="flex gap-6 mr-16">
            <a href="https://github.com/UlissesMolina" target="_blank" rel="noopener noreferrer">
              <span className="border-2 border-white rounded-xl p-3 flex items-center justify-center transition-colors duration-200 hover:border-gray-400">
                <FaGithub className="text-white" size={40} />
              </span>
            </a>
            <a href="https://www.linkedin.com/in/ulissesmolina" target="_blank" rel="noopener noreferrer">
              <span className="border-2 border-white rounded-xl p-3 flex items-center justify-center transition-colors duration-200 hover:border-gray-400">
                <FaLinkedin className="text-white" size={40} />
              </span>
            </a>
            <a href="mailto:umolina2005your@email.com">
              <span className="border-2 border-white rounded-xl p-3 flex items-center justify-center transition-colors duration-200 hover:border-gray-400">
                <FaEnvelope className="text-white" size={40} />
              </span>
            </a>
          </div>
        </div>
      </header>
      {/* About Me Section - left aligned */}
      <section className="flex flex-col items-start ml-72 mb-24 mt-32">
        <h2 className="text-5xl font-bold text-white mb-10">About Me</h2>
        <p className="text-3xl text-gray-200 max-w-2xl text-left mb-24">
          I am a passionate developer with a love for building modern web applications. I enjoy learning new technologies and solving challenging problems. Welcome to my portfolio!
        </p>
      </section>
      {/* Tech Stack Section - left aligned under name */}
      <section className="flex flex-col items-start ml-72 mb-24">
        <h2 className="text-5xl font-bold text-white mb-10">Tech Stack</h2>
        <div className="flex gap-16 flex-wrap">
          <div className="flex flex-col items-center">
            <span className="border-2 border-white rounded-xl p-6 flex items-center justify-center mb-2">
              <FaJava className="text-white" size={80} />
            </span>
            <span className="text-2xl text-white mt-2">Java</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="border-2 border-white rounded-xl p-6 flex items-center justify-center mb-2">
              <FaPython className="text-white" size={80} />
            </span>
            <span className="text-2xl text-white mt-2">Python</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="border-2 border-white rounded-xl p-6 flex items-center justify-center mb-2">
              <FaReact className="text-white" size={80} />
            </span>
            <span className="text-2xl text-white mt-2">React</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="border-2 border-white rounded-xl p-6 flex items-center justify-center mb-2">
              <FaHtml5 className="text-white" size={80} />
            </span>
            <span className="text-2xl text-white mt-2">HTML</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="border-2 border-white rounded-xl p-6 flex items-center justify-center mb-2">
              <FaCss3Alt className="text-white" size={80} />
            </span>
            <span className="text-2xl text-white mt-2">CSS</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="border-2 border-white rounded-xl p-6 flex items-center justify-center mb-2">
              <FaJsSquare className="text-white" size={80} />
            </span>
            <span className="text-2xl text-white mt-2">JavaScript</span>
          </div>
        </div>
      </section>
      {/* Projects Section - vertical layout, left aligned */}
      <section className="flex flex-col items-start ml-72">
        <h2 className="text-5xl font-bold text-white mb-16">Projects</h2>
        <div className="flex flex-col gap-20 w-full max-w-2xl px-4">
          {/* Project Card 1 */}
          <div className="bg-zinc-800 rounded-xl p-16 shadow-lg mb-12">
            <h3 className="text-3xl font-semibold text-white mb-8">Project One</h3>
            <p className="text-2xl text-gray-300 mb-8">A brief description of the first project goes here. Highlight the main features and technologies used.</p>
            <a href="#" className="text-blue-400 hover:underline text-2xl">View Project</a>
          </div>
          {/* Project Card 2 */}
          <div className="bg-zinc-800 rounded-xl p-16 shadow-lg mb-12">
            <h3 className="text-3xl font-semibold text-white mb-8">Project Two</h3>
            <p className="text-2xl text-gray-300 mb-8">A brief description of the second project goes here. Highlight the main features and technologies used.</p>
            <a href="#" className="text-blue-400 hover:underline text-2xl">View Project</a>
          </div>
          {/* Add more project cards as needed */}
        </div>
      </section>
      {/* Footer */}
      <footer className="w-full py-10 mt-32 flex justify-center items-center bg-zinc-900 border-t border-zinc-800">
        <span className="text-gray-400 text-lg">&copy; {new Date().getFullYear()} Ulisses Molina-Becerra. All rights reserved.</span>
      </footer>
    </div>
  )
}

export default App

