// Progress Tracker - Handles user progress tracking and analytics

class ProgressTracker {
    constructor() {
        this.sessionHistory = this.loadSessionHistory();
        this.achievements = this.loadAchievements();
        this.totalStudyTime = this.loadStudyTime();
    }

    // Load session history from storage
    loadSessionHistory() {
        return loadFromStorage('sessionHistory', []);
    }

    // Load achievements from storage
    loadAchievements() {
        return loadFromStorage('achievements', []);
    }

    // Load total study time from storage
    loadStudyTime() {
        return loadFromStorage('totalStudyTime', 0);
    }

    // Save session history to storage
    saveSessionHistory() {
        saveToStorage('sessionHistory', this.sessionHistory);
    }

    // Save achievements to storage
    saveAchievements() {
        saveToStorage('achievements', this.achievements);
    }

    // Save study time to storage
    saveStudyTime() {
        saveToStorage('totalStudyTime', this.totalStudyTime);
    }

    // Record a completed session
    recordSession(sessionData) {
        // Calculate session duration
        const startTime = new Date(sessionData.startTime);
        const endTime = new Date(sessionData.endTime);
        const duration = Math.round((endTime - startTime) / (1000 * 60)); // minutes

        // Enhanced session data
        const enhancedSession = {
            ...sessionData,
            duration: duration,
            date: startTime.toDateString(),
            timestamp: startTime.getTime()
        };

        // Add to history
        this.sessionHistory.push(enhancedSession);

        // Update total study time
        this.totalStudyTime += duration;

        // Check for new achievements
        this.checkAchievements(enhancedSession);

        // Save to storage
        this.saveSessionHistory();
        this.saveStudyTime();

        return enhancedSession;
    }

    // Get overall statistics
    getOverallStats() {
        if (this.sessionHistory.length === 0) {
            return {
                totalSessions: 0,
                totalWordsStudied: 0,
                averageAccuracy: 0,
                totalStudyTime: 0,
                currentStreak: 0,
                bestStreak: 0,
                averageSessionDuration: 0
            };
        }

        const totalSessions = this.sessionHistory.length;
        const totalWordsStudied = this.sessionHistory.reduce((sum, session) => sum + session.completedWords, 0);
        const totalAccuracy = this.sessionHistory.reduce((sum, session) => sum + (session.averageAccuracy || 0), 0);
        const averageAccuracy = totalAccuracy / totalSessions;
        const averageSessionDuration = this.sessionHistory.reduce((sum, session) => sum + (session.duration || 0), 0) / totalSessions;
        
        const streaks = this.calculateStreaks();

        return {
            totalSessions,
            totalWordsStudied,
            averageAccuracy: Math.round(averageAccuracy),
            totalStudyTime: this.totalStudyTime,
            currentStreak: streaks.current,
            bestStreak: streaks.best,
            averageSessionDuration: Math.round(averageSessionDuration)
        };
    }

    // Calculate study streaks
    calculateStreaks() {
        if (this.sessionHistory.length === 0) {
            return { current: 0, best: 0 };
        }

        // Sort sessions by date
        const sortedSessions = [...this.sessionHistory].sort((a, b) => 
            new Date(a.startTime) - new Date(b.startTime)
        );

        // Get unique study dates
        const studyDates = [...new Set(sortedSessions.map(session => 
            new Date(session.startTime).toDateString()
        ))];

        let currentStreak = 0;
        let bestStreak = 0;
        let tempStreak = 0;

        // Calculate streaks
        const today = new Date();
        for (let i = studyDates.length - 1; i >= 0; i--) {
            const studyDate = new Date(studyDates[i]);
            const daysDiff = Math.floor((today - studyDate) / (1000 * 60 * 60 * 24));

            if (i === studyDates.length - 1) {
                // Most recent study date
                if (daysDiff <= 1) {
                    currentStreak = 1;
                    tempStreak = 1;
                }
            } else {
                const prevStudyDate = new Date(studyDates[i + 1]);
                const daysBetween = Math.floor((prevStudyDate - studyDate) / (1000 * 60 * 60 * 24));

                if (daysBetween === 1) {
                    tempStreak++;
                    if (i === studyDates.length - 2 && daysDiff <= 1) {
                        currentStreak = tempStreak;
                    }
                } else {
                    bestStreak = Math.max(bestStreak, tempStreak);
                    tempStreak = 1;
                }
            }
        }

        bestStreak = Math.max(bestStreak, tempStreak, currentStreak);

        return { current: currentStreak, best: bestStreak };
    }

