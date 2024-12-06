import React, { useState, useEffect, useRef } from 'react';

const MovieTimedChallengeGame = ({ language, isDarkMode, userProfile }) => {
  // Sample movie data (you'd replace this with a more comprehensive database)
  const movies = [
    { title: 'The Shawshank Redemption', original: true },
    { title: 'Pulp Fiction', original: true },
    { title: 'Forrest Gump', original: true },
    { title: 'The Matrix', original: true },
    { title: 'Inception', original: true },
    { title: 'The Dark Knight', original: true },
    { title: 'Schindler\'s List', original: true },
    { title: 'Fight Club', original: true },
    { title: 'The Godfather', original: true },
    { title: 'Goodfellas', original: true }
  ];

  const [currentMovies, setCurrentMovies] = useState([]);
  const [guessedMovies, setGuessedMovies] = useState([]);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes
  const [gameStatus, setGameStatus] = useState('not-started'); // 'not-started', 'playing', 'won', 'lost'
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);

  // Color scheme based on dark/light mode
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
      textDecoration: guessedMovies.includes(movies.title) ? 'line-through' : 'none'
    },
    startButton: {
      width: '100%',
      padding: '10px',
      backgroundColor: colors.buttonBackground,
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer'
    }
  };

  // Shuffle and select movies
  const startGame = () => {
    const shuffled = movies.sort(() => 0.5 - Math.random());
    setCurrentMovies(shuffled.slice(0, 10));
    setGuessedMovies([]);
    setTimeLeft(180);
    setGameStatus('playing');
  };

  // Handle input submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedInput = inputValue.trim();
    
    if (currentMovies.some(movie => 
      movie.title.toLowerCase() === trimmedInput.toLowerCase() && 
      !guessedMovies.includes(movie.title)
    )) {
      const newGuessedMovies = [
        ...guessedMovies, 
        currentMovies.find(movie => movie.title.toLowerCase() === trimmedInput.toLowerCase()).title
      ];
      setGuessedMovies(newGuessedMovies);
      
      // Check if all movies are guessed
      if (newGuessedMovies.length === currentMovies.length) {
        setGameStatus('won');
      }
    }
    
    setInputValue('');
  };

  // Timer logic
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

  // Render different game states
  const renderGameContent = () => {
    switch (gameStatus) {
      case 'not-started':
        return (
          <button 
            style={styles.startButton} 
            onClick={startGame}
          >
            {language === 'en' ? 'Start Timed Movie Challenge' : 'Zeitbasierte Film-Challenge starten'}
          </button>
        );
      
      case 'playing':
        return (
          <>
            <div style={styles.timer}>
              {Math.floor(timeLeft / 60)}:
              {(timeLeft % 60).toString().padStart(2, '0')}
            </div>
            
            <div style={styles.movieList}>
              {currentMovies.map((movie) => (
                <div 
                  key={movie.title} 
                  style={{
                    ...styles.movieItem,
                    opacity: guessedMovies.includes(movie.title) ? 0.5 : 1
                  }}
                >
                  {guessedMovies.includes(movie.title) ? '✓ ' : ''}
                  {movie.title}
                </div>
              ))}
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
              onClick={startGame}
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
              onClick={startGame}
            >
              {language === 'en' ? 'Try Again' : 'Nochmal versuchen'}
            </button>
          </div>
        );
      
      default:
        return null;
    }
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
      
      {renderGameContent()}
    </div>
  );
};

export default MovieTimedChallengeGame;