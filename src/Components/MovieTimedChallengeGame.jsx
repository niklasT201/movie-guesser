import React, { useState, useEffect, useRef } from 'react';

const MovieTimedChallengeGame = ({ language, isDarkMode, userProfile }) => {
  // API Configuration
  const API_KEY = '014c0bfe3d16b0265fdd1fe8a7ccf1aa';
  const BASE_URL = 'https://api.themoviedb.org/3';

  // Game Modes
  const GAME_MODES = {
    EASY: 'easy',
    HARD: 'hard'
  };

  // State Management
  const [currentMovies, setCurrentMovies] = useState([]);
  const [guessedMovies, setGuessedMovies] = useState([]);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes
  const [gameStatus, setGameStatus] = useState('not-started');
  const [inputValue, setInputValue] = useState('');
  const [gameMode, setGameMode] = useState(GAME_MODES.EASY);
  const [gameOptions, setGameOptions] = useState({
    genre: null,
    year: null,
    decade: null
  });
  const [genres, setGenres] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const colors = isDarkMode 
    ? {
        background: '#121826',
        text: '#e5e7eb',
        cardBackground: '#1f2937',
        inputBackground: '#374151',
        buttonBackground: '#4b5563'
      }
    : {
        background: '#f3f4f6',
        text: '#1f2937',
        cardBackground: 'white',
        inputBackground: '#e5e7eb',
        buttonBackground: '#374151'
      };

  const styles = {
    container: {
      maxWidth: '600px',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: colors.background,
      color: colors.text,
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    },
    header: {
      textAlign: 'center',
      marginBottom: '20px'
    },
    timer: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: timeLeft <= 30 ? 'red' : colors.text
    },
    input: {
      width: '100%',
      padding: '10px',
      marginBottom: '10px',
      backgroundColor: colors.inputBackground,
      color: colors.text,
      border: 'none',
      borderRadius: '8px'
    },
    movieList: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '10px',
      marginBottom: '20px'
    },
    movieItem: {
      padding: '10px',
      backgroundColor: colors.cardBackground,
      borderRadius: '8px',
      textAlign: 'center',
      //textDecoration: guessedMovies.includes(movie.title) ? 'line-through' : 'none'
    },
    startButton: {
      width: '100%',
      padding: '10px',
      backgroundColor: colors.buttonBackground,
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer'
    },
    modeSelector: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '20px'
      },
      modeButton: {
        flex: 1,
        margin: '0 10px',
        padding: '10px',
        backgroundColor: colors.buttonBackground,
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer'
      },
      activeMode: {
        backgroundColor: '#10b981' // Green color for active mode
      },
      loadingError: {
        color: 'red',
        textAlign: 'center',
        margin: '10px 0'
      }
    };
  
    // Fetch movie genres
    useEffect(() => {
      const fetchGenres = async () => {
        try {
          const response = await fetch(
            `${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=${language === 'en' ? 'en-US' : 'de-DE'}`
          );
          
          if (!response.ok) {
            throw new Error('Failed to fetch genres');
          }
          
          const data = await response.json();
          setGenres(data.genres);
        } catch (error) {
          console.error('Error fetching genres:', error);
          setError('Could not load genres. Please try again.');
        }
      };
      
      fetchGenres();
    }, [language]);
  
    // Fetch movies based on game mode and options
    const fetchMovies = async () => {
      try {
        setIsLoading(true);
        setError(null);
        let movies = [];
        let url = '';
        
        if (gameMode === GAME_MODES.EASY) {
          // Build URL for discovering movies
          const params = new URLSearchParams({
            api_key: API_KEY,
            language: language === 'en' ? 'en-US' : 'de-DE',
            sort_by: 'popularity.desc',
            page: 1
          });
          
          // Add optional filters
          if (gameOptions.genre) params.append('with_genres', gameOptions.genre);
          if (gameOptions.year) params.append('primary_release_year', gameOptions.year);
          if (gameOptions.decade) {
            params.append('primary_release_date.gte', `${gameOptions.decade}-01-01`);
            params.append('primary_release_date.lte', `${gameOptions.decade + 9}-12-31`);
          }
          
          url = `${BASE_URL}/discover/movie?${params.toString()}`;
        } else {
          // Popular movies for hard mode
          url = `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=${language === 'en' ? 'en-US' : 'de-DE'}&page=1`;
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Failed to fetch movies');
        }
        
        const data = await response.json();
        
        // Map and slice movies
        movies = data.results.slice(0, 10).map(movie => ({
          title: movie.title,
          original: true,
          hidden: gameMode === GAME_MODES.HARD
        }));
        
        setIsLoading(false);
        return movies;
      } catch (error) {
        console.error('Error fetching movies:', error);
        setError('Could not load movies. Please try again.');
        setIsLoading(false);
        return [];
      }
    };
  
    // Start Game Function
    const startGame = async () => {
      const gameModeMovies = await fetchMovies();
      setCurrentMovies(gameModeMovies);
      setGuessedMovies([]);
      setTimeLeft(180);
      setGameStatus('playing');
    };
  
    // Handle Input Submission
    const handleSubmit = (e) => {
      e.preventDefault();
      const trimmedInput = inputValue.trim();
      
      const matchedMovie = currentMovies.find(movie => 
        movie.title.toLowerCase() === trimmedInput.toLowerCase() && 
        !guessedMovies.includes(movie.title)
      );
      
      if (matchedMovie) {
        const newGuessedMovies = [...guessedMovies, matchedMovie.title];
        setGuessedMovies(newGuessedMovies);
        
        // Check if all movies are guessed
        if (newGuessedMovies.length === currentMovies.length) {
          setGameStatus('won');
        }
      }
      
      setInputValue('');
    };
  
    // Render Game Modes Selector
    const renderModeSelector = () => {
      return (
        <div style={styles.modeSelector}>
          <button 
            style={{
              ...styles.modeButton,
              ...(gameMode === GAME_MODES.EASY ? styles.activeMode : {})
            }}
            onClick={() => setGameMode(GAME_MODES.EASY)}
          >
            {language === 'en' ? 'Easy Mode' : 'Einfacher Modus'}
          </button>
          <button 
            style={{
              ...styles.modeButton,
              ...(gameMode === GAME_MODES.HARD ? styles.activeMode : {})
            }}
            onClick={() => setGameMode(GAME_MODES.HARD)}
          >
            {language === 'en' ? 'Hard Mode' : 'Schwerer Modus'}
          </button>
        </div>
      );
    };
  
    // Render Game Options for Easy Mode
    const renderGameOptions = () => {
      if (gameMode !== GAME_MODES.EASY) return null;
  
      return (
        <div>
          {/* Genre Selector */}
          <select 
            value={gameOptions.genre || ''}
            onChange={(e) => setGameOptions(prev => ({
              ...prev, 
              genre: e.target.value ? parseInt(e.target.value) : null
            }))}
            style={styles.input}
          >
            <option value="">
              {language === 'en' ? 'Select Genre' : 'Genre auswählen'}
            </option>
            {genres.map(genre => (
              <option key={genre.id} value={genre.id}>
                {genre.name}
              </option>
            ))}
          </select>
  
          {/* Year Selector */}
          <select 
            value={gameOptions.year || ''}
            onChange={(e) => setGameOptions(prev => ({
              ...prev, 
              year: e.target.value ? parseInt(e.target.value) : null
            }))}
            style={styles.input}
          >
            <option value="">
              {language === 'en' ? 'Select Year' : 'Jahr auswählen'}
            </option>
            {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
  
          {/* Decade Selector */}
          <select 
            value={gameOptions.decade || ''}
            onChange={(e) => setGameOptions(prev => ({
              ...prev, 
              decade: e.target.value ? parseInt(e.target.value) : null
            }))}
            style={styles.input}
          >
            <option value="">
              {language === 'en' ? 'Select Decade' : 'Dekade auswählen'}
            </option>
            {[1980, 1990, 2000, 2010, 2020].map(decade => (
              <option key={decade} value={decade}>
                {decade}s
              </option>
            ))}
          </select>
        </div>
      );
    };
  
    // Render Game Content (similar to previous implementation)
    const renderGameContent = () => {
      switch (gameStatus) {
        case 'not-started':
          return (
            <>
              {renderModeSelector()}
              {renderGameOptions()}
              <button 
                style={styles.startButton} 
                onClick={startGame}
                disabled={gameMode === GAME_MODES.EASY && (!gameOptions.genre && !gameOptions.year && !gameOptions.decade)}
              >
                {language === 'en' ? 'Start Timed Movie Challenge' : 'Zeitbasierte Film-Challenge starten'}
              </button>
            </>
          );
        
        case 'playing':
          return (
            <>
              <div style={styles.timer}>
                {Math.floor(timeLeft / 60)}:
                {(timeLeft % 60).toString().padStart(2, '0')}
              </div>
              
              <div style={styles.movieList}>
                {currentMovies.map((movie) => {
                  const isGuessed = guessedMovies.includes(movie.title);
                  return (
                    <div 
                      key={movie.title} 
                      style={{
                        ...styles.movieItem,
                        opacity: isGuessed ? 0.5 : 1
                      }}
                    >
                      {isGuessed ? '✓ ' : ''}
                      {isGuessed || !movie.hidden ? movie.title : '?????'}
                    </div>
                  );
                })}
              </div>
              
              <form onSubmit={handleSubmit}>
                <input 
                  ref={inputRef}
                  style={styles.input}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={
                    language === 'en' 
                      ? 'Type movie title here...' 
                      : 'Filmtitel hier eingeben...'
                  }
                />
              </form>
            </>
          );
        
        // Won and Lost states remain the same as in previous implementation
        case 'won':
          return (
            <div style={{textAlign: 'center'}}>
              <h2>{language === 'en' ? '🎉 Congratulations! You Won!' : '🎉 Gratulation! Du hast gewonnen!'}</h2>
              <p>
                {language === 'en' 
                  ? `You guessed all ${currentMovies.length} movies in time!`
                  : `Du hast alle ${currentMovies.length} Filme rechtzeitig erraten!`}
              </p>
              <button 
                style={styles.startButton} 
                onClick={() => setGameStatus('not-started')}
              >
                {language === 'en' ? 'Play Again' : 'Nochmal spielen'}
              </button>
            </div>
          );
        
        case 'lost':
          return (
            <div style={{textAlign: 'center'}}>
              <h2>{language === 'en' ? '⏰ Time\'s Up!' : '⏰ Zeit abgelaufen!'}</h2>
              <p>
                {language === 'en' 
                  ? `You guessed ${guessedMovies.length} out of ${currentMovies.length} movies.`
                  : `Du hast ${guessedMovies.length} von ${currentMovies.length} Filmen erraten.`}
              </p>
              <button 
                style={styles.startButton} 
                onClick={() => setGameStatus('not-started')}
              >
                {language === 'en' ? 'Try Again' : 'Nochmal versuchen'}
              </button>
            </div>
          );
        
        default:
          return null;
      }
    };
  
    // Timer Logic (remains the same as previous implementation)
    useEffect(() => {
      let timer;
      if (gameStatus === 'playing' && timeLeft > 0) {
        timer = setInterval(() => {
          setTimeLeft(prev => prev - 1);
        }, 1000);
      } else if (timeLeft === 0) {
        setGameStatus('lost');
      }
      
      return () => clearInterval(timer);
    }, [gameStatus, timeLeft]);
  
    // Auto-focus input when game starts
    useEffect(() => {
      if (gameStatus === 'playing') {
        inputRef.current?.focus();
      }
    }, [gameStatus]);

    const renderLoadingOrError = () => {
        if (isLoading) {
          return (
            <div style={styles.loadingError}>
              {language === 'en' ? 'Loading...' : 'Wird geladen...'}
            </div>
          );
        }
        
        if (error) {
          return (
            <div style={styles.loadingError}>
              {error}
            </div>
          );
        }
        
        return null;
      };    
  
    return (
        <div style={styles.container}>
          <div style={styles.header}>
            <h1>
              {language === 'en' 
                ? 'Movie Timed Challenge' 
                : 'Zeitbasierte Film-Challenge'}
            </h1>
            <p>
              {language === 'en'
                ? 'Guess all 10 movies before time runs out!'
                : 'Erraten Sie alle 10 Filme, bevor die Zeit abläuft!'}
            </p>
          </div>
          
          {renderLoadingOrError()}
          
          {renderGameContent()}
        </div>
      );
    };
    
    export default MovieTimedChallengeGame;