import { useRef } from 'react';
import { FaGithub } from 'react-icons/fa';

export default function ProjectCard({ project, isDarkMode }) {
  const videoRef = useRef(null);

  const handleMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <a
      href={project.githubUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`group relative block overflow-hidden rounded-lg border transition-all duration-300 ease-out cursor-pointer
        hover:scale-[1.02] hover:-translate-y-1
        ${isDarkMode
          ? 'border-teal-900/40 bg-teal-950/20 hover:border-teal-600/50 hover:shadow-lg hover:shadow-teal-950/50'
          : 'border-teal-200/80 bg-white/80 hover:border-teal-400/80 hover:shadow-xl hover:shadow-slate-300/50'
        }`}
    >
      {/* Media area: video plays on hover */}
      <div
        className={`relative aspect-[5/3] w-full overflow-hidden ${
          isDarkMode ? 'bg-teal-950/40' : 'bg-teal-100/60'
        }`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {project.media?.type === 'image' && project.media?.url ? (
          <img
            src={project.media.url}
            alt={project.title}
            className="h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-110"
          />
        ) : project.media?.type === 'video' && project.media?.url ? (
          <video
            ref={videoRef}
            src={project.media.url}
            className="h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
            muted
            loop
            playsInline
            aria-label={`Video preview for ${project.title}`}
          />
        ) : (
          <div
            className={`flex h-full w-full items-center justify-center transition-colors duration-300 group-hover:brightness-110 ${
              isDarkMode ? 'text-teal-800/60' : 'text-teal-600/70'
            }`}
          >
            <span className="text-[10px] sm:text-xs">Image or video</span>
          </div>
        )}
      </div>
      <div className="p-3">
        <h3
          className={`font-medium text-sm mb-1 line-clamp-2 transition-colors duration-300 ${
            isDarkMode
              ? 'text-slate-50 group-hover:text-teal-100'
              : 'text-slate-900 group-hover:text-slate-800'
          }`}
        >
          {project.title}
        </h3>
        <p
          className={`text-xs leading-snug mb-2 line-clamp-2 transition-colors duration-300 ${
            isDarkMode ? 'text-slate-300/70' : 'text-slate-600'
          }`}
        >
          {project.description}
        </p>
        <div className="flex flex-wrap items-center gap-1.5 mb-2">
          {project.tags.map((tag, tagIndex) => (
            <span
              key={tagIndex}
              className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors duration-300 ${
                isDarkMode
                  ? 'text-teal-400/70 border-teal-800/50 group-hover:border-teal-700/60'
                  : 'text-slate-500 border-teal-200 group-hover:border-teal-300'
              }`}
            >
              {tag}
            </span>
          ))}
        </div>
        <span
          className={`inline-flex items-center gap-1 text-[11px] transition-all duration-300 ${
            isDarkMode
              ? 'text-teal-400/80 group-hover:gap-2'
              : 'text-teal-600 group-hover:gap-2'
          }`}
        >
          <FaGithub size={12} />
          Code
        </span>
      </div>
    </a>
  );
}
