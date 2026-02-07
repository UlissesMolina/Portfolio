import { useEffect, useState } from 'react';
import { FaExternalLinkAlt } from 'react-icons/fa';

const GITHUB_USER = 'UlissesMolina';
const COMMITS_PER_PAGE = 5;

// Theme-aligned colors for language bar (coral/orange/amber — no blue)
const LANGUAGE_COLORS = [
  '#ff6b35', '#fdba74', '#ea580c', '#f59e0b', '#d97706',
  '#fb923c', '#f97316', '#c2410c', '#9a3412', '#7c2d12',
];

function truncateMessage(msg, maxLen = 40) {
  if (!msg || msg.length <= maxLen) return msg || '';
  return msg.slice(0, maxLen).trim() + '...';
}

function formatLogDate(date) {
  if (!date || !(date instanceof Date) || isNaN(date)) return '----.--.-- --:--';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d} ${h}:${min}`;
}

export default function RecentCommitsCard({ isDarkMode, roundedClass = 'rounded-xl', cardTier = 'tertiary' }) {
  const [commits, setCommits] = useState([]);
  const [languages, setLanguages] = useState([]); // { name, percentage, color }
  const [hoveredLang, setHoveredLang] = useState(null); // for tooltip
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [repoUrl, setRepoUrl] = useState(`https://github.com/${GITHUB_USER}`);

  useEffect(() => {
    let cancelled = false;

    async function fetchCommits() {
      setLoading(true);
      setError(null);
      let lastError = null;

      try {
        // Try repos (match workspace name first, then common names)
        const reposToTry = ['personal-portflio', 'Portfolio', 'Tiger-Scheduler-Course-Auto-Register-Tool'];
        let list = [];
        let repo = reposToTry[0];

        for (const repoName of reposToTry) {
          const url = `https://api.github.com/repos/${GITHUB_USER}/${repoName}/commits?per_page=${COMMITS_PER_PAGE}`;
          const res = await fetch(url, { headers: { Accept: 'application/vnd.github.v3+json' } });
          if (!res.ok) {
            const status = res.status;
            let msg = `GitHub ${status}`;
            try {
              const body = await res.json();
              if (body?.message) msg = body.message;
              if (status === 403 && (body?.message || '').toLowerCase().includes('rate')) {
                lastError = 'GitHub rate limit exceeded. Try again in an hour or use a token.';
              } else {
                lastError = msg;
              }
            } catch (_) {
              lastError = msg;
            }
            continue;
          }
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            list = data;
            repo = repoName;
            setRepoUrl(`https://github.com/${GITHUB_USER}/${repo}/commits`);
            lastError = null;
            break;
          }
        }

        if (cancelled) {
          setLoading(false);
          return;
        }

        if (list.length === 0) {
          setCommits([]);
          setError(lastError || "Couldn't load commits. Check repo name or try again later.");
          setLoading(false);
          return;
        }

        // Build commit list and fetch stats (additions/deletions) per commit
        const baseList = list.slice(0, COMMITS_PER_PAGE);
        const withStats = await Promise.all(
          baseList.map(async (c) => {
            const author = c.commit?.author?.name || c.author?.login || 'Unknown';
            const message = c.commit?.message?.split('\n')[0] || '';
            const dateStr = c.commit?.author?.date || c.commit?.committer?.date || '';
            const date = dateStr ? new Date(dateStr) : null;
            let additions = null;
            let deletions = null;
            try {
              const detailRes = await fetch(
                `https://api.github.com/repos/${GITHUB_USER}/${repo}/commits/${c.sha}`,
                { headers: { Accept: 'application/vnd.github.v3+json' } }
              );
              if (detailRes.ok) {
                const detail = await detailRes.json();
                additions = detail.stats?.additions ?? null;
                deletions = detail.stats?.deletions ?? null;
              }
            } catch (_) {}
            return {
              author,
              message,
              date,
              additions,
              deletions,
              url: c.html_url,
            };
          })
        );

        if (!cancelled) setCommits(withStats);

        // Fetch repo languages (one extra request)
        try {
          const langRes = await fetch(
            `https://api.github.com/repos/${GITHUB_USER}/${repo}/languages`,
            { headers: { Accept: 'application/vnd.github.v3+json' } }
          );
          if (!cancelled && langRes.ok) {
            const langData = await langRes.json();
            const total = Object.values(langData).reduce((a, b) => a + b, 0);
            if (total > 0) {
              const entries = Object.entries(langData)
                .map(([name, bytes], i) => ({
                  name,
                  percentage: Math.round((bytes / total) * 100),
                  color: LANGUAGE_COLORS[i % LANGUAGE_COLORS.length],
                }))
                .sort((a, b) => b.percentage - a.percentage);
              setLanguages(entries);
            }
          }
        } catch (_) {}
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load commits');
          setCommits([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchCommits();
    return () => { cancelled = true; };
  }, []);

  const padX = cardTier === 'tertiary' ? 'px-3' : 'px-4';
  const messageColor = isDarkMode ? 'text-ink-muted' : 'text-slate-600';
  const linkColor = isDarkMode ? 'text-ink-muted hover:text-accent' : 'text-slate-600 hover:text-accent';

  return (
    <div
      className={`w-full ${roundedClass} overflow-hidden font-mono text-sm transition-colors duration-300 ${
        isDarkMode ? 'bg-surface-card/60 border border-surface-border' : 'bg-white/60 border border-slate-200'
      }`}
    >
      {/* Terminal log separator */}
      <div className={`${padX} pt-3 border-t ${isDarkMode ? 'border-surface-border' : 'border-slate-200'}`}>
        <div className={`text-xs tracking-wider ${messageColor}`}>
          ───────────────────────────────────────
        </div>
      </div>

      {/* Log lines: [date time] message    +x / -y */}
      <div className={`${padX} py-3 space-y-1`}>
        {loading ? (
          <div className={messageColor}>Loading...</div>
        ) : error ? (
          <div className={messageColor}>{error}</div>
        ) : commits.length === 0 ? (
          <div className={messageColor}>No recent commits.</div>
        ) : (
          commits.map((commit, i) => (
            <a
              key={i}
              href={commit.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`block py-0.5 rounded transition-colors ${
                isDarkMode ? 'hover:bg-surface-border/50' : 'hover:bg-slate-100'
              }`}
            >
              <span className={isDarkMode ? 'text-ink-dim' : 'text-slate-500'}>
                [{formatLogDate(commit.date)}]
              </span>
              {' '}
              <span className={messageColor}>{truncateMessage(commit.message)}</span>
              {'     '}
              <span className={isDarkMode ? 'text-emerald-500/90' : 'text-emerald-600'}>+{commit.additions ?? '—'}</span>
              <span className={isDarkMode ? 'text-slate-500' : 'text-slate-400'}> / </span>
              <span className={isDarkMode ? 'text-rose-500/90' : 'text-rose-600'}>-{commit.deletions ?? '—'}</span>
            </a>
          ))
        )}
      </div>

      {/* Watching footer */}
      <div className={`${padX} py-2 ${messageColor} text-xs`}>
        Watching for changes... (press Ctrl+C to stop)
      </div>

      {/* View on GitHub + language bar */}
      <div className={`${padX} pb-3 pt-1 border-t ${isDarkMode ? 'border-surface-border' : 'border-slate-200'}`}>
        <a
          href={repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-1.5 text-xs ${linkColor} transition-colors`}
        >
          View on GitHub
          <FaExternalLinkAlt size={10} />
        </a>
        <div className="mt-2 relative">
          <div className="flex h-1.5 w-full overflow-hidden rounded-full">
            {languages.length > 0 ? (
              languages.map((lang) => (
                <div
                  key={lang.name}
                  className="min-h-full transition-opacity hover:opacity-100 cursor-default"
                  style={{
                    width: `${lang.percentage}%`,
                    backgroundColor: lang.color,
                    opacity: 0.85,
                  }}
                  onMouseEnter={() => setHoveredLang(lang)}
                  onMouseLeave={() => setHoveredLang(null)}
                />
              ))
            ) : (
              <div className={`h-full w-full rounded-full ${isDarkMode ? 'bg-surface-border' : 'bg-slate-200'}`} />
            )}
          </div>
          {hoveredLang && (
            <div
              className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-0.5 text-xs font-medium whitespace-nowrap rounded z-20 ${
                isDarkMode ? 'bg-surface-card text-ink border border-surface-border' : 'bg-slate-800 text-slate-100 border border-slate-200'
              }`}
            >
              {hoveredLang.name} {hoveredLang.percentage}%
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
