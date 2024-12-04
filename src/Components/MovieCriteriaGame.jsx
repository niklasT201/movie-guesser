import React, { useState, useEffect, useCallback } from 'react';
import './MovieCriteriaGame.css';

const API_KEY = '014c0bfe3d16b0265fdd1fe8a7ccf1aa';

const translations = {
  en: {
    movieCriteriaChallenge: 'Movie Criteria Challenge',
    selectGameSettings: 'Select your game settings',
    keepSameCriteria: 'Keep same criteria',
    changeCriteriaEachRound: 'Change criteria each round',
    randomMode: 'Random Mode',
    selectGameMode: 'Select your game mode',
    backToModes: '← Back to Modes',
    score: 'Score',
    guesses: 'Guesses',
    movieWith: 'A movie with',
    movieFrom: 'A movie from',
    enterMovieTitle: 'Enter movie title...',
    guess: 'Guess',
    gameOver: 'Game Over!',
    finalScore: 'Final Score',
    playAgain: 'Play Again',
    changeMode: 'Change Mode',
    congratulations: 'Congratulations!',
    correct: 'Correct! Great job!',
    incorrect: 'Incorrect. Try again!'
  },
  de: {
    movieCriteriaChallenge: 'Film-Kriterien Challenge',
    selectGameSettings: 'Wähle deine Spieleinstellungen',
    keepSameCriteria: 'Gleiche Kriterien behalten',
    changeCriteriaEachRound: 'Kriterien pro Runde ändern',
    randomMode: 'Zufallsmodus',
    selectGameMode: 'Wähle deinen Spielmodus',
    backToModes: '← Zurück zur Auswahl',
    score: 'Punkte',
    guesses: 'Versuche',
    movieWith: 'Ein Film mit',
    movieFrom: 'Ein Film aus dem Jahr',
    enterMovieTitle: 'Filmtitel eingeben...',
    guess: 'Raten',
    gameOver: 'Spiel vorbei!',
    finalScore: 'Endpunktzahl',
    playAgain: 'Nochmal spielen',
    changeMode: 'Modus ändern',

    congratulations: 'Glückwunsch!',
    correct: 'Richtig! Gut gemacht!',
    incorrect: 'Falsch. Versuch es nochmal!'
  }
};

const GAME_MODES = {
  ACTOR: {
    nameEN: 'Actor Mode',
    nameDE: 'Schauspieler-Modus',
    type: 'actor',
    descriptionEN: 'Guess movies by actor',
    descriptionDE: 'Rate Filme nach Schauspieler',
    color: '#22c55e'
  },
  DIRECTOR: {
    nameEN: 'Director Mode',
    nameDE: 'Regisseur-Modus',
    type: 'director',
    descriptionEN: 'Guess movies by director',
    descriptionDE: 'Rate Filme nach Regisseur',
    color: '#3b82f6'
  },
  YEAR: {
    nameEN: 'Year Mode',
    nameDE: 'Jahres-Modus',
    type: 'year',
    descriptionEN: 'Guess movies by year',
    descriptionDE: 'Rate Filme nach Jahr',
    color: '#ef4444'
  },
  RANDOM: {
    nameEN: 'Random Mode',
    nameDE: 'Zufalls-Modus',
    type: 'random',
    descriptionEN: 'Random criteria each round',
    descriptionDE: 'Zufällige Kriterien in jeder Runde',
    color: '#8b5cf6'
  }
};


