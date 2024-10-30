import React, { useState, useEffect } from 'react';

const API_KEY = '014c0bfe3d16b0265fdd1fe8a7ccf1aa';

const GAME_MODES = {
  ACTOR: {
    name: 'Actor Mode',
    type: 'actor',
    description: 'Guess movies by actor',
    color: '#22c55e'
  },
  DIRECTOR: {
    name: 'Director Mode',
    type: 'director',
    description: 'Guess movies by director',
    color: '#3b82f6'
  },
  YEAR: {
    name: 'Year Mode',
    type: 'year',
    description: 'Guess movies by year',
    color: '#ef4444'
  },
  RANDOM: {
    name: 'Random Mode',
    type: 'random',
    description: 'Random criteria each round',
    color: '#8b5cf6'
  }
};

const MovieCriteriaGame = () => {
  const [gameMode, setGameMode] = useState(null);
  const [score, setScore] = useState(0);
  const [currentCriteria, setCurrentCriteria] = useState(null);
  const [criteriaType, setCriteriaType] = useState(null);
  const [guess, setGuess] = useState('');
  const [gameState, setGameState] = useState('playing');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [guessesRemaining, setGuessesRemaining] = useState(3);

  // Function to get a random year between 1970 and current year
  const getRandomYear = () => {
    const currentYear = new Date().getFullYear();
    return Math.floor(Math.random() * (currentYear - 1970 + 1)) + 1970;
  };

  // Function to get a random person (director or actor)
  const getRandomPerson = async (type) => {
    try {
      const page = Math.floor(Math.random() * 5) + 1;
      const response = await fetch(
        `https://api.themoviedb.org/3/person/popular?api_key=${API_KEY}&language=en-US&page=${page}`
      );
      const data = await response.json();
      const person = data.results[Math.floor(Math.random() * data.results.length)];
      
      // Get more details about the person to ensure they match the type
      const detailResponse = await fetch(
        `https://api.themoviedb.org/3/person/${person.id}?api_key=${API_KEY}&append_to_response=credits`
      );
      const detailData = await detailResponse.json();
      
      // Check if person has worked in the required role
      const hasRole = type === 'director' 
        ? detailData.credits.crew?.some(credit => credit.job === "Director")
        : detailData.credits.cast?.length > 0;
      
      if (hasRole) {
        return person.name;
      } else {
        // Try again if person doesn't match criteria
        return getRandomPerson(type);
      }
    } catch (error) {
      console.error("Error fetching person:", error);
      return null;
    }
  };

  // Function to generate new criteria based on game mode
  const generateNewCriteria = async () => {
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
    setSearchResults([]);
    setGuess('');
  };

  // Initialize game when mode is selected
  useEffect(() => {
    if (gameMode) {
      generateNewCriteria();
    }
  }, [gameMode]);

  // Function to search movies
  const searchMovies = async (query) => {
    try {
      setIsSearching(true);
      const response = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&language=en-US&query=${query}&page=1`
      );
      const data = await response.json();
      setSearchResults(data.results.slice(0, 5));
      setIsSearching(false);
    } catch (error) {
      console.error("Error searching movies:", error);
      setIsSearching(false);
    }
  };

  // Function to verify guess
  const verifyGuess = async (movieId) => {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}&append_to_response=credits`
      );
      const movie = await response.json();
      const releaseYear = new Date(movie.release_date).getFullYear();
      const director = movie.credits.crew.find(person => person.job === "Director")?.name;
      const actors = movie.credits.cast.map(actor => actor.name);

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
      }

      if (isCorrect) {
        setScore(prev => prev + 100);
        generateNewCriteria();
      } else {
        setGuessesRemaining(prev => prev - 1);
        setScore(prev => prev - 50);
        if (guessesRemaining <= 1) {
          setGameState('lost');
        }
      }
      setGuess('');
      setSearchResults([]);
    } catch (error) {
      console.error("Error verifying guess:", error);
    }
  };

  const styles = {
    container: {
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
      marginTop: '50px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
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
    input: {
      width: '100%',
      padding: '12px',
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
      fontSize: '16px',
      marginBottom: '12px'
    },
    searchResults: {
      marginTop: '12px'
    },
    searchItem: {
      padding: '12px',
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
      marginBottom: '8px',
      cursor: 'pointer',
      transition: 'background-color 0.2s'
    },
    gameOver: {
      textAlign: 'center',
      marginTop: '24px'
    },
    button: {
      padding: '12px 24px',
      borderRadius: '8px',
      border: 'none',
      backgroundColor: '#3b82f6',
      color: 'white',
      fontWeight: '500',
      cursor: 'pointer'
    }
  };

  if (!gameMode) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>Movie Criteria Challenge</h1>
          <p style={{ textAlign: 'center', color: '#6b7280', margin: '20px 0' }}>
            Select your game mode
          </p>
          <div style={styles.modeSelection}>
            {Object.entries(GAME_MODES).map(([mode, details]) => (
              <button
                key={mode}
                onClick={() => setGameMode(mode)}
                style={{
                  ...styles.modeCard,
                  backgroundColor: details.color
                }}
              >
                <div style={{ fontSize: '20px', marginBottom: '8px' }}>
                  {details.name}
                </div>
                <div style={{ fontSize: '14px', opacity: '0.9' }}>
                  {details.description}
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
            <h2>Game Over!</h2>
            <p>Final Score: {score}</p>
            <button 
              onClick={() => {
                setScore(0);
                setGameState('playing');
                generateNewCriteria();
              }}
              style={styles.button}
            >
              Play Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Movie Criteria Challenge</h1>
          <div style={styles.stats}>
            <div style={styles.statItem}>Score: {score}</div>
            <div style={styles.statItem}>Guesses: {guessesRemaining}</div>
          </div>
        </div>

        <div style={styles.criteria}>
          Find a movie {criteriaType === 'year' ? 'from' : 'with'} {criteriaType}:{' '}
          {currentCriteria}
        </div>

        <input
          type="text"
          value={guess}
          onChange={(e) => {
            setGuess(e.target.value);
            if (e.target.value.length > 2) {
              searchMovies(e.target.value);
            } else {
              setSearchResults([]);
            }
          }}
          placeholder="Search for a movie..."
          style={styles.input}
        />

        <div style={styles.searchResults}>
          {isSearching && <div>Searching...</div>}
          {searchResults.map(movie => (
            <div
              key={movie.id}
              onClick={() => verifyGuess(movie.id)}
              style={styles.searchItem}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
              }}
            >
              {movie.title} ({new Date(movie.release_date).getFullYear()})
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MovieCriteriaGame;