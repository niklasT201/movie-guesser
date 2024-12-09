import React, { useState, useEffect } from 'react';

const DailyLeaderboard = ({ userProfile, language, isDarkMode }) => {
  const [dailyScores, setDailyScores] = useState([]);

  useEffect(() => {
    if (userProfile) {
      // Retrieve or initialize daily scores from localStorage
      const storedScores = JSON.parse(localStorage.getItem('movieGameDailyScores') || '[]');
      
      // Filter scores for the last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const recentScores = storedScores
        .filter(score => new Date(score.date) >= sevenDaysAgo)
        .sort((a, b) => new Date(b.date) - new Date(a.date));
      
      setDailyScores(recentScores);
    }
  }, [userProfile]);

  const translations = {
    en: {
      title: 'Daily Scores',
      noScores: 'No scores yet',
      points: 'points'
    },
    de: {
      title: 'Tägliche Punktzahlen',
      noScores: 'Noch keine Punktzahlen',
      points: 'Punkte'
    }
  };

  const t = translations[language];

  const styles = {
    container: {
      backgroundColor: isDarkMode ? '#374151' : '#f3f4f6',
      borderRadius: '12px',
      margin: '10px 100px',
      padding: '15px',
      marginTop: '10px',
      maxWidth: '250px',
      width: '100%',
    },
    title: {
      fontSize: '18px',
      fontWeight: 'bold',
      marginBottom: '10px',
      color: isDarkMode ? '#e5e7eb' : '#1f2937'
    },
    scoreItem: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '8px 0',
      borderBottom: `1px solid ${isDarkMode ? '#4b5563' : '#e5e7eb'}`,
      color: isDarkMode ? '#e5e7eb' : '#1f2937'
    },
    noScores: {
      textAlign: 'center',
      color: isDarkMode ? '#9ca3af' : '#6b7280'
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'de-DE', {
      weekday: 'short'
    }).format(date);
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>{t.title}</h3>
      {dailyScores.length === 0 ? (
        <p style={styles.noScores}>{t.noScores}</p>
      ) : (
        dailyScores.map((score, index) => (
          <div key={index} style={styles.scoreItem}>
            <span>{formatDate(score.date)}</span>
            <span>{score.points} {t.points}</span>
          </div>
        ))
      )}
    </div>
  );
};

export default DailyLeaderboard;