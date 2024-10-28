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

  if (!gameMode) {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Select Game Mode</h1>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          {Object.keys(GAME_MODES).map((mode) => (
            <button
              key={mode}
              onClick={() => selectGameMode(mode)}
              style={{
                padding: '12px 24px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {GAME_MODES[mode].name}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (gameState === 'loading') {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', textAlign: 'center' }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', marginBottom: '10px' }}>
          Movie Guessing Game - {GAME_MODES[gameMode].name} Mode
        </h1>
        <div>
          Score: {score} | Questions Left: {9 - questionsAsked}
          {gameMode !== 'EASY' && ` | Guesses Left: ${guessesRemaining}`}
          {timeRemaining !== null && ` | Time: ${timeRemaining}s`}
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Revealed Clues:</h3>
        {revealedClues && revealedClues.map(clue => (
          <div 
            key={clue.id} 
            style={{ 
              border: '1px solid #ccc', 
              padding: '10px', 
              marginBottom: '10px', 
              borderRadius: '4px' 
            }}
          >
            <strong>{clue.type}:</strong> {clue.value}
          </div>
        ))}
      </div>

      {gameState === 'playing' && (
        <div>
          <div style={{ marginBottom: '10px', display: 'flex', gap: '10px' }}>
            <input
              type="text"
              placeholder="Enter your guess..."
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              style={{ 
                padding: '8px', 
                borderRadius: '4px', 
                border: '1px solid #ccc',
                flex: 1
              }}
            />
            <button
              onClick={makeGuess}
              disabled={!guess}
              style={{
                padding: '8px 16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: !guess ? 'not-allowed' : 'pointer',
                opacity: !guess ? 0.5 : 1
              }}
            >
              Guess
            </button>
          </div>
          <button
            onClick={getClue}
            disabled={questionsAsked >= 9}
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: questionsAsked >= 9 ? 'not-allowed' : 'pointer',
              opacity: questionsAsked >= 9 ? 0.5 : 1
            }}
          >
            Get Clue ({9 - questionsAsked} left)
          </button>
        </div>
      )}

      {(gameState === 'won' || gameState === 'lost') && (
        <div style={{ 
          padding: '20px', 
          backgroundColor: gameState === 'won' ? '#d4edda' : '#f8d7da', 
          borderRadius: '4px',
          marginTop: '20px'
        }}>
          <h3>{gameState === 'won' ? 'Congratulations!' : 'Game Over'}</h3>
          <p>
            {gameState === 'won' 
              ? `You won! Points earned: ${Math.max(10 - questionsAsked, 1) * 100}`
              : `The movie was: ${currentMovie?.title}`
            }
          </p>
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button
              onClick={startNewGame}
              style={{
                padding: '8px 16px',
                backgroundColor: gameState === 'won' ? '#28a745' : '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Play Again
            </button>
            <button
              onClick={() => setGameMode(null)}
              style={{
                padding: '8px 16px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Change Mode
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieGuessingGame;