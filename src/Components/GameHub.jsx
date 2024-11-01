import React, { useState } from 'react';
import MovieGuessingGame from './MovieGuessingGame';
import MoviewCriteriaGame from './MovieCriteriaGame';

const GameHub = () => {
  const [selectedGame, setSelectedGame] = useState(null);
  const [isNavbarOpen, setIsNavbarOpen] = useState(true);
  
  const games = [
    {
      id: 'movie-guesser',
      title: 'Movie Guesser',
      description: 'Test your movie knowledge! Guess the movie from various clues.',
      icon: '🎬',
      component: MovieGuessingGame
    },
    {
      id: 'movie-criteria',
      title: 'Movie Criteria Challenge',
      description: 'Find movies matching specific years, directors, or actors!',
      icon: '🎯',
      component: MoviewCriteriaGame
    }
  ];

  const styles = {
    mainContainer: {
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#f3f4f6',
    },
    navbar: {
      width: isNavbarOpen ? '250px' : '60px',
      backgroundColor: '#1f2937',
      transition: 'width 0.3s ease',
      padding: '20px',
      color: 'white',
      position: 'relative'
    },
    navbarHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '24px'
    },
    navbarTitle: {
      fontSize: '20px',
      fontWeight: 'bold',
      opacity: isNavbarOpen ? 1 : 0,
      transition: 'opacity 0.2s',
      whiteSpace: 'nowrap'
    },
    navbarToggle: {
      backgroundColor: 'transparent',
      border: 'none',
      color: 'white',
      cursor: 'pointer',
      padding: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '20px',
      width: '32px',
      height: '32px'
    },
    navItem: {
      padding: '12px',
      marginBottom: '8px',
      borderRadius: '8px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      transition: 'background-color 0.2s',
      backgroundColor: 'transparent',
      overflow: 'hidden',
      whiteSpace: 'nowrap'
    },
    container: {
      flex: 1,
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    header: {
      textAlign: 'center',
      marginBottom: '48px'
    },
    title: {
      fontSize: '36px',
      fontWeight: 'bold',
      marginBottom: '16px',
      color: '#1f2937'
    },
    subtitle: {
      fontSize: '18px',
      color: '#6b7280'
    },
    gamesGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '24px',
      padding: '20px'
    },
    gameCard: {
      maxWidth: '700px',
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      cursor: 'pointer',
      transition: 'transform 0.2s, box-shadow 0.2s',
      border: '1px solid #e5e7eb'
    },
    gameCardHover: {
      transform: 'translateY(-4px)',
      boxShadow: '0 8px 12px rgba(0, 0, 0, 0.15)'
    },
    icon: {
      fontSize: '48px',
      marginBottom: '16px'
    },
    gameTitle: {
      fontSize: '24px',
      fontWeight: 'bold',
      marginBottom: '8px',
      color: '#1f2937'
    },
    gameDescription: {
      color: '#6b7280',
      lineHeight: '1.5'
    },
    backButton: {
      position: 'absolute',
      top: '20px',
      left: '20px',
      padding: '8px 16px',
      borderRadius: '8px',
      border: 'none',
      backgroundColor: '#6b7280',
      color: 'white',
      cursor: 'pointer',
      fontSize: '14px'
    }
  };

  if (selectedGame) {
    const GameComponent = selectedGame.component;
    return (
      <div style={styles.mainContainer}>
        <nav style={styles.navbar}>
          <div style={styles.navbarHeader}>
            {isNavbarOpen && <span style={styles.navbarTitle}>Movie Games</span>}
            <button 
              style={styles.navbarToggle}
              onClick={() => setIsNavbarOpen(!isNavbarOpen)}
            >
              {isNavbarOpen ? '×' : '☰'}
            </button>
          </div>
          {games.map(game => (
            <div
              key={game.id}
              style={{
                ...styles.navItem,
                backgroundColor: selectedGame?.id === game.id ? '#374151' : 'transparent'
              }}
              onClick={() => setSelectedGame(game)}
            >
              <span>{game.icon}</span>
              {isNavbarOpen && <span>{game.title}</span>}
            </div>
          ))}
        </nav>
        <div style={styles.container}>
          <button 
            onClick={() => setSelectedGame(null)} 
            style={styles.backButton}
          >
            ← Back to Games
          </button>
          <GameComponent />
        </div>
      </div>
    );
  }

  return (
    <div style={styles.mainContainer}>
      <nav style={styles.navbar}>
        <div style={styles.navbarHeader}>
          {isNavbarOpen && <span style={styles.navbarTitle}>Movie Games</span>}
          <button 
            style={styles.navbarToggle}
            onClick={() => setIsNavbarOpen(!isNavbarOpen)}
          >
            {isNavbarOpen ? '×' : '☰'}
          </button>
        </div>
        {games.map(game => (
          <div
            key={game.id}
            style={styles.navItem}
            onClick={() => setSelectedGame(game)}
          >
            <span>{game.icon}</span>
            {isNavbarOpen && <span>{game.title}</span>}
          </div>
        ))}
      </nav>
      <div style={styles.container}>
        <header style={styles.header}>
          <h1 style={styles.title}>Game Hub</h1>
          <p style={styles.subtitle}>Choose your game and start playing!</p>
        </header>

        <div style={styles.gamesGrid}>
          {games.map(game => (
            <div
              key={game.id}
              style={styles.gameCard}
              onClick={() => setSelectedGame(game)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = styles.gameCardHover.transform;
                e.currentTarget.style.boxShadow = styles.gameCardHover.boxShadow;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = styles.gameCard.boxShadow;
              }}
            >
              <div style={styles.icon}>{game.icon}</div>
              <h2 style={styles.gameTitle}>{game.title}</h2>
              <p style={styles.gameDescription}>{game.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameHub;