import React, { useState, useEffect, useCallback, useRef } from 'react';

const API_KEY = '014c0bfe3d16b0265fdd1fe8a7ccf1aa';

const GAME_MODES = {
  EASY: {
    nameEN: 'Easy',
    nameDE: 'Einfach',
    titleLengthLimit: 20,
    guessLimit: Infinity,
    timeLimit: Infinity
  },
  NORMAL: {
    nameEN: 'Normal',
    nameDE: 'Normal',
    titleLengthLimit: Infinity,
    guessLimit: 5,
    timeLimit: Infinity
  },
  HARD: {
    nameEN: 'Hard',
    nameDE: 'Schwer',
    titleLengthLimit: Infinity,
    guessLimit: 2,
    timeLimit: 60
  }
};

const translations = {
  en: {
    loading: 'Loading your challenge...',
    selectChallenge: 'Select your challenge level',
    movieGuesser: 'Movie Guesser',
    backToModes: '← Back to Modes',
    backToGames: '← Back to Games',
    score: 'Score',
    clues: 'Clues',
    guesses: 'Guesses',
    time: 'Time',
    enterGuess: 'Enter your guess...',
    guessButton: 'Guess',
    getClue: 'Get Clue',
    cluesLeft: 'left',
    giveUp: 'Give Up',
    congratulations: 'Congratulations!',
    gameOver: 'Game Over',
    pointsEarned: 'Points earned',
    movieWas: 'The movie was',
    playAgain: 'Play Again',
    changeMode: 'Change Mode',
    unlimitedGuesses: 'Unlimited guesses',
    fiveGuesses: '5 guesses',
    hardModeDesc: '2 guesses • 60s timer',
    year: 'Year',
    genre: 'Genre',
    director: 'Director',
    mainActors: 'Main Actors',
    notAvailable: 'Not Available',
    plot: 'Plot',
    budget: 'Budget',
    boxOffice: 'Box Office',
    runtime: 'Runtime',
    rating: 'Rating',
    minutes: 'minutes',
    enterGuessPlaceholder: 'Enter your guess...',
    guessButtonText: 'Guess',
    getClueButton: 'Get Clue',
  },
  de: {
    loading: 'Lade deine Herausforderung...',
    selectChallenge: 'Wähle deinen Schwierigkeitsgrad',
    movieGuesser: 'Film Raten',
    backToModes: '← Zurück zu den Modi',
    backToGames: '← Zurück zu Spielen',
    score: 'Punkte',
    clues: 'Hinweise',
    guesses: 'Versuche',
    time: 'Zeit',
    enterGuess: 'Gib deinen Tipp ein...',
    guessButton: 'Raten',
    getClue: 'Hinweis',
    cluesLeft: 'übrig',
    giveUp: 'Aufgeben',
    congratulations: 'Glückwunsch!',
    gameOver: 'Spiel vorbei',
    pointsEarned: 'Punkte erhalten',
    movieWas: 'Der Film war',
    playAgain: 'Nochmal spielen',
    changeMode: 'Modus ändern',
    unlimitedGuesses: 'Unbegrenzte Versuche',
    fiveGuesses: '5 Versuche',
    hardModeDesc: '2 Versuche • 60s Zeit',
    year: 'Jahr',
    genre: 'Genre',
    director: 'Regisseur',
    mainActors: 'Hauptdarsteller',
    notAvailable: 'Nicht verfügbar',
    plot: 'Handlung',
    budget: 'Budget',
    boxOffice: 'Einspielergebnis',
    runtime: 'Laufzeit',
    rating: 'Bewertung',
    minutes: 'Minuten',
    enterGuessPlaceholder: 'Gib deinen Tipp ein...',
    guessButtonText: 'Raten',
    getClueButton: 'Hinweis holen',
  }
};

const MovieGuessingGame = ({ language }) => {
  const [currentMovie, setCurrentMovie] = useState(null);
  const [questionsAsked, setQuestionsAsked] = useState(1);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState('loading');
  const [guess, setGuess] = useState('');
  const [revealedClues, setRevealedClues] = useState([]);
  const [gameMode, setGameMode] = useState(null);
  const [guessesRemaining, setGuessesRemaining] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [usedMovies, setUsedMovies] = useState(new Set());
  const [germanTitle, setGermanTitle] = useState(null);
  const t = translations[language];

  const gameModeRef = useRef(gameMode);

  useEffect(() => {
    gameModeRef.current = gameMode;
  }, [gameMode]);

  // Function to format currency
  const formatCurrency = (amount) => {
    if (!amount) return t.notAvailable;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

    // Function to handle giving up
    const handleGiveUp = () => {
      setGameState('lost');
    };

  // Timer effect for hard mode
  useEffect(() => {
    let timer;
    if (gameMode === 'HARD' && questionsAsked >= 9 && gameState === 'playing' && !timeRemaining) {
      // Start 60 second timer when all clues are revealed in hard mode
      setTimeRemaining(60);
    }
    
    if (timeRemaining > 0 && gameState === 'playing') {
      timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setGameState('lost');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [timeRemaining, gameState, questionsAsked, gameMode]);

  // Function to get a random popular movie
  const fetchRandomMovie = useCallback(async () => {
    try {
      let validMovie = null;
      let attempts = 0;
      const maxAttempts = 10;

      while (!validMovie && attempts < maxAttempts) {
        const response = await fetch(
          `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=en-US&page=${Math.floor(Math.random() * 5) + 1}`
        );
        const data = await response.json();
        
        // Filter movies based on game mode and already used movies
        const eligibleMovies = data.results.filter(movie => {
          const titleLength = movie.title.length;
          return (
            !usedMovies.has(movie.id) &&
            (gameMode === 'EASY' ? titleLength <= GAME_MODES.EASY.titleLengthLimit : true)
          );
        });

        if (eligibleMovies.length > 0) {
          const randomMovie = eligibleMovies[Math.floor(Math.random() * eligibleMovies.length)];
          
          const detailResponse = await fetch(
            `https://api.themoviedb.org/3/movie/${randomMovie.id}?api_key=${API_KEY}&language=en-US&append_to_response=credits`
          );
          const movieDetail = await detailResponse.json();

          const germanResponse = await fetch(
            `https://api.themoviedb.org/3/movie/${randomMovie.id}?api_key=${API_KEY}&language=de-DE`
          );
          const germanData = await germanResponse.json();
          
          validMovie = {
            id: movieDetail.id,
            title: movieDetail.title,
            germanTitle: germanData.title || movieDetail.title, // Fallback to English title if German is not available
            year: new Date(movieDetail.release_date).getFullYear().toString(),
            director: movieDetail.credits.crew.find(person => person.job === "Director")?.name || "Unknown",
            genre: movieDetail.genres.map(g => g.name).join(", "),
            actors: movieDetail.credits.cast.slice(0, 3).map(actor => actor.name).join(", "),
            plot: {
              en: movieDetail.overview,
              de: germanData.overview || movieDetail.overview // Fallback to English plot if German is not available
            },
            budget: movieDetail.budget,
            revenue: movieDetail.revenue,
            runtime: movieDetail.runtime,
            rating: movieDetail.vote_average.toFixed(1)
          };
        }
        attempts++;
      }
      
      return validMovie;
    } catch (error) {
      console.error("Error fetching movie:", error);
      setGameState('playing'); // Ensure we're not stuck in loading state
      return null;
    }
  }, [gameMode, usedMovies]);

  // Get clues for current movie
  const getClues = () => {
    if (!currentMovie) return [];
    return [
      { id: 1, type: t.year, value: currentMovie.year },
      { id: 2, type: t.genre, value: currentMovie.genre },
      { id: 3, type: t.director, value: currentMovie.director },
      { id: 4, type: t.mainActors, value: currentMovie.actors },
      { id: 5, type: t.plot, value: currentMovie.plot[language] },
      { id: 6, type: t.budget, value: formatCurrency(currentMovie.budget) },
      { id: 7, type: t.boxOffice, value: formatCurrency(currentMovie.revenue) },
      { id: 8, type: t.runtime, value: `${currentMovie.runtime} ${t.minutes}` },
      { id: 9, type: t.rating, value: `${currentMovie.rating}/10` }
    ];
  };

  useEffect(() => {
    if (currentMovie && revealedClues.length > 0) {
      // Regenerate the revealed clues with new language
      const allClues = getClues();
      const updatedRevealedClues = revealedClues.map(revealedClue => {
        return allClues.find(clue => clue.id === revealedClue.id);
      });
      setRevealedClues(updatedRevealedClues);
    }
  }, [language]);

  const startNewGame = useCallback(async () => {
    setGameState('loading');
    setRevealedClues([]);
    
    const movie = await fetchRandomMovie();
    if (movie) {
      setCurrentMovie(movie);
      setGermanTitle(movie.germanTitle);
      setQuestionsAsked(1);
      setGameState('playing');
      setGuess('');
      setUsedMovies(prev => new Set([...prev, movie.id]));
      setTimeRemaining(null);
      
      // Use a function to get the latest gameMode
      setGuessesRemaining(() => {
    const currentGameMode = gameModeRef.current;
    return currentGameMode === 'EASY' ? Infinity :
           currentGameMode === 'NORMAL' ? GAME_MODES.NORMAL.guessLimit :
           GAME_MODES.HARD.guessLimit;
    });
      
    const initialClue = { id: 1, type: t.year, value: movie.year };
      setRevealedClues([initialClue]);
    } else {
      alert('Error loading movie. Please try again.');
      setGameState('playing');
    }
  }, [fetchRandomMovie]);

  const getText = (en, de) => language === 'en' ? en : de;

  // Initialize game when mode is selected
  useEffect(() => {
    if (gameMode) {
      startNewGame().catch(console.error);
    }
  }, [gameMode]);

  const getRandomClue = (excludeIds = []) => {
    const clues = getClues();
    const availableClues = clues.filter(clue => !excludeIds.includes(clue.id));
    if (availableClues.length === 0) return null;
    return availableClues[Math.floor(Math.random() * availableClues.length)];
  };

  const getClue = () => {
    if (questionsAsked >= 9) {
      if (gameMode === 'HARD') {
        setTimeRemaining(GAME_MODES.HARD.timeLimit);
      }
      return;
    }
    
    const randomClue = getRandomClue(revealedClues.map(c => c.id));
    if (randomClue) {
      setRevealedClues(prev => [...prev, randomClue]);
      setQuestionsAsked(prev => prev + 1);
    }
  };

  const makeGuess = () => {
    if (!currentMovie) return;
    
    if (guess.toLowerCase() === currentMovie.title.toLowerCase()) {
      const newPoints = Math.max(10 - questionsAsked, 1) * 100;
      setScore(prev => prev + newPoints);
      setGameState('won');
    } else {
      // Subtract 100 points for wrong answers in Normal and Hard mode
      if (gameMode !== 'EASY') {
        setScore(prev => prev - 100); // Now allows negative scores
      }
    
      setGuessesRemaining(prev => prev - 1);
      setGuess('');
      if (guessesRemaining <= 1) {
        setGameState('lost');
      }
    }
  };


  const selectGameMode = (mode) => {
    setGameMode(mode);
    setScore(0);
    setUsedMovies(new Set());
    setRevealedClues([]);
  };

  const styles = {
    container: {
      maxWidth: '800px',
      width: '100%',
      margin: '50px auto 0',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      position: 'relative',
      '@media (max-width: 840px)': {
        width: 'calc(100% - 40px)',
        margin: '70px auto 0', // Slightly less margin on mobile
      }
    },
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
      flexDirection: 'column', // Stack elements vertically by default
      gap: '20px',
      marginBottom: '20px',
      '@media (min-width: 1024px)': { // Only use horizontal layout on larger screens
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      margin: '0'
    },
    stats: {
      display: 'flex',
      flexWrap: 'wrap', // Allow stats to wrap on smaller screens
      gap: '20px',
      justifyContent: 'flex-start', // Align to the left
      '@media (max-width: 768px)': {
        width: '100%', // Take full width on mobile
      }
    },
    statItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 16px',
      backgroundColor: '#f3f4f6',
      borderRadius: '8px',
      fontSize: '14px',
      '@media (max-width: 768px)': {
        flex: '1 1 auto', // Allow items to grow and shrink
        minWidth: 'calc(33.333% - 10px)', // Ensure 3 items per row on mobile
        justifyContent: 'center',
      }
    },
    clueCard: {
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '12px',
      border: '1px solid #e5e7eb'
    },
    clueType: {
      fontWeight: '500',
      color: '#6b7280',
      marginBottom: '4px'
    },
    clueValue: {
      fontSize: '16px'
    },
    inputGroup: {
      display: 'flex',
      gap: '12px',
      marginBottom: '16px',
      '@media (max-width: 480px)': {
        flexDirection: 'column',
      }
    },
    input: {
      flex: '1',
      padding: '12px',
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
      fontSize: '16px',
      minWidth: 10, // This prevents the input from overflowing
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
      whiteSpace: 'nowrap', // Prevents button text from wrapping
      '@media (max-width: 480px)': {
        width: '100%',
      }
    },
    buttonGroup: {
      display: 'flex',
      gap: '12px',
      marginTop: '12px',
      '@media (max-width: 480px)': {
        flexDirection: 'column',
      }
    },
    buttonsContainer: {
      marginTop: '24px',
      display: 'flex',
      flexDirection: 'column',
     // gap: '12px',
      width: '100%',
    },
    secondaryButton: {
      backgroundColor: '#6b7280'
    },
    disabledButton: {
      opacity: '0.5',
      cursor: 'not-allowed'
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
      wordBreak: 'break-word', // Allow text to wrap
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '120px'
    },
    gameOverCard: {
      padding: '24px',
      borderRadius: '12px',
      textAlign: 'center',
      marginTop: '24px'
    },
    badge: {
      padding: '4px 12px',
      borderRadius: '16px',
      fontSize: '14px',
      fontWeight: '500',
      backgroundColor: '#e5e7eb',
      marginLeft: '8px'
    },
    backButton: {
      position: 'absolute',
      top: '-40px', 
      left: '10',
      padding: '8px 16px',
      borderRadius: '8px',
      border: 'none',
      backgroundColor: '#6b7280',
      color: 'white',
      cursor: 'pointer',
      fontSize: '14px',
      '@media (max-width: 768px)': {
        top: '-50px',
        marginLeft: '20px'
      }
    },
    timer: {
      padding: '8px 16px',
      backgroundColor: timeRemaining && timeRemaining <= 10 ? '#ef4444' : '#3b82f6',
      color: 'white',
      borderRadius: '8px',
      fontWeight: '500',
      transition: 'background-color 0.3s'
    }
  };

  if (!gameMode) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>{t.movieGuesser}</h1>
          <p style={{ textAlign: 'center', color: '#6b7280', margin: '20px 0' }}>
            {t.selectChallenge}
          </p>
          <div style={styles.modeSelection}>
            {Object.keys(GAME_MODES).map((mode) => (
              <button
                key={mode}
                onClick={() => selectGameMode(mode)}
                style={{
                  ...styles.modeCard,
                  backgroundColor: 'white',
                  color: mode === 'EASY' ? '#22c55e' : 
                         mode === 'NORMAL' ? '#3b82f6' : 
                         '#ef4444',
                  border: `2px solid ${
                    mode === 'EASY' ? '#22c55e' : 
                    mode === 'NORMAL' ? '#3b82f6' : 
                    '#ef4444'
                  }`,
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 
                  mode === 'EASY' ? '#22c55e' :                                       
                  mode === 'NORMAL' ? '#3b82f6' : '#ef4444';
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.color = 
                  mode === 'EASY' ? '#22c55e' : 
                  mode === 'NORMAL' ? '#3b82f6' : '#ef4444';
                  e.currentTarget.style.transform = 'scale(1)';
                }}>
                <div style={{ fontSize: '20px', marginBottom: '8px' }}>
                  {language === 'en' ? GAME_MODES[mode].nameEN : GAME_MODES[mode].nameDE}
                </div>
                <div style={{ fontSize: '14px', opacity: '0.9' }}>
                  {mode === 'EASY' && t.unlimitedGuesses}
                  {mode === 'NORMAL' && t.fiveGuesses}
                  {mode === 'HARD' && t.hardModeDesc}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'loading') {
    return (
      <div style={{ ...styles.container, textAlign: 'center' }}>
        <div style={styles.card}>
          {t.loading}
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
          <h1 style={styles.title}>
            {t.movieGuesser}
            <span style={styles.badge}>
              {language === 'en' ? GAME_MODES[gameMode].nameEN : GAME_MODES[gameMode].nameDE}
            </span>
          </h1>
           <div style={styles.stats}>
            <div style={styles.statItem}>
              {t.score}: {score}
            </div>
             <div style={styles.statItem}>
              {t.clues}: {9 - questionsAsked}
            </div>
            {gameMode !== 'EASY' && (
              <div style={styles.statItem}>
                {t.guesses}: {guessesRemaining}
              </div>
            )}
            {timeRemaining > 0 && (
              <div style={styles.timer}>
                {t.time}: {timeRemaining}s
              </div>
            )}
          </div>
        </div>

        <div>
          {revealedClues.map(clue => (
            <div key={clue.id} style={styles.clueCard}>
              <div style={styles.clueType}>{clue.type}</div>
              <div style={styles.clueValue}>{clue.value}</div>
            </div>
          ))}

          {gameState === 'playing' && (
           <div style={styles.buttonsContainer}>
              <div style={styles.inputGroup}>
                <input
                  type="text"
                  placeholder={t.enterGuessPlaceholder}
                  value={guess}
                  onChange={(e) => setGuess(e.target.value)}
                  style={styles.input}
                />
                <button
                  onClick={makeGuess}
                  disabled={!guess}
                  style={{
                    ...styles.button,
                    ...((!guess) && styles.disabledButton)
                  }}
                >
                  {t.guessButtonText}
                </button>
              </div>
              <div style={styles.buttonGroup}>
                <button
                  onClick={getClue}
                  disabled={questionsAsked >= 9}
                  style={{
                    ...styles.button,
                    ...styles.secondaryButton,
                    flex: '1',
                    ...(questionsAsked >= 9 && styles.disabledButton)
                  }}
                >
                  {t.getClueButton} ({9 - questionsAsked} {t.cluesLeft})
                </button>
                {gameMode === 'EASY' && (
                  <button
                    onClick={handleGiveUp}
                    style={{
                      ...styles.button,
                      backgroundColor: '#ef4444',
                      flex: '0 0 auto'
                    }}
                  >
                      {t.giveUp}
                  </button>
                )}
              </div>
            </div>
          )}

          {(gameState === 'won' || gameState === 'lost') && (
            <div style={{
              ...styles.gameOverCard,
              backgroundColor: gameState === 'won' ? '#dcfce7' : '#fee2e2'
            }}>
              <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>
                {gameState === 'won' ? 'Congratulations!' : 'Game Over'}
              </h3>
              <p style={{ marginBottom: '20px' }}>
                {gameState === 'won'
                  ? `You won! Points earned: ${Math.max(10 - questionsAsked, 1) * 100}`
                  : `The movie was: ${currentMovie?.title}${gameMode !== 'EASY' ? ' (-100 points)' : ''}`}
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button
                  onClick={startNewGame}
                  style={styles.button}
                >
                    {t.playAgain}
                </button>
                <button
                  onClick={() => setGameMode(null)}
                  style={{
                    ...styles.button,
                    backgroundColor: '#6b7280'
                  }}
                >
                    {t.changeMode}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieGuessingGame;

// maybe german/english
// speedrun mode
// reason for coming back each day
// dark mode/light mode
// back buttons position changing