import React, { useState, useEffect } from 'react';

const MovieQuoteGame = ({ language, isDarkMode, userProfile }) => {
  const [quote, setQuote] = useState('');
  const [options, setOptions] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Color scheme based on dark mode
  const colors = {
    light: {
      background: '#f3f4f6',
      text: '#1f2937',
      buttonBackground: '#374151',
      buttonText: 'white',
      cardBackground: 'white',
      cardBorder: '#e5e7eb',
    },
    dark: {
      background: '#121826',
      text: '#e5e7eb',
      buttonBackground: '#374151',
      buttonText: 'white',
      cardBackground: '#1f2937',
      cardBorder: '#374151',
    }
  };
  const currentColors = isDarkMode ? colors.dark : colors.light;

  const styles = {
    container: {
      maxWidth: '600px',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: currentColors.background,
      color: currentColors.text,
      borderRadius: '12px',
      textAlign: 'center',
    },
    quote: {
      fontSize: '24px',
      fontStyle: 'italic',
      marginBottom: '20px',
      padding: '20px',
      backgroundColor: currentColors.cardBackground,
      borderRadius: '12px',
      border: `1px solid ${currentColors.cardBorder}`,
    },
    button: {
      backgroundColor: currentColors.buttonBackground,
      color: currentColors.buttonText,
      border: 'none',
      padding: '12px 24px',
      margin: '10px',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'transform 0.2s',
    },
    scoreDisplay: {
      fontSize: '18px',
      marginBottom: '20px',
    },
    feedback: {
      marginTop: '20px',
      fontWeight: 'bold',
      color: isCorrect === true ? 'green' : 'red',
    }
  };

  const movieDatabase = [
    { title: 'The Shawshank Redemption', quote: 'Get busy living, or get busy dying.' },
    { title: 'Forrest Gump', quote: 'Life is like a box of chocolates. You never know what you\'re gonna get.' },
    { title: 'The Dark Knight', quote: 'Why so serious?' },
    { title: 'Pulp Fiction', quote: 'Say \'what\' again. I dare you, I double dare you!' },
    { title: 'The Matrix', quote: 'There is no spoon.' },
    { title: 'Inception', quote: 'You must not be afraid to dream a little bigger, darling.' },
    { title: 'Fight Club', quote: 'The first rule of Fight Club is: you do not talk about Fight Club.' },
    { title: 'Star Wars: A New Hope', quote: 'May the Force be with you.' },
    { title: 'The Godfather', quote: 'I\'m gonna make him an offer he can\'t refuse.' },
    { title: 'Titanic', quote: 'I\'m the king of the world!' }
  ];

  const startGame = () => {
    setGameStarted(true);
    fetchQuote();
  };

  const fetchQuote = () => {
    // Use local movie database instead of external API
    const randomMovie = movieDatabase[Math.floor(Math.random() * movieDatabase.length)];
    
    // Create options - include correct movie and 3 random incorrect movies
    const incorrectOptions = movieDatabase
      .filter(m => m.title !== randomMovie.title)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
    
    const allOptions = [...incorrectOptions, randomMovie]
      .sort(() => 0.5 - Math.random());

    setQuote(randomMovie.quote);
    setOptions(allOptions);
    setSelectedMovie(null);
    setIsCorrect(null);
  };

  const handleMovieSelect = (movie) => {
    setSelectedMovie(movie);
    const correctMovie = movieDatabase.find(m => m.quote === quote);
    
    const isAnswerCorrect = movie.title === correctMovie.title;
    setIsCorrect(isAnswerCorrect);

    if (isAnswerCorrect) {
      setScore(prevScore => prevScore + 1);
    }

    // Auto-proceed to next quote after 2 seconds
    setTimeout(fetchQuote, 2000);
  };

  useEffect(() => {
    // Reset game when component mounts
    setScore(0);
  }, []);

  if (!gameStarted) {
    return (
      <div style={styles.container}>
        <h1>{language === 'en' ? 'Movie Quote Guesser' : 'Film-Zitat-Raten'}</h1>
        <p>
          {language === 'en' 
            ? 'Guess the movie from the famous quote!' 
            : 'Erraten Sie den Film anhand eines berühmten Zitats!'}
        </p>
        <button 
          style={styles.button} 
          onClick={startGame}
        >
          {language === 'en' ? 'Start Game' : 'Spiel starten'}
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1>{language === 'en' ? 'Movie Quote Guesser' : 'Film-Zitat-Raten'}</h1>
      
      <div style={styles.scoreDisplay}>
        {language === 'en' ? 'Score:' : 'Punktestand:'} {score}
      </div>

      <div style={styles.quote}>
        "{quote}"
      </div>

      <div>
        {options.map((movie) => (
          <button
            key={movie.title}
            style={{
              ...styles.button,
              opacity: selectedMovie && selectedMovie.title !== movie.title ? 0.5 : 1,
              backgroundColor: 
                selectedMovie && selectedMovie.title === movie.title
                  ? (isCorrect ? 'green' : 'red')
                  : currentColors.buttonBackground
            }}
            onClick={() => handleMovieSelect(movie)}
            disabled={!!selectedMovie}
          >
            {movie.title}
          </button>
        ))}
      </div>

      {selectedMovie && (
        <div style={styles.feedback}>
          {isCorrect 
            ? (language === 'en' ? 'Correct!' : 'Richtig!') 
            : (language === 'en' ? 'Wrong!' : 'Falsch!')}
        </div>
      )}
    </div>
  );
};

export default MovieQuoteGame;