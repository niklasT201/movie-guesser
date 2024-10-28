import React, { useState, useEffect } from 'react';

const API_KEY = '014c0bfe3d16b0265fdd1fe8a7ccf1aa';

const MovieGuessingGame = () => {
  const [currentMovie, setCurrentMovie] = useState(null);
  const [questionsAsked, setQuestionsAsked] = useState(1);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState('loading'); // 'loading', 'playing', 'won', 'lost'
  const [guess, setGuess] = useState('');
  const [revealedClues, setRevealedClues] = useState([]);

  // Function to format currency
  const formatCurrency = (amount) => {
    if (!amount) return "Not Available";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Function to get a random popular movie
  const fetchRandomMovie = async () => {
    try {
      // First get a list of popular movies
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=en-US&page=${Math.floor(Math.random() * 5) + 1}`
      );
      const data = await response.json();
      const randomMovie = data.results[Math.floor(Math.random() * data.results.length)];

      // Then get detailed information for the chosen movie
      const detailResponse = await fetch(
        `https://api.themoviedb.org/3/movie/${randomMovie.id}?api_key=${API_KEY}&language=en-US&append_to_response=credits`
      );
      const movieDetail = await detailResponse.json();
      
      return {
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

  // Initialize game
  useEffect(() => {
    startNewGame();
  }, []);

  // Function to get a random clue
  const getRandomClue = (excludeIds = []) => {
    const clues = getClues();
    const availableClues = clues.filter(clue => !excludeIds.includes(clue.id));
    return availableClues[Math.floor(Math.random() * availableClues.length)];
  };

  const getClue = () => {
    if (questionsAsked >= 9) {
      setGameState('lost');
      return;
    }
    
    const randomClue = getRandomClue(revealedClues);
    if (randomClue) {
      setRevealedClues([...revealedClues, randomClue.id]);
      setQuestionsAsked(questionsAsked + 1);
    }
  };

  const makeGuess = () => {
    if (guess.toLowerCase() === currentMovie.title.toLowerCase()) {
      const newPoints = Math.max(10 - questionsAsked, 1) * 100;
      setScore(score + newPoints);
      setGameState('won');
    } else {
      setQuestionsAsked(questionsAsked + 1);
      setGuess('');
      if (questionsAsked >= 9) {
        setGameState('lost');
      }
    }
  };

  const startNewGame = async () => {
    setGameState('loading');
    const movie = await fetchRandomMovie();
    if (movie) {
      setCurrentMovie(movie);
      setQuestionsAsked(1);
      setGameState('playing');
      setGuess('');
      
      // Get initial random clue
      const initialClue = { id: 1, type: "Year", value: movie.year };
      setRevealedClues([initialClue.id]);
    } else {
      // Handle error case
      alert('Error loading movie. Please try again.');
      setGameState('playing');
    }
  };

  if (gameState === 'loading') {
    return (
      <div style={{ 
        maxWidth: '600px', 
        margin: '0 auto', 
        padding: '20px',
        textAlign: 'center' 
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', marginBottom: '10px' }}>Movie Guessing Game</h1>
        <div>Score: {score} | Questions Left: {9 - questionsAsked}</div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Revealed Clues:</h3>
        {currentMovie && revealedClues.map(clueId => {
          const clue = getClues().find(c => c.id === clueId);
          return (
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
          );
        })}
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
              style={{
                padding: '8px 16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
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

      {gameState === 'won' && (
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#d4edda', 
          borderRadius: '4px',
          marginTop: '20px'
        }}>
          <h3>Congratulations!</h3>
          <p>You won! Points earned: {Math.max(10 - questionsAsked, 1) * 100}</p>
          <button
            onClick={startNewGame}
            style={{
              padding: '8px 16px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            Play Again
          </button>
        </div>
      )}

      {gameState === 'lost' && (
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#f8d7da', 
          borderRadius: '4px',
          marginTop: '20px'
        }}>
          <h3>Game Over</h3>
          <p>The movie was: {currentMovie.title}</p>
          <button
            onClick={startNewGame}
            style={{
              padding: '8px 16px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default MovieGuessingGame;