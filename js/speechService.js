// Speech Service - Handles text-to-speech functionality

class SpeechService {
    constructor() {
        this.synthesis = window.speechSynthesis;
        this.voices = [];
        this.currentVoice = null;
        this.rate = 1.0;
        this.isPlaying = false;
        
        // Initialize voices when available
        this.loadVoices();
        
        // Handle voice changes (some browsers load voices asynchronously)
        if (this.synthesis.onvoiceschanged !== undefined) {
            this.synthesis.onvoiceschanged = () => this.loadVoices();
        }
    }

    // Load available voices
    loadVoices() {
        this.voices = this.synthesis.getVoices();
        
        // Prefer English voices
        const englishVoices = this.voices.filter(voice => 
            voice.lang.startsWith('en')
        );
        
        // Set default voice (prefer female English voice)
        this.currentVoice = englishVoices.find(voice => 
            voice.name.toLowerCase().includes('female') ||
            voice.name.toLowerCase().includes('samantha') ||
            voice.name.toLowerCase().includes('susan')
        ) || englishVoices[0] || this.voices[0];
    }

    // Set speech rate (speed)
    setRate(rate) {
        this.rate = parseFloat(rate);
    }

    // Set voice by name or index
    setVoice(voiceIdentifier) {
        if (typeof voiceIdentifier === 'number') {
            this.currentVoice = this.voices[voiceIdentifier];
        } else if (typeof voiceIdentifier === 'string') {
            this.currentVoice = this.voices.find(voice => 
                voice.name === voiceIdentifier
            ) || this.currentVoice;
        }
    }

    // Speak text with current settings
    speak(text, options = {}) {
        return new Promise((resolve, reject) => {
            // Stop any current speech
            this.stop();
            
            if (!text || text.trim() === '') {
                reject(new Error('No text provided'));
                return;
            }

            // Create utterance
            const utterance = new SpeechSynthesisUtterance(text);
            
            // Apply settings
            utterance.voice = this.currentVoice;
            utterance.rate = options.rate || this.rate;
            utterance.pitch = options.pitch || 1.0;
            utterance.volume = options.volume || 1.0;
            
            // Set up event handlers
            utterance.onstart = () => {
                this.isPlaying = true;
                if (options.onStart) options.onStart();
            };
            
            utterance.onend = () => {
                this.isPlaying = false;
                if (options.onEnd) options.onEnd();
                resolve();
            };
            
            utterance.onerror = (event) => {
                this.isPlaying = false;
                if (options.onError) options.onError(event);
                reject(new Error(`Speech synthesis error: ${event.error}`));
            };
            
            utterance.onpause = () => {
                if (options.onPause) options.onPause();
            };
            
            utterance.onresume = () => {
                if (options.onResume) options.onResume();
            };

            // Speak the text
            try {
                this.synthesis.speak(utterance);
            } catch (error) {
                this.isPlaying = false;
                reject(error);
            }
        });
    }

    // Stop current speech
    stop() {
        if (this.synthesis.speaking) {
            this.synthesis.cancel();
        }
        this.isPlaying = false;
    }

    // Pause current speech
    pause() {
        if (this.synthesis.speaking && !this.synthesis.paused) {
            this.synthesis.pause();
        }
    }

    // Resume paused speech
    resume() {
        if (this.synthesis.paused) {
            this.synthesis.resume();
        }
    }

    // Check if currently speaking
    isSpeaking() {
        return this.synthesis.speaking || this.isPlaying;
    }

    // Check if paused
    isPaused() {
        return this.synthesis.paused;
    }

    // Get available voices
    getVoices() {
        return this.voices.map((voice, index) => ({
            index,
            name: voice.name,
            lang: voice.lang,
            default: voice.default,
            localService: voice.localService
        }));
    }

    // Get English voices only
    getEnglishVoices() {
        return this.getVoices().filter(voice => 
            voice.lang.startsWith('en')
        );
    }

    // Get current voice info
    getCurrentVoice() {
        if (!this.currentVoice) return null;
        
        return {
            name: this.currentVoice.name,
            lang: this.currentVoice.lang,
            default: this.currentVoice.default,
            localService: this.currentVoice.localService
        };
    }

    // Test speech with sample text
    async testSpeech(sampleText = "Hello, this is a test of the speech synthesis system.") {
        try {
            await this.speak(sampleText);
            return true;
        } catch (error) {
            console.error('Speech test failed:', error);
            throw error;
        }
    }

    // Check if speech synthesis is supported
    isSupported() {
        return 'speechSynthesis' in window;
    }

    // Get speech synthesis info
    getInfo() {
        return {
            supported: this.isSupported(),
            voicesLoaded: this.voices.length > 0,
            currentVoice: this.getCurrentVoice(),
            rate: this.rate,
            isPlaying: this.isPlaying,
            isPaused: this.isPaused()
        };
    }

    // Save speech settings to storage
    saveSettings() {
        const settings = {
            voiceName: this.currentVoice ? this.currentVoice.name : null,
            rate: this.rate
        };
        saveToStorage('speechSettings', settings);
    }

    // Load speech settings from storage
    loadSettings() {
        const settings = loadFromStorage('speechSettings', {});
        
        if (settings.rate) {
            this.setRate(settings.rate);
        }
        
        if (settings.voiceName) {
            // Wait for voices to load before setting
            const setVoiceWhenReady = () => {
                if (this.voices.length > 0) {
                    this.setVoice(settings.voiceName);
                } else {
                    setTimeout(setVoiceWhenReady, 100);
                }
            };
            setVoiceWhenReady();
        }
    }

    // Break long text into chunks for better speech
    breakTextIntoChunks(text, maxLength = 200) {
        if (text.length <= maxLength) {
            return [text];
        }

        const sentences = text.split(/[.!?]+/).filter(s => s.trim());
        const chunks = [];
        let currentChunk = '';

        for (const sentence of sentences) {
            const trimmedSentence = sentence.trim();
            if (trimmedSentence) {
                if (currentChunk.length + trimmedSentence.length + 1 <= maxLength) {
                    currentChunk += (currentChunk ? '. ' : '') + trimmedSentence;
                } else {
                    if (currentChunk) {
                        chunks.push(currentChunk + '.');
                    }
                    currentChunk = trimmedSentence;
                }
            }
        }

        if (currentChunk) {
            chunks.push(currentChunk + '.');
        }

        return chunks;
    }

    // Speak long text by breaking it into chunks
    async speakLongText(text, options = {}) {
        const chunks = this.breakTextIntoChunks(text);
        
        for (let i = 0; i < chunks.length; i++) {
            await this.speak(chunks[i], {
                ...options,
                onStart: i === 0 ? options.onStart : undefined,
                onEnd: i === chunks.length - 1 ? options.onEnd : undefined
            });
        }
    }
}

// Create global instance
const speechService = new SpeechService();

// Load saved settings
speechService.loadSettings();
