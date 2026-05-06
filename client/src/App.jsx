import { NavLink, Routes, Route, Link } from 'react-router-dom'
import { useSession } from './hooks/useSession.js'
import Home from './pages/Home.jsx'
import Vote from './pages/Vote.jsx'
import Results from './pages/Results.jsx'
import MyPokemon from './pages/MyPokemon.jsx'
import LeaderboardPage from './pages/LeaderboardPage.jsx'
import styles from './App.module.css'

function Nav() {
  const { sessionId } = useSession();
  const linkClass = ({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link;

  return (
    <nav className={styles.nav}>
      <NavLink to="/" end className={linkClass}>Home</NavLink>
      <NavLink to="/vote" className={linkClass}>Vote</NavLink>
      {sessionId && (
        <NavLink to={`/results/${sessionId}`} className={linkClass}>Results</NavLink>
      )}
      {sessionId && (
        <NavLink to={`/my-pokemon/${sessionId}`} className={linkClass}>My Pokémon</NavLink>
      )}
      <NavLink to="/leaderboard" className={linkClass}>Leaderboard</NavLink>
    </nav>
  );
}

function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '64px 16px' }}>
      <h2>404 — Page Not Found</h2>
      <Link to="/" style={{ color: '#888' }}>Go Home</Link>
    </div>
  );
}

function App() {
  return (
    <>
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/vote" element={<Vote />} />
        <Route path="/results/:sessionId" element={<Results />} />
        <Route path="/my-pokemon/:sessionId" element={<MyPokemon />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <footer className={styles.footer}>Made by Anna Tuite — 2026</footer>
    </>
  )
}

export default App
