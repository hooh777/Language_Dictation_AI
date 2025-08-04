// Data Manager - Handles vocabulary data import and management

class DataManager {
    constructor() {
        this.vocabulary = [];
        this.currentSession = null;
        this.sessionWords = [];
        this.currentWordIndex = 0;
        
        // Load saved vocabulary on initialization
        this.loadVocabularyFromStorage();
    }

    // Import vocabulary from Google Sheets using authentication
    async importFromGoogleSheets(sheetUrl) {
        try {
            if (!window.googleAuthService) {
                throw new Error('Google Authentication service not available');
            }

            if (!window.googleAuthService.isSignedIn) {
                throw new Error('Please sign in to Google first to access your private sheets');
            }

            showLoading('Fetching data from Google Sheets...');
            
            // Use authenticated access to get sheet data
            const csvText = await window.googleAuthService.accessGoogleSheet(sheetUrl);
            
            if (!csvText.trim()) {
                throw new Error('The Google Sheet appears to be empty or has no data.');
            }
            
            // Parse the data (tab-separated from Sheets API)
            const parsedData = this.parseCSV(csvText, '\t'); // Use tab delimiter
            const vocabulary = this.processImportedData(parsedData);
            
            if (vocabulary.length === 0) {
                throw new Error('No valid vocabulary data found in the Google Sheet. Please check the format: Word | POS | Meaning | Sentence Example');
            }
            
            this.vocabulary = vocabulary;
            this.saveVocabularyToStorage();
            
            hideLoading();
            return vocabulary;
            
        } catch (error) {
            hideLoading();
            console.error('Google Sheets import error:', error);
            throw error;
        }
    }

