import React, { useState, useEffect } from 'react';

const API_KEY = '014c0bfe3d16b0265fdd1fe8a7ccf1aa';

const GAME_MODES = {
  EASY: {
    name: 'Easy',
    titleLengthLimit: 20,
    guessLimit: Infinity,
    timeLimit: Infinity
  },
  NORMAL: {
    name: 'Normal',
    titleLengthLimit: Infinity,
    guessLimit: 5,
    timeLimit: Infinity
  },
  HARD: {
    name: 'Hard',
    titleLengthLimit: Infinity,
    guessLimit: 2,
    timeLimit: 60
  }
};

const MovieGuessingGame = () => {
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

  // Function to format currency
  const formatCurrency = (amount) => {
    if (!amount) return "Not Available";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Timer effect for hard mode
  useEffect(() => {
    let timer;
    if (timeRemaining !== null && timeRemaining > 0 && gameState === 'playing') {
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
  }, [timeRemaining, gameState]);

  // Function to get a random popular movie
  const fetchRandomMovie = async () => {
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
          
          validMovie = {
            id: movieDetail.id,
            title: movieDetail.title,
            year: new Date(movieDetail.release_date).getFullYear().toString(),
            director: movieDetail.credits.crew.find(person => person.job === "Director")?.name || "Unknown",
            genre: movieDetail.genres.map(g => g.name).join(", "),
            actors: movieDetail.credits.cast.slice(0, 3).map(actor => actor.name).join(", "),
            plot: movieDetail.overview,
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
      return null;
    }
  };

  // Get clues for current movie
  const getClues = () => {
    if (!currentMovie) return [];
    return [
      { id: 1, type: "Year", value: currentMovie.year },
      { id: 2, type: "Genre", value: currentMovie.genre },
      { id: 3, type: "Director", value: currentMovie.director },
      { id: 4, type: "Main Actors", value: currentMovie.actors },
      { id: 5, type: "Plot", value: currentMovie.plot },
      { id: 6, type: "Budget", value: formatCurrency(currentMovie.budget) },
      { id: 7, type: "Box Office", value: formatCurrency(currentMovie.revenue) },
      { id: 8, type: "Runtime", value: `${currentMovie.runtime} minutes` },
      { id: 9, type: "Rating", value: `${currentMovie.rating}/10` }
    ];
  };

  // Initialize game when mode is selected
  useEffect(() => {
    if (gameMode) {
      startNewGame();
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
      setGuessesRemaining(prev => prev - 1);
      setGuess('');
      if (guessesRemaining <= 1) {
        setGameState('lost');
      }
    }
  };

  const startNewGame = async () => {
    setGameState('loading');
    setRevealedClues([]); // Reset revealed clues
    
    const movie = await fetchRandomMovie();
    if (movie) {
      setCurrentMovie(movie);
      setQuestionsAsked(1);
      setGameState('playing');
      setGuess('');
      setUsedMovies(prev => new Set([...prev, movie.id]));
      setTimeRemaining(null);
      
      // Reset guesses based on game mode
      setGuessesRemaining(
        gameMode === 'EASY' ? Infinity :
        gameMode === 'NORMAL' ? GAME_MODES.NORMAL.guessLimit :
        GAME_MODES.HARD.guessLimit
      );
      
      // Get initial random clue
      const initialClue = { id: 1, type: "Year", value: movie.year };
      setRevealedClues([initialClue]);
    } else {
      alert('Error loading movie. Please try again.');
      setGameState('playing');
    }
  };

  const selectGameMode = (mode) => {
    setGameMode(mode);
    setScore(0);
    setUsedMovies(new Set());
    setRevealedClues([]); // Reset revealed clues when changing mode
  };

  const styles = {
    container: {
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      padding: '24px',
      marginBottom: '20px'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px'
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      margin: '0'
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
      cursor: 'pointer',
      transition: 'background-color 0.2s'
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
      border: 'none'
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
    }
  };

  if (!gameMode) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>Movie Guessing Game</h1>
          <p style={{ textAlign: 'center', color: '#6b7280', margin: '20px 0' }}>
            Select your challenge level
          </p>
          <div style={styles.modeSelection}>
            {Object.keys(GAME_MODES).map((mode) => (
              <button
                key={mode}
                onClick={() => selectGameMode(mode)}
                style={{
                  ...styles.modeCard,
                  backgroundColor: mode === 'EASY' ? '#22c55e' : 
                                 mode === 'NORMAL' ? '#3b82f6' : 
                                 '#ef4444',
                  color: 'white'
                }}
              >
                <div style={{ fontSize: '20px', marginBottom: '8px' }}>
                  {GAME_MODES[mode].name}
                </div>
                <div style={{ fontSize: '14px', opacity: '0.9' }}>
                  {mode === 'EASY' && "Unlimited guesses"}
                  {mode === 'NORMAL' && "5 guesses"}
                  {mode === 'HARD' && "2 guesses • 60s timer"}
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
          Loading your challenge...
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>
            Movie Guesser
            <span style={styles.badge}>{GAME_MODES[gameMode].name}</span>
          </h1>
          <div style={styles.stats}>
            <div style={styles.statItem}>
              Score: {score}
            </div>
            <div style={styles.statItem}>
              Clues: {9 - questionsAsked}
            </div>
            {gameMode !== 'EASY' && (
              <div style={styles.statItem}>
                Guesses: {guessesRemaining}
              </div>
            )}
            {timeRemaining !== null && (
              <div style={styles.statItem}>
                Time: {timeRemaining}s
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
            <div style={{ marginTop: '24px' }}>
              <div style={styles.inputGroup}>
                <input
                  type="text"
                  placeholder="Enter your guess..."
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
                  Guess
                </button>
              </div>
              <button
                onClick={getClue}
                disabled={questionsAsked >= 9}
                style={{
                  ...styles.button,
                  ...styles.secondaryButton,
                  width: '100%',
                  ...(questionsAsked >= 9 && styles.disabledButton)
                }}
              >
                Get Clue ({9 - questionsAsked} left)
              </button>
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
                  : `The movie was: ${currentMovie?.title}`}
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button
                  onClick={startNewGame}
                  style={styles.button}
                >
                  Play Again
                </button>
                <button
                  onClick={() => setGameMode(null)}
                  style={{
                    ...styles.button,
                    backgroundColor: '#6b7280'
                  }}
                >
                  Change Mode
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

// timer after all 9 questions visible
// question films of one special year
// maybe german/english
// wrong question removes 100 points
// speedrun mode
// reason for coming back each day
// dark mode/ light mode