import React from 'react';
import MovieGuessingGame from './MovieGuessingGame';

const GameHub = () => {
  const [selectedGame, setSelectedGame] = React.useState(null);
  
  const games = [
    {
      id: 'movie-guesser',
      title: 'Movie Guesser',
      description: 'Test your movie knowledge! Guess the movie from various clues.',
      icon: '🎬',
      component: MovieGuessingGame
    }
    // Future games can be added here
  ];

  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
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
      <div>
        <button 
          onClick={() => setSelectedGame(null)} 
          style={styles.backButton}
        >
          ← Back to Games
        </button>
        <GameComponent />
      </div>
    );
  }

  return (
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
  );
};

export default GameHub;