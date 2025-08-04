// AI Service - Handles communication with Qwen-Plus API for sentence generation

class AIService {
    constructor() {
        this.apiKey = this.loadApiKey();
        this.baseUrl = 'https://dashscope.aliyuncs.com/compatible-mode/v1'; // Qwen API endpoint
        this.model = 'qwen-plus'; // Qwen-Plus model name
    }

    // Load API key from storage
    loadApiKey() {
        return loadFromStorage('qwenApiKey', '');
    }

    // Save API key to storage
    saveApiKey(apiKey) {
        this.apiKey = apiKey;
        saveToStorage('qwenApiKey', apiKey);
    }

    // Validate if API key is configured
    isConfigured() {
        return validateApiKey(this.apiKey);
    }

    // Generate sentence using Grok-1.5 Vision API
    async generateSentence(word, pos, meaning, difficulty, existingExample = null) {
        if (!this.isConfigured()) {
            throw new Error('Grok-1.5 Vision API key not configured');
        }

        const prompt = this.buildPrompt(word, pos, meaning, difficulty, existingExample);
        
        try {
            showLoading('Generating sentence with AI...');
            
            const response = await fetch(`${this.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                    'X-DashScope-DataInspection': 'enable'
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a helpful English language teacher assistant. Generate clear, grammatically correct sentences for vocabulary practice.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    max_tokens: 100,
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`API Error (${response.status}): ${errorData.error?.message || 'Unknown error'}`);
            }

            const data = await response.json();
            
            if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                throw new Error('Invalid response format from API');
            }

            const generatedSentence = data.choices[0].message.content.trim();
            
            // Clean up the response (remove quotes, extra formatting)
            const cleanSentence = this.cleanGeneratedSentence(generatedSentence);
            
            return cleanSentence;

        } catch (error) {
            console.error('Error generating sentence:', error);
            
            // Fallback to example sentence if API fails
            if (existingExample) {
                showToast('Using example sentence (API unavailable)', 'warning');
                return existingExample;
            }
            
            // Final fallback to simple sentence
            const fallbackSentence = this.generateFallbackSentence(word, pos, difficulty);
            showToast('Using fallback sentence (API unavailable)', 'warning');
            return fallbackSentence;
            
        } finally {
            hideLoading();
        }
    }

    // Build prompt for sentence generation
    buildPrompt(word, pos, meaning, difficulty, existingExample) {
        const difficultyInstructions = {
            beginner: 'Use simple vocabulary and short sentences (8-12 words). Focus on basic grammar structures.',
            intermediate: 'Use moderate vocabulary and medium-length sentences (12-18 words). Include some complex grammar.',
            advanced: 'Use sophisticated vocabulary and longer sentences (18-25 words). Include complex grammar structures and nuanced meanings.'
        };

        let prompt = `Generate a ${difficulty} level English sentence using the word "${word}" (${pos}).`;
        
        if (meaning) {
            prompt += ` The word means: ${meaning}.`;
        }
        
        prompt += ` ${difficultyInstructions[difficulty]}`;
        
        if (existingExample) {
            prompt += ` Here's an existing example for reference (create a different sentence): "${existingExample}"`;
        }
        
        prompt += ' Return only the sentence, no additional text or explanations.';
        
        return prompt;
    }

    // Clean generated sentence response
    cleanGeneratedSentence(sentence) {
        return sentence
            .replace(/^["']|["']$/g, '') // Remove surrounding quotes
            .replace(/^\d+\.\s*/, '') // Remove numbering
            .replace(/^Sentence:\s*/i, '') // Remove "Sentence:" prefix
            .replace(/^Here's?\s+.*?:\s*/i, '') // Remove explanatory prefixes
            .trim();
    }

    // Generate fallback sentence when API is unavailable
    generateFallbackSentence(word, pos, difficulty) {
        const templates = {
            beginner: {
                'n.': [
                    `The ${word} is very important.`,
                    `I can see a ${word} here.`,
                    `This ${word} is useful.`
                ],
                'v.': [
                    `I ${word} every day.`,
                    `Please ${word} this carefully.`,
                    `We should ${word} together.`
                ],
                'adj.': [
                    `This is very ${word}.`,
                    `The weather is ${word} today.`,
                    `She looks ${word}.`
                ]
            },
            intermediate: {
                'n.': [
                    `The ${word} plays an important role in our daily lives.`,
                    `Understanding this ${word} requires careful consideration.`,
                    `Many people find this ${word} quite interesting.`
                ],
                'v.': [
                    `Students often ${word} when they study hard.`,
                    `The team decided to ${word} their strategy.`,
                    `She managed to ${word} despite the challenges.`
                ],
                'adj.': [
                    `The situation became increasingly ${word} over time.`,
                    `His approach was both practical and ${word}.`,
                    `The results were surprisingly ${word}.`
                ]
            },
            advanced: {
                'n.': [
                    `The intricate ${word} of this complex system demonstrates the sophisticated nature of modern technology.`,
                    `Scholars have extensively debated the philosophical implications of this particular ${word} throughout history.`,
                    `The remarkable ${word} serves as a testament to human ingenuity and perseverance.`
                ],
                'v.': [
                    `Organizations that successfully ${word} tend to demonstrate exceptional strategic planning and execution capabilities.`,
                    `The ability to ${word} effectively distinguishes exceptional leaders from their contemporaries.`,
                    `Researchers continue to ${word} innovative methodologies to address contemporary challenges.`
                ],
                'adj.': [
                    `The professor's ${word} analysis revealed previously unrecognized patterns in the data.`,
                    `Her ${word} perspective challenged conventional wisdom and sparked meaningful discourse.`,
                    `The ${word} implications of this discovery extend far beyond initial expectations.`
                ]
            }
        };

        const posKey = pos.toLowerCase().includes('noun') || pos.toLowerCase().includes('n.') ? 'n.' :
                      pos.toLowerCase().includes('verb') || pos.toLowerCase().includes('v.') ? 'v.' :
                      pos.toLowerCase().includes('adj') ? 'adj.' : 'n.';

        const sentenceTemplates = templates[difficulty]?.[posKey] || templates[difficulty]['n.'];
        const randomTemplate = sentenceTemplates[Math.floor(Math.random() * sentenceTemplates.length)];
        
        return randomTemplate;
    }

    // Test API connection
    async testConnection() {
        if (!this.isConfigured()) {
            throw new Error('API key not configured');
        }

        try {
            const response = await fetch(`${this.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: [
                        {
                            role: 'user',
                            content: 'Say "API connection successful" if you can read this.'
                        }
                    ],
                    max_tokens: 10
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`API Error: ${errorData.error?.message || 'Connection failed'}`);
            }

            return true;

        } catch (error) {
            console.error('API connection test failed:', error);
            throw error;
        }
    }

    // Get API usage/status information
    async getApiStatus() {
        // This would return information about API usage, rate limits, etc.
        // Implementation depends on what Grok-1.5 Vision API provides
        return {
            configured: this.isConfigured(),
            model: this.model,
            baseUrl: this.baseUrl
        };
    }
}

// Create global instance
const aiService = new AIService();
