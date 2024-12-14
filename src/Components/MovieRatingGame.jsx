import React, { useState, useEffect } from 'react';

const MovieRatingGame = ({ language, isDarkMode, userProfile }) => {
  const [currentMovie, setCurrentMovie] = useState(null);
  const [options, setOptions] = useState([]);
  const [selectedRating, setSelectedRating] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [roundsPlayed, setRoundsPlayed] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const API_KEY = '014c0bfe3d16b0265fdd1fe8a7ccf1aa';
  const MAX_ROUNDS = 10;

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getCurrentColors = () => ({
    light: {
      background: '#f3f4f6',
      text: '#1f2937',
      secondaryText: '#6b7280',
      cardBackground: 'white',
      cardBorder: '#e5e7eb',
    },
    dark: {
      background: '#121826',
      text: '#e5e7eb',
      secondaryText: '#9ca3af',
      cardBackground: '#1f2937',
      cardBorder: '#374151',
    }
  })[isDarkMode ? 'dark' : 'light'];

  const fetchRandomMovie = async () => {
    setIsLoading(true);
    try {
      // Fetch a random page of popular movies
      const pageResponse = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&page=${Math.floor(Math.random() * 10) + 1}`);
      const pageData = await pageResponse.json();
      
      // Select a random movie from the results
      const randomMovie = pageData.results[Math.floor(Math.random() * pageData.results.length)];
      
      // Fetch full movie details to get vote average
      const movieResponse = await fetch(`https://api.themoviedb.org/3/movie/${randomMovie.id}?api_key=${API_KEY}`);
      const movieData = await movieResponse.json();
      
      // Generate rating options
      const correctRating = Math.round(movieData.vote_average * 10) / 10;
      const generateOptions = () => {
        const options = [correctRating];
        while (options.length < 4) {
          const randomRating = Number((Math.random() * 10).toFixed(1));
          if (!options.includes(randomRating) && randomRating > 0) {
            options.push(randomRating);
          }
        }
        return options.sort(() => Math.random() - 0.5);
      };

      setCurrentMovie(movieData);
      setOptions(generateOptions());
      setSelectedRating(null);
      setIsCorrect(null);
    } catch (error) {
      console.error('Error fetching movie:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRandomMovie();
  }, []);

  const handleRatingSelect = (rating) => {
    if (selectedRating !== null) return;

    setSelectedRating(rating);
    const correct = rating === Math.round(currentMovie.vote_average * 10) / 10;
    setIsCorrect(correct);

    let points = 0;
    if (correct) {
      // Award points based on attempts
      points = 10;
      setScore(prev => prev + points);
    }

    setRoundsPlayed(prev => prev + 1);

    // Update user profile if exists
    const storedProfile = JSON.parse(localStorage.getItem('movieGameProfile'));
    if (storedProfile) {
      // Get current date
      const today = new Date();
      const currentDate = today.toISOString().split('T')[0];

      // Ensure dailyScores array exists
      if (!storedProfile.gameStats.dailyScores) {
        storedProfile.gameStats.dailyScores = [];
      }

      // Check if there's already a score for today
      const todayScoreIndex = storedProfile.gameStats.dailyScores.findIndex(
        score => new Date(score.date).toISOString().split('T')[0] === currentDate
      );

      if (todayScoreIndex !== -1) {
        // Update existing today's score
        storedProfile.gameStats.dailyScores[todayScoreIndex].points += points;
      } else {
        // Add new daily score
        storedProfile.gameStats.dailyScores.push({
          date: today.toISOString(),
          points: points
        });
      }

      // Update total score
      storedProfile.gameStats.totalScore = 
        (storedProfile.gameStats.totalScore || 0) + points;

      // Update Movie Criteria game stats
      storedProfile.gameStats.movieCriteria = storedProfile.gameStats.movieCriteria || { gamesPlayed: 0, highScore: 0 };
      storedProfile.gameStats.movieCriteria.gamesPlayed += 1;
      storedProfile.gameStats.movieCriteria.highScore = Math.max(
        storedProfile.gameStats.movieCriteria.highScore || 0, 
        points
      );

      // Update daily score
      storedProfile.gameStats.dailyScore = 
        (storedProfile.gameStats.dailyScore || 0) + points;

      // Update last score update timestamp
      storedProfile.gameStats.lastScoreUpdate = today.toISOString();

      // Ensure game-specific stats are tracked
      if (!storedProfile.gameStats.gameSpecificStats) {
        storedProfile.gameStats.gameSpecificStats = {};
      }
      // Mark this specific game as played
      storedProfile.gameStats.gameSpecificStats['movieRatingGame'] = true;

      // Increment total games played for the First Steps achievement
      storedProfile.gameStats.gamesPlayed = (storedProfile.gameStats.gamesPlayed || 0) + 1;

      // Save updated profile
      localStorage.setItem('movieGameProfile', JSON.stringify(storedProfile));

      // Call onProfileUpdate if passed as prop
      if (userProfile && userProfile.onProfileUpdate) {
        userProfile.onProfileUpdate(storedProfile);
      }
    }

    if (roundsPlayed + 1 >= MAX_ROUNDS) {
      setGameOver(true);
    } else {
      setTimeout(fetchRandomMovie, 1500);
    }
  };

  const resetGame = () => {
    setScore(0);
    setRoundsPlayed(0);
    setGameOver(false);
    fetchRandomMovie();
  };

  const styles = {
    container: {
      maxWidth: '600px',
      margin: '0 auto',
      padding: '20px',
      textAlign: 'center',
      backgroundColor: getCurrentColors().background,
      color: getCurrentColors().text,
    },
    moviePoster: {
      width: '100%',
      maxWidth: '300px',
      height: 'auto',
      maxHeight: windowWidth < 400 ? '250px' : 
                windowWidth < 600 ? '350px' : 
                '450px',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      margin: '20px auto',
      display: 'block',
      objectFit: 'cover',
    },
    title: {
      fontSize: windowWidth < 400 ? '20px' : '24px',
      marginBottom: '20px',
      color: getCurrentColors().text,
    },
    optionsContainer: {
      display: 'grid',
      gridTemplateColumns: windowWidth < 400 ? '1fr' : '1fr 1fr',
      gap: '15px',
      marginTop: '20px',
    },
    optionButton: {
      padding: windowWidth < 400 ? '10px' : '15px',
      fontSize: windowWidth < 400 ? '16px' : '18px',
      borderRadius: '8px',
      border: `1px solid ${getCurrentColors().cardBorder}`,
      backgroundColor: getCurrentColors().cardBackground,
      color: getCurrentColors().text,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
    },
    correctButton: {
      backgroundColor: '#4CAF50',
      color: 'white',
    },
    incorrectButton: {
      backgroundColor: '#f44336',
      color: 'white',
    },
    scoreContainer: {
      marginTop: '20px',
      fontSize: windowWidth < 400 ? '16px' : '18px',
    },
    gameOverContainer: {
      marginTop: '40px',
    },
    resetButton: {
      padding: '15px 30px',
      fontSize: '18px',
      backgroundColor: getCurrentColors().cardBackground,
      color: getCurrentColors().text,
      border: `1px solid ${getCurrentColors().cardBorder}`,
      borderRadius: '8px',
      cursor: 'pointer',
    }
  };

  if (isLoading) {
    return (
      <div style={styles.container}>
        <p>{language === 'en' ? 'Loading...' : 'Laden...'}</p>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div style={styles.container}>
        <div style={styles.gameOverContainer}>
          <h2>{language === 'en' ? 'Game Over' : 'Spiel Vorbei'}</h2>
          <p style={styles.scoreContainer}>
            {language === 'en' ? 'Your Score:' : 'Deine Punktzahl:'} {score}/{MAX_ROUNDS * 10}
          </p>
          <button 
            onClick={resetGame} 
            style={styles.resetButton}
          >
            {language === 'en' ? 'Play Again' : 'Nochmal Spielen'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>
        {language === 'en' 
          ? 'Guess the Movie Rating' 
          : 'Bewerte den Film'}
      </h1>
      
      {currentMovie && (
        <>
          <img 
            src={`https://image.tmdb.org/t/p/w500${currentMovie.poster_path}`} 
            alt={currentMovie.title} 
            style={styles.moviePoster}
          />
          
          <h2>{currentMovie.title}</h2>
          
          <p>
            {language === 'en' 
              ? 'What do you think is its rating?' 
              : 'Was denkst du ist seine Bewertung?'}
          </p>
          
          <div style={styles.optionsContainer}>
            {options.map((rating) => (
              <button
                key={rating}
                onClick={() => handleRatingSelect(rating)}
                style={{
                  ...styles.optionButton,
                  ...(selectedRating === rating 
                    ? (isCorrect 
                      ? styles.correctButton 
                      : styles.incorrectButton) 
                    : {})
                }}
                disabled={selectedRating !== null}
              >
                {rating.toFixed(1)}
              </button>
            ))}
          </div>
          
          <div style={styles.scoreContainer}>
            {language === 'en' 
              ? `Score: ${score}/${MAX_ROUNDS * 10}` 
              : `Punktzahl: ${score}/${MAX_ROUNDS * 10}`}
          </div>
        </>
      )}
    </div>
  );
};

export default MovieRatingGame;