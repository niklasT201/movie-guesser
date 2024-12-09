import React, { useState, useEffect } from 'react';

const DailyLeaderboard = ({ userProfile, language, isDarkMode, onClose }) => {
  const [dailyScores, setDailyScores] = useState([]);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'de-DE', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

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

        <div style={styles.scoreList}>
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
      </div>
    </div>
  );
};

export default DailyLeaderboard;