const MovieCriteriaGame = ({ language, isDarkMode, onProfileUpdate}) => {
  const [gameMode, setGameMode] = useState(null);
  const [criteriaChangeMode, setCriteriaChangeMode] = useState('multiple');
  const [randomMode, setRandomMode] = useState(false);
  const [score, setScore] = useState(0);
  const [currentCriteria, setCurrentCriteria] = useState(null);
  const [criteriaType, setCriteriaType] = useState(null);
  const [guess, setGuess] = useState('');
  const [gameState, setGameState] = useState('playing');
  const [guessesRemaining, setGuessesRemaining] = useState(3);
  const [notification, setNotification] = useState(null);
  const t = translations[language];
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const getCurrentColors = () => colors[isDarkMode ? 'dark' : 'light'];
  
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Function to get a random year between 1970 and current year
  const getRandomYear = () => {
    const currentYear = new Date().getFullYear();
    return Math.floor(Math.random() * (currentYear - 1970 + 1)) + 1970;
  };

  // Function to get a random person (director or actor)
  const getRandomPerson = useCallback(async (type) => {
    try {
      const page = Math.floor(Math.random() * 5) + 1;
      const response = await fetch(
        `https://api.themoviedb.org/3/person/popular?api_key=${API_KEY}&language=en-US&page=${page}`
      );
      const data = await response.json();
      const person = data.results[Math.floor(Math.random() * data.results.length)];
      
      const detailResponse = await fetch(
        `https://api.themoviedb.org/3/person/${person.id}?api_key=${API_KEY}&append_to_response=credits`
      );
      const detailData = await detailResponse.json();
      
      const hasRole = type === 'director' 
        ? detailData.credits.crew?.some(credit => credit.job === "Director")
        : detailData.credits.cast?.length > 0;
      
      if (hasRole) {
        return person.name;
      } else {
        return getRandomPerson(type);
      }
    } catch (error) {
      console.error("Error fetching person:", error);
      return null;
    }
  }, []);

  // Function to generate new criteria based on game mode
  const generateNewCriteria = useCallback(async () => {
    const type = gameMode === 'RANDOM' 
      ? ['year', 'director', 'actor'][Math.floor(Math.random() * 3)]
      : GAME_MODES[gameMode].type;
    
    setCriteriaType(type);
    let newCriteria;
    
    if (type === 'year') {
      newCriteria = getRandomYear();
    } else {
      newCriteria = await getRandomPerson(type);
    }
    
    setCurrentCriteria(newCriteria);
    setGuessesRemaining(3);
    setGuess('');
  }, [gameMode, getRandomPerson]);

  // Initialize game when mode is selected
  useEffect(() => {
    if (gameMode) {
      generateNewCriteria();
    }
  }, [gameMode, generateNewCriteria]);

  // Function to verify guess
  const verifyGuess = async () => {
    if (!guess.trim()) return;
    
    try {
      // Search for the movie
      const searchResponse = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&language=en-US&query=${guess}&page=1`
      );
      const searchData = await searchResponse.json();
      
      if (searchData.results.length === 0) {
        setGuessesRemaining(prev => prev - 1);
        setScore(prev => prev - 50);
        setGuess('');
        if (guessesRemaining <= 1) {
          setGameState('lost');
        }
        return;
      }

      const movie = searchData.results[0];
      const movieResponse = await fetch(
        `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${API_KEY}&append_to_response=credits`
      );
      const movieData = await movieResponse.json();

      const releaseYear = new Date(movieData.release_date).getFullYear();
      const director = movieData.credits.crew.find(person => person.job === "Director")?.name;
      const actors = movieData.credits.cast.map(actor => actor.name);

      let isCorrect = false;
      switch (criteriaType) {
        case 'year':
          isCorrect = releaseYear === currentCriteria;
          break;
        case 'director':
          isCorrect = director?.toLowerCase() === currentCriteria?.toLowerCase();
          break;
        case 'actor':
          isCorrect = actors.some(actor => 
            actor.toLowerCase() === currentCriteria?.toLowerCase()
          );
          break;
        default:
          isCorrect = false;
          break;
      }

      if (isCorrect) {
        // Update local storage profile with new scores
        const storedProfile = JSON.parse(localStorage.getItem('movieGameProfile'));
        if (storedProfile) {
          // Get current date
          const today = new Date();
          const currentDate = today.toISOString().split('T')[0];
  
          // Parse the last score update date
          const lastUpdateDate = storedProfile.gameStats.lastScoreUpdate 
            ? new Date(storedProfile.gameStats.lastScoreUpdate).toISOString().split('T')[0] 
            : null;
  
          // Update total score
          storedProfile.gameStats.totalScore = 
            (storedProfile.gameStats.totalScore || 0) + 100;
  
          // Check if it's a new day or first score
          if (currentDate !== lastUpdateDate) {
            // Reset daily score if it's a new day
            storedProfile.gameStats.dailyScore = 100;
          } else {
            // Add to existing daily score
            storedProfile.gameStats.dailyScore = 
              (storedProfile.gameStats.dailyScore || 0) + 100;
          }
  
          // Update last score update timestamp
          storedProfile.gameStats.lastScoreUpdate = today.toISOString();
  
          // Save updated profile
          localStorage.setItem('movieGameProfile', JSON.stringify(storedProfile));
  
          // Call onProfileUpdate if it exists
          if (onProfileUpdate) {
            onProfileUpdate(storedProfile);
          }
        }

        setScore(prev => prev + 100);
        setNotification({ type: 'success', message: t.correct });
        
        // Generate new criteria if in multiple mode or random mode
        if (randomMode || criteriaChangeMode === 'multiple') {
          generateNewCriteria();
        } else {
          // Just reset guesses and guess input for same criteria
          setGuessesRemaining(3);
          setGuess('');
        }
      } else {
        setGuessesRemaining(prev => prev - 1);
        setScore(prev => prev - 50);
        setNotification({ type: 'error', message: t.incorrect });
        if (guessesRemaining <= 1) {
          setGameState('lost');
        }
        setGuess('');
      }
    } catch (error) {
      console.error("Error verifying guess:", error);
    }
  };

  // Effect to clear notification after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const colors = {
    light: {
      background: '#f3f4f6',
      text: '#1f2937',
      secondaryText: '#6b7280',
      cardBackground: 'white',
      cardBorder: '#e5e7eb',
      inputBackground: '#f9fafb',
      inputBorder: '#e5e7eb',
      statBackground: '#f3f4f6',
      buttonBackground: '#3b82f6',
      buttonHover: '#2563eb',
      selectorBackground: '#d1d5db',
    },

    dark: {
      background: '#121826',
      text: '#e5e7eb',
      secondaryText: '#9ca3af',
      cardBackground: '#1f2937',
      cardBorder: '#374151',
      inputBackground: '#374151',
      inputBorder: '#4b5563',
      statBackground: '#374151',
      buttonBackground: '#2563eb',
      buttonHover: '#3b82f6',
      selectorBackground: '#293550',
    }
  };

  const currentColors = getCurrentColors();

  const styles = {
    card: {
      marginTop: 90,
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      padding: '24px',
      marginBottom: '20px',
    },
    header: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      marginBottom: '20px',
      '@media (min-width: 1024px)': {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      margin: '0',
    },
    criteria: {
      fontSize: '28px',
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: '24px',
      color: '#3b82f6'
    },
    stats: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '20px',
      justifyContent: 'flex-start',
      '@media (max-width: 768px)': {
        width: '100%',
      }
    },
    statItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 16px',
      backgroundColor: currentColors.statBackground,
      borderRadius: '8px',
      fontSize: '14px',
      '@media (max-width: 768px)': {
        flex: '1 1 auto',
        minWidth: 'calc(33.333% - 10px)',
        justifyContent: 'center',
      }
    },
    input: {
      flex: '1',
      padding: '12px',
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
      backgroundColor: currentColors.inputBackground,
      borderColor: currentColors.cardBorder,
      color: currentColors.text,
      fontSize: '16px',
      minWidth: 10,
    },
    button: {
      padding: '12px 24px',
      borderRadius: '8px',
      border: 'none',
      backgroundColor: '#3b82f6',
      color: 'white',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      whiteSpace: 'nowrap',
      '@media (max-width: 480px)': {
        width: '100%',
      }
    },
    gameOver: {
      textAlign: 'center',
      marginTop: '24px'
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
    notification: {
        padding: '12px 24px',
        borderRadius: '8px',
        color: 'white',
        fontWeight: 'bold',
        marginTop: '16px',
        textAlign: 'center',
      },
      success: {
        backgroundColor: '#22c55e',
      },
      error: {
        backgroundColor: '#ef4444',
      },
      selectorContainer: {
        display: 'flex',
        flexDirection: 'row', // Changed to row
        flexWrap: 'wrap', // Allow wrapping on smaller screens
        gap: '12px',
        marginBottom: '24px',
        justifyContent: 'center',
      },
      selectorButton: {
        width: '180px',
        padding: '12px',
        borderRadius: '8px',
        border: 'none',
        color: 'white',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        fontSize: '14px',
        textAlign: 'center',
        height: '50px',
      },
  };

  if (!gameMode) {
    return (
      <div className={`movie-game-container ${isDarkMode ? 'dark-mode' : ''}`}
        style={{
        backgroundColor: isDarkMode ? currentColors.background : '#f3f4f6',
        transition: 'background-color 0.3s ease, color 0.3s ease',
        color: isDarkMode ? currentColors.text : '#1f2937'
      }}
      >
         <div className={`movie-game-card ${isDarkMode ? 'dark-mode' : ''}`}
          style={{
            backgroundColor: isDarkMode ? currentColors.cardBackground : 'white',
            color: isDarkMode ? currentColors.text : '#1f2937',
            boxShadow: isDarkMode 
              ? '0 4px 6px rgba(0, 0, 0, 0.3)' 
              : '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}
          >
          <h1 className="game-title">{t.movieCriteriaChallenge}</h1>
          
          <p className="game-subtitle">
            {t.selectGameSettings}
          </p>

          <div style={styles.selectorContainer}>
          <button
            onClick={() => setCriteriaChangeMode('single')}
            style={{
              ...styles.selectorButton,
              backgroundColor: criteriaChangeMode === 'single' ? '#f59e0b' : currentColors.selectorBackground,
            }}
          >
            {t.keepSameCriteria}
          </button>
          <button
            onClick={() => setCriteriaChangeMode('multiple')}
            style={{
              ...styles.selectorButton,
              backgroundColor: criteriaChangeMode === 'multiple' ? '#10b981' : currentColors.selectorBackground,
            }}
          >
            {t.changeCriteriaEachRound}
          </button>
          <button
            onClick={() => setRandomMode(!randomMode)}
            style={{
              ...styles.selectorButton,
              backgroundColor: randomMode ? '#6366f1' : currentColors.selectorBackground,
            }}
          >
            {t.randomMode}
          </button>
        </div>

          <p className="game-subtitle">
            {t.selectGameMode}
          </p>
          <div className="mode-selection">
            {Object.entries(GAME_MODES).map(([mode, details]) => (
              <button
                key={mode}
                onClick={() => setGameMode(mode)}
                className="mode-card"
                style={{
                  backgroundColor: currentColors.cardBackground,
                  transition: 'background-color 0.3s ease, color 0.3s ease',
                  color: details.color,
                  border: `2px solid ${details.color}`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = details.color;
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = currentColors.cardBackground;
                  e.currentTarget.style.color = details.color;
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <div className="mode-card-title">
                  {language === 'en' ? details.nameEN : details.nameDE}
                </div>
                <div className="mode-card-description">
                  {language === 'en' ? details.descriptionEN : details.descriptionDE}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'lost') {
    return (
      <div className="movie-game-card">
        <div style={styles.card}>
          <div style={styles.gameOver}>
            <h2>{t.gameOver}</h2>
            <p>{t.finalScore} {score}</p>
            <button 
              onClick={() => {
                setGameState('playing');
                setScore(0);
                generateNewCriteria();
              }}
              style={styles.button}
            >
              {t.playAgain}
            </button>
            <button
              onClick={() => setGameMode(null)}
              style={{
                ...styles.button,
                backgroundColor: '#6b7280',
                marginLeft: '12px'
              }}
            >
              {t.changeMode}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`movie-game-container ${isDarkMode ? 'dark-mode' : ''}`}
        style={{
        backgroundColor: isDarkMode ? currentColors.background : '#f3f4f6',
        transition: 'background-color 0.3s ease, color 0.3s ease',
        color: isDarkMode ? currentColors.text : '#1f2937'
      }}
      >
      <button 
        onClick={() => setGameMode(null)} 
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

      <div className={`movie-game-card ${isDarkMode ? 'dark-mode' : ''}`}
        style={{
          backgroundColor: isDarkMode ? currentColors.cardBackground : 'white',
          color: isDarkMode ? currentColors.text : '#1f2937',
          boxShadow: isDarkMode 
            ? '0 4px 6px rgba(0, 0, 0, 0.3)' 
            : '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}
        >
        <div style={styles.header}>
          <h1 style={styles.title}>{t.movieCriteriaChallenge}</h1>
          <div style={styles.stats}>
            <div style={styles.statItem}>{t.score} {score}</div>
            <div style={styles.statItem}>{t.guesses} {guessesRemaining}</div>
          </div>
        </div>

        <div style={styles.criteria}>
          {criteriaType === 'year' 
            ? `${t.movieFrom} ${currentCriteria}` 
            : `${t.movieWith} ${criteriaType === 'actor' ? 'Actor' : 'Director'}: ${currentCriteria}`
          }
        </div>

        <div className="input-group">
          <input
            type="text"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            placeholder={t.enterMovieTitle}
            style={styles.input}
          />
          <button 
            onClick={verifyGuess}
            disabled={!guess.trim()}
            className="guess-button"
            style={{
              opacity: !guess.trim() ? 0.5 : 1,
              cursor: !guess.trim() ? 'not-allowed' : 'pointer'
            }}
          >
            {t.guess}
          </button>
        </div>
        
        {notification && (
          <div 
            style={{
              ...styles.notification,
              ...(notification.type === 'success' ? styles.success : styles.error)
            }}
          >
            {notification.message}
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieCriteriaGame;