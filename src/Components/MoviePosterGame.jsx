import React, { useState, useEffect } from 'react';
import './MoviePosterGame.css';

const MoviePosterGame = ({ language, isDarkMode, userProfile }) => {
  const API_KEY = '014c0bfe3d16b0265fdd1fe8a7ccf1aa';
  const [currentMovie, setCurrentMovie] = useState(null);
  const [guessInput, setGuessInput] = useState('');
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [maxAttempts, setMaxAttempts] = useState(3);
  const [revealedPieces, setRevealedPieces] = useState(0);

  // Color scheme (reusing from previous implementation)
  const colors = {
    light: {
      background: '#f3f4f6',
      text: '#1f2937',
      inputBg: 'white',
      inputBorder: '#d1d5db',
      buttonBg: '#374151',
      buttonText: 'white'
    },
    dark: {
      background: '#121826',
      text: '#e5e7eb',
      inputBg: '#374151',
      inputBorder: '#4b5563',
      buttonBg: '#4b5563',
      buttonText: '#e5e7eb'
    }
  };

  const currentColors = isDarkMode ? colors.dark : colors.light;

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px',
      backgroundColor: currentColors.background,
      transition: 'background-color 0.3s ease, color 0.3s ease',
      color: currentColors.text,
      minHeight: 'calc(100vh - 100px)'
    },
    posterContainer: {
      position: 'relative',
      width: '300px',
      height: '450px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#e2e8f0',
      borderRadius: '12px',
      marginBottom: '20px',
      overflow: 'hidden'
    },
    poster: {
      position: 'absolute',
      top: 0,
      left: 0,
      maxWidth: '100%',
      maxHeight: '100%',
      objectFit: 'cover'
    },
    posterOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gridTemplateRows: 'repeat(2, 1fr)',
      gap: 0
    },
    posterPiece: {
      backgroundColor: 'black',
      opacity: 1,
      boxSizing: 'border-box',
      border: 'none',
      padding: 0
    },
    revealedPiece: {
      opacity: 0
    },
    revealButton: {
      marginTop: '10px',
      backgroundColor: currentColors.buttonBg,
      color: currentColors.buttonText,
      border: 'none',
      padding: '10px 20px',
      borderRadius: '8px',
      cursor: 'pointer'
    },
    input: {
      width: '300px',
      padding: '10px',
      marginBottom: '10px',
      backgroundColor: currentColors.inputBg,
      color: currentColors.text,
      border: `1px solid ${currentColors.inputBorder}`,
      borderRadius: '8px'
    },
    button: {
      backgroundColor: currentColors.buttonBg,
      color: currentColors.buttonText,
      border: 'none',
      padding: '10px 20px',
      borderRadius: '8px',
      cursor: 'pointer'
    },
    feedback: {
      marginTop: '10px',
      fontWeight: 'bold'
    }
  };

  const fetchRandomMovie = async () => {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=en-US&page=${Math.floor(Math.random() * 10) + 1}`
      );
      const data = await response.json();
      
      const movies = data.results;
      const randomMovie = movies[Math.floor(Math.random() * movies.length)];
      
      // Fetch poster details
      const posterPath = randomMovie.poster_path;
      const fullPosterUrl = `https://image.tmdb.org/t/p/w500${posterPath}`;
      
      setCurrentMovie({
        id: randomMovie.id,
        title: randomMovie.title,
        posterUrl: fullPosterUrl
      });
      
      // Reset game state
      setGuessInput('');
      setFeedback('');
      setAttempts(0);
      setRevealedPieces(1); // Start with one piece revealed
    } catch (error) {
      console.error('Error fetching movie:', error);
      setFeedback(language === 'en' 
        ? 'Error loading movie. Please try again.' 
        : 'Fehler beim Laden des Films. Bitte versuchen Sie es erneut.');
    }
  };

  useEffect(() => {
    fetchRandomMovie();
  }, []);

  const handleGuess = () => {
    if (!currentMovie) return;
  
    const normalizedGuess = guessInput.trim().toLowerCase();
    const normalizedTitle = currentMovie.title.toLowerCase();
  
    setAttempts(prev => prev + 1);
  
    if (normalizedGuess === normalizedTitle) {
      // Correct guess
      const points = Math.max(3 - attempts, 1) * 10;
      setScore(prev => prev + points);
      setFeedback(language === 'en' 
        ? `Correct! The movie is ${currentMovie.title}. You earned ${points} points!` 
        : `Richtig! Der Film ist ${currentMovie.title}. Sie haben ${points} Punkte verdient!`);
      
      // Update user profile in local storage
      const storedProfile = JSON.parse(localStorage.getItem('movieGameProfile'));
      if (storedProfile) {
        // Get current date
        const today = new Date();
        const currentDate = today.toISOString().split('T')[0];
  
        // Parse the last score update date
        const lastUpdateDate = storedProfile.gameStats.lastScoreUpdate
          ? new Date(storedProfile.gameStats.lastScoreUpdate).toISOString().split('T')[0]
          : null;
  
        // Update total score for Movie Poster Guesser
        storedProfile.gameStats.totalScore =
          (storedProfile.gameStats.totalScore || 0) + points;
        
        // Update Movie Poster Guesser high score
        storedProfile.gameStats.movieGuesser.gamesPlayed += 1;
        storedProfile.gameStats.movieGuesser.highScore = Math.max(
          storedProfile.gameStats.movieGuesser.highScore || 0, 
          points
        );
  
        // Check if it's a new day or first score
        if (currentDate !== lastUpdateDate) {
          // Reset daily score if it's a new day
          storedProfile.gameStats.dailyScore = points;
        } else {
          // Add to existing daily score
          storedProfile.gameStats.dailyScore =
            (storedProfile.gameStats.dailyScore || 0) + points;
        }
  
        // Update last score update timestamp
        storedProfile.gameStats.lastScoreUpdate = today.toISOString();
  
        // Save updated profile
        localStorage.setItem('movieGameProfile', JSON.stringify(storedProfile));
  
        // Call onProfileUpdate if passed as prop
        if (userProfile && userProfile.onProfileUpdate) {
          userProfile.onProfileUpdate(storedProfile);
        }
      }
      
      // Fetch new movie after a short delay
      setTimeout(fetchRandomMovie, 2000);
    } else if (attempts >= maxAttempts - 1) {
      // Last attempt
      setFeedback(language === 'en' 
        ? `Game over! The movie was ${currentMovie.title}.` 
        : `Spiel vorbei! Der Film war ${currentMovie.title}.`);
      
      // Fetch new movie after a short delay
      setTimeout(fetchRandomMovie, 2000);
    } else {
      // Incorrect guess
      setFeedback(language === 'en' 
        ? `Wrong guess. Try again! (${maxAttempts - attempts} attempts left)` 
        : `Falsche Vermutung. Versuchen Sie es erneut! (${maxAttempts - attempts} Versuche übrig)`);
    }
  };

  const revealRandomPiece = () => {
    // Ensure we don't reveal more than 6 pieces
    if (revealedPieces < 6) {
      setRevealedPieces(prev => prev + 1);
    }
  };

  return (
    <div style={styles.container}>
      <h1>{language === 'en' ? 'Movie Poster Guesser' : 'Film-Poster-Raten'}</h1>
      
      {currentMovie && (
        <>
          <div 
            style={styles.posterContainer} 
            className="movie-poster-container"
          >
            <img 
              src={currentMovie.posterUrl} 
              alt="Movie Poster" 
              style={styles.poster}
            />
            <div style={styles.posterOverlay}>
              {[0, 1, 2, 3, 4, 5].map((pieceIndex) => (
                <div
                  key={pieceIndex}
                  style={{
                    ...styles.posterPiece,
                    ...(revealedPieces >= pieceIndex + 1 ? styles.revealedPiece : {})
                  }}
                />
              ))}
            </div>
          </div>
          
          <div className="movie-poster-controls">
            <input
              type="text"
              value={guessInput}
              onChange={(e) => setGuessInput(e.target.value)}
              placeholder={language === 'en' ? "Guess the movie title" : "Raten Sie den Filmtitel"}
              style={styles.input}
              className="movie-poster-input"
              onKeyPress={(e) => e.key === 'Enter' && handleGuess()}
            />
          
          <button 
              onClick={revealRandomPiece}
              style={styles.revealButton}
              className="movie-poster-reveal-button"
              disabled={revealedPieces >= 6}
            >
              {language === 'en' 
                ? `Reveal Piece (${6 - revealedPieces} left)` 
                : `Stück aufdecken (${6 - revealedPieces} übrig)`}
            </button>

            <button 
              onClick={handleGuess}
              style={styles.button}
              className="movie-poster-button"
            >
              {language === 'en' ? 'Submit Guess' : 'Eingeben'}
            </button>
          
            {feedback && (
              <div style={styles.feedback}>
                {feedback}
              </div>
            )}
          
            <div>
              {language === 'en' ? 'Score:' : 'Punktzahl:'} {score}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MoviePosterGame;