import React, { useState, useEffect, useRef } from 'react';

const MovieTimedChallengeGame = ({ language, isDarkMode, }) => {
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
  const [lastGuessResult, setLastGuessResult] = useState(null);
  const [gameOptions, setGameOptions] = useState({
    genre: null,
    year: null,
    decade: null
  });
  const [genres, setGenres] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [score, setScore] = useState(0);
  const [unrevealedMovies, setUnrevealedMovies] = useState([]);
  const inputRef = useRef(null);

  const colors = isDarkMode 
    ? {
        background: '#121826',
        text: '#e5e7eb',
        cardBackground: '#1f2937',
        inputBackground: '#374151',
        buttonBackground: '#4b5563',
        boxShadow:'0 4px 6px rgba(0, 0, 0, 0.3)' ,
      }
    : {
        background: '#f3f4f6',
        text: '#1f2937',
        cardBackground: 'white',
        inputBackground: '#e5e7eb',
        buttonBackground: '#374151',
        boxShadow:'0 4px 6px rgba(0, 0, 0, 0.1)',
      };

  const styles = {
    container: {
      maxWidth: '600px',
      margin: '100px auto',
      padding: '20px',
      backgroundColor: colors.cardBackground,
      color: colors.text,
      borderRadius: '12px',
      boxShadow: colors.boxShadow,
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
      borderRadius: '8px',
      boxSizing: 'border-box' 
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
      },
      guessResult: {
        textAlign: 'center',
        padding: '10px',
        marginBottom: '10px',
        borderRadius: '8px',
        fontWeight: 'bold'
      },
      correctGuess: {
        backgroundColor: 'rgba(16, 185, 129, 0.2)', // Soft green
        color: '#10b981'
      },
      incorrectGuess: {
        backgroundColor: 'rgba(239, 68, 68, 0.2)', // Soft red
        color: '#ef4444'
      },
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

    const isYesterday = (lastDate, currentDate) => {
      const yesterday = new Date(currentDate);
      yesterday.setDate(yesterday.getDate() - 1);
      
      return (
        lastDate.getFullYear() === yesterday.getFullYear() &&
        lastDate.getMonth() === yesterday.getMonth() &&
        lastDate.getDate() === yesterday.getDate()
      );
    };
    
    const isSameDay = (date1, date2) => {
      return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
      );
    };
  
    const updateLocalStorageProfile = (newScore, isPerfectRun = false, movieDetails = null) => {
      try {
        const storedProfile = JSON.parse(localStorage.getItem('movieGameProfile')) || {};
        const today = new Date();
        const currentDate = today.toISOString().split('T')[0];
  
        // Get or initialize game stats
        const gameStats = storedProfile.gameStats || {
          totalScore: 0,
          dailyScores: [],
          lastScoreUpdate: null,
          movieGuesser: {
            gamesPlayed: 0,
            highScore: 0,
            genresGuessed: [] // Add this to track unique genres
          },
          timedChallenge: {
            gamesPlayed: 0,
            highScore: 0,
            perfectRuns: 0 // Add this line to track perfect runs
          }
        };

        if (movieDetails && movieDetails.genre_ids) {
          const newGenres = movieDetails.genre_ids.filter(
            genreId => !gameStats.movieGuesser.genresGuessed.includes(genreId)
          );
          
          gameStats.movieGuesser.genresGuessed = [
            ...gameStats.movieGuesser.genresGuessed, 
            ...newGenres
          ];
        }

        // Ensure game-specific stats are tracked
        if (!storedProfile.gameStats.gameSpecificStats) {
          storedProfile.gameStats.gameSpecificStats = {};
        }
        // Mark this specific game as played
        storedProfile.gameStats.gameSpecificStats['movieTimeGame'] = true;

        // Increment total games played for the First Steps achievement
        storedProfile.gameStats.gamesPlayed = (storedProfile.gameStats.gamesPlayed || 0) + 1;
    
        // Check if there's already a score for today
        const todayScoreIndex = gameStats.dailyScores.findIndex(
          score => new Date(score.date).toISOString().split('T')[0] === currentDate
        );
    
        if (todayScoreIndex !== -1) {
          // Update existing today's score
          gameStats.dailyScores[todayScoreIndex].points += newScore;
        } else {
          // Add new daily score
          gameStats.dailyScores.push({
            date: today.toISOString(),
            points: newScore
          });
        }
    
        // Parse the last score update date
        const lastUpdateDate = gameStats.lastScoreUpdate
          ? new Date(gameStats.lastScoreUpdate).toISOString().split('T')[0]
          : null;
  
        // Update total score
        gameStats.totalScore = (gameStats.totalScore || 0) + newScore;
        
        // Update Timed Challenge stats
        gameStats.timedChallenge = gameStats.timedChallenge || {
          gamesPlayed: 0,
          highScore: 0
        };
        gameStats.timedChallenge.gamesPlayed += 1;
        gameStats.timedChallenge.highScore = Math.max(
          gameStats.timedChallenge.highScore || 0, 
          newScore
        );
    
        // Check if it's a new day or first score
        if (currentDate !== lastUpdateDate) {
          gameStats.dailyScore = newScore;
        } else {
          gameStats.dailyScore = (gameStats.dailyScore || 0) + newScore;
        }
  
        // Update last score update timestamp
        gameStats.lastScoreUpdate = today.toISOString();
        
        if (isPerfectRun) {
          gameStats.timedChallenge.perfectRuns = 
            (gameStats.timedChallenge.perfectRuns || 0) + 1;
        }
  
        // Save updated profile
        const updatedProfile = {
          ...storedProfile,
          gameStats
        };

        if (!storedProfile.gameStats) {
          storedProfile.gameStats = {};
        }
    
        // Initialize streak if not exists
        if (!storedProfile.gameStats.streak) {
          storedProfile.gameStats.streak = {
            currentStreak: 0,
            lastStreakDate: null
          };
        }
    
        const streak = storedProfile.gameStats.streak;
        const lastStreakDate = streak.lastStreakDate 
          ? new Date(streak.lastStreakDate) 
          : null;
    
        // Check if today has scores
        const todayScores = storedProfile.gameStats.dailyScores || [];
        const todayHasScores = todayScores.some(score => 
          new Date(score.date).toISOString().split('T')[0] === currentDate
        );
    
        if (todayHasScores) {
          // If this is the first day or last streak was yesterday
          if (!lastStreakDate || isYesterday(lastStreakDate, today)) {
            streak.currentStreak = (streak.currentStreak || 0) + 1;
            streak.lastStreakDate = currentDate;
          } else if (isSameDay(lastStreakDate, today)) {
            // If last streak was today, do nothing
            return storedProfile;
          } else {
            // If more than a day has passed, reset streak
            streak.currentStreak = 1;
            streak.lastStreakDate = currentDate;
          }
        }
  
        localStorage.setItem('movieGameProfile', JSON.stringify(updatedProfile));
  
        return updatedProfile;
      } catch (error) {
        console.error('Error updating local storage:', error);
        return null;
      }
    };

    // Fetch movies based on game mode and options
    const fetchMovieDetails = async (movieTitle) => {
      try {
        const searchParams = new URLSearchParams({
          api_key: API_KEY,
          language: language === 'en' ? 'en-US' : 'de-DE',
          query: movieTitle
        });
  
        const response = await fetch(`${BASE_URL}/search/movie?${searchParams.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch movie details');
        }
        
        const data = await response.json();
        return data.results[0];
      } catch (error) {
        console.error('Error fetching movie details:', error);
        return null;
      }
    };
  
    // Modify fetchMovies to set up the game differently for Easy mode
    const fetchMovies = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setUnrevealedMovies([]); // Reset unrevealed movies
        
        if (gameMode === GAME_MODES.EASY) {
          // Create placeholders with explicit IDs
          const placeholderMovies = Array.from({ length: 10 }, (_, index) => ({
            id: `placeholder-${index + 1}`,
            title: '?????',
            originalId: index + 1,
            isGuessed: false
          }));
          
          // Apply filtering criteria if set
          if (gameOptions.genre || gameOptions.year || gameOptions.decade) {
            placeholderMovies.forEach((movie) => {
              movie.matchCriteria = {
                genre: gameOptions.genre,
                year: gameOptions.year,
                decade: gameOptions.decade
              };
            });
          }
          
          setCurrentMovies(placeholderMovies);
          setIsLoading(false);
          return placeholderMovies;
        } else {
          // Hard mode with movie storage
          const response = await fetch(
            `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=${language === 'en' ? 'en-US' : 'de-DE'}&page=1`
          );
          
          if (!response.ok) {
            throw new Error('Failed to fetch movies');
          }
          
          const data = await response.json();
          
          const movies = data.results.slice(0, 10).map(movie => ({
            id: movie.id,
            title: movie.title,
            original: true,
            hidden: true
          }));
          
          // Store unrevealed movies for potential later reveal
          setUnrevealedMovies(movies.map(movie => movie.title));
          
          setCurrentMovies(movies);
          setIsLoading(false);
          return movies;
        }
      } catch (error) {
        console.error('Error fetching movies:', error);
        setError('Could not load movies. Please try again.');
        setIsLoading(false);
        return [];
      }
    };
  
    // Start Game Function
    const startGame = async () => {
      // Clear any previous guess results
      setLastGuessResult(null);
      
      const gameModeMovies = await fetchMovies();
      setCurrentMovies(gameModeMovies);
      setGuessedMovies([]);
      setTimeLeft(180);
      setGameStatus('playing');
    };

    const resetGameState = () => {
      setCurrentMovies([]);
      setGuessedMovies([]);
      setTimeLeft(180);
      setGameStatus('not-started');
      setInputValue('');
      setLastGuessResult(null);
      
      // Reset game options if needed
      setGameOptions({
        genre: null,
        year: null,
        decade: null
      });
    };
  
    // Handle Input Submission
    const handleSubmit = async (e) => {
      e.preventDefault();
      const trimmedInput = inputValue.trim();
      let isPerfectRun = true;
      
      if (gameMode === GAME_MODES.EASY) {
        // In Easy mode, validate the movie against the selected criteria
        const movieDetails = await fetchMovieDetails(trimmedInput);
        
        if (!movieDetails) {
          setLastGuessResult({
            isCorrect: false,
            message: language === 'en' ? 'Movie not found' : 'Film nicht gefunden'
          });
          isPerfectRun = false; // Mark as not perfect run
          setInputValue('');
          return;
        }
        
        // Check criteria (keep existing logic)
        const meetsGenreCriteria = !gameOptions.genre || 
          movieDetails.genre_ids.includes(gameOptions.genre);
        
        const meetYearCriteria = !gameOptions.year || 
          new Date(movieDetails.release_date).getFullYear() === gameOptions.year;
        
        const meetDecadeCriteria = !gameOptions.decade || 
          (Math.floor(new Date(movieDetails.release_date).getFullYear() / 10) * 10 === gameOptions.decade);
        
        if (meetsGenreCriteria && meetYearCriteria && meetDecadeCriteria) {
          // Check if this movie has already been guessed
          if (guessedMovies.includes(movieDetails.title)) {
            setLastGuessResult({
              isCorrect: false,
              message: language === 'en' ? 'You already guessed this movie' : 'Diesen Film hast du bereits erraten'
            });
            isPerfectRun = false; // Mark as not perfect run
            setInputValue('');
            return;
          }
          
          // Find the first available placeholder
          const firstAvailablePlaceholder = currentMovies.find(
            movie => movie.title === '?????' && !movie.isGuessed
          );
          
          if (firstAvailablePlaceholder) {
            // Update the movies array
            const updatedMovies = currentMovies.map(movie => 
              movie.id === firstAvailablePlaceholder.id 
                ? { 
                    ...movie, 
                    title: movieDetails.title, 
                    isGuessed: true 
                  } 
                : movie
            );
            
            const newGuessedMovies = [...guessedMovies, movieDetails.title];
            
            setCurrentMovies(updatedMovies);
            setGuessedMovies(newGuessedMovies);
            
            setLastGuessResult({
              isCorrect: true,
              message: language === 'en' ? 'Correct Guess!' : 'Richtig geraten!'
            });
            
            // Check if all movies are guessed
            if (newGuessedMovies.length === currentMovies.length) {
              // In Easy mode, points only awarded when all 10 movies are guessed
              const newScore = 150; // 1000 points for completing Easy mode
              setScore(prev => prev + newScore);
              updateLocalStorageProfile(newScore, isPerfectRun, movieDetails);
              setGameStatus('won');
            }
          } else {
            setLastGuessResult({
              isCorrect: false,
              message: language === 'en' 
                ? 'No available placeholders' 
                : 'Keine verfügbaren Platzhalter'
            });
          }
        } else {
          setLastGuessResult({
            isCorrect: false,
            message: language === 'en' 
              ? 'Movie does not match the selected criteria' 
              : 'Film entspricht nicht den ausgewählten Kriterien'
          });
          isPerfectRun = false; // Mark as not perfect run
        }
        
        setInputValue('');
      }
      else {
        // Hard mode logic
        const matchedMovie = currentMovies.find(movie => 
          movie.title.toLowerCase() === trimmedInput.toLowerCase() && 
          !guessedMovies.includes(movie.title)
        );
        
        if (matchedMovie) {
          // Find the first movie with 'hidden' property true
          const firstAvailableMovie = currentMovies.find(movie => movie.hidden);
          
          if (firstAvailableMovie) {
            const updatedMovies = currentMovies.map(movie => 
              movie.id === firstAvailableMovie.id 
                ? { 
                    ...movie, 
                    hidden: false 
                  } 
                : movie
            );
            
            const newGuessedMovies = [...guessedMovies, matchedMovie.title];
            
            setCurrentMovies(updatedMovies);
            setGuessedMovies(newGuessedMovies);
            
            // Award points for each correct guess in Hard mode
            const newScore = 100; // 100 points per correct movie
            setScore(prev => prev + newScore);
            updateLocalStorageProfile(newScore);
            
            setLastGuessResult({
              isCorrect: true,
              message: language === 'en' ? 'Correct Guess!' : 'Richtig geraten!'
            });
            
            // Check if all movies are guessed
            if (newGuessedMovies.length === currentMovies.length) {
              const newScore = 100 * currentMovies.length;
              setScore(prev => prev + newScore);
              updateLocalStorageProfile(newScore, isPerfectRun);
              setGameStatus('won');
            }
          } else {
            setLastGuessResult({
              isCorrect: false,
              message: language === 'en' 
                ? 'No available movies left' 
                : 'Keine verfügbaren Filme mehr'
            });
          }
        } else {
          setLastGuessResult({
            isCorrect: false,
            message: language === 'en' ? 'Incorrect Guess' : 'Falsch geraten'
          });
          isPerfectRun = false; // Mark as not perfect run
          setInputValue('');
          return;
        }
        
        setInputValue('');
      }
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
              {language === 'en' ? 'Select Decade' : 'Jahrzehnt auswählen'}
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
  
    // Render Game Content 
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
              {lastGuessResult && (
              <div 
                style={{
                  ...styles.guessResult,
                  ...(lastGuessResult.isCorrect ? styles.correctGuess : styles.incorrectGuess)
                }}
              >
                {lastGuessResult.message}
              </div>
            )}
              <div style={styles.timer}>
                {Math.floor(timeLeft / 60)}:
                {(timeLeft % 60).toString().padStart(2, '0')}
              </div>
              {renderScoreDisplay()}
              
              <div style={styles.movieList}>
                {currentMovies.map((movie) => {
                  const isGuessed = 
                    gameMode === GAME_MODES.EASY 
                      ? movie.isGuessed 
                      : !movie.hidden;
                  
                  return (
                    <div 
                      key={movie.id} 
                      style={{
                        ...styles.movieItem,
                        opacity: isGuessed ? 0.5 : 1
                      }}
                    >
                      {isGuessed ? '✓ ' : ''}
                      {isGuessed 
                        ? (gameMode === GAME_MODES.EASY ? movie.title : movie.title)
                        : '?????'}
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
                onClick={resetGameState} // Use resetGameState instead
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

                {gameMode === GAME_MODES.HARD && unrevealedMovies.length > 0 && (
                  <div>
                    <h3>{language === 'en' ? 'Missed Movies:' : 'Verpasste Filme:'}</h3>
                    <ul style={{listStyleType: 'none', padding: 0}}>
                      {unrevealedMovies.map((movie, index) => (
                        <li key={index}>{movie}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <button 
                  style={styles.startButton} 
                  onClick={resetGameState}
                >
                  {language === 'en' ? 'Try Again' : 'Nochmal versuchen'}
                </button>
              </div>
            );
          
          default:
            return null;
        }
      };
  
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
  
      const renderScoreDisplay = () => {
        return (
          <div style={{
            textAlign: 'left', 
            color: colors.text,
            marginTop: '10px',  // Add some vertical spacing between timer and score
            fontSize: '18px'    // Optional: adjust font size if needed
          }}>
            {language === 'en' ? 'Score: ' : 'Punktzahl: '}{score}
          </div>
        );
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