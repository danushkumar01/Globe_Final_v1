import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import Globe from './components/Globe';
import WorldMap from './components/WorldMap';
import { ThemeProvider } from './hooks/useTheme';
import ThemeToggle from './components/ThemeToggle';
import './App.css';
import './styles.css';

// Header component that can access location
const AppHeader = () => {
  const location = useLocation();
  const showThemeToggle = location.pathname === '/2d';

  return (
    <header className="app-header">
      <h1>Global News Visualization</h1>
      <nav className="navigation">
        <NavLink 
          to="/3d" 
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
        >
          3D Globe
        </NavLink>
        <NavLink 
          to="/2d" 
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
        >
          2D Map
        </NavLink>
      </nav>
      {showThemeToggle && <ThemeToggle />}
    </header>
  );
};

// App content that can access location for theme forcing
const AppContent = () => {
  const location = useLocation();
  const forcedTheme = location.pathname === '/3d' || location.pathname === '/' ? 'dark' : null;

  return (
    <ThemeProvider forcedTheme={forcedTheme}>
      <div className="App">
        <AppHeader />
          
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/3d" replace />} />
            <Route path="/3d" element={<Globe />} />
            <Route path="/2d" element={<WorldMap />} />
          </Routes>
        </main>
      </div>
    </ThemeProvider>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