    // Extract Google Sheet ID from various URL formats
    extractGoogleSheetId(url) {
        // Handle different Google Sheets URL formats
        const patterns = [
            /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/,  // Standard format
            /\/spreadsheets\/u\/\d+\/d\/([a-zA-Z0-9-_]+)/, // With user ID
            /^([a-zA-Z0-9-_]+)$/ // Just the ID
        ];
        
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) {
                return match[1];
            }
        }
        
        return null;
    }

    // Import vocabulary from Excel/CSV file
    async importFromFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const data = e.target.result;
                    let parsedData;
                    
                    if (file.name.endsWith('.csv')) {
                        parsedData = this.parseCSV(data);
                    } else {
                        // Excel file
                        const workbook = XLSX.read(data, { type: 'binary' });
                        const sheetName = workbook.SheetNames[0];
                        const worksheet = workbook.Sheets[sheetName];
                        parsedData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                    }
                    
                    const vocabulary = this.processImportedData(parsedData);
                    
                    if (vocabulary.length === 0) {
                        reject(new Error('No valid vocabulary data found in file'));
                        return;
                    }
                    
                    this.vocabulary = vocabulary;
                    this.saveVocabularyToStorage();
                    resolve(vocabulary);
                    
                } catch (error) {
                    reject(new Error(`Failed to parse file: ${error.message}`));
                }
            };
            
            reader.onerror = () => reject(new Error('Failed to read file'));
            
            if (file.name.endsWith('.csv')) {
                reader.readAsText(file);
            } else {
                reader.readAsBinaryString(file);
            }
        });
    }

    // Parse CSV data with configurable delimiter
    parseCSV(csvText, delimiter = ',') {
        const lines = csvText.split('\n');
        const result = [];
        
        for (let line of lines) {
            if (line.trim()) {
                // Handle quoted fields that might contain commas/tabs
                const fields = this.parseCSVLine(line, delimiter);
                result.push(fields);
            }
        }
        
        return result;
    }

    // Parse individual CSV line handling quoted fields with configurable delimiter
    parseCSVLine(line, delimiter = ',') {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === delimiter && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current.trim());
        return result;
    }

    // Process imported data into vocabulary format
    processImportedData(data) {
        const vocabulary = [];
        
        // Skip header row if it exists
        const startIndex = this.hasHeader(data) ? 1 : 0;
        
        for (let i = startIndex; i < data.length; i++) {
            const row = data[i];
            
            if (row.length >= 4 && row[0] && row[0].trim()) {
                const word = {
                    id: generateId(),
                    word: row[0].trim(),
                    pos: row[1] ? row[1].trim() : '',
                    meaning: row[2] ? row[2].trim() : '',
                    example: row[3] ? row[3].trim() : '',
                    dateAdded: new Date().toISOString(),
                    timesStudied: 0,
                    averageAccuracy: 0,
                    lastStudied: null
                };
                
                vocabulary.push(word);
            }
        }
        
        return vocabulary;
    }

    // Check if first row is a header
    hasHeader(data) {
        if (data.length === 0) return false;
        
        const firstRow = data[0];
        const possibleHeaders = ['word', 'pos', 'meaning', 'sentence', 'example'];
        
        return firstRow.some(cell => 
            possibleHeaders.some(header => 
                cell && cell.toLowerCase().includes(header)
            )
        );
    }

    // Load sample data for demonstration
    loadSampleData() {
        const sampleVocabulary = [
            {
                id: generateId(),
                word: 'Neighborhood',
                pos: 'n.',
                meaning: '鄰近地區 / 街坊',
                example: 'The children in our neighborhood often play together in the park.',
                dateAdded: new Date().toISOString(),
                timesStudied: 0,
                averageAccuracy: 0,
                lastStudied: null
            },
            {
                id: generateId(),
                word: 'Sidewalk',
                pos: 'n.',
                meaning: '人行道',
                example: 'Please walk on the sidewalk for your safety.',
                dateAdded: new Date().toISOString(),
                timesStudied: 0,
                averageAccuracy: 0,
                lastStudied: null
            },
            {
                id: generateId(),
                word: 'Accomplish',
                pos: 'v.',
                meaning: '完成 / 達成',
                example: 'She worked hard to accomplish her goals.',
                dateAdded: new Date().toISOString(),
                timesStudied: 0,
                averageAccuracy: 0,
                lastStudied: null
            },
            {
                id: generateId(),
                word: 'Magnificent',
                pos: 'adj.',
                meaning: '壯麗的 / 宏偉的',
                example: 'The view from the mountain top was absolutely magnificent.',
                dateAdded: new Date().toISOString(),
                timesStudied: 0,
                averageAccuracy: 0,
                lastStudied: null
            },
            {
                id: generateId(),
                word: 'Democracy',
                pos: 'n.',
                meaning: '民主制度',
                example: 'Democracy allows citizens to participate in government decisions.',
                dateAdded: new Date().toISOString(),
                timesStudied: 0,
                averageAccuracy: 0,
                lastStudied: null
            }
        ];
        
        this.vocabulary = sampleVocabulary;
        this.saveVocabularyToStorage();
        return sampleVocabulary;
    }

    // Create a new study session
    createSession(sessionSize, difficulty) {
        if (this.vocabulary.length === 0) {
            throw new Error('No vocabulary data available');
        }
        
        const availableWords = this.vocabulary.slice();
        const sessionWords = shuffleArray(availableWords).slice(0, sessionSize);
        
        this.currentSession = {
            id: generateId(),
            startTime: new Date().toISOString(),
            difficulty: difficulty,
            totalWords: sessionWords.length,
            completedWords: 0,
            totalAccuracy: 0,
            words: sessionWords.map(word => ({
                ...word,
                accuracy: null,
                userAnswer: null,
                generatedSentence: null,
                completed: false
            }))
        };
        
        this.sessionWords = this.currentSession.words;
        this.currentWordIndex = 0;
        
        return this.currentSession;
    }

    // Get current word in session
    getCurrentWord() {
        if (!this.currentSession || this.currentWordIndex >= this.sessionWords.length) {
            return null;
        }
        
        return this.sessionWords[this.currentWordIndex];
    }

    // Move to next word in session
    nextWord() {
        if (this.currentSession && this.currentWordIndex < this.sessionWords.length - 1) {
            this.currentWordIndex++;
            return this.getCurrentWord();
        }
        return null;
    }

    // Update word result in current session
    updateWordResult(wordId, userAnswer, generatedSentence, accuracy) {
        if (!this.currentSession) return false;
        
        const wordIndex = this.sessionWords.findIndex(w => w.id === wordId);
        if (wordIndex === -1) return false;
        
        this.sessionWords[wordIndex].userAnswer = userAnswer;
        this.sessionWords[wordIndex].generatedSentence = generatedSentence;
        this.sessionWords[wordIndex].accuracy = accuracy;
        this.sessionWords[wordIndex].completed = true;
        
        this.currentSession.completedWords++;
        this.currentSession.totalAccuracy += accuracy;
        
        // Update the original vocabulary data
        const vocabIndex = this.vocabulary.findIndex(w => w.id === wordId);
        if (vocabIndex !== -1) {
            this.vocabulary[vocabIndex].timesStudied++;
            this.vocabulary[vocabIndex].lastStudied = new Date().toISOString();
            
            // Update average accuracy
            const oldAvg = this.vocabulary[vocabIndex].averageAccuracy || 0;
            const timesStudied = this.vocabulary[vocabIndex].timesStudied;
            this.vocabulary[vocabIndex].averageAccuracy = 
                ((oldAvg * (timesStudied - 1)) + accuracy) / timesStudied;
        }
        
        this.saveVocabularyToStorage();
        return true;
    }

    // Complete current session
    completeSession() {
        if (!this.currentSession) return null;
        
        this.currentSession.endTime = new Date().toISOString();
        this.currentSession.averageAccuracy = 
            this.currentSession.totalAccuracy / this.currentSession.completedWords;
        
        // Save session to history
        const sessionHistory = loadFromStorage('sessionHistory', []);
        sessionHistory.push(this.currentSession);
        saveToStorage('sessionHistory', sessionHistory);
        
        const completedSession = { ...this.currentSession };
        this.currentSession = null;
        this.sessionWords = [];
        this.currentWordIndex = 0;
        
        return completedSession;
    }

    // Get session progress
    getSessionProgress() {
        if (!this.currentSession) return null;
        
        return {
            current: this.currentWordIndex + 1,
            total: this.sessionWords.length,
            completed: this.currentSession.completedWords,
            averageAccuracy: this.currentSession.completedWords > 0 
                ? this.currentSession.totalAccuracy / this.currentSession.completedWords 
                : 0
        };
    }

    // Save vocabulary to local storage
    saveVocabularyToStorage() {
        saveToStorage('vocabulary', this.vocabulary);
    }

    // Load vocabulary from local storage
    loadVocabularyFromStorage() {
        this.vocabulary = loadFromStorage('vocabulary', []);
    }

    // Get vocabulary statistics
    getVocabularyStats() {
        return {
            totalWords: this.vocabulary.length,
            studiedWords: this.vocabulary.filter(w => w.timesStudied > 0).length,
            averageAccuracy: this.vocabulary.length > 0 
                ? this.vocabulary.reduce((sum, w) => sum + (w.averageAccuracy || 0), 0) / this.vocabulary.length 
                : 0,
            recentlyStudied: this.vocabulary.filter(w => {
                if (!w.lastStudied) return false;
                const lastStudied = new Date(w.lastStudied);
                const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
                return lastStudied > dayAgo;
            }).length
        };
    }

    // Get vocabulary list
    getVocabulary() {
        return this.vocabulary;
    }

    // Clear all data
    clearData() {
        this.vocabulary = [];
        this.currentSession = null;
        this.sessionWords = [];
        this.currentWordIndex = 0;
        this.saveVocabularyToStorage();
    }
}

// Create global instance
const dataManager = new DataManager();
