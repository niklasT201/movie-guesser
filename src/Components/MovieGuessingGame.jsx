import React, { useState } from 'react';

const MovieGuessingGame = () => {
  const [currentMovie, setCurrentMovie] = useState({
    title: "The Dark Knight",
    year: "2008",
    director: "Christopher Nolan",
    genre: "Action, Crime, Drama",
    actors: "Christian Bale, Heath Ledger, Aaron Eckhart",
    plot: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice."
  });
  
  const [questionsAsked, setQuestionsAsked] = useState(0);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState('playing'); // 'playing', 'won', 'lost'
  const [guess, setGuess] = useState('');
  const [revealedClues, setRevealedClues] = useState([]);
  
  const clues = [
    { id: 1, type: "Year", value: currentMovie.year },
    { id: 2, type: "Genre", value: currentMovie.genre },
    { id: 3, type: "Director", value: currentMovie.director },
    { id: 4, type: "Main Actor", value: currentMovie.actors.split(',')[0] },
    { id: 5, type: "Plot Hint", value: currentMovie.plot },
  ];
  
  const getClue = () => {
    if (questionsAsked >= 9) {
      setGameState('lost');
      return;
    }
    
    const availableClues = clues.filter(
      clue => !revealedClues.includes(clue.id)
    );
    
    if (availableClues.length > 0) {
      const randomClue = availableClues[Math.floor(Math.random() * availableClues.length)];
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
  
  const startNewGame = () => {
    setCurrentMovie({
      title: "Inception",
      year: "2010",
      director: "Christopher Nolan",
      genre: "Action, Adventure, Sci-Fi",
      actors: "Leonardo DiCaprio, Joseph Gordon-Levitt, Ellen Page",
      plot: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O."
    });
    setQuestionsAsked(0);
    setGameState('playing');
    setGuess('');
    setRevealedClues([]);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', marginBottom: '10px' }}>Movie Guessing Game</h1>
        <div>Score: {score} | Questions Left: {9 - questionsAsked}</div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Revealed Clues:</h3>
        {revealedClues.length === 0 ? (
          <p>No clues revealed yet</p>
        ) : (
          clues
            .filter(clue => revealedClues.includes(clue.id))
            .map(clue => (
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
            ))
        )}
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