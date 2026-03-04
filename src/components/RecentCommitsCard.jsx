import { useEffect, useState } from 'react';
import { FaExternalLinkAlt } from 'react-icons/fa';

const GITHUB_USER = 'UlissesMolina';
const ALL_REPOS = [
  'personal-portflio',
  'Trackr',
  'Tiger-Scheduler-Course-Auto-Register-Tool',
  'FinanceDashBoard',
  'Enterprise',
];
const COMMITS_PER_REPO = 3;
const MAX_DISPLAY = 6;

const LANGUAGE_COLORS_BY_THEME = {
  coral: [
    '#ff6b35', '#ea580c', '#f59e0b', '#dc2626', '#d97706',
    '#c2410c', '#b45309', '#9a3412', '#7c2d12', '#78350f',
  ],
  matrix: [
    '#00ff41', '#22c55e', '#16a34a', '#15803d', '#0d9488',
    '#0f766e', '#0d3d0d', '#14532d', '#052e16', '#064e3b',
  ],
  dracula: [
    '#bd93f9', '#a855f7', '#8b5cf6', '#c084fc', '#7c3aed',
    '#ec4899', '#6d28d9', '#be185d', '#4c1d95', '#9d174d',
  ],
  frost: [
    '#5dadec', '#0ea5e9', '#a5f3fc', '#1d4ed8', '#67e8f9',
    '#1e3a5f', '#38bdf8', '#0c4a6e', '#7dd3fc', '#082f49',
  ],
};

// Short display names for repo labels
const REPO_LABELS = {
  'personal-portflio': 'portfolio',
  'Trackr': 'trackr',
  'Tiger-Scheduler-Course-Auto-Register-Tool': 'tiger-scheduler',
  'FinanceDashBoard': 'clarity-finance',
  'Enterprise': 'enterprise-api',
};

function truncateMessage(msg, maxLen = 38) {
  if (!msg || msg.length <= maxLen) return msg || '';
  return msg.slice(0, maxLen).trim() + '…';
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

async function fetchRepoCommits(repo) {
  try {
    const url = `https://api.github.com/repos/${GITHUB_USER}/${repo}/commits?per_page=${COMMITS_PER_REPO}`;
    const res = await fetch(url, { headers: { Accept: 'application/vnd.github.v3+json' } });
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map((c) => ({
      repo,
      repoLabel: REPO_LABELS[repo] ?? repo,
      message: c.commit?.message?.split('\n')[0] || '',
      date: c.commit?.author?.date ? new Date(c.commit.author.date) : null,
      url: c.html_url,
    }));
  } catch {
    return [];
  }
}

export default function RecentCommitsCard({ theme = 'coral', roundedClass = 'rounded-xl', cardTier = 'tertiary' }) {
  const languageColors = LANGUAGE_COLORS_BY_THEME[theme] ?? LANGUAGE_COLORS_BY_THEME.coral;
  const [commits, setCommits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchAll() {
      setLoading(true);
      setError(null);
      try {
        const results = await Promise.all(ALL_REPOS.map(fetchRepoCommits));
        if (cancelled) return;
        const all = results
          .flat()
          .filter((c) => c.date)
          .sort((a, b) => b.date - a.date)
          .slice(0, MAX_DISPLAY);
        if (all.length === 0) {
          setError("Couldn't load commits. Check back later.");
        } else {
          setCommits(all);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load commits');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchAll();
    return () => { cancelled = true; };
  }, []);

  const padX = cardTier === 'tertiary' ? 'px-3' : 'px-4';
  const messageColor = 'text-ink-muted';
  const linkColor = 'text-ink-muted hover:text-accent';

  // Build a simple repo activity bar: count commits per repo from displayed list
  const repoCounts = commits.reduce((acc, c) => {
    acc[c.repoLabel] = (acc[c.repoLabel] ?? 0) + 1;
    return acc;
  }, {});
  const repoEntries = Object.entries(repoCounts).sort((a, b) => b[1] - a[1]);
  const totalCommits = commits.length;

  return (
    <div
      className={`w-full ${roundedClass} overflow-hidden font-mono text-sm transition-colors duration-300 bg-surface-card/60 border border-surface-border`}
    >
      <div className={`${padX} pt-3 border-t border-surface-border`}>
        <div className={`text-xs tracking-wider ${messageColor}`}>
          ───────────────────────────────────────
        </div>
      </div>

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
              className="flex items-baseline gap-2 py-0.5 rounded transition-colors hover:bg-surface-border/50"
            >
              <span className="text-ink-dim shrink-0">
                [{formatLogDate(commit.date)}]
              </span>
              <span className="text-[10px] shrink-0 border border-accent/30 bg-accent/10 text-accent px-1.5 rounded">
                {commit.repoLabel}
              </span>
              <span className={`${messageColor} truncate`}>{truncateMessage(commit.message)}</span>
            </a>
          ))
        )}
      </div>

      <div className={`${padX} py-2 ${messageColor} text-xs`}>
        Watching for changes... (press Ctrl+C to stop)
      </div>

      <div className={`${padX} pb-3 pt-1 border-t border-surface-border`}>
        <a
          href={`https://github.com/${GITHUB_USER}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-1.5 text-xs ${linkColor} transition-colors`}
        >
          View all repos
          <FaExternalLinkAlt size={10} />
        </a>
        {repoEntries.length > 0 && (
          <div className="mt-2 relative">
            <div className="flex h-1.5 w-full overflow-hidden rounded-full">
              {repoEntries.map(([label, count], i) => (
                <div
                  key={label}
                  className="min-h-full transition-opacity hover:opacity-100 cursor-default"
                  title={`${label}: ${count} commit${count !== 1 ? 's' : ''}`}
                  style={{
                    width: `${(count / totalCommits) * 100}%`,
                    backgroundColor: languageColors[i % languageColors.length],
                    opacity: 0.85,
                  }}
                />
              ))}
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5">
              {repoEntries.map(([label, count], i) => (
                <span key={label} className="flex items-center gap-1 text-[10px] text-ink-dim">
                  <span
                    className="inline-block w-2 h-2 rounded-full"
                    style={{ backgroundColor: languageColors[i % languageColors.length] }}
                  />
                  {label}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