    // Get recent performance (last 7 sessions)
    getRecentPerformance() {
        const recentSessions = this.sessionHistory.slice(-7);
        
        return recentSessions.map(session => ({
            date: new Date(session.startTime).toLocaleDateString(),
            accuracy: session.averageAccuracy || 0,
            wordsStudied: session.completedWords,
            duration: session.duration || 0
        }));
    }

    // Get word-level progress
    getWordProgress() {
        const wordStats = {};

        // Aggregate data from all sessions
        this.sessionHistory.forEach(session => {
            if (session.words) {
                session.words.forEach(wordData => {
                    if (wordData.completed) {
                        const wordId = wordData.id;
                        if (!wordStats[wordId]) {
                            wordStats[wordId] = {
                                word: wordData.word,
                                pos: wordData.pos,
                                meaning: wordData.meaning,
                                attempts: 0,
                                totalAccuracy: 0,
                                averageAccuracy: 0,
                                lastStudied: null,
                                difficulty: session.difficulty
                            };
                        }

                        wordStats[wordId].attempts++;
                        wordStats[wordId].totalAccuracy += wordData.accuracy || 0;
                        wordStats[wordId].averageAccuracy = wordStats[wordId].totalAccuracy / wordStats[wordId].attempts;
                        
                        const sessionDate = new Date(session.startTime);
                        if (!wordStats[wordId].lastStudied || sessionDate > new Date(wordStats[wordId].lastStudied)) {
                            wordStats[wordId].lastStudied = session.startTime;
                        }
                    }
                });
            }
        });

        // Convert to array and sort by average accuracy (lowest first for review)
        return Object.values(wordStats)
            .sort((a, b) => a.averageAccuracy - b.averageAccuracy);
    }

    // Get words that need review (low accuracy or not studied recently)
    getWordsForReview() {
        const wordProgress = this.getWordProgress();
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        return wordProgress.filter(word => {
            const lowAccuracy = word.averageAccuracy < 80;
            const notRecentlyStudied = !word.lastStudied || new Date(word.lastStudied) < oneWeekAgo;
            return lowAccuracy || notRecentlyStudied;
        });
    }

    // Check and award achievements
    checkAchievements(sessionData) {
        const stats = this.getOverallStats();
        const newAchievements = [];

        // Define achievements
        const achievementDefinitions = [
            {
                id: 'first_session',
                name: 'Getting Started',
                description: 'Complete your first dictation session',
                condition: () => stats.totalSessions >= 1,
                icon: '🎯'
            },
            {
                id: 'week_streak',
                name: 'Week Warrior',
                description: 'Study for 7 consecutive days',
                condition: () => stats.currentStreak >= 7,
                icon: '🔥'
            },
            {
                id: 'perfect_session',
                name: 'Perfectionist',
                description: 'Complete a session with 100% accuracy',
                condition: () => sessionData.averageAccuracy === 100,
                icon: '⭐'
            },
            {
                id: 'hundred_words',
                name: 'Century Scholar',
                description: 'Study 100 words in total',
                condition: () => stats.totalWordsStudied >= 100,
                icon: '📚'
            },
            {
                id: 'marathon_session',
                name: 'Marathon Learner',
                description: 'Complete a session lasting over 30 minutes',
                condition: () => sessionData.duration >= 30,
                icon: '⏰'
            },
            {
                id: 'consistency_champion',
                name: 'Consistency Champion',
                description: 'Complete 30 sessions',
                condition: () => stats.totalSessions >= 30,
                icon: '🏆'
            },
            {
                id: 'accuracy_expert',
                name: 'Accuracy Expert',
                description: 'Maintain 90%+ average accuracy',
                condition: () => stats.averageAccuracy >= 90,
                icon: '🎓'
            }
        ];

        // Check each achievement
        achievementDefinitions.forEach(achievement => {
            const alreadyEarned = this.achievements.some(earned => earned.id === achievement.id);
            
            if (!alreadyEarned && achievement.condition()) {
                const earnedAchievement = {
                    ...achievement,
                    earnedDate: new Date().toISOString(),
                    sessionId: sessionData.id
                };
                
                this.achievements.push(earnedAchievement);
                newAchievements.push(earnedAchievement);
            }
        });

        if (newAchievements.length > 0) {
            this.saveAchievements();
            
            // Show achievement notifications
            newAchievements.forEach(achievement => {
                setTimeout(() => {
                    showToast(`🎉 Achievement Unlocked: ${achievement.name}`, 'success', 5000);
                }, 1000);
            });
        }

        return newAchievements;
    }

    // Get performance trend (improving, declining, stable)
    getPerformanceTrend() {
        if (this.sessionHistory.length < 3) {
            return 'insufficient_data';
        }

        const recentSessions = this.sessionHistory.slice(-5);
        const accuracies = recentSessions.map(s => s.averageAccuracy || 0);
        
        // Calculate trend using linear regression
        const n = accuracies.length;
        const x = Array.from({ length: n }, (_, i) => i);
        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = accuracies.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((sum, xi, i) => sum + xi * accuracies[i], 0);
        const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        
        if (slope > 2) return 'improving';
        if (slope < -2) return 'declining';
        return 'stable';
    }

    // Export progress data
    exportData() {
        return {
            sessionHistory: this.sessionHistory,
            achievements: this.achievements,
            totalStudyTime: this.totalStudyTime,
            exportDate: new Date().toISOString(),
            stats: this.getOverallStats()
        };
    }

    // Import progress data
    importData(data) {
        try {
            if (data.sessionHistory) {
                this.sessionHistory = data.sessionHistory;
                this.saveSessionHistory();
            }
            
            if (data.achievements) {
                this.achievements = data.achievements;
                this.saveAchievements();
            }
            
            if (data.totalStudyTime) {
                this.totalStudyTime = data.totalStudyTime;
                this.saveStudyTime();
            }
            
            return true;
        } catch (error) {
            console.error('Failed to import progress data:', error);
            return false;
        }
    }

    // Clear all progress data
    clearProgress() {
        this.sessionHistory = [];
        this.achievements = [];
        this.totalStudyTime = 0;
        
        this.saveSessionHistory();
        this.saveAchievements();
        this.saveStudyTime();
    }

    // Get study recommendations
    getStudyRecommendations() {
        const stats = this.getOverallStats();
        const wordsForReview = this.getWordsForReview();
        const trend = this.getPerformanceTrend();
        const recommendations = [];

        if (wordsForReview.length > 0) {
            recommendations.push({
                type: 'review',
                message: `You have ${wordsForReview.length} words that could use more practice`,
                action: 'Review difficult words'
            });
        }

        if (stats.averageAccuracy < 70) {
            recommendations.push({
                type: 'difficulty',
                message: 'Consider using easier difficulty level to build confidence',
                action: 'Try beginner level'
            });
        }

        if (stats.currentStreak === 0) {
            recommendations.push({
                type: 'consistency',
                message: 'Regular practice helps improve retention',
                action: 'Try to study daily'
            });
        }

        if (trend === 'declining') {
            recommendations.push({
                type: 'performance',
                message: 'Your recent performance shows room for improvement',
                action: 'Focus on accuracy over speed'
            });
        }

        return recommendations;
    }
}

// Create global instance
const progressTracker = new ProgressTracker();
