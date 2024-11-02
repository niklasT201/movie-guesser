import React, { useState } from 'react';
import MovieGuessingGame from './MovieGuessingGame';
import MoviewCriteriaGame from './MovieCriteriaGame';

const GameHub = () => {
  const [selectedGame, setSelectedGame] = useState(null);
  const [isNavbarOpen, setIsNavbarOpen] = useState(true);
  const [language, setLanguage] = useState('en'); // 'en' or 'de'
  
  const games = [
    {
      id: 'movie-guesser',
      title: language === 'en' ? 'Movie Guesser' : 'Film Raten',
      description: language === 'en' 
        ? 'Test your movie knowledge! Guess the movie from various clues.'
        : 'Teste dein Filmwissen! Errate den Film anhand verschiedener Hinweise.',
      icon: '🎬',
      component: MovieGuessingGame
    },
    {
      id: 'movie-criteria',
      title: language === 'en' ? 'Movie Criteria Challenge' : 'Film-Kriterien Challenge',
      description: language === 'en'
        ? 'Find movies matching specific years, directors, or actors!'
        : 'Finde Filme, die bestimmten Jahren, Regisseuren oder Schauspielern entsprechen!',
      icon: '🎯',
      component: MoviewCriteriaGame
    }
  ];

  const styles = {
    mainContainer: {
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#f3f4f6',
      position: 'relative',
    },
    navbar: {
      width: isNavbarOpen ? '250px' : '60px',
      backgroundColor: '#1f2937',
      transition: 'width 0.3s ease',
      padding: '20px',
      color: 'white',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      overflowX: 'hidden'
    },
    navbarHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '24px'
    },
    navbarContent: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
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
      whiteSpace: 'nowrap'
    },
    languageSelector: {
      marginBottom: 30,
      padding: '12px',
      borderTop: '1px solid #374151',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    languageFlag: {
      fontSize: '20px',
      cursor: 'pointer'
    },
    languageButton: {
      backgroundColor: 'transparent',
      border: 'none',
      color: 'white',
      cursor: 'pointer',
      padding: '8px',
      borderRadius: '4px',
      transition: 'background-color 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    activeLanguage: {
      backgroundColor: '#374151'
    },
    mainContent: {
      marginLeft: isNavbarOpen ? '250px' : '60px',
      flex: 1,
      transition: 'margin-left 0.3s ease'
    },
    container: {
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    header: {
      textAlign: 'center',
      marginBottom: '48px',
      maxWidth: '800px',
      margin: '0 auto 48px auto'
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
      maxWidth: '1100px',
      margin: '0 auto',
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
      padding: '8px 16px',
      borderRadius: '8px',
      border: 'none',
      backgroundColor: '#6b7280',
      color: 'white',
      cursor: 'pointer',
      fontSize: '14px',
      marginBottom: '20px',
      marginLeft: '20px'
    }
  };

  const renderNavbar = () => (
    <nav style={styles.navbar}>
      <div style={styles.navbarHeader}>
        {isNavbarOpen && <span style={styles.navbarTitle}>
          {language === 'en' ? 'Movie Games' : 'Filmspiele'}
        </span>}
        <button 
          style={styles.navbarToggle}
          onClick={() => setIsNavbarOpen(!isNavbarOpen)}
        >
          {isNavbarOpen ? '×' : '☰'}
        </button>
      </div>
      <div style={styles.navbarContent}>
        <div>
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
        </div>
        
        <div style={styles.languageSelector}>
          {isNavbarOpen ? (
            <>
              <button
                style={{
                  ...styles.languageButton,
                  ...(language === 'en' ? styles.activeLanguage : {})
                }}
                onClick={() => setLanguage('en')}
              >
                <span>🇺🇸</span>
                <span>EN</span>
              </button>
              <button
                style={{
                  ...styles.languageButton,
                  ...(language === 'de' ? styles.activeLanguage : {})
                }}
                onClick={() => setLanguage('de')}
              >
                <span>🇩🇪</span>
                <span>DE</span>
              </button>
            </>
          ) : (
            <div 
              style={styles.languageFlag}
              onClick={() => setLanguage(language === 'en' ? 'de' : 'en')}
            >
              {language === 'en' ? '🇺🇸' : '🇩🇪'}
            </div>
          )}
        </div>
      </div>
    </nav>
  );

  const renderContent = () => {
    if (selectedGame) {
      const GameComponent = selectedGame.component;
      return (
        <div style={styles.container}>
          <button 
            onClick={() => setSelectedGame(null)} 
            style={styles.backButton}
          >
            {language === 'en' ? '← Back to Games' : '← Zurück zu den Spielen'}
          </button>
          <GameComponent language={language} />
        </div>
      );
    }

    return (
      <div style={styles.container}>
        <header style={styles.header}>
          <h1 style={styles.title}>
            {language === 'en' ? 'Game Hub' : 'Spielezentrale'}
          </h1>
          <p style={styles.subtitle}>
            {language === 'en' 
              ? 'Choose your game and start playing!'
              : 'Wähle dein Spiel und beginne zu spielen!'}
          </p>
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

  return (
    <div style={styles.mainContainer}>
      {renderNavbar()}
      <div style={styles.mainContent}>
        {renderContent()}
      </div>
    </div>
  );
};

export default GameHub;