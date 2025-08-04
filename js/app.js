// Main Application Logic

class DictationApp {
    constructor() {
        this.currentTab = 'setup';
        this.isSessionActive = false;
        this.currentGeneratedSentence = '';
        this.performanceChart = null;
        this.deferredPrompt = null; // For PWA installation
        this.platform = this.detectPlatform();
        
        this.initializeApp();
    }

    // Detect the current platform
    detectPlatform() {
        if (window.electronAPI) {
            return 'electron';
        } else if (window.Capacitor) {
            return 'capacitor';
        } else {
            return 'web';
        }
    }

    // Initialize the application
    initializeApp() {
        this.setupEventListeners();
        this.setupPlatformSpecificFeatures();
        this.loadInitialData();
        this.updateUI();
        
        // Initialize Google Authentication service
        window.googleAuthService = new GoogleAuthService();
        
        // Load saved API key
        const savedApiKey = loadFromStorage('qwenApiKey', '');
        if (savedApiKey) {
            document.getElementById('qwenApiKey').value = savedApiKey;
            aiService.saveApiKey(savedApiKey);
        }
        
        // Load saved Google Client ID
        const savedClientId = loadFromStorage('googleClientId', '');
        if (savedClientId) {
            document.getElementById('googleClientId').value = savedClientId;
            window.googleAuthService.setClientId(savedClientId);
        }
        
        console.log(`App initialized on ${this.platform} platform`);
    }

    // Setup platform-specific features
    setupPlatformSpecificFeatures() {
        switch (this.platform) {
            case 'electron':
                this.setupElectronFeatures();
                break;
            case 'capacitor':
                this.setupCapacitorFeatures();
                break;
            default:
                this.setupPWAInstallation();
                break;
        }
    }

    // Setup Electron-specific features
    setupElectronFeatures() {
        console.log('Setting up Electron features...');
        
        // Hide PWA install button in Electron
        const installBtn = document.getElementById('installPWABtn');
        if (installBtn) {
            installBtn.style.display = 'none';
        }
        
        // Setup Electron menu handlers
        if (window.electronAPI) {
            window.electronAPI.onMenuImportVocabulary(() => {
                document.getElementById('fileInput').click();
            });
            
            window.electronAPI.onMenuExportProgress(() => {
                this.exportProgress();
            });
            
            window.electronAPI.onMenuNewSession(() => {
                if (this.currentTab !== 'setup') {
                    this.switchTab('setup');
                }
            });
            
            window.electronAPI.onMenuPauseSession(() => {
                const pauseBtn = document.getElementById('pauseBtn');
                if (pauseBtn && !pauseBtn.disabled) {
                    pauseBtn.click();
                }
            });
            
            window.electronAPI.onMenuEndSession(() => {
                const endBtn = document.getElementById('endSessionBtn');
                if (endBtn && !endBtn.disabled) {
                    endBtn.click();
                }
            });
        }
    }

    // Setup Capacitor-specific features
    setupCapacitorFeatures() {
        console.log('Setting up Capacitor features...');
        
        // Hide PWA install button in Capacitor
        const installBtn = document.getElementById('installPWABtn');
        if (installBtn) {
            installBtn.style.display = 'none';
        }
        
        // Import Capacitor plugins
        if (window.Capacitor) {
            const { StatusBar } = window.Capacitor.Plugins;
            const { SplashScreen } = window.Capacitor.Plugins;
            
            // Hide splash screen when app is ready
            SplashScreen.hide();
            
            // Setup status bar
            StatusBar.setStyle({ style: 'LIGHT' });
            StatusBar.setBackgroundColor({ color: '#667eea' });
            
            // Handle app state changes
            document.addEventListener('resume', () => {
                console.log('App resumed');
                // Refresh any data if needed
            });
            
            document.addEventListener('pause', () => {
                console.log('App paused');
                // Save any pending data
                this.saveAppState();
            });
        }
    }

