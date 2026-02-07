import { useEffect, useState } from 'react';
import { FaExternalLinkAlt } from 'react-icons/fa';

const GITHUB_USER = 'UlissesMolina';
const DEFAULT_REPO = 'Portfolio'; // fallback repo for commits
const COMMITS_PER_PAGE = 5;

// Colors for language bar segments (one per language, by order)
const LANGUAGE_COLORS = [
  '#3b82f6', '#3178c6', '#f97316', '#84cc16', '#ef4444',
  '#8b5cf6', '#ec4899', '#06b6d4', '#eab308', '#22c55e',
];

function truncateMessage(msg, maxLen = 48) {
  if (!msg || msg.length <= maxLen) return msg || '';
  return msg.slice(0, maxLen).trim() + '...';
}

export default function RecentCommitsCard({ isDarkMode }) {
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
      try {
        // Try portfolio repo first, then fallback to user's first repo with activity
        const reposToTry = [DEFAULT_REPO, 'personal-portflio', 'Tiger-Scheduler-Course-Auto-Register-Tool'];
        let list = [];
        let repo = DEFAULT_REPO;

        for (const repoName of reposToTry) {
          const res = await fetch(
            `https://api.github.com/repos/${GITHUB_USER}/${repoName}/commits?per_page=${COMMITS_PER_PAGE}`,
            { headers: { Accept: 'application/vnd.github.v3+json' } }
          );
          if (!res.ok) continue;
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            list = data;
            repo = repoName;
            setRepoUrl(`https://github.com/${GITHUB_USER}/${repo}/commits`);
            break;
          }
        }

        if (cancelled || list.length === 0) {
          setCommits([]);
          setLoading(false);
          return;
        }

        // Optionally fetch stats (additions/deletions) for each commit
        const withStats = await Promise.all(
          list.slice(0, COMMITS_PER_PAGE).map(async (c) => {
            const author = c.commit?.author?.name || c.author?.login || 'Unknown';
            const message = c.commit?.message?.split('\n')[0] || '';
            const sha = c.sha;
            let additions = null;
            let deletions = null;
            try {
              const detailRes = await fetch(
                `https://api.github.com/repos/${GITHUB_USER}/${repo}/commits/${sha}`,
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
              additions,
              deletions,
              url: c.html_url,
            };
          })
        );

        if (!cancelled) setCommits(withStats);

        // Fetch repo languages for the bar (same repo we showed commits from)
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

  /* Match site theme: teal + slate like project cards and nav */
  const cardBg = isDarkMode
    ? 'bg-teal-950/20 border-teal-900/40'
    : 'bg-white/80 border-teal-200/80 shadow-sm';
  const titleColor = isDarkMode ? 'text-teal-100/90' : 'text-slate-800';
  const authorColor = isDarkMode ? 'text-teal-400' : 'text-teal-600';
  const messageColor = isDarkMode ? 'text-slate-300/90' : 'text-slate-600';
  const linkColor = isDarkMode ? 'text-teal-400/90 hover:text-teal-300' : 'text-teal-600 hover:text-teal-700';
  const headerBorder = isDarkMode ? 'border-teal-900/30' : 'border-teal-200/60';

  return (
    <div
      className={`w-full max-w-2xl rounded-xl border ${cardBg} overflow-hidden transition-colors duration-300`}
    >
      {/* Header */}
      <div className={`flex items-center gap-2 px-4 py-3 border-b ${headerBorder}`}>
        <span className={linkColor}>
          <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path opacity="0.5" d="M2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12Z" fill="currentColor"/>
            <path d="M11.2274 8.56904L9.21236 10.1737C8.36695 10.8469 7.94424 11.1836 8.02675 11.5594L8.03114 11.578C8.12514 11.9515 8.66096 12.0951 9.73259 12.3823C10.3281 12.5418 10.6259 12.6216 10.7656 12.8473L10.7727 12.8592C10.9075 13.0876 10.8308 13.3737 10.6775 13.9459L10.6374 14.0954L10.6374 14.0954C10.2123 15.6818 9.99979 16.4749 10.4091 16.7311C10.8184 16.9872 11.4697 16.4686 12.7722 15.4314L12.7723 15.4314L14.7873 13.8267C15.6327 13.1535 16.0554 12.8169 15.9729 12.441L15.9686 12.4224C15.8745 12.0489 15.3387 11.9053 14.2671 11.6182C13.6716 11.4586 13.3738 11.3788 13.2341 11.1531L13.227 11.1412C13.0922 10.9128 13.1689 10.6267 13.3222 10.0546L13.3623 9.905C13.7873 8.31864 13.9999 7.52547 13.5905 7.26931C13.1812 7.01316 12.5299 7.53179 11.2274 8.56904Z" fill="currentColor"/>
          </svg>
        </span>
        <h3 className={`font-serif text-lg font-medium ${titleColor}`}>
          Recent Commits
        </h3>
      </div>

      {/* Commit list */}
      <div className="px-4 py-3">
        {loading ? (
          <div className={`text-sm ${messageColor}`}>Loading commits...</div>
        ) : error ? (
          <div className={`text-sm ${messageColor}`}>{error}</div>
        ) : commits.length === 0 ? (
          <div className={`text-sm ${messageColor}`}>No recent commits to show.</div>
        ) : (
          <ul className="space-y-2">
            {commits.map((commit, i) => (
              <li key={i} className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
                <span className="min-w-0 flex-1">
                  <span className={`font-medium ${authorColor}`}>{commit.author}:</span>{' '}
                  <span className={messageColor}>{truncateMessage(commit.message)}</span>
                </span>
                <span className="flex items-center gap-1 flex-shrink-0">
                  <span className={isDarkMode ? 'text-green-400' : 'text-green-600'}>+{commit.additions ?? '—'}</span>
                  <span className={isDarkMode ? 'text-slate-500' : 'text-slate-400'}>/</span>
                  <span className={isDarkMode ? 'text-red-400' : 'text-red-600'}>-{commit.deletions ?? '—'}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Footer: View on GitHub + activity bar */}
      <div className="px-4 pb-4">
        <a
          href={repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-1.5 text-sm ${linkColor} transition-colors`}
        >
          View on GitHub
          <FaExternalLinkAlt size={12} />
        </a>
        {/* Language bar: hover shows "Language XX%" tooltip (below bar so it's not clipped) */}
        <div className="mt-3 relative">
          <div className="flex h-2 w-full overflow-hidden rounded-full">
            {languages.length > 0 ? (
              languages.map((lang) => (
                <div
                  key={lang.name}
                  className="min-h-full transition-opacity hover:opacity-100 cursor-default"
                  style={{
                    width: `${lang.percentage}%`,
                    backgroundColor: lang.color,
                    opacity: 0.9,
                  }}
                  onMouseEnter={() => setHoveredLang(lang)}
                  onMouseLeave={() => setHoveredLang(null)}
                />
              ))
            ) : (
              <div className={`h-full w-full rounded-full ${isDarkMode ? 'bg-teal-950/50' : 'bg-teal-100/80'}`} />
            )}
          </div>
          {hoveredLang && (
            <div
              className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs font-medium whitespace-nowrap rounded z-20 ${
                isDarkMode
                  ? 'bg-teal-950/95 text-teal-100 border border-teal-800 shadow-lg'
                  : 'bg-slate-800 text-slate-100 border border-teal-200 shadow-lg'
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
