import React, { useState, useEffect } from 'react';

// Daily Quest Definitions
export const DAILY_QUESTS = {
  POSTER_CHALLENGE: {
    id: 'poster_challenge',
    title: {
      en: 'Poster Detective',
      de: 'Poster-Detektiv'
    },
    description: {
      en: 'Correctly guess 5 movie posters',
      de: 'Erkenne 5 Filmplakate richtig'
    },
    icon: '🕵️',
    reward: 50,
    difficulty: 'medium',
    type: 'moviePoster',
    condition: (userProfile) => {
      const correctPosters = userProfile.gameStats.moviePosterGame?.correctPosters || 0;
      return correctPosters >= 5;
    }
  },
  RATING_EXPERT: {
    id: 'rating_expert',
    title: {
      en: 'Rating Guru',
      de: 'Bewertungs-Guru'
    },
    description: {
      en: 'Guess movie ratings with 80% accuracy',
      de: 'Erraten Sie Filmbewertungen mit 80% Genauigkeit'
    },
    icon: '⭐',
    reward: 75,
    difficulty: 'hard',
    type: 'movieRating',
    condition: (userProfile) => {
      const ratingGame = userProfile.gameStats.movieRatingGame || {};
      const accuracy = ratingGame.accuracy || 0;
      return accuracy >= 80;
    }
  },
  GENRE_MASTER: {
    id: 'genre_master',
    title: {
      en: 'Genre Explorer',
      de: 'Genre-Entdecker'
    },
    description: {
      en: 'Play all 3 different movie games today',
      de: 'Spielen Sie 3 verschiedene Filmspiele'
    },
    icon: '🌈',
    reward: 100,
    difficulty: 'hard',
    type: 'multiGame',
    condition: (userProfile) => {
      const today = new Date().toISOString().split('T')[0];
      const dailyGameStats = userProfile.gameStats.dailyGameStats?.[today] || {};
      const uniqueGamesPlayed = new Set(Object.keys(dailyGameStats)).size;
      return uniqueGamesPlayed >= 3;
    }
  },
  SPEED_CHALLENGE: {
    id: 'speed_challenge',
    title: {
      en: 'Speed Runner',
      de: 'Schnellspieler'
    },
    description: {
      en: 'Complete the Timed Challenge game',
      de: 'Beenden Sie das Zeitspiel'
    },
    icon: '⏱️',
    reward: 60,
    difficulty: 'medium',
    type: 'timedChallenge',
    condition: (userProfile) => {
      const timedChallengeGame = userProfile.gameStats.timedChallengeGame || {};
      return timedChallengeGame.completed === true;
    }
  }
};

