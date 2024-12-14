import React, { useState, useEffect } from 'react';

// Achievement definitions
export const ACHIEVEMENTS = {
  FIRST_GAME: {
    id: 'first_game',
    title: {
      en: 'First Steps',
      de: 'Erste Schritte'
    },
    description: {
      en: 'Play your first game',
      de: 'Spiele dein erstes Spiel'
    },
    icon: '🏁',
    points: 10,
    condition: (userProfile) => userProfile.gameStats.gamesPlayed > 0
  },
  MOVIE_MASTER: {
    id: 'movie_master',
    title: {
      en: 'Movie Master',
      de: 'Film-Meister'
    },
    description: {
      en: 'Reach a total score of 500 points',
      de: 'Erreiche eine Gesamtpunktzahl von 500 Punkten'
    },
    icon: '🏆',
    points: 50,
    condition: (userProfile) => (userProfile.gameStats.totalScore || 0) >= 500
  },
  POSTER_EXPERT: {
    id: 'poster_expert',
    title: {
      en: 'Poster Expert',
      de: 'Poster-Experte'
    },
    description: {
      en: 'Guess 20 movie posters correctly',
      de: 'Erkenne 20 Filmplakate korrekt'
    },
    icon: '🖼️',
    points: 30,
    condition: (userProfile) => 
      (userProfile.gameStats.movieGuesser?.correctlyGuessedPosters || 0) >= 20
  },
  DAILY_STREAK: {
    id: 'daily_streak',
    title: {
      en: 'Consistent Player',
      de: 'Beständiger Spieler'
    },
    description: {
      en: 'Play games for 7 consecutive days',
      de: 'Spiele 7 Tage hintereinander'
    },
    icon: '🔥',
    points: 40,
    condition: (userProfile) => {
      if (!userProfile.gameStats.dailyScores) return false;
      
      // Sort daily scores by date
      const sortedScores = userProfile.gameStats.dailyScores
        .sort((a, b) => new Date(a.date) - new Date(b.date));
      
      // Check for consecutive days
      let consecutiveDays = 1;
      let lastDate = new Date(sortedScores[sortedScores.length - 1].date);
      
      for (let i = sortedScores.length - 2; i >= 0; i--) {
        const currentDate = new Date(sortedScores[i].date);
        const dayDifference = (lastDate - currentDate) / (1000 * 60 * 60 * 24);
        
        if (dayDifference <= 1) {
          consecutiveDays++;
          lastDate = currentDate;
        } else {
          break;
        }
        
        if (consecutiveDays >= 7) return true;
      }
      
      return false;
    }
  },
  GENRE_DIVERSITY: {
    id: 'genre_diversity',
    title: {
      en: 'Genre Explorer',
      de: 'Genre-Entdecker'
    },
    description: {
      en: 'Play all 5 different movie games',
      de: 'Spiele alle 5 verschiedenen Filmspiele'
    },
    icon: '🌈',
    points: 60,
    condition: (userProfile) => {
      // This would require tracking which games have been played
      const gamesPlayedCount = Object.keys(userProfile.gameStats?.gameSpecificStats || {}).length;
      return gamesPlayedCount >= 5;
    }
  }
};

