import React, { useState, useEffect } from 'react';
import MovieGuessingGame from './MovieGuessingGame';
import MoviewCriteriaGame from './MovieCriteriaGame';
import UserProfile from './UserProfile';
import './GameHub.css'; 
import './GameGrid.css';

const GameHub = () => {
  const [selectedGame, setSelectedGame] = useState(null);
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);
  const [language, setLanguage] = useState('en');
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedDarkMode = localStorage.getItem('movieGameDarkMode');
    return savedDarkMode !== null ? JSON.parse(savedDarkMode) : false;
  });
  
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    localStorage.setItem('movieGameDarkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const [userProfile, setUserProfile] = useState(() => {
    // Try to load profile from localStorage on initial load
    const savedProfile = localStorage.getItem('movieGameProfile');
    return savedProfile ? JSON.parse(savedProfile) : null;
  });

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(!userProfile);

  const handleProfileUpdate = (newProfile) => { 
    setUserProfile(newProfile);
    setIsProfileModalOpen(false);
  };

  // Function to open profile modal
  const openProfileModal = () => {
    setIsProfileModalOpen(true);

  };

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

  const colors = {
    light: {
      background: '#f3f4f6',
      navbarText: "#e5e7eb",
      text: '#1f2937',
      secondaryText: '#6b7280',
      navBackground: '#1f2937',
      cardBackground: 'white',
      cardBorder: '#e5e7eb',
      navItem: '#374151',
      highlight: '#374151'
    },
    dark: {
      background: '#121826',
      navbarText: "#e5e7eb",
      text: '#e5e7eb',
      secondaryText: '#9ca3af',
      navBackground: '#1f2937',
      cardBackground: '#1f2937',
      cardBorder: '#374151',
      navItem: '#374151',
      highlight: '#4b5563'
    }
  };

  const getCurrentColors = () => colors[isDarkMode ? 'dark' : 'light'];

   const styles = {
    mainContainer: {
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: getCurrentColors().background,
      position: 'relative',
      color: getCurrentColors().text
    },
    navbarHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '24px',
      position: 'relative'
    },
    navbarContent: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      color: getCurrentColors().text
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
      height: '32px',
      left: isNavbarOpen ? '20px' : '10px',
      top: '20px',
      zIndex: 1001,
      '@media (max-width: 768px)': {
        left: isNavbarOpen ? 'auto' : '10px',
        right: isNavbarOpen ? '20px' : 'auto'
      }
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
      whiteSpace: 'normal',
      wordBreak: 'break-word',
      color: getCurrentColors().navbarText
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
      marginLeft: windowWidth > 768 
        ? (isNavbarOpen ? '250px' : '60px') 
        : '0',
      flex: 1,
      transition: 'margin-left 0.3s ease',
      width: '100%',
      position: 'relative',
      overflow: 'hidden' // Prevent horizontal scrolling
    },
    container: {
      padding: '20px',
      //marginLeft: -100, adding for more left main hub
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
      color: getCurrentColors().text
    },
    subtitle: {
      fontSize: '18px',
      color: getCurrentColors().secondaryText
    },
    gameCard: {
      backgroundColor: getCurrentColors().cardBackground,
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      cursor: 'pointer',
      transition: 'transform 0.2s, box-shadow 0.2s',
      border: `1px solid ${getCurrentColors().cardBorder}`,
      color: getCurrentColors().text
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
      color: getCurrentColors().text
    },
    gameDescription: {
      color: '#6b7280',
      lineHeight: '1.5'
    },
    backButton: {
      position: 'fixed',
      top: windowWidth <= 1150 ? '20px' : '80px',
      right: windowWidth <= 1150 ? '20px' : '100px',
      width: windowWidth <= 1150 ? '40px' : '50px',
      height: windowWidth <= 1150 ? '40px' : '50px',
      borderRadius: '50%',
      border: 'none',
      backgroundColor: '#8a93a6',
      color: 'white',
      cursor: 'pointer',
      fontSize: '18px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.3s ease',
      zIndex: 999,
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    },
    backButtonIcon: {
      transform: 'scaleX(0.7)',
      display: 'inline-block',
      marginTop: '-2px'
    },
    darkModeToggle: {
      position: 'absolute',
      top: isNavbarOpen ? 'auto' : 'auto', // Adjust vertical positioning
      bottom: isNavbarOpen ? '65px' : '110px', // Position above language switch when closed
      right: isNavbarOpen ? '30px' : '35px', // Right side in both states
      backgroundColor: 'transparent',
      border: 'none',
      cursor: 'pointer',
      fontSize: '24px'
    },
    profileBadge: {
      position: 'absolute',
      top: isNavbarOpen ? '20px' : '20px',
      right: isNavbarOpen ? '70px' : '70px',
      zIndex: 1002,
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      cursor: 'pointer',
      backgroundColor: isDarkMode ? '#374151' : '#f3f4f6',
      padding: '8px 12px',
      borderRadius: '20px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
    },
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const renderNavbar = () => (
    <>
      <button 
        className={`mobile-menu-button ${isNavbarOpen ? 'hidden' : ''}`}
        onClick={() => setIsNavbarOpen(!isNavbarOpen)}
      >
        ☰
      </button>
      <nav className={`navbar ${isNavbarOpen ? 'open' : ''}`}>
        <div style={styles.navbarHeader}>
          {isNavbarOpen && (
            <span style={styles.navbarTitle}>
              {language === 'en' ? 'Movie Games' : 'Filmspiele'}
            </span>
          )}
          <button 
            style={styles.navbarToggle}
            onClick={() => setIsNavbarOpen(!isNavbarOpen)}
          >
            {isNavbarOpen ? '×' : '☰'}
          </button>
        </div>
      <div style={styles.navbarContent}>
        <div>
          <div
            key="game-hub"
            style={{
              ...styles.navItem,
              backgroundColor: !selectedGame ? '#374151' : 'transparent'
            }}
            onClick={() => setSelectedGame(null)}
          >
            <span>🏠</span>
            {isNavbarOpen && <span>{language === 'en' ? 'Game Hub' : 'Spieleübersicht'}</span>}
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
        </div>

        <button 
          style={styles.darkModeToggle}
          onClick={toggleDarkMode}
          aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>
        
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

    <div 
      className={`profileBadge ${isDarkMode ? 'dark-mode' : 'light-mode'}`}
      onClick={openProfileModal}
      >
      {userProfile ? (
        <>
          <span style={{
            fontSize: '24px',
            marginRight: '8px'
          }}>
            {userProfile.avatar}
          </span>
          <div style={{
            display: 'flex',
            flexDirection: 'column'
          }}>
            <span style={{
              color: isDarkMode ? '#e5e7eb' : '#1f2937',
              fontWeight: 'bold'
            }}>
              {userProfile.username}
            </span>
            <span style={{
              fontSize: '12px',
              color: isDarkMode ? '#9ca3af' : '#6b7280'
            }}>
              Score: {userProfile?.gameStats?.totalScore || 0}
            </span>
          </div>
        </>
      ) : (
        <span style={{
          color: isDarkMode ? '#e5e7eb' : '#1f2937',
          fontWeight: 'bold'
        }}>
          {language === 'en' ? 'Create Profile' : 'Profil erstellen'}
        </span>
      )}
      </div>
      </>
    );

  const renderContent = () => {
    if (isProfileModalOpen) {
      return (
        <UserProfile 
          language={language}
          isDarkMode={isDarkMode}
          onClose={() => setIsProfileModalOpen(false)}
          onProfileUpdate={handleProfileUpdate}
        />
      );
    }
    if (selectedGame) {
      const GameComponent = selectedGame.component;
      return (
        <div style={styles.container}>
          <button 
            onClick={() => setSelectedGame(null)} 
            style={styles.backButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 12px rgba(0, 0, 0, 0.15)';
              e.currentTarget.style.backgroundColor = '#374151';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
              e.currentTarget.style.backgroundColor = '#8a93a6';
            }}
            aria-label={language === 'en' ? 'Back to Games' : 'Zurück zu den Spielen'}
          >
            <span style={styles.backButtonIcon}>&#10094;</span>
          </button>
          <GameComponent language={language} isDarkMode={isDarkMode} userProfile={userProfile}/>
        </div>
      );
    }

    return (
      <div style={styles.container}>
        <header style={styles.header}>
          <h1 style={styles.title}>
            {language === 'en' ? 'Game Hub' : 'Game Hub'}
          </h1>
          <p style={styles.subtitle}>
            {language === 'en' 
              ? 'Choose your game and start playing!'
              : 'Wähle dein Spiel und beginne zu spielen!'}
          </p>
        </header>

        <div className="games-grid">
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

// streak tracking mechanism
// achievements system ("Guessed 10 Movies in a Row", "Master of Year Mode")
// daily quests
// Leaderboard for daily points made
// Combo Bonus (every 5/10 bonuses)
// Movie Poster
// Persistent Score Tracking
// Updating Score directly

// Genre Guessing Mode
// Quote Guessing Mode
// Oscar Winners Mode
// Soundtrack/Music Mode
// speedrun mode
// 10 films in 3 minutes mode

// Animated Transitions
// Theme Customization
// Sound Effects