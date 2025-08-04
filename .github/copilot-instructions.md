<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Language Dictation AI - Copilot Instructions

This is a web-based dictation application that helps users learn vocabulary through AI-generated sentences. The application uses vanilla JavaScript with modular architecture.

## Project Structure
- `index.html` - Main application interface with tabs for Setup, Practice, and Progress
- `styles/main.css` - Complete styling with responsive design
- `js/` - Modular JavaScript components:
  - `app.js` - Main application logic and UI management
  - `dataManager.js` - Vocabulary import and session management
  - `aiService.js` - Grok3 API integration for sentence generation
  - `speechService.js` - Text-to-speech functionality
  - `ocrService.js` - OCR for handwritten text recognition
  - `progressTracker.js` - User progress tracking and analytics
  - `utils.js` - Utility functions and helpers

## Key Features
1. **Vocabulary Import**: Excel/CSV file import with format: Word | POS | Meaning | Sentence Example
2. **AI Sentence Generation**: Uses Grok-1.5 Vision API to create contextual sentences based on difficulty level
3. **Text-to-Speech**: Browser-based TTS with customizable speed
4. **OCR Support**: Tesseract.js for handwritten text recognition
5. **Progress Tracking**: Session history, accuracy metrics, achievements system
6. **Responsive Design**: Mobile-friendly interface

## API Integration
- **Grok-1.5 Vision API**: Used for generating vocabulary sentences with different difficulty levels
- The API key is stored locally and never sent to external servers
- Fallback mechanisms for when API is unavailable

## External Libraries
- XLSX.js for Excel file parsing
- Tesseract.js for OCR functionality
- Chart.js for progress visualization
- Font Awesome for icons

## Code Patterns
- ES6 classes for service modules
- Local storage for data persistence
- Promise-based async operations
- Event-driven architecture
- Modular design with clear separation of concerns

## Best Practices
- Always handle errors gracefully with user-friendly messages
- Use loading indicators for async operations
- Implement proper input validation
- Follow accessibility guidelines
- Maintain responsive design principles

When making changes:
1. Keep the modular structure intact
2. Update both functionality and UI consistently
3. Add proper error handling
4. Test cross-browser compatibility
5. Maintain the existing styling patterns
