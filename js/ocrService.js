// OCR Service - Handles optical character recognition for handwritten text

class OCRService {
    constructor() {
        this.worker = null;
        this.isInitialized = false;
        this.isProcessing = false;
    }

    // Initialize Tesseract worker
    async initialize() {
        if (this.isInitialized) return;

        try {
            showLoading('Initializing OCR engine...');
            
            this.worker = await Tesseract.createWorker('eng', 1, {
                logger: m => {
                    if (m.status === 'recognizing text') {
                        const progress = Math.round(m.progress * 100);
                        showLoading(`Processing image... ${progress}%`);
                    }
                }
            });

            // Set OCR parameters for better handwriting recognition
            await this.worker.setParameters({
                tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,!?;:()-"\' ',
                tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK,
                preserve_interword_spaces: '1',
            });

            this.isInitialized = true;
            hideLoading();
            
        } catch (error) {
            hideLoading();
            console.error('Failed to initialize OCR:', error);
            throw new Error('Failed to initialize OCR engine');
        }
    }

    // Process image file and extract text
    async processImage(imageFile) {
        if (!this.isInitialized) {
            await this.initialize();
        }

        if (this.isProcessing) {
            throw new Error('OCR is already processing another image');
        }

        this.isProcessing = true;

        try {
            // Validate file type
            if (!imageFile.type.startsWith('image/')) {
                throw new Error('Please select a valid image file');
            }

            // Check file size (limit to 10MB)
            if (imageFile.size > 10 * 1024 * 1024) {
                throw new Error('Image file is too large. Please use an image smaller than 10MB');
            }

            showLoading('Processing image...');

            // Create image element for preprocessing
            const imageElement = await this.createImageElement(imageFile);
            
            // Preprocess image for better OCR results
            const processedCanvas = this.preprocessImage(imageElement);
            
            // Convert canvas to blob
            const processedImageBlob = await this.canvasToBlob(processedCanvas);

            // Perform OCR
            const { data: { text, confidence } } = await this.worker.recognize(processedImageBlob);

            hideLoading();

            // Clean and validate the extracted text
            const cleanedText = this.cleanExtractedText(text);
            
            if (!cleanedText.trim()) {
                throw new Error('No text was detected in the image. Please ensure the handwriting is clear and well-lit.');
            }

            return {
                text: cleanedText,
                confidence: confidence,
                originalText: text
            };

        } catch (error) {
            hideLoading();
            console.error('OCR processing error:', error);
            throw error;
        } finally {
            this.isProcessing = false;
        }
    }

    // Create image element from file
    createImageElement(file) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const url = URL.createObjectURL(file);
            
            img.onload = () => {
                URL.revokeObjectURL(url);
                resolve(img);
            };
            
            img.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new Error('Failed to load image'));
            };
            
            img.src = url;
        });
    }

    // Preprocess image to improve OCR accuracy
    preprocessImage(imageElement) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas size
        canvas.width = imageElement.width;
        canvas.height = imageElement.height;
        
        // Draw original image
        ctx.drawImage(imageElement, 0, 0);
        
        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Apply image processing for better OCR
        this.applyImageFilters(data);
        
        // Put processed data back
        ctx.putImageData(imageData, 0, 0);
        
        return canvas;
    }

    // Apply filters to improve text recognition
    applyImageFilters(data) {
        // Convert to grayscale and increase contrast
        for (let i = 0; i < data.length; i += 4) {
            // Grayscale conversion
            const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            
            // Increase contrast and apply threshold
            const contrast = 1.5;
            const threshold = 128;
            const enhanced = ((gray - 128) * contrast) + 128;
            const final = enhanced > threshold ? 255 : 0;
            
            data[i] = final;     // Red
            data[i + 1] = final; // Green
            data[i + 2] = final; // Blue
            // Alpha channel (data[i + 3]) remains unchanged
        }
    }

    // Convert canvas to blob
    canvasToBlob(canvas) {
        return new Promise((resolve) => {
            canvas.toBlob(resolve, 'image/png');
        });
    }

    // Clean extracted text
    cleanExtractedText(text) {
        return text
            // Remove excessive whitespace
            .replace(/\s+/g, ' ')
            // Remove common OCR artifacts
            .replace(/[|]/g, 'I')
            .replace(/[`]/g, "'")
            .replace(/[""]/g, '"')
            .replace(/['']/g, "'")
            // Fix common character misrecognitions
            .replace(/rn/g, 'm')
            .replace(/\b0\b/g, 'o')
            .replace(/\b1\b/g, 'I')
            .replace(/\b5\b/g, 'S')
            // Remove special characters that shouldn't be in sentences
            .replace(/[~@#$%^&*_+=<>]/g, '')
            // Clean up punctuation
            .replace(/\s+([.,!?;:])/g, '$1')
            .replace(/([.,!?;:])\s*([.,!?;:])/g, '$1')
            // Trim whitespace
            .trim();
    }

    // Process image from URL (for testing)
    async processImageFromUrl(imageUrl) {
        if (!this.isInitialized) {
            await this.initialize();
        }

        try {
            showLoading('Processing image from URL...');
            
            const { data: { text, confidence } } = await this.worker.recognize(imageUrl);
            
            hideLoading();
            
            const cleanedText = this.cleanExtractedText(text);
            
            return {
                text: cleanedText,
                confidence: confidence,
                originalText: text
            };
            
        } catch (error) {
            hideLoading();
            console.error('OCR processing error:', error);
            throw error;
        }
    }

    // Check if OCR is available
    isAvailable() {
        return typeof Tesseract !== 'undefined';
    }

    // Get OCR status
    getStatus() {
        return {
            available: this.isAvailable(),
            initialized: this.isInitialized,
            processing: this.isProcessing
        };
    }

    // Cleanup resources
    async cleanup() {
        if (this.worker && this.isInitialized) {
            try {
                await this.worker.terminate();
                this.worker = null;
                this.isInitialized = false;
            } catch (error) {
                console.error('Error cleaning up OCR worker:', error);
            }
        }
    }

    // Get usage tips for better OCR results
    getUsageTips() {
        return [
            'Write clearly and legibly',
            'Use dark ink on white/light paper',
            'Ensure good lighting when taking the photo',
            'Avoid shadows on the text',
            'Hold the camera steady and focus properly',
            'Take the photo straight-on (avoid angles)',
            'Make sure text fills most of the image',
            'Use high resolution/quality camera settings'
        ];
    }

    // Validate image before processing
    validateImage(file) {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        
        if (!validTypes.includes(file.type)) {
            throw new Error('Please select a JPEG, PNG, or WebP image file');
        }
        
        if (file.size > 10 * 1024 * 1024) {
            throw new Error('Image file must be smaller than 10MB');
        }
        
        return true;
    }
}

// Create global instance
const ocrService = new OCRService();

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    ocrService.cleanup();
});