// Achievement Manager Hook
export const useAchievements = (userProfile, language = 'en') => {
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);
  const [isAchievementsModalOpen, setIsAchievementsModalOpen] = useState(false);

  useEffect(() => {
    if (!userProfile) return;

    // Initialize achievements in user profile if not exists
    if (!userProfile.achievements) {
      userProfile.achievements = {
        unlocked: [],
        totalAchievementPoints: 0
      };
    }

    // Check for new achievements
    const newUnlockedAchievements = Object.values(ACHIEVEMENTS)
      .filter(achievement => 
        !userProfile.achievements.unlocked.includes(achievement.id) &&
        achievement.condition(userProfile)
      );

    // If new achievements found, update profile
    if (newUnlockedAchievements.length > 0) {
      const achievementIds = newUnlockedAchievements.map(a => a.id);
      const achievementPoints = newUnlockedAchievements.reduce((sum, a) => sum + a.points, 0);

      const updatedProfile = {
        ...userProfile,
        achievements: {
          unlocked: [...userProfile.achievements.unlocked, ...achievementIds],
          totalAchievementPoints: (userProfile.achievements.totalAchievementPoints || 0) + achievementPoints
        }
      };

      // Save to localStorage
      localStorage.setItem('movieGameProfile', JSON.stringify(updatedProfile));

      // Update state
      setUnlockedAchievements(newUnlockedAchievements);
    }
  }, [userProfile]);

  // Achievement Notification Component
  const AchievementNotification = ({ achievement }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 5000);

      return () => clearTimeout(timer);
    }, []);

    if (!isVisible) return null;

    return (
      <div style={{
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#4CAF50',
        color: 'white',
        padding: '15px',
        borderRadius: '8px',
        margin: '10px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
        zIndex: 1000,
        maxWidth: '350px',
        width: '90%'
      }}>
        <div style={{ fontSize: '40px', marginRight: '15px' }}>
          {achievement.icon}
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0, fontSize: '16px', marginBottom: '5px' }}>
            {achievement.title[language]}
          </h3>
          <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>
            {achievement.description[language]}
          </p>
          <small style={{ display: 'block', marginTop: '5px', opacity: 0.8 }}>
            +{achievement.points} {language === 'en' ? 'points' : 'Punkte'}
          </small>
        </div>
        <button 
          onClick={() => setIsVisible(false)}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '20px',
            cursor: 'pointer',
            marginLeft: '10px'
          }}
        >
          ×
        </button>
      </div>
    );
  };

  // Achievements Modal Component
  const AchievementsModal = ({ isDarkMode = false }) => {
    const colors = {
      light: {
        background: '#f3f4f6',
        text: '#1f2937',
        unlockedBg: '#e9f5e9',
        lockedBg: '#f3f4f6'
      },
      dark: {
        background: '#121826',
        text: '#e5e7eb',
        unlockedBg: '#2c3e50',
        lockedBg: '#1f2937'
      }
    };

    const currentColors = isDarkMode ? colors.dark : colors.light;
    const allAchievements = Object.values(ACHIEVEMENTS);
    const unlockedAchievementIds = userProfile?.achievements?.unlocked || [];

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1100
      }}>
        <div style={{
          backgroundColor: currentColors.background,
          borderRadius: '12px',
          padding: '20px',
          maxWidth: '500px',
          width: '90%',
          maxHeight: '80%',
          overflowY: 'auto',
          color: currentColors.text
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h2 style={{ margin: 0 }}>
              {language === 'en' ? 'Achievements' : 'Erfolge'}
            </h2>
            <button 
              onClick={() => setIsAchievementsModalOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer'
              }}
            >
              ×
            </button>
          </div>

          <div>
            <p style={{ marginBottom: '20px' }}>
              {language === 'en' 
                ? `Total Achievement Points: ${userProfile?.achievements?.totalAchievementPoints || 0}`
                : `Gesamt-Erfolgspunkte: ${userProfile?.achievements?.totalAchievementPoints || 0}`}
            </p>

            {allAchievements.map(achievement => {
              const isUnlocked = unlockedAchievementIds.includes(achievement.id);
              
              return (
                <div 
                  key={achievement.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '15px',
                    padding: '15px',
                    borderRadius: '8px',
                    backgroundColor: isUnlocked 
                      ? currentColors.unlockedBg 
                      : currentColors.lockedBg,
                    opacity: isUnlocked ? 1 : 0.6
                  }}
                >
                  <div style={{ 
                    fontSize: '40px', 
                    marginRight: '15px',
                    filter: isUnlocked ? 'none' : 'grayscale(100%)'
                  }}>
                    {achievement.icon}
                  </div>
                  <div>
                    <h3 style={{ margin: 0 }}>
                      {achievement.title[language]}
                      {isUnlocked && <span style={{ marginLeft: '10px', color: 'green' }}>✓</span>}
                    </h3>
                    <p style={{ margin: '5px 0', color: currentColors.text }}>
                      {achievement.description[language]}
                    </p>
                    {isUnlocked && (
                      <small style={{ color: '#4CAF50' }}>
                        +{achievement.points} {language === 'en' ? 'points' : 'Punkte'}
                      </small>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return {
    unlockedAchievements,
    AchievementNotification,
    AchievementsModal,
    isAchievementsModalOpen,
    setIsAchievementsModalOpen,
    getAllAchievements: () => ACHIEVEMENTS,
    getUnlockedAchievements: () => 
      Object.values(ACHIEVEMENTS).filter(a => 
        userProfile?.achievements?.unlocked?.includes(a.id)
      )
  };
};

export default { ACHIEVEMENTS, useAchievements };