export const useDailyQuests = (userProfile, language = 'en') => {
  const [dailyQuests, setDailyQuests] = useState([]);
  const [questModalOpen, setQuestModalOpen] = useState(false);

  useEffect(() => {
    if (!userProfile) return;

    // Initialize daily quests tracking
    if (!userProfile.dailyQuests) {
      userProfile.dailyQuests = {
        date: new Date().toISOString().split('T')[0],
        quests: [],
        completedQuests: [],
        totalQuestRewards: 0
      };
    }

    // Reset quests if it's a new day
    const today = new Date().toISOString().split('T')[0];
    if (userProfile.dailyQuests.date !== today) {
      userProfile.dailyQuests = {
        date: today,
        quests: [],
        completedQuests: [],
        totalQuestRewards: 0
      };
    }

    // If no quests for today, generate 3 random quests
    if (userProfile.dailyQuests.quests.length === 0) {
      const availableQuests = Object.values(DAILY_QUESTS);
      const selectedQuests = [];
      
      while (selectedQuests.length < 3 && availableQuests.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableQuests.length);
        selectedQuests.push(availableQuests[randomIndex]);
        availableQuests.splice(randomIndex, 1);
      }

      userProfile.dailyQuests.quests = selectedQuests.map(quest => quest.id);
    }

    // Check quest completion
    const completedQuests = userProfile.dailyQuests.quests
      .filter(questId => {
        const quest = DAILY_QUESTS[questId];
        return quest && quest.condition(userProfile) && 
          !userProfile.dailyQuests.completedQuests.includes(questId);
      });

    if (completedQuests.length > 0) {
      const questRewards = completedQuests.reduce((total, questId) => {
        return total + DAILY_QUESTS[questId].reward;
      }, 0);

      userProfile.dailyQuests.completedQuests.push(...completedQuests);
      userProfile.dailyQuests.totalQuestRewards += questRewards;
      
      // Update user's total score
      userProfile.gameStats.totalScore = 
        (userProfile.gameStats.totalScore || 0) + questRewards;

      // Save updated profile
      localStorage.setItem('movieGameProfile', JSON.stringify(userProfile));
    }

    // Set state for quests
    setDailyQuests(
      userProfile.dailyQuests.quests.map(questId => ({
        ...DAILY_QUESTS[questId],
        completed: userProfile.dailyQuests.completedQuests.includes(questId)
      }))
    );
  }, [userProfile]);

  const QuestModal = ({ isDarkMode = false }) => {
    const colors = {
      light: {
        background: '#f3f4f6',
        text: '#1f2937',
        questBg: 'white',
        completedBg: '#e9f5e9'
      },
      dark: {
        background: '#121826',
        text: '#e5e7eb',
        questBg: '#1f2937',
        completedBg: '#2c3e50'
      }
    };

    const currentColors = isDarkMode ? colors.dark : colors.light;

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
              {language === 'en' ? 'Daily Quests' : 'Tägliche Aufgaben'}
            </h2>
            <button 
              onClick={() => setQuestModalOpen(false)}
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
                ? `Total Quest Rewards: ${userProfile?.dailyQuests?.totalQuestRewards || 0}`
                : `Gesamte Quest-Belohnungen: ${userProfile?.dailyQuests?.totalQuestRewards || 0}`}
            </p>

            {dailyQuests.map(quest => {
                if (!quest) return null;
              const isCompleted = quest.completed;
              
              return (
                <div 
                  key={quest.id || 'unknown-quest'}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '15px',
                    padding: '15px',
                    borderRadius: '8px',
                    backgroundColor: isCompleted 
                      ? currentColors.completedBg 
                      : currentColors.questBg,
                    opacity: isCompleted ? 0.7 : 1
                  }}
                >
                  <div style={{ 
                    fontSize: '40px', 
                    marginRight: '15px',
                    filter: isCompleted ? 'grayscale(100%)' : 'none'
                }}>
                    {quest.icon || '❓'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0, display: 'flex', justifyContent: 'space-between' }}>
                    {quest.title?.[language] || 'Unknown Quest'}
                    {isCompleted && <span style={{ color: 'green' }}>✓</span>}
                    </h3>
                    <p style={{ margin: '5px 0 10px' }}>
                    {quest.description?.[language] || 'No description'}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <small style={{ color: isCompleted ? 'green' : 'inherit' }}>
                        +{quest.reward} {language === 'en' ? 'points' : 'Punkte'}
                      </small>
                      <small style={{ 
                        color: quest.difficulty === 'hard' 
                          ? 'red' 
                          : quest.difficulty === 'medium' 
                            ? 'orange' 
                            : 'green' 
                      }}>
                        {quest.difficulty === 'hard' 
                          ? (language === 'en' ? 'Hard' : 'Schwer')
                          : quest.difficulty === 'medium'
                            ? (language === 'en' ? 'Medium' : 'Mittel')
                            : (language === 'en' ? 'Easy' : 'Leicht')
                        }
                      </small>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const DailyQuestButton = ({ isDarkMode, style }) => (
    <button 
      style={{
        position: 'fixed',
        bottom: '140px', 
        right: '20px',
        zIndex: 1002,
        backgroundColor: isDarkMode ? '#374151' : '#f3f4f6',
        border: 'none',
        cursor: 'pointer',
        fontSize: '24px',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
        ...style
      }}
      onClick={() => setQuestModalOpen(true)}
    >
      📋
    </button>
  );

  return {
    dailyQuests,
    DailyQuestButton,
    QuestModal,
    questModalOpen,
    setQuestModalOpen
  };
};

export default { DAILY_QUESTS, useDailyQuests };