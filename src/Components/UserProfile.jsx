import React, { useState, useEffect } from 'react';
import './responsive/GameHub.css'; 

const UserProfile = ({ 
  language, 
  isDarkMode, 
  onClose, 
  onProfileUpdate 
}) => {
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState('🎬');
  const [showDataWarning, setShowDataWarning] = useState(true);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Custom function to generate a unique ID
  const generateUniqueId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  const avatars = ['🎬', '🍿', '🎥', '🌟', '🎭', '🎮', '🚀', '🌈'];

  const translations = {
    en: {
      profileTitle: 'Player Profile',
      username: 'Username',
      chooseAvatar: 'Choose Avatar',
      save: 'Save Profile',
      dataWarningTitle: 'Important: Data Storage',
      dataWarningMessage: 'Your profile and game progress are stored in your browser\'s local storage. Clearing browser data will delete all progress.',
      understood: 'I Understand',
      close: 'Close'
    },
    de: {
      profileTitle: 'Spielerprofil',
      username: 'Benutzername',
      chooseAvatar: 'Avatar wählen',
      save: 'Profil speichern',
      dataWarningTitle: 'Wichtig: Datenspeicherung',
      dataWarningMessage: 'Ihr Profil und Spielfortschritt werden im lokalen Speicher des Browsers gespeichert. Das Löschen der Browserdaten wird alle Fortschritte entfernen.',
      understood: 'Verstanden',
      close: 'Schließen'
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
    input: {
      width: '100%',
      padding: '10px 15px',
      marginBottom: '20px',
      borderRadius: '8px',
      border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
      backgroundColor: isDarkMode ? '#374151' : '#f9fafb',
      color: isDarkMode ? '#e5e7eb' : '#1f2937',
      boxSizing: 'border-box',
    },
    avatarContainer: {
      display: 'flex',
      justifyContent: 'center',
      gap: '10px',
      marginBottom: '20px',
      flexWrap: 'wrap'
    },
    avatarButton: {
      fontSize: windowWidth <= 768 ? '30px' : '40px',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      opacity: 0.5,
      transition: 'opacity 0.2s'
    },
    selectedAvatar: {
      opacity: 1,
      transform: 'scale(1.2)',
      border: `2px solid ${isDarkMode ? '#3b82f6' : '#1f2937'}`,
      borderRadius: '50%'
    },
    saveButton: {
      width: '100%',
      padding: '12px',
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'background-color 0.2s'
    },
    warningContainer: {
      backgroundColor: isDarkMode ? '#374151' : '#f3f4f6',
      padding: '20px',
      borderRadius: '8px',
      marginBottom: '20px',
      textAlign: 'center'
    },
    warningTitle: {
      color: '#ef4444',
      fontWeight: 'bold',
      marginBottom: '10px'
    }
  };

  const handleSaveProfile = () => {
    if (!username.trim()) return;

    const profileData = {
      id: generateUniqueId(),
      username: username.trim(),
      avatar,
      createdAt: new Date().toISOString(),
      gameStats: {
        totalScore: 0,  // Total Score
        dailyScore: 0,  // Daily Score to Reset
        lastScoreUpdate: new Date().toISOString(),  // Tracking daily reset
        movieGuesser: { gamesPlayed: 0, highScore: 0 },
        movieCriteria: { gamesPlayed: 0, highScore: 0 }
      }
    };

    localStorage.setItem('movieGameProfile', JSON.stringify(profileData));
    onProfileUpdate(profileData);
    onClose();
  };

  const renderWarning = () => {
    if (!showDataWarning) return null;

    return (
      <div style={styles.warningContainer}>
        <div style={styles.warningTitle}>{t.dataWarningTitle}</div>
        <p>{t.dataWarningMessage}</p>
        <button 
          style={styles.saveButton}
          onClick={() => setShowDataWarning(false)}
        >
          {t.understood}
        </button>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>{t.profileTitle}</h2>
          <button 
            onClick={onClose} 
            style={{
              background: 'none', 
              border: 'none', 
              fontSize: '24px', 
              cursor: 'pointer',
              color: isDarkMode ? '#e5e7eb' : '#1f2937'
            }}
          >
            ×
          </button>
        </div>

        {renderWarning()}

        <input
          type="text"
          placeholder={t.username}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={styles.input}
          maxLength={20}
        />

        <div>
          <p>{t.chooseAvatar}</p>
          <div style={styles.avatarContainer}>
            {avatars.map((avatarOption) => (
              <button
                key={avatarOption}
                onClick={() => setAvatar(avatarOption)}
                style={{
                  ...styles.avatarButton,
                  ...(avatar === avatarOption ? styles.selectedAvatar : {})
                }}
              >
                {avatarOption}
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={handleSaveProfile}
          style={styles.saveButton}
          disabled={!username.trim()}
        >
          {t.save}
        </button>
      </div>
    </div>
  );
};

export default UserProfile;