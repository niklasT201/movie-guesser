import React, { useState, useEffect, useCallback, useRef } from 'react';
import './responsive/MovieGuessingGame.css';

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
    unknown: 'Unknown',
    errorLoadingMovie: 'Error loading movie. Please try again.',
    youWon: 'You won!',
    pointsEarnedMessage: 'Points earned:', // For "Points earned: ${points}"
    theMovieWas: 'The movie was:', // For "The movie was: ${title}"
    pointsDeducted: '(-100 points)', // For the points deduction message
    wonMessage: 'You won! Points earned:', // Combined message
    lostMessage: 'The movie was:', 
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
    unknown: 'Unbekannt',
    errorLoadingMovie: 'Fehler beim Laden des Films. Bitte versuchen Sie es erneut.',
    youWon: 'Du hast gewonnen!',
    pointsEarnedMessage: 'Erhaltene Punkte:', // For "Points earned: ${points}"
    theMovieWas: 'Der Film war:', // For "The movie was: ${title}"
    pointsDeducted: '(-100 Punkte)', // For the points deduction message
    wonMessage: 'Du hast gewonnen! Erhaltene Punkte:', // Combined message
    lostMessage: 'Der Film war:', // Combined message
  }
};

const MovieGuessingGame = ({ language, isDarkMode, onProfileUpdate}) => {
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
  const [comboStreak, setComboStreak] = useState(0);
  const t = translations[language];
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const getCurrentColors = () => colors[isDarkMode ? 'dark' : 'light'];

  const colors = {
    light: {
      background: '#f3f4f6',
      statBackground: '#f3f4f6',
      text: '#1f2937',
      secondaryText: '#6b7280',
      cardBackground: 'white',
      cardBorder: '#e5e7eb',
      inputBackground: '#ffffff',
      buttonPrimary: '#3b82f6',
      buttonSecondary: '#6b7280',
      gameoverBackground: '#fee2e2',
      gamewonBackground: '#dcfce7',
    },
  
    dark: {
      background: '#121826',
      statBackground: "#181f30",
      text: '#e5e7eb',
      secondaryText: '#9ca3af',
      cardBackground: '#1f2937',
      cardBorder: '#374151',
      inputBackground: '#374151',
      buttonPrimary: '#2563eb',
      buttonSecondary: '#4b5563',
      gameoverBackground: '#9e3c3c',
      gamewonBackground: '#0d5827',
    }
  };
  
  const currentColors = getCurrentColors();
  
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      setComboStreak(0);
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
            director: movieDetail.credits.crew.find(person => person.job === "Director")?.name || t.unknown,
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
  }, [gameMode, usedMovies, t.unknown]);

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
      alert(t.errorLoadingMovie);
      setGameState('playing');
    }
  }, [fetchRandomMovie]);

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
    
    // Helper functions for streak calculation
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
  
    const updateStreak = (storedProfile) => {
      // Initialize gameStats and streak if not exists
      if (!storedProfile.gameStats) {
        storedProfile.gameStats = {};
      }
  
      // Get today's date
      const today = new Date();
      const todayString = today.toISOString().split('T')[0];
  
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
        new Date(score.date).toISOString().split('T')[0] === todayString
      );
  
      if (todayHasScores) {
        // If this is the first day or last streak was yesterday
        if (!lastStreakDate || isYesterday(lastStreakDate, today)) {
          streak.currentStreak = (streak.currentStreak || 0) + 1;
          streak.lastStreakDate = todayString;
        } else if (isSameDay(lastStreakDate, today)) {
          // If last streak was today, do nothing
          return storedProfile;
        } else {
          // If more than a day has passed, reset streak
          streak.currentStreak = 1;
          streak.lastStreakDate = todayString;
        }
      }
  
      return storedProfile;
    };
    
    if (guess.toLowerCase() === currentMovie.title.toLowerCase()) {
      const newPoints = Math.max(10 - questionsAsked, 1) * 100;

      const comboMultiplier = Math.min(Math.floor(comboStreak / 5) + 1, 3); // Cap at 3x
      const comboBonus = newPoints * (comboMultiplier - 1);
      
      // Set the score with base points and bonus
      setScore(prev => prev + newPoints + comboBonus);
      setComboStreak(prev => prev + 1);
      
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
          (storedProfile.gameStats.totalScore || 0) + newPoints;
    
        // Ensure dailyScores array exists
        if (!storedProfile.gameStats.dailyScores) {
          storedProfile.gameStats.dailyScores = [];
        }

        // Ensure game-specific stats are tracked
        if (!storedProfile.gameStats.gameSpecificStats) {
          storedProfile.gameStats.gameSpecificStats = {};
        }
        // Mark this specific game as played
        storedProfile.gameStats.gameSpecificStats['movieGuessingGame'] = true;

        // Increment total games played for the First Steps achievement
        storedProfile.gameStats.gamesPlayed = (storedProfile.gameStats.gamesPlayed || 0) + 1;
            
        // Check if there's already a score for today
        const todayScoreIndex = storedProfile.gameStats.dailyScores.findIndex(
          score => new Date(score.date).toISOString().split('T')[0] === currentDate
        );

        storedProfile.gameStats.movieGuesser = storedProfile.gameStats.movieGuesser || { 
          correctAnswers: 0 
        };
    
        if (todayScoreIndex !== -1) {
          // Update existing today's score
          storedProfile.gameStats.dailyScores[todayScoreIndex].points += newPoints;
        } else {
          // Add new daily score
          storedProfile.gameStats.dailyScores.push({
            date: today.toISOString(),
            points: newPoints
          });
        }
    
        // Check if it's a new day or first score
        if (currentDate !== lastUpdateDate) {
          // Reset daily score if it's a new day
          storedProfile.gameStats.dailyScore = newPoints;
        } else {
          
          storedProfile.gameStats.dailyScore = 
            (storedProfile.gameStats.dailyScore || 0) + newPoints;
        }
    
        // Update last score update timestamp
        storedProfile.gameStats.lastScoreUpdate = today.toISOString();
        
        // Update streak BEFORE saving the profile
        const updatedProfile = updateStreak(storedProfile);
    
        localStorage.setItem('movieGameProfile', JSON.stringify(updatedProfile));
    
        // Call onProfileUpdate if it exists
        if (onProfileUpdate) {
          onProfileUpdate(updatedProfile);
        }

        storedProfile.gameStats.movieGuesser.correctAnswers += 1;
      }
      setGameState('won');

    } else {
      setComboStreak(0);
      
      // Subtract 100 points for wrong answers in Normal and Hard mode
      if (gameMode !== 'EASY') {
        setComboStreak(0);
        setScore(prev => prev - 100);
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
    setComboStreak(0);
  };

  const styles = {
    header: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      marginBottom: '20px',
      '@media (min-width: 1024px)': {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      },
      '@media (max-width: 320px)': {
        flexDirection: 'column',
        alignItems: 'flex-start'
      }
    },
     title: {
      fontSize: '24px',
      fontWeight: 'bold',
      margin: '0',
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '10px',
      '@media (max-width: 320px)': {
        flexDirection: 'column',
        alignItems: 'flex-start'
      }
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
      backgroundColor: currentColors.statBackground,
      borderRadius: '8px',
      fontSize: '14px',
      '@media (max-width: 768px)': {
        flex: '1 1 auto', // Allow items to grow and shrink
        minWidth: 'calc(33.333% - 10px)', // Ensure 3 items per row on mobile
        justifyContent: 'center',
      }
    },
    clueCard: {
      backgroundColor: currentColors.cardBackground,
      color: currentColors.text,
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '12px',
      border: '1px solid #e5e7eb',
      borderColor: currentColors.cardBorder,
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
      flexWrap: 'wrap', // Add this
      '@media (max-width: 480px)': {
        flexDirection: 'column',
        '& > *': {
          width: '100%'
        }
      }
    },
    input: {
      backgroundColor: currentColors.inputBackground,
      borderColor: currentColors.cardBorder,
      color: currentColors.text,
      flex: '1',
      padding: '12px',
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
      fontSize: '16px',
      minWidth: 60,
    },   
    button: {
      padding: '12px 24px',
      borderRadius: '8px',
      border: 'none',
      backgroundColor: currentColors.buttonPrimary,
      color: 'white',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      whiteSpace: 'nowrap',
      '@media (max-width: 480px)': {
        width: '100%',
        minWidth: '100%' // Add this
      }
    },
    buttonGroup: {
      display: 'flex',
      gap: '12px',
      flexWrap: 'wrap', // Add this
      '@media (max-width: 480px)': {
        flexDirection: 'column',
        '& > *': {
          width: '100%'
        }
      }
    },
    buttonsContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      width: '100%',
      marginTop: '24px'
    },
    secondaryButton: {
      backgroundColor: currentColors.buttonSecondary,
    },
    disabledButton: {
      opacity: '0.5',
      cursor: 'not-allowed'
    },
    gameOverButtonGroup: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'center',
      marginTop: '20px',
      '@media (max-width: 480px)': {
        flexDirection: 'column',
        gap: '8px',
        '& > button': {
          width: '100%'
        }
      }
    },
    gameOverCard: {
      padding: '24px',
      borderRadius: '12px',
      textAlign: 'center',
      marginTop: '24px',
      '@media (max-width: 480px)': {
        padding: '16px'
      }
    },
    gameOverButton: {
      padding: '12px 24px',
      borderRadius: '8px',
      border: 'none',
      backgroundColor: '#3b82f6',
      color: 'white',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      minWidth: '120px',
      '@media (max-width: 480px)': {
        minWidth: '100%',
        padding: '14px 24px'
      }
    },
    gameOverTitle: {
      fontSize: '24px',
      marginBottom: '16px',
      '@media (max-width: 480px)': {
        fontSize: '20px'
      }
    },
    gameOverMessage: {
      marginBottom: '24px',
      fontSize: '16px',
      
      '@media (max-width: 480px)': {
        fontSize: '14px',
        marginBottom: '20px'
      }
    },
    badge: {
      padding: '4px 12px',
      borderRadius: '16px',
      fontSize: '14px',
      fontWeight: '500',
      backgroundColor: isDarkMode ? currentColors.background : '#e5e7eb',
      marginLeft: '8px'
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
          <h1 style={styles.title}>{t.movieGuesser}</h1>
          <p style={{ textAlign: 'center', color: '#6b7280', margin: '20px 0' }}>
            {t.selectChallenge}
          </p>
          <div className="mode-selection">
            {Object.keys(GAME_MODES).map((mode) => (
              <button
                key={mode}
                onClick={() => selectGameMode(mode)}
                className="mode-card"
                style={{
                  backgroundColor: currentColors.cardBackground,
                  transition: 'background-color 0.3s ease, color 0.3s ease',
                  color: mode === 'EASY' ? '#22c55e' : 
                         mode === 'NORMAL' ? '#3b82f6' : 
                         '#ef4444',
                  border: `2px solid ${
                    mode === 'EASY' ? '#22c55e' : 
                    mode === 'NORMAL' ? '#3b82f6' : 
                    '#ef4444'
                  }`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 
                  mode === 'EASY' ? '#22c55e' :                                       
                  mode === 'NORMAL' ? '#3b82f6' : '#ef4444';
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = currentColors.cardBackground;
                  e.currentTarget.style.color = 
                  mode === 'EASY' ? '#22c55e' : 
                  mode === 'NORMAL' ? '#3b82f6' : '#ef4444';
                  e.currentTarget.style.transform = 'scale(1)';
                }}>
                <div className="mode-card-title">
                  {language === 'en' ? GAME_MODES[mode].nameEN : GAME_MODES[mode].nameDE}
                </div>
                <div className="mode-card-description">
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
          {t.loading}
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

          {comboStreak > 0 && (
              <div style={{
                ...styles.statItem,
                backgroundColor: '#22c55e',
                color: 'white'
              }}>
                🔥 Combo: {comboStreak} (x{Math.min(Math.floor(comboStreak / 5) + 1, 3)})
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
              backgroundColor: gameState === 'won' ? currentColors.gamewonBackground : currentColors.gameoverBackground
            }}>
              <h3 className="game-over-title">
                {gameState === 'won' ? t.congratulations : t.gameOver}
              </h3>
              <p className="game-over-message">
                {gameState === 'won'
                  ? `${t.wonMessage} ${Math.max(10 - questionsAsked, 1) * 100}`
                  : `${t.lostMessage} ${currentMovie?.title}${gameMode !== 'EASY' ? t.pointsDeducted : ''}`}
              </p>
              <div className="game-over-buttons">
                <button
                  onClick={startNewGame}
                  className="game-over-button primary"
                >
                  {t.playAgain}
                </button>
                <button
                  onClick={() => setGameMode(null)}
                  className="game-over-button secondary"
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