    // Setup event listeners
    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // File input for vocabulary import
        document.getElementById('fileInput').addEventListener('change', (e) => {
            this.handleFileImport(e.target.files[0]);
        });

        // Load sample data button
        document.getElementById('loadSampleBtn').addEventListener('click', () => {
            this.loadSampleData();
        });

        // Google Sheets import
        document.getElementById('importGoogleSheetBtn').addEventListener('click', () => {
            this.showGoogleSheetInput();
        });

        document.getElementById('confirmGoogleSheetBtn').addEventListener('click', () => {
            this.handleGoogleSheetImport();
        });

        document.getElementById('cancelGoogleSheetBtn').addEventListener('click', () => {
            this.hideGoogleSheetInput();
        });

        // Google Sheet URL input enter key
        document.getElementById('googleSheetUrl').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleGoogleSheetImport();
            }
        });

        // API key input
        document.getElementById('qwenApiKey').addEventListener('input', (e) => {
            const apiKey = e.target.value.trim();
            aiService.saveApiKey(apiKey);
            this.updateStartButtonState();
        });

        // Google Client ID input
        document.getElementById('googleClientId').addEventListener('input', (e) => {
            const clientId = e.target.value.trim();
            saveToStorage('googleClientId', clientId);
            if (window.googleAuthService) {
                window.googleAuthService.setClientId(clientId);
            }
        });

        // Google Authentication buttons
        document.getElementById('googleSignInBtn').addEventListener('click', async () => {
            try {
                showLoading('Signing in to Google...');
                await window.googleAuthService.signIn();
                hideLoading();
                showMessage('Successfully signed in to Google!', 'success');
            } catch (error) {
                hideLoading();
                showMessage(`Sign in failed: ${error.message}`, 'error');
            }
        });

        document.getElementById('googleSignOutBtn').addEventListener('click', async () => {
            try {
                await window.googleAuthService.signOut();
                showMessage('Successfully signed out from Google', 'success');
            } catch (error) {
                showMessage(`Sign out failed: ${error.message}`, 'error');
            }
        });

        // Google setup guide link
        document.getElementById('googleSetupGuide').addEventListener('click', (e) => {
            e.preventDefault();
            this.showGoogleSetupGuide();
        });

        // Qwen setup guide link
        document.getElementById('qwenSetupGuide').addEventListener('click', (e) => {
            e.preventDefault();
            this.showQwenSetupGuide();
        });

        // Session settings
        ['difficultyLevel', 'sessionSize', 'voiceSpeed'].forEach(id => {
            document.getElementById(id).addEventListener('change', () => {
                this.updateStartButtonState();
                if (id === 'voiceSpeed') {
                    speechService.setRate(parseFloat(document.getElementById('voiceSpeed').value));
                    speechService.saveSettings();
                }
            });
        });

        // Start session button
        document.getElementById('startSessionBtn').addEventListener('click', () => {
            this.startSession();
        });

        // Practice controls
        document.getElementById('playAudioBtn').addEventListener('click', () => {
            this.playCurrentSentence();
        });

        document.getElementById('replayBtn').addEventListener('click', () => {
            this.playCurrentSentence();
        });

        document.getElementById('submitAnswerBtn').addEventListener('click', () => {
            this.submitAnswer();
        });

        document.getElementById('nextWordBtn').addEventListener('click', () => {
            this.nextWord();
        });

        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.pauseSession();
        });

        document.getElementById('endSessionBtn').addEventListener('click', () => {
            this.endSession();
        });

        // Handwriting upload
        document.getElementById('handwritingUpload').addEventListener('change', (e) => {
            this.handleHandwritingUpload(e.target.files[0]);
        });

        // User input enter key
        document.getElementById('userInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                this.submitAnswer();
            }
        });
    }

    // Switch between tabs
    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');

        this.currentTab = tabName;

        // Load tab-specific data
        if (tabName === 'progress') {
            this.loadProgressData();
        }
    }

    // Load initial data
    loadInitialData() {
        this.updateVocabularyPreview();
        this.updateStartButtonState();
    }

    // Handle file import
    async handleFileImport(file) {
        if (!file) {
            // If no file provided and we're in Electron, use native file dialog
            if (this.platform === 'electron' && window.electronAPI) {
                try {
                    const filePath = await window.electronAPI.openFileDialog();
                    if (filePath) {
                        // Create a File object from the path (this would need additional implementation)
                        showToast('Please use the file selector for now in Electron version', 'info');
                        return;
                    }
                } catch (error) {
                    console.error('Electron file dialog error:', error);
                }
            }
            return;
        }

        try {
            showLoading('Importing vocabulary...');
            const vocabulary = await dataManager.importFromFile(file);
            this.updateVocabularyPreview();
            this.updateStartButtonState();
            showToast(`Successfully imported ${vocabulary.length} words!`, 'success');
        } catch (error) {
            showToast(`Import failed: ${error.message}`, 'error');
        } finally {
            hideLoading();
        }
    }

    // Enhanced export for different platforms
    async exportProgress() {
        try {
            const progressData = progressTracker.getExportData();
            const filename = `dictation-progress-${new Date().toISOString().split('T')[0]}.json`;
            
            if (this.platform === 'electron' && window.electronAPI) {
                // Use Electron's save dialog
                const filePath = await window.electronAPI.saveFileDialog(filename);
                if (filePath) {
                    // Create downloadable blob
                    const blob = new Blob([JSON.stringify(progressData, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = filename;
                    a.click();
                    URL.revokeObjectURL(url);
                    showToast('Progress exported successfully!', 'success');
                }
            } else {
                // Web/Capacitor fallback
                const blob = new Blob([JSON.stringify(progressData, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                a.click();
                URL.revokeObjectURL(url);
                showToast('Progress exported successfully!', 'success');
            }
        } catch (error) {
            showToast(`Export failed: ${error.message}`, 'error');
        }
    }

    // Save app state (useful for mobile)
    saveAppState() {
        const appState = {
            currentTab: this.currentTab,
            isSessionActive: this.isSessionActive,
            timestamp: Date.now()
        };
        saveToStorage('appState', appState);
    }

    // Load sample data
    loadSampleData() {
        try {
            const vocabulary = dataManager.loadSampleData();
            this.updateVocabularyPreview();
            this.updateStartButtonState();
            showToast(`Loaded ${vocabulary.length} sample words!`, 'success');
        } catch (error) {
            showToast(`Failed to load sample data: ${error.message}`, 'error');
        }
    }

    // Show Google Sheets input
    showGoogleSheetInput() {
        document.getElementById('googleSheetInput').style.display = 'block';
        document.getElementById('googleSheetUrl').focus();
    }

    // Hide Google Sheets input
    hideGoogleSheetInput() {
        document.getElementById('googleSheetInput').style.display = 'none';
        document.getElementById('googleSheetUrl').value = '';
    }

    // Handle Google Sheets import
    async handleGoogleSheetImport() {
        const sheetUrl = document.getElementById('googleSheetUrl').value.trim();
        
        if (!sheetUrl) {
            showToast('Please enter a Google Sheets URL', 'warning');
            return;
        }

        try {
            const vocabulary = await dataManager.importFromGoogleSheets(sheetUrl);
            this.updateVocabularyPreview();
            this.updateStartButtonState();
            this.hideGoogleSheetInput();
            showToast(`Successfully imported ${vocabulary.length} words from Google Sheets!`, 'success');
        } catch (error) {
            showToast(`Google Sheets import failed: ${error.message}`, 'error');
        }
    }

    // Update vocabulary preview
    updateVocabularyPreview() {
        const vocabulary = dataManager.getVocabulary();
        const preview = document.getElementById('wordPreview');
        const wordCount = document.getElementById('wordCount');
        const wordList = document.getElementById('wordList');

        if (vocabulary.length === 0) {
            preview.style.display = 'none';
            return;
        }

        preview.style.display = 'block';
        wordCount.textContent = vocabulary.length;

        // Show first 10 words
        const previewWords = vocabulary.slice(0, 10);
        wordList.innerHTML = previewWords.map(word => `
            <div class="word-item">
                <div class="word-info">
                    <div class="word">${word.word} <span class="pos">${word.pos}</span></div>
                    <div class="meaning">${word.meaning}</div>
                </div>
            </div>
        `).join('');

        if (vocabulary.length > 10) {
            wordList.innerHTML += `<div class="word-item"><em>... and ${vocabulary.length - 10} more words</em></div>`;
        }
    }

    // Update start button state
    updateStartButtonState() {
        const startBtn = document.getElementById('startSessionBtn');
        const vocabulary = dataManager.getVocabulary();
        const hasApiKey = aiService.isConfigured();
        const hasVocabulary = vocabulary.length > 0;

        startBtn.disabled = !hasApiKey || !hasVocabulary;
        
        if (!hasVocabulary) {
            startBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Import Vocabulary First';
        } else if (!hasApiKey) {
            startBtn.innerHTML = '<i class="fas fa-key"></i> Enter Grok-1.5 Vision API Key First';
        } else {
            startBtn.innerHTML = '<i class="fas fa-play"></i> Start Dictation Session';
        }
    }

    // Start a new dictation session
    async startSession() {
        try {
            const difficulty = document.getElementById('difficultyLevel').value;
            const sessionSize = parseInt(document.getElementById('sessionSize').value);

            showLoading('Starting session...');

            // Create session
            const session = dataManager.createSession(sessionSize, difficulty);
            this.isSessionActive = true;

            // Switch to practice tab
            this.switchTab('practice');

            // Load first word
            await this.loadCurrentWord();

            hideLoading();
            showToast('Session started! Good luck!', 'success');

        } catch (error) {
            hideLoading();
            showToast(`Failed to start session: ${error.message}`, 'error');
        }
    }

    // Load current word in practice
    async loadCurrentWord() {
        const currentWord = dataManager.getCurrentWord();
        if (!currentWord) {
            this.endSession();
            return;
        }

        const progress = dataManager.getSessionProgress();

        // Update UI
        document.getElementById('currentWordNum').textContent = progress.current;
        document.getElementById('totalWords').textContent = progress.total;
        document.getElementById('currentWord').textContent = currentWord.word;
        document.getElementById('currentPOS').textContent = currentWord.pos;
        document.getElementById('currentMeaning').textContent = currentWord.meaning;
        document.getElementById('difficultyBadge').textContent = 
            dataManager.currentSession.difficulty.charAt(0).toUpperCase() + 
            dataManager.currentSession.difficulty.slice(1);

        // Clear previous input and feedback
        document.getElementById('userInput').value = '';
        document.getElementById('feedbackSection').style.display = 'none';
        document.getElementById('playAudioBtn').style.display = 'inline-flex';
        document.getElementById('replayBtn').style.display = 'none';

        try {
            // Generate sentence
            document.getElementById('generatedSentence').textContent = 'Generating sentence...';
            
            const generatedSentence = await aiService.generateSentence(
                currentWord.word,
                currentWord.pos,
                currentWord.meaning,
                dataManager.currentSession.difficulty,
                currentWord.example
            );

            this.currentGeneratedSentence = generatedSentence;
            document.getElementById('generatedSentence').textContent = generatedSentence;

        } catch (error) {
            console.error('Failed to generate sentence:', error);
            showToast('Failed to generate sentence, using example', 'warning');
            this.currentGeneratedSentence = currentWord.example || `This is an example sentence with the word ${currentWord.word}.`;
            document.getElementById('generatedSentence').textContent = this.currentGeneratedSentence;
        }
    }

    // Play current sentence
    async playCurrentSentence() {
        if (!this.currentGeneratedSentence) return;

        try {
            document.getElementById('playAudioBtn').style.display = 'none';
            document.getElementById('replayBtn').style.display = 'inline-flex';

            await speechService.speak(this.currentGeneratedSentence, {
                onStart: () => {
                    document.getElementById('replayBtn').innerHTML = '<i class="fas fa-stop"></i> Stop';
                },
                onEnd: () => {
                    document.getElementById('replayBtn').innerHTML = '<i class="fas fa-redo"></i> Replay';
                }
            });

        } catch (error) {
            showToast('Failed to play audio', 'error');
            document.getElementById('playAudioBtn').style.display = 'inline-flex';
            document.getElementById('replayBtn').style.display = 'none';
        }
    }

    // Submit user answer
    submitAnswer() {
        const userInput = document.getElementById('userInput').value.trim();
        if (!userInput) {
            showToast('Please enter your answer first', 'warning');
            return;
        }

        this.processAnswer(userInput);
    }

    // Process and evaluate answer
    processAnswer(userAnswer) {
        const currentWord = dataManager.getCurrentWord();
        if (!currentWord) return;

        // Calculate accuracy
        const accuracy = calculateSimilarity(userAnswer, this.currentGeneratedSentence);

        // Update word result
        dataManager.updateWordResult(
            currentWord.id,
            userAnswer,
            this.currentGeneratedSentence,
            accuracy
        );

        // Show feedback
        this.showFeedback(userAnswer, accuracy);
    }

    // Show feedback for user answer
    showFeedback(userAnswer, accuracy) {
        document.getElementById('accuracyScore').textContent = `${accuracy}%`;
        document.getElementById('expectedSentence').textContent = this.currentGeneratedSentence;
        document.getElementById('actualSentence').textContent = userAnswer;
        document.getElementById('feedbackSection').style.display = 'block';

        // Set accuracy color
        const scoreElement = document.getElementById('accuracyScore');
        if (accuracy >= 90) {
            scoreElement.style.color = '#28a745';
        } else if (accuracy >= 70) {
            scoreElement.style.color = '#ffc107';
        } else {
            scoreElement.style.color = '#dc3545';
        }

        // Scroll to feedback
        document.getElementById('feedbackSection').scrollIntoView({ behavior: 'smooth' });
    }

    // Move to next word
    async nextWord() {
        const nextWordData = dataManager.nextWord();
        
        if (nextWordData) {
            await this.loadCurrentWord();
        } else {
            this.completeSession();
        }
    }

    // Complete the session
    completeSession() {
        const completedSession = dataManager.completeSession();
        this.isSessionActive = false;

        // Record in progress tracker
        progressTracker.recordSession(completedSession);

        // Show completion message
        const accuracy = Math.round(completedSession.averageAccuracy);
        const wordsStudied = completedSession.completedWords;

        showToast(`Session complete! ${accuracy}% accuracy on ${wordsStudied} words`, 'success');

        // Switch to progress tab to show results
        this.switchTab('progress');
    }

    // Pause session
    pauseSession() {
        speechService.stop();
        showToast('Session paused', 'info');
    }

    // End session early
    endSession() {
        if (this.isSessionActive) {
            if (confirm('Are you sure you want to end this session?')) {
                speechService.stop();
                this.isSessionActive = false;
                dataManager.currentSession = null;
                this.switchTab('setup');
                showToast('Session ended', 'info');
            }
        }
    }

    // Handle handwriting upload
    async handleHandwritingUpload(file) {
        if (!file) return;

        try {
            showLoading('Processing handwritten text...');
            
            const result = await ocrService.processImage(file);
            
            // Insert OCR result into text area
            document.getElementById('userInput').value = result.text;
            
            hideLoading();
            showToast(`Text extracted! Confidence: ${Math.round(result.confidence)}%`, 'success');
            
        } catch (error) {
            hideLoading();
            showToast(`OCR failed: ${error.message}`, 'error');
        }
    }

    // Load progress data
    loadProgressData() {
        const stats = progressTracker.getOverallStats();
        
        // Update stats overview
        document.getElementById('totalWordsLearned').textContent = stats.totalWordsStudied;
        document.getElementById('averageAccuracy').textContent = `${stats.averageAccuracy}%`;
        document.getElementById('totalSessions').textContent = stats.totalSessions;
        document.getElementById('studyTime').textContent = formatDuration(stats.totalStudyTime);

        // Update performance chart
        this.updatePerformanceChart();

        // Update word progress
        this.updateWordProgressList();
    }

    // Update performance chart
    updatePerformanceChart() {
        const ctx = document.getElementById('performanceChart').getContext('2d');
        const recentPerformance = progressTracker.getRecentPerformance();

        if (this.performanceChart) {
            this.performanceChart.destroy();
        }

        this.performanceChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: recentPerformance.map(p => p.date),
                datasets: [{
                    label: 'Accuracy (%)',
                    data: recentPerformance.map(p => p.accuracy),
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    // Update word progress list
    updateWordProgressList() {
        const wordProgress = progressTracker.getWordProgress();
        const container = document.getElementById('wordProgressList');

        if (wordProgress.length === 0) {
            container.innerHTML = '<p>No word progress data yet. Complete some sessions to see your progress!</p>';
            return;
        }

        container.innerHTML = wordProgress.slice(0, 20).map(word => {
            const accuracyClass = word.averageAccuracy >= 80 ? 'high' : 
                                 word.averageAccuracy >= 60 ? 'medium' : 'low';
            
            return `
                <div class="progress-item">
                    <span class="progress-word">${word.word}</span>
                    <span class="progress-accuracy ${accuracyClass}">${Math.round(word.averageAccuracy)}%</span>
                </div>
            `;
        }).join('');
    }

    // Update UI
    updateUI() {
        // Update any dynamic UI elements
        this.updateVocabularyPreview();
        this.updateStartButtonState();
    }

    // Setup PWA installation functionality
    setupPWAInstallation() {
        // Listen for the beforeinstallprompt event
        window.addEventListener('beforeinstallprompt', (e) => {
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            e.preventDefault();
            // Stash the event so it can be triggered later
            this.deferredPrompt = e;
            // Show install button/banner
            this.showInstallPrompt();
        });

        // Listen for app installation
        window.addEventListener('appinstalled', (evt) => {
            console.log('App was installed');
            showToast('App installed successfully! 📱', 'success');
            this.hideInstallPrompt();
        });

        // Check if app is already installed (standalone mode)
        if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
            console.log('App is running in standalone mode');
            // Hide install prompts since app is already installed
            this.hideInstallPrompt();
        }
    }

    // Show PWA install prompt
    showInstallPrompt() {
        // Create install banner if it doesn't exist
        if (!document.getElementById('installBanner')) {
            const banner = document.createElement('div');
            banner.id = 'installBanner';
            banner.innerHTML = `
                <div style="
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 12px 20px;
                    text-align: center;
                    z-index: 1000;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                ">
                    <span>📱 Install Language Dictation AI for the best experience!</span>
                    <button id="installBtn" style="
                        background: white;
                        color: #667eea;
                        border: none;
                        padding: 8px 16px;
                        border-radius: 20px;
                        margin-left: 15px;
                        font-weight: 600;
                        cursor: pointer;
                    ">Install App</button>
                    <button id="dismissInstall" style="
                        background: transparent;
                        color: white;
                        border: 1px solid white;
                        padding: 8px 16px;
                        border-radius: 20px;
                        margin-left: 10px;
                        cursor: pointer;
                    ">Later</button>
                </div>
            `;
            document.body.appendChild(banner);

            // Add event listeners
            document.getElementById('installBtn').addEventListener('click', () => {
                this.installPWA();
            });

            document.getElementById('dismissInstall').addEventListener('click', () => {
                this.hideInstallPrompt();
            });
        }
    }

    // Hide install prompt
    hideInstallPrompt() {
        const banner = document.getElementById('installBanner');
        if (banner) {
            banner.remove();
        }
    }

    // Install PWA
    async installPWA() {
        if (this.deferredPrompt) {
            // Show the prompt
            this.deferredPrompt.prompt();
            
            // Wait for the user to respond to the prompt
            const { outcome } = await this.deferredPrompt.userChoice;
            
            if (outcome === 'accepted') {
                console.log('User accepted the install prompt');
            } else {
                console.log('User dismissed the install prompt');
            }
            
            // Clear the deferredPrompt
            this.deferredPrompt = null;
            this.hideInstallPrompt();
        }
    }

    // Show Google OAuth setup guide
    showGoogleSetupGuide() {
        const guideContent = `
        <div style="max-width: 600px; line-height: 1.6;">
            <h3>🔧 Google OAuth Setup Guide</h3>
            <p>To access your private Google Sheets, you need to create a Google OAuth Client ID:</p>
            
            <ol>
                <li><strong>Go to Google Cloud Console:</strong><br>
                    Visit <a href="https://console.cloud.google.com/" target="_blank">console.cloud.google.com</a>
                </li>
                
                <li><strong>Create or Select Project:</strong><br>
                    Create a new project or select an existing one
                </li>
                
                <li><strong>Enable APIs:</strong><br>
                    Go to "APIs & Services" → "Library" and enable:
                    <ul>
                        <li>Google Sheets API</li>
                        <li>Google Drive API</li>
                    </ul>
                </li>
                
                <li><strong>Create OAuth Credentials:</strong><br>
                    Go to "APIs & Services" → "Credentials" → "Create Credentials" → "OAuth client ID"
                </li>
                
                <li><strong>Configure OAuth Screen:</strong><br>
                    If prompted, configure the OAuth consent screen (use "External" for personal use)
                </li>
                
                <li><strong>Application Type:</strong><br>
                    Select "Web application"
                </li>
                
                <li><strong>Authorized Origins:</strong><br>
                    Add these origins:
                    <ul>
                        <li><code>http://localhost:8000</code></li>
                        <li><code>https://your-domain.com</code> (if deploying online)</li>
                    </ul>
                </li>
                
                <li><strong>Copy Client ID:</strong><br>
                    Copy the generated Client ID and paste it in the "Google OAuth Client ID" field above
                </li>
            </ol>
            
            <p><strong>🔒 Privacy:</strong> Your Client ID is stored locally and only used to authenticate with Google. Your sheets data never passes through our servers.</p>
        </div>
        `;
        
        showMessage(guideContent, 'info', 15000); // Show for 15 seconds
    }

    // Show Qwen-Plus API setup guide
    showQwenSetupGuide() {
        const guideContent = `
        <div style="max-width: 600px; line-height: 1.6;">
            <h3>🔧 Qwen-Plus API Setup Guide</h3>
            <p>Get your Qwen-Plus API key to enable AI sentence generation:</p>
            
            <ol>
                <li><strong>Visit Alibaba Cloud:</strong><br>
                    Go to <a href="https://www.aliyun.com/product/bailian" target="_blank">Alibaba Cloud Model Studio</a>
                </li>
                
                <li><strong>Sign Up/Login:</strong><br>
                    Create an account or sign in to your existing Alibaba Cloud account
                </li>
                
                <li><strong>Access DashScope:</strong><br>
                    Navigate to DashScope (百炼) service in the console
                </li>
                
                <li><strong>Get API Key:</strong><br>
                    Go to "API Keys" section and create a new API key
                </li>
                
                <li><strong>Enable Qwen-Plus:</strong><br>
                    Make sure Qwen-Plus model is enabled in your account
                </li>
                
                <li><strong>Copy & Paste:</strong><br>
                    Copy your API key and paste it in the field above
                </li>
            </ol>
            
            <p><strong>💰 Pricing:</strong> Qwen-Plus offers competitive pricing and free tier for new users.</p>
            <p><strong>🔒 Security:</strong> Your API key is stored locally and only used for sentence generation.</p>
        </div>
        `;
        
        showMessage(guideContent, 'info', 12000);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dictationApp = new DictationApp();
});
