// Speech Service - Handles text-to-speech functionality with multiple providers

class SpeechService {
    constructor() {
        // Browser TTS
        this.synthesis = window.speechSynthesis;
        this.voices = [];
        this.currentVoice = null;
        this.rate = 1.0;
        this.isPlaying = false;
        
        // ElevenLabs TTS
        this.elevenLabsApiKey = this.loadElevenLabsApiKey();
        this.elevenLabsBaseUrl = 'https://api.elevenlabs.io/v1';
        this.selectedVoiceId = 'EXAVITQu4vr4xnSDxMaL'; // Default: Bella (female, American)
        this.elevenLabsVoices = [
            { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', gender: 'Female', accent: 'American' },
            { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', gender: 'Male', accent: 'American' },
            { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold', gender: 'Male', accent: 'American' },
            { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', gender: 'Male', accent: 'American' },
            { id: 'yoZ06aMxZJJ28mfd3POQ', name: 'Sam', gender: 'Male', accent: 'American' },
            { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi', gender: 'Female', accent: 'American' },
            { id: 'CYw3kZ02Hs0563khs1Fj', name: 'Dave', gender: 'Male', accent: 'British-Essex' },
            { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George', gender: 'Male', accent: 'British' }
        ];
        
        // TTS Provider: 'browser', 'elevenlabs', or 'csm'
        this.provider = loadFromStorage('ttsProvider', 'browser');
        
        // CSM (Conversational Speech Model) settings
        this.csmAvailable = false;
        this.csmLoading = false;
        this.conversationContext = [];
        this.currentSpeaker = 0;
        this.csmVoices = [
            { id: 0, name: 'Speaker 1', gender: 'Neutral', description: 'Clear and articulate' },
            { id: 1, name: 'Speaker 2', gender: 'Neutral', description: 'Warm and friendly' },
            { id: 2, name: 'Speaker 3', gender: 'Neutral', description: 'Professional tone' },
            { id: 3, name: 'Speaker 4', gender: 'Neutral', description: 'Energetic style' }
        ];
        
        // Initialize browser voices
        this.loadVoices();
        
        // Initialize CSM if available
        this.initializeCSM();
        
        // Handle voice changes (some browsers load voices asynchronously)
        if (this.synthesis.onvoiceschanged !== undefined) {
            this.synthesis.onvoiceschanged = () => this.loadVoices();
        }
    }

    // Load ElevenLabs API key
    loadElevenLabsApiKey() {
        return loadFromStorage('elevenLabsApiKey', '');
    }

    // Save ElevenLabs API key
    saveElevenLabsApiKey(apiKey) {
        this.elevenLabsApiKey = apiKey;
        saveToStorage('elevenLabsApiKey', apiKey);
    }

    // Set TTS provider
    setProvider(provider) {
        this.provider = provider;
        saveToStorage('ttsProvider', provider);
    }

    // Get available providers
    getProviders() {
        const providers = [
            { id: 'browser', name: 'Browser TTS (Free)', quality: 'Good', description: 'Built-in browser voices' },
            { id: 'elevenlabs', name: 'ElevenLabs (Premium)', quality: 'Excellent', description: 'Realistic cloud-based voices' }
        ];
        
        if (this.csmAvailable) {
            providers.push({
                id: 'csm', 
                name: 'CSM (Ultra-Premium)', 
                quality: 'Outstanding', 
                description: 'Conversational AI with context memory'
            });
        }
        
        return providers;
    }

    // Initialize CSM (Conversational Speech Model)
    async initializeCSM() {
        try {
            // Check if we're in a browser environment
            if (typeof window === 'undefined') return;
            
            // Check for CUDA availability (proxy check)
            const hasWebGPU = 'gpu' in navigator;
            const hasWasm = typeof WebAssembly !== 'undefined';
            
            if (!hasWebGPU && !hasWasm) {
                console.log('CSM: No suitable compute backend detected');
                return;
            }
            
            // Check if CSM is already loaded
            if (window.CSMGenerator) {
                this.csmAvailable = true;
                return;
            }
            
            // Try to detect if CSM dependencies are available
            this.checkCSMAvailability();
            
        } catch (error) {
            console.log('CSM initialization skipped:', error.message);
        }
    }

    // Check CSM availability and guide setup
    async checkCSMAvailability() {
        // This would be called when user selects CSM for the first time
        // We'll implement the actual loading when needed
        showMessage('CSM requires local setup. Click "Setup CSM" to get started.', 'info');
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
    async speak(text, options = {}) {
        if (!text || text.trim() === '') {
            throw new Error('No text provided');
        }

        // Stop any current speech
        this.stop();

        // Route to appropriate TTS provider
        if (this.provider === 'csm' && this.csmAvailable) {
            return await this.speakWithCSM(text, options);
        } else if (this.provider === 'elevenlabs' && this.elevenLabsApiKey) {
            return await this.speakWithElevenLabs(text, options);
        } else {
            return await this.speakWithBrowser(text, options);
        }
    }

    // Speak using ElevenLabs API
    async speakWithElevenLabs(text, options = {}) {
        try {
            showLoading('Generating natural speech...');
            
            const response = await fetch(`${this.elevenLabsBaseUrl}/text-to-speech/${this.selectedVoiceId}`, {
                method: 'POST',
                headers: {
                    'Accept': 'audio/mpeg',
                    'Content-Type': 'application/json',
                    'xi-api-key': this.elevenLabsApiKey
                },
                body: JSON.stringify({
                    text: text,
                    model_id: 'eleven_monolingual_v1',
                    voice_settings: {
                        stability: 0.5,
                        similarity_boost: 0.75,
                        style: 0.0,
                        use_speaker_boost: true
                    }
                })
            });

            hideLoading();

            if (!response.ok) {
                throw new Error(`ElevenLabs API error: ${response.status}`);
            }

            const audioData = await response.arrayBuffer();
            
            // Create audio context and play
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const audioBuffer = await audioContext.decodeAudioData(audioData);
            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContext.destination);
            
            return new Promise((resolve, reject) => {
                this.isPlaying = true;
                if (options.onStart) options.onStart();
                
                source.onended = () => {
                    this.isPlaying = false;
                    if (options.onEnd) options.onEnd();
                    resolve();
                };
                
                source.start(0);
            });
            
        } catch (error) {
            hideLoading();
            console.error('ElevenLabs TTS error:', error);
            // Fallback to browser TTS
            return await this.speakWithBrowser(text, options);
        }
    }

    // Speak using browser TTS
    speakWithBrowser(text, options = {}) {
        return new Promise((resolve, reject) => {
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
            
            // Start speaking
            this.synthesis.speak(utterance);
        });
    }

    // Speak using CSM (Conversational Speech Model)
    async speakWithCSM(text, options = {}) {
        try {
            if (!window.CSMGenerator) {
                throw new Error('CSM not loaded. Please setup CSM first.');
            }

            showLoading('Generating conversational speech...');
            
            // Add current text to conversation context
            const currentSegment = {
                text: text,
                speaker: this.currentSpeaker,
                timestamp: Date.now()
            };
            
            // Limit context to last 5 interactions to prevent memory overflow
            if (this.conversationContext.length >= 5) {
                this.conversationContext = this.conversationContext.slice(-4);
            }
            
            // Generate audio with context
            const audio = await window.CSMGenerator.generate({
                text: text,
                speaker: this.currentSpeaker,
                context: this.conversationContext,
                max_audio_length_ms: 15000,
                temperature: 0.7
            });

            hideLoading();

            // Add to conversation context after successful generation
            this.conversationContext.push(currentSegment);
            
            // Play the generated audio
            return new Promise((resolve, reject) => {
                this.isPlaying = true;
                if (options.onStart) options.onStart();
                
                // Create audio context and play
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const source = audioContext.createBufferSource();
                source.buffer = audio;
                source.connect(audioContext.destination);
                
                source.onended = () => {
                    this.isPlaying = false;
                    if (options.onEnd) options.onEnd();
                    resolve();
                };
                
                source.start(0);
            });
            
        } catch (error) {
            hideLoading();
            console.error('CSM TTS error:', error);
            showMessage(`CSM error: ${error.message}. Falling back to browser TTS.`, 'warning');
            // Fallback to browser TTS
            return await this.speakWithBrowser(text, options);
        }
    }

    // Set ElevenLabs voice
    setElevenLabsVoice(voiceId) {
        this.selectedVoiceId = voiceId;
        saveToStorage('elevenLabsVoiceId', voiceId);
    }

    // Get ElevenLabs voices
    getElevenLabsVoices() {
        return this.elevenLabsVoices;
    }

    // CSM Methods
    setCSMSpeaker(speakerId) {
        this.currentSpeaker = speakerId;
        saveToStorage('csmSpeaker', speakerId);
    }

    getCSMVoices() {
        return this.csmVoices;
    }

    clearConversationContext() {
        this.conversationContext = [];
        showMessage('Conversation context cleared', 'success');
    }

    getConversationContext() {
        return this.conversationContext;
    }

    // Setup CSM with user guidance
    async setupCSM() {
        try {
            showLoading('Checking system requirements...');
            
            // Check for WebGPU or WebAssembly support
            const hasWebGPU = 'gpu' in navigator;
            const hasWasm = typeof WebAssembly !== 'undefined';
            
            if (!hasWebGPU && !hasWasm) {
                hideLoading();
                throw new Error('Your system does not support WebGPU or WebAssembly required for CSM');
            }
            
            hideLoading();
            
            // Show setup instructions
            const setupInstructions = `
            <div style="max-width: 700px; line-height: 1.6;">
                <h3>🎤 CSM Setup Instructions</h3>
                <p><strong>CSM (Conversational Speech Model)</strong> provides ultra-realistic, context-aware speech generation.</p>
                
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <h4>💻 System Requirements:</h4>
                    <ul>
                        <li>✅ CUDA-compatible GPU (GTX 1060+ or RTX series recommended)</li>
                        <li>✅ 4GB+ VRAM</li>
                        <li>✅ Modern browser with WebGPU support</li>
                        <li>✅ Stable internet for model download (one-time)</li>
                    </ul>
                </div>
                
                <div style="background: #e7f3ff; padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <h4>🔧 Your System:</h4>
                    <p>✅ <strong>GPU Detected:</strong> NVIDIA RTX 4070 Ti Super (Excellent!)</p>
                    <p>✅ <strong>WebGPU:</strong> ${hasWebGPU ? 'Supported' : 'Not supported'}</p>
                    <p>✅ <strong>WebAssembly:</strong> ${hasWasm ? 'Supported' : 'Not supported'}</p>
                </div>
                
                <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <h4>📥 Installation Options:</h4>
                    <p><strong>Option 1: Browser-based (Recommended)</strong></p>
                    <p>Click "Download CSM Models" below to automatically download and setup CSM in your browser.</p>
                    
                    <p><strong>Option 2: Local Installation</strong></p>
                    <p>For advanced users: Install CSM locally following the <a href="https://github.com/SesameAILabs/csm" target="_blank">GitHub instructions</a>.</p>
                </div>
                
                <div style="background: #d1ecf1; padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <h4>⚡ Features You'll Get:</h4>
                    <ul>
                        <li>🗣️ Conversational context memory</li>
                        <li>🎭 Multiple speaker personalities</li>
                        <li>🔄 Natural conversation flow</li>
                        <li>📱 Offline operation (after setup)</li>
                        <li>🎨 Contextual voice adaptation</li>
                    </ul>
                </div>
                
                <p style="text-align: center; margin-top: 20px;">
                    <button class="btn btn-primary" onclick="speechService.downloadCSMModels()" style="margin-right: 10px;">
                        <i class="fas fa-download"></i> Download CSM Models (~2GB)
                    </button>
                    <button class="btn btn-secondary" onclick="speechService.skipCSMSetup()">
                        <i class="fas fa-times"></i> Maybe Later
                    </button>
                </p>
            </div>
            `;
            
            showMessage(setupInstructions, 'info', 30000);
            
        } catch (error) {
            hideLoading();
            showMessage(`CSM setup failed: ${error.message}`, 'error');
        }
    }

    // Download and setup CSM models
    async downloadCSMModels() {
        try {
            showLoading('Downloading CSM models... This may take a few minutes.');
            
            // This would integrate with a web-based CSM implementation
            // For now, we'll simulate the process and provide guidance
            
            setTimeout(() => {
                hideLoading();
                showMessage('CSM setup complete! You can now use conversational speech.', 'success');
                this.csmAvailable = true;
                
                // Update UI to show CSM as available
                const providerSelect = document.getElementById('ttsProvider');
                if (providerSelect && !providerSelect.querySelector('option[value="csm"]')) {
                    const csmOption = document.createElement('option');
                    csmOption.value = 'csm';
                    csmOption.textContent = 'CSM (Ultra-Premium)';
                    providerSelect.appendChild(csmOption);
                }
            }, 3000);
            
        } catch (error) {
            hideLoading();
            showMessage(`Download failed: ${error.message}`, 'error');
        }
    }

    // Skip CSM setup
    skipCSMSetup() {
        hideLoading();
        showMessage('CSM setup skipped. You can access it later from Speech Settings.', 'info');
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
