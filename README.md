# Personal Portfolio

A terminal-style portfolio built with React and Vite. The site looks like a live terminal: type commands to jump to sections, play a word game, or explore projects.

## Features

- **Interactive terminal** — Commands like `work`, `projects`, `contact`, `open github`, plus classic Unix-style replies (`ls`, `pwd`, `whoami`, etc.)
- **Tab completion** and **↑/↓ command history**
- **Theme switcher** — Coral, Matrix, Dracula, and Monokai (accent colors + GitHub language bar)
- **Wordle easter egg** — Type `wordle`, `wordplay`, or `puzzle` to play a 5-letter game in the terminal
- **Konami code** — ↑↑↓↓←→←→ B A for a small surprise
- **Work timeline** with expandable bullets and theme-colored connector line
- **Projects** with code snippets, tags, and links
- **Recent activity** — GitHub commits and repo language bar (theme-aware)
- **Session timer** in the footer (replaces static uptime)
- **Loading bar** when navigating between sections
- **Live clock** in the nav (desktop)

## Tech Stack

- React 19
- Vite 7
- Tailwind CSS
- react-icons

## Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Build

```bash
npm run build
npm run preview   # preview production build
```

## Project Structure

```
src/
  App.jsx         # Layout, sections, theme & Konami state
  App.css         # Theme variables, timeline, load bar, animations
  components/
    NavBar.jsx    # $ ulisses@molina ~, links, clock, theme selector
    Terminal.jsx  # Command parsing, Wordle, history, tab complete
    ProjectCard.jsx
    RecentCommitsCard.jsx
```

## License

Private — portfolio use.
