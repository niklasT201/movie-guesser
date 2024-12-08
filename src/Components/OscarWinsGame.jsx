import React, { useState, useEffect } from 'react';

const OscarWinsGame = ({ language, isDarkMode, userProfile }) => {
  const API_KEY = '014c0bfe3d16b0265fdd1fe8a7ccf1aa';
  const [difficulty, setDifficulty] = useState('medium');
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState('setup');
  const [options, setOptions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [questionHistory, setQuestionHistory] = useState([]);
  const [awardWinningMovies, setAwardWinningMovies] = useState([]);

  const colors = {
    light: {
      background: '#f3f4f6',
      cardBackground: 'white',
      text: '#1f2937',
      secondaryText: '#6b7280',
      buttonBackground: '#374151',
      buttonText: 'white',
      correctBackground: '#10B981',
      incorrectBackground: '#EF4444'
    },
    dark: {
      background: '#121826',
      cardBackground: '#1f2937',
      text: '#e5e7eb',
      secondaryText: '#9ca3af',
      buttonBackground: '#4b5563',
      buttonText: 'white',
      correctBackground: '#10B981',
      incorrectBackground: '#EF4444'
    }
  };

  const currentColors = colors[isDarkMode ? 'dark' : 'light'];

  const styles = {
    container: {
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: currentColors.background,
      color: currentColors.text,
      borderRadius: '12px'
    },
    title: {
      textAlign: 'center',
      marginBottom: '20px',
      color: currentColors.text
    },
    optionButton: {
      backgroundColor: currentColors.cardBackground,
      color: currentColors.text,
      border: `1px solid ${currentColors.secondaryText}`,
      padding: '15px',
      borderRadius: '8px',
      width: '100%',
      marginBottom: '10px',
      cursor: 'pointer',
      transition: 'all 0.3s'
    },
    selectedOption: {
      transform: 'scale(1.05)',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
    correctOption: {
      backgroundColor: currentColors.correctBackground,
      color: 'white'
    },
    incorrectOption: {
      backgroundColor: currentColors.incorrectBackground,
      color: 'white'
    }
  };

  // Fetch award-winning movies when component mounts
  useEffect(() => {
    const fetchAwardWinningMovies = async () => {
      try {
        const years = [2020, 2019, 2018, 2017, 2016];
        const allMovies = [];

        for (const year of years) {
          const response = await fetch(
            `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&primary_release_year=${year}&sort_by=vote_average.desc&vote_count.gte=100`
          );
          const data = await response.json();
          allMovies.push(...data.results.map(movie => ({
            ...movie,
            year
          })));
        }

        setAwardWinningMovies(allMovies);
        startGame(allMovies);
      } catch (error) {
        console.error('Error fetching movies:', error);
      }
    };

    fetchAwardWinningMovies();
  }, []);

  const generateQuestion = (movies) => {
    if (movies.length < 4) return null;

    const questionTypes = [
      // Highest Rated Movie in a Year
      () => {
        const year = movies[0].year;
        const yearMovies = movies.filter(m => m.year === year);
        const topMovie = yearMovies.reduce((max, movie) => 
          (movie.vote_average > max.vote_average) ? movie : max
        );

        const wrongOptions = yearMovies
          .filter(m => m.id !== topMovie.id)
          .sort(() => 0.5 - Math.random())
          .slice(0, 3)
          .map(m => Math.round(m.vote_average * 10) / 10);

        const options = [
          Math.round(topMovie.vote_average * 10) / 10,
          ...wrongOptions
        ].sort(() => 0.5 - Math.random());

        return {
          question: language === 'en'
            ? `What was the highest-rated movie rating in ${year}?`
            : `Was war die höchste Filmbewertung im Jahr ${year}?`,
          correctAnswer: Math.round(topMovie.vote_average * 10) / 10,
          options,
          movieTitle: topMovie.title
        };
      },

      // Movie with Most Votes
      () => {
        const year = movies[0].year;
        const yearMovies = movies.filter(m => m.year === year);
        const mostVotedMovie = yearMovies.reduce((max, movie) => 
          (movie.vote_count > max.vote_count) ? movie : max
        );

        const wrongOptions = yearMovies
          .filter(m => m.id !== mostVotedMovie.id)
          .sort(() => 0.5 - Math.random())
          .slice(0, 3)
          .map(m => m.vote_count);

        const options = [
          mostVotedMovie.vote_count,
          ...wrongOptions
        ].sort(() => 0.5 - Math.random());

        return {
          question: language === 'en'
            ? `How many votes did the most popular movie get in ${year}?`
            : `Wie viele Stimmen bekam der beliebteste Film im Jahr ${year}?`,
          correctAnswer: mostVotedMovie.vote_count,
          options,
          movieTitle: mostVotedMovie.title
        };
      }
    ];

    const selectedQuestionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
    return selectedQuestionType();
  };

  const startGame = (movies) => {
    if (!movies || movies.length === 0) return;

    const questionData = generateQuestion(movies);
    
    if (questionData) {
      setCurrentQuestion(questionData);
      setOptions(questionData.options);
      setGameState('playing');
      setSelectedAnswer(null);
      setFeedback(null);
    }
  };

  const checkAnswer = (selectedOption) => {
    setSelectedAnswer(selectedOption);
    const isCorrect = selectedOption === currentQuestion.correctAnswer;

    setFeedback({
      correct: isCorrect,
      message: isCorrect 
        ? (language === 'en' ? 'Correct!' : 'Richtig!')
        : (language === 'en' ? 'Wrong!' : 'Falsch!')
    });

    if (isCorrect) {
      setScore(prevScore => prevScore + 1);
    }

    setQuestionHistory(prev => [...prev, {
      question: currentQuestion.question,
      selectedAnswer,
      correctAnswer: currentQuestion.correctAnswer,
      isCorrect
    }]);

    setTimeout(() => startGame(awardWinningMovies), 2000);
  };

  const renderGameContent = () => {
    if (gameState === 'setup' || !currentQuestion) {
      return <div>Loading...</div>;
    }

    return (
      <div>
        <h2 style={styles.title}>{currentQuestion.question}</h2>
        <div>
          {options.map((option, index) => (
            <button
              key={index}
              style={{
                ...styles.optionButton,
                ...(selectedAnswer === option && styles.selectedOption),
                ...(feedback?.correct && option === currentQuestion.correctAnswer && styles.correctOption),
                ...(feedback && !feedback.correct && option === selectedAnswer && styles.incorrectOption)
              }}
              onClick={() => checkAnswer(option)}
              disabled={selectedAnswer !== null}
            >
              {option}
            </button>
          ))}
        </div>
        {feedback && (
          <div style={{
            textAlign: 'center', 
            marginTop: '20px', 
            color: feedback.correct ? currentColors.correctBackground : currentColors.incorrectBackground
          }}>
            {feedback.message}
            {!feedback.correct && (
              <p>
                {language === 'en' 
                  ? `The correct answer for "${currentQuestion.movieTitle}" was ${currentQuestion.correctAnswer}` 
                  : `Die richtige Antwort für "${currentQuestion.movieTitle}" war ${currentQuestion.correctAnswer}`}
              </p>
            )}
          </div>
        )}
        <div style={{textAlign: 'center', marginTop: '20px'}}>
          <p style={{color: currentColors.text}}>
            {language === 'en' ? 'Score:' : 'Punktestand:'} {score}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>
        {language === 'en' ? 'Movie Awards Trivia' : 'Film-Auszeichnungs-Quiz'}
      </h1>
      {renderGameContent()}
    </div>
  );
};

export default OscarWinsGame;