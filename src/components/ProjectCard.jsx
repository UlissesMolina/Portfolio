import { useRef } from 'react';
import { FaGithub, FaPython, FaReact } from 'react-icons/fa';
import { SiTypescript } from 'react-icons/si';

const TAG_ICONS = {
  Python: FaPython,
  React: FaReact,
  JavaScript: FaReact,
  TypeScript: SiTypescript,
};

// Simple syntax highlight: keywords + strings
const KEYWORD_SET = new Set(['from', 'import', 'while', 'True', 'False', 'if', 'else', 'return', 'const', 'function', 'default', 'export', 'class', 'async', 'await']);
const TOKEN_RE = /\b(from|import|while|True|False|if|else|return|const|function|default|export|class|async|await)\b|"([^"\\]|\\.)*"|'([^'\\]|\\.)*'/g;

function highlightLine(line, isDark) {
  const parts = [];
  let lastEnd = 0;
  let m;
  TOKEN_RE.lastIndex = 0;
  while ((m = TOKEN_RE.exec(line)) !== null) {
    if (m.index > lastEnd) parts.push({ t: 'plain', s: line.slice(lastEnd, m.index) });
    const word = m[0];
    if (KEYWORD_SET.has(word)) parts.push({ t: 'keyword', s: word });
    else if (word.startsWith('"') || word.startsWith("'")) parts.push({ t: 'string', s: word });
    else parts.push({ t: 'plain', s: word });
    lastEnd = TOKEN_RE.lastIndex;
  }
  if (lastEnd < line.length) parts.push({ t: 'plain', s: line.slice(lastEnd) });
  const keywordCl = isDark ? 'text-accent' : 'text-orange-600';
  const stringCl = isDark ? 'text-emerald-400/90' : 'text-emerald-600';
  const plainCl = isDark ? 'text-ink-muted' : 'text-slate-300';
  return parts.map((p, i) => (
    <span key={i} className={p.t === 'keyword' ? keywordCl : p.t === 'string' ? stringCl : plainCl}>{p.s}</span>
  ));
}

export default function ProjectCard({ project, isDarkMode, roundedClass = 'rounded-lg', featured = false }) {
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

  const aspectClass = featured ? 'aspect-[21/9] sm:aspect-[3/1]' : 'aspect-[5/3]';
  const hasSnippet = project.snippet;

  return (
    <div
      className={`group relative block overflow-hidden ${roundedClass} border transition-all duration-300 ease-out cursor-pointer
        hover:scale-[1.02] hover:-translate-y-1
        hover:shadow-lg
        ${isDarkMode
          ? 'border-surface-border bg-surface-card hover:border-accent/30 hover:shadow-accent/10'
          : 'border-slate-200 bg-white/90 hover:border-accent/40 hover:shadow-slate-300/50'
        }`}
    >
      <a
        href={project.githubUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-[inherit]"
      >
        <div
          className={`relative w-full overflow-hidden ${aspectClass} ${!hasSnippet ? (isDarkMode ? 'bg-surface-border/50' : 'bg-slate-100') : ''}`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {hasSnippet ? (
            <div className={`absolute inset-0 flex flex-col p-3 sm:p-4 ${
              isDarkMode
                ? 'bg-gradient-to-b from-surface-bg/95 to-surface-card'
                : 'bg-gradient-to-b from-slate-900/95 to-slate-800'
            }`}>
              <div className={`font-mono text-xs sm:text-sm leading-relaxed flex-1 min-h-0 overflow-auto flex ${
                isDarkMode ? 'text-ink-muted' : 'text-slate-300'
              }`}>
                <div className={`select-none pr-3 tabular-nums shrink-0 border-r text-right min-w-[2rem] ${isDarkMode ? 'border-white/10' : 'border-slate-500/20'}`}>
                  {project.snippet.split('\n').map((_, i) => (
                    <div key={i} className={isDarkMode ? 'text-ink-dim' : 'text-slate-500'}>{i + 1}</div>
                  ))}
                </div>
                <pre className="pl-3 flex-1 min-w-0 overflow-auto m-0">
                  {project.snippet.split('\n').map((line, i) => (
                    <div key={i}>{highlightLine(line, isDarkMode)}</div>
                  ))}
                </pre>
              </div>
            </div>
          ) : project.media?.type === 'image' && project.media?.url ? (
            <img
              src={project.media.url}
              alt={project.title}
              className="h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
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
            <div className={`flex h-full w-full items-center justify-center ${isDarkMode ? 'text-ink-dim' : 'text-slate-400'}`}>
              <span className="text-sm font-medium">{project.title}</span>
            </div>
          )}
        </div>
        <div className={featured ? 'p-4' : 'p-3'}>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            {featured && (
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${isDarkMode ? 'bg-accent/20 text-accent' : 'bg-accent/15 text-accent'}`}>
                Featured
              </span>
            )}
            {featured && project.status && (
              <span className={`text-[10px] font-mono tabular-nums ${isDarkMode ? 'text-ink-dim' : 'text-slate-500'}`}>
                {project.status}
              </span>
            )}
          </div>
          <h3
            className={`font-medium line-clamp-2 transition-colors ${
              featured ? 'text-base sm:text-lg mb-2' : 'text-sm mb-1'
            } ${isDarkMode ? 'text-ink group-hover:text-accent/90' : 'text-slate-900'}`}
          >
            {project.title}
          </h3>
          <p
            className={`leading-snug mb-2 transition-colors ${
              featured ? 'text-sm line-clamp-3' : 'text-xs line-clamp-2'
            } ${isDarkMode ? 'text-ink-muted' : 'text-slate-600'}`}
          >
            {project.description}
          </p>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {project.tags.map((tag, tagIndex) => {
              const Icon = TAG_ICONS[tag];
              return (
                <span
                  key={tagIndex}
                  className={`inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-md transition-colors ${
                    isDarkMode
                      ? 'text-ink-muted border border-surface-border bg-surface-border/40'
                      : 'text-slate-600 border border-slate-200 bg-slate-50'
                  }`}
                >
                  {Icon ? <Icon size={10} /> : null}
                  {tag}
                </span>
              );
            })}
          </div>
        </div>
      </a>
      <div className={`flex flex-wrap items-center gap-2 ${featured ? 'px-4 pb-4' : 'px-3 pb-3'} -mt-2`}>
        {project.demoUrl && (
          <a
            href={project.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md bg-accent text-white hover:bg-accent-light transition-colors"
          >
            Live demo
          </a>
        )}
        <a
          href={project.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-1 text-[11px] transition-colors ${
            isDarkMode ? 'text-ink-dim hover:text-accent' : 'text-slate-500 hover:text-accent'
          }`}
        >
          <FaGithub size={12} />
          Code
        </a>
      </div>
    </div>
  );
}
