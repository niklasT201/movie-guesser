import React, { useState, useEffect, useCallback } from 'react';

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


const MovieCriteriaGame = ({ language }) => {
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

  const styles = {
    container: {
      maxWidth: '800px',
      width: '100%',
      margin: '50px auto 0',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      position: 'relative',
      '@media (max-width: 840px)': {
        width: 'calc(100% - 40px)',
        margin: '70px auto 0',
      }
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      padding: '24px'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px'
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      margin: '0'
    },
    modeSelection: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
      padding: '32px'
    },
    modeCard: {
      padding: '24px',
      borderRadius: '12px',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'transform 0.2s',
      border: 'none',
      color: 'white'
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
      gap: '20px'
    },
    statItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 16px',
      backgroundColor: '#f3f4f6',
      borderRadius: '8px',
      fontSize: '14px'
    },
    inputGroup: {
      display: 'flex',
      gap: '12px',
      marginBottom: '16px'
    },
    input: {
      flex: '1',
      padding: '12px',
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
      fontSize: '16px'
    },
    button: {
      padding: '12px 24px',
      borderRadius: '8px',
      border: 'none',
      backgroundColor: '#3b82f6',
      color: 'white',
      fontWeight: '500',
      cursor: 'pointer'
    },
    gameOver: {
      textAlign: 'center',
      marginTop: '24px'
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
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>{t.movieCriteriaChallenge}</h1>
          
          <p style={{ textAlign: 'center', color: '#6b7280', margin: '20px 0' }}>
            {t.selectGameSettings}
          </p>

          <div style={styles.selectorContainer}>
          <button
            onClick={() => setCriteriaChangeMode('single')}
            style={{
              ...styles.selectorButton,
              backgroundColor: criteriaChangeMode === 'single' ? '#f59e0b' : '#d1d5db',
            }}
          >
            {t.keepSameCriteria}
          </button>
          <button
            onClick={() => setCriteriaChangeMode('multiple')}
            style={{
              ...styles.selectorButton,
              backgroundColor: criteriaChangeMode === 'multiple' ? '#10b981' : '#d1d5db',
            }}
          >
            {t.changeCriteriaEachRound}
          </button>
          <button
            onClick={() => setRandomMode(!randomMode)}
            style={{
              ...styles.selectorButton,
              backgroundColor: randomMode ? '#6366f1' : '#d1d5db',
            }}
          >
            {t.randomMode}
          </button>
        </div>

         <p style={{ textAlign: 'center', color: '#6b7280', margin: '20px 0' }}>
            {t.selectGameMode}
          </p>
          <div style={styles.modeSelection}>
            {Object.entries(GAME_MODES).map(([mode, details]) => (
              <button
                key={mode}
                onClick={() => setGameMode(mode)}
                style={{
                  ...styles.modeCard,
                  backgroundColor: 'white',
                  color: details.color,
                  border: `2px solid ${details.color}`,
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = details.color;
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.color = details.color;
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <div style={{ fontSize: '20px', marginBottom: '8px' }}>
                  {language === 'en' ? details.nameEN : details.nameDE}
                </div>
                <div style={{ fontSize: '14px', opacity: '0.9' }}>
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
      <div style={styles.container}>
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
    <div style={styles.container}>
      <button 
        onClick={() => setGameMode(null)} 
        style={styles.backButton}
      >
        {t.backToModes}
      </button>

      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>{t.movieCriteriaChallenge}</h1>
          <div style={styles.stats}>
            <div style={styles.statItem}>{t.score} {score}</div>
            <div style={styles.statItem}>{t.guesses} {guessesRemaining}</div>
          </div>
        </div>

        <div style={styles.criteria}>
          {criteriaType === 'year' ? t.movieFrom : t.movieWith} {t[criteriaType]}:{' '}
          {currentCriteria}
        </div>

        <div style={styles.inputGroup}>
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
            style={{
              ...styles.button,
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