import React, { useState, useEffect } from 'react';

const DailyLeaderboard = ({ userProfile, language, isDarkMode, onClose }) => {
  const [dailyScores, setDailyScores] = useState([]);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [timeToReset, setTimeToReset] = useState('');

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Calculate time until midnight
    const updateTimeToReset = () => {
      const now = new Date();
      const midnight = new Date(
        now.getFullYear(), 
        now.getMonth(), 
        now.getDate() + 1, 
        0, 0, 0
      );
      
      const difference = midnight.getTime() - now.getTime();
      
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / (1000 * 60)) % 60);
      const seconds = Math.floor((difference / 1000) % 60);
      
      // Format with leading zeros
      const formattedHours = hours.toString().padStart(2, '0');
      const formattedMinutes = minutes.toString().padStart(2, '0');
      const formattedSeconds = seconds.toString().padStart(2, '0');
      
      setTimeToReset(`${formattedHours}:${formattedMinutes}:${formattedSeconds}`);
    };

    // Initial update
    updateTimeToReset();

    // Update every second
    const timer = setInterval(updateTimeToReset, 1000);

    // Retrieve and process daily scores when component mounts
    if (userProfile) {
      const processedDailyScores = getDailyScoresForLastWeek();
      setDailyScores(processedDailyScores);
    }

    // Cleanup
    return () => {
      clearInterval(timer);
    };
  }, [userProfile]);

  const getDailyScoresForLastWeek = () => {
    // Retrieve the full game stats from localStorage
    const storedProfile = JSON.parse(localStorage.getItem('movieGameProfile'));
    
    if (!storedProfile || !storedProfile.gameStats || !storedProfile.gameStats.dailyScores) {
      return [];
    }

    // Get the daily scores
    const allDailyScores = storedProfile.gameStats.dailyScores || [];
  
    // Get current date and time
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
    // Filter and sort scores for the last 7 days
    const scoresLastWeek = allDailyScores
      .filter(score => {
        const scoreDate = new Date(score.date);
        const scoreDateOnly = new Date(scoreDate.getFullYear(), scoreDate.getMonth(), scoreDate.getDate());
        
        // Calculate the difference in days
        const daysDifference = (today - scoreDateOnly) / (1000 * 60 * 60 * 24);
        
        // Keep scores within the last 7 days
        return daysDifference >= 0 && daysDifference < 7;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 7); // Ensure only 7 most recent scores are shown
  
    return scoresLastWeek;
  };

  const translations = {
    en: {
      title: 'Daily Scores',
      noScores: 'No scores yet',
      points: 'points',
      timeToReset: 'Time until daily reset',
      currentDay: 'Current Day',
      streak: 'Streak',
    },
    de: {
      title: 'Tägliche Punktzahlen',
      noScores: 'Noch keine Punktzahlen',
      points: 'Punkte',
      timeToReset: 'Zeit bis zum täglichen Zurücksetzen',
      currentDay: 'Aktueller Tag',
      streak: 'Serie',
    }
  };

  const t = translations[language];

  const styles = {
    container: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: isDarkMode ? 'rgba(18, 24, 38, 0.95)' : 'rgba(243, 244, 246, 0.95)',
      zIndex: 2000,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: windowWidth <= 768 ? '0px' : '20px',
      overflow: 'auto'
    },
    modal: {
      backgroundColor: isDarkMode ? '#1f2937' : 'white',
      borderRadius: '16px',
      padding: '30px',
      width: '100%',
      maxWidth: '500px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
      color: isDarkMode ? '#e5e7eb' : '#1f2937'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px'
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      margin: 0
    },
    closeButton: {
      background: 'none',
      border: 'none',
      fontSize: '24px',
      cursor: 'pointer',
      color: isDarkMode ? '#e5e7eb' : '#1f2937'
    },
    scoreList: {
      maxHeight: '300px',
      overflowY: 'auto'
    },
    scoreItem: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '12px',
      borderBottom: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
      color: isDarkMode ? '#e5e7eb' : '#1f2937'
    },
    noScores: {
      textAlign: 'center',
      color: isDarkMode ? '#9ca3af' : '#6b7280',
      padding: '20px'
    },
    timerContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: isDarkMode ? '#374151' : '#e5e7eb',
      padding: '10px',
      borderRadius: '8px',
      marginBottom: '20px'
    },
    timerLabel: {
      marginRight: '10px',
      color: isDarkMode ? '#e5e7eb' : '#1f2937'
    },
    timer: {
      fontWeight: 'bold',
      color: isDarkMode ? '#e5e7eb' : '#1f2937'
    },
    streakContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: isDarkMode ? '#374151' : '#e5e7eb',
      padding: '10px',
      borderRadius: '16px', // Slightly more rounded
      marginBottom: '20px',
      boxShadow: isDarkMode 
        ? '0 4px 6px rgba(255,255,255,0.1)' 
        : '0 4px 6px rgba(0,0,0,0.1)', // Add subtle shadow
    },
    streakLabel: {
      marginRight: '10px',
      color: isDarkMode ? '#9ca3af' : '#6b7280', // Softer text color
      fontSize: '14px', // Slightly smaller font
    },
    streak: {
      fontWeight: 'bold',
      color: isDarkMode ? '#3b82f6' : '#2563eb', // Highlight color
      backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(37, 99, 235, 0.1)', // Subtle background
      padding: '4px 8px',
      borderRadius: '8px',
      minWidth: '40px', // Ensure consistent width
      textAlign: 'center',
    },
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'de-DE', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    }).format(new Date(date));
  };
  
  // Get current streak
  const currentStreak = userProfile?.gameStats?.streak?.currentStreak || 0;

  return (
    <div style={styles.container}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>{t.title}</h2>
          <button
            onClick={onClose}
            style={styles.closeButton}
          >
            ×
          </button>
        </div>
        
        <div style={styles.timerContainer}>
          <span style={styles.timerLabel}>{t.timeToReset}:</span>
          <span style={styles.timer}>{timeToReset}</span>
        </div>

        <div style={styles.streakContainer}>
          <span style={styles.streakLabel}>{t.streak}:</span>
          <span style={styles.streak}>{currentStreak}</span>
        </div>

        <div style={styles.scoreList}>
          {dailyScores.length === 0 ? (
            <p style={styles.noScores}>{t.noScores}</p>
          ) : (
            dailyScores.map((scoreData, index) => (
              <div key={index} style={styles.scoreItem}>
                <span>{formatDate(scoreData.date)}</span>
                <span>{scoreData.points} {t.points}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyLeaderboard;