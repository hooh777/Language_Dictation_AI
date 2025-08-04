# Language Dictation AI

A web-based dictation application that helps users learn vocabulary through AI-generated sentences. The app- **Local Storage**: All vocabulary and progress data stored locally
- **API Key Security**: Grok-1.5 Vision API key stored locally, never shared
- **No Account Required**: Works completely offline after initial setupports vocabulary from Excel/Google Sheets, generates contextual sentences using Grok-1.5 Vision AI, and provides text-to-speech functionality for interactive learning.

## 🚀 Features

### Core Functionality
- **Vocabulary Import**: Import words from Excel/CSV files with format: Word | POS | Meaning | Sentence Example
- **AI Sentence Generation**: Uses Grok-1.5 Vision API to create contextual sentences based on difficulty levels (Beginner, Intermediate, Advanced)
- **Text-to-Speech**: Browser-based speech synthesis with adjustable speed
- **Multiple Input Methods**: Type answers or upload handwritten responses (OCR support)
- **Progress Tracking**: Comprehensive analytics including accuracy metrics, study streaks, and achievements

### User Experience
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Session Management**: Customizable session sizes (5-20 words) with random word selection
- **Real-time Feedback**: Instant accuracy scoring with detailed comparisons
- **Achievement System**: Unlock achievements for consistency, accuracy, and milestones

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **AI Integration**: Grok-1.5 Vision API (x.ai) for sentence generation
- **Text-to-Speech**: Web Speech API
- **OCR**: Tesseract.js for handwriting recognition
- **File Processing**: XLSX.js for Excel file parsing
- **Charts**: Chart.js for progress visualization
- **Storage**: Browser Local Storage for data persistence

## 📁 Project Structure

```
Language_Dictation_AI/
├── index.html              # Main application interface
├── styles/
│   └── main.css            # Complete styling with responsive design
├── js/
│   ├── app.js              # Main application logic
│   ├── dataManager.js      # Vocabulary import and session management
│   ├── aiService.js        # Grok3 API integration
│   ├── speechService.js    # Text-to-speech functionality
│   ├── ocrService.js       # OCR for handwritten text
│   ├── progressTracker.js  # Progress tracking and analytics
│   └── utils.js            # Utility functions
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Modern web browser with JavaScript enabled
- Grok-1.5 Vision API key from x.ai (for AI sentence generation)
- Vocabulary data in Excel/CSV format

### Installation

1. **Clone or download** this repository to your local machine
2. **Open** `index.html` in your web browser
3. **Configure** your Grok3 API key in the Setup tab
4. **Import** your vocabulary data or use the sample data to get started

### Vocabulary File Format

Your Excel/CSV file should have the following columns:
```
Word          | POS  | Meaning           | Sentence Example
Neighborhood  | n.   | 鄰近地區 / 街坊    | The children in our neighborhood often play together in the park.
Sidewalk      | n.   | 人行道            | Please walk on the sidewalk for your safety.
```

## 📖 How to Use

### 1. Setup Phase
- **Import Vocabulary**: Upload your Excel/CSV file or load sample data
- **Configure API**: Enter your Grok-1.5 Vision API key (stored locally, never shared)
- **Set Preferences**: Choose difficulty level, session size, and speech speed

### 2. Practice Phase
- **Listen**: AI generates a sentence and reads it aloud
- **Type**: Write down what you heard
- **Submit**: Get instant feedback with accuracy scoring
- **Continue**: Progress through your vocabulary list

### 3. Progress Tracking
- **View Statistics**: See your overall performance metrics
- **Track Progress**: Monitor accuracy trends over time
- **Review Words**: Identify words that need more practice
- **Earn Achievements**: Unlock rewards for consistency and accuracy

## 🔧 Configuration

### API Setup
1. Get your Grok-1.5 Vision API key from [x.ai](https://x.ai)
2. Enter the key in the Setup tab
3. The key is stored locally and never transmitted to third parties

### Speech Settings
- **Speed**: Adjust speech rate (Slow/Normal/Fast)
- **Voice**: Automatic selection of best available English voice
- **Replay**: Listen to sentences multiple times

### Session Options
- **Difficulty Levels**:
  - **Beginner**: Simple vocabulary, short sentences (8-12 words)
  - **Intermediate**: Moderate vocabulary, medium sentences (12-18 words)
  - **Advanced**: Sophisticated vocabulary, longer sentences (18-25 words)
- **Session Sizes**: 5, 10, 15, or 20 words per session

## 🎯 Features in Detail

### AI Sentence Generation
- Context-aware sentences based on word meaning and part of speech
- Difficulty-appropriate vocabulary and grammar structures
- Fallback to example sentences when API is unavailable

### OCR Support
- Upload photos of handwritten answers
- Automatic text extraction using Tesseract.js
- Image preprocessing for better recognition accuracy

### Progress Analytics
- **Accuracy Tracking**: Per-word and overall accuracy metrics
- **Study Streaks**: Track consecutive days of study
- **Performance Trends**: Visual charts showing improvement over time
- **Achievement System**: Unlock rewards for various milestones

### Data Management
- **Local Storage**: All data stored in your browser
- **Session History**: Complete record of past sessions
- **Export/Import**: Backup and restore your progress data
- **Privacy**: No data transmitted to external servers (except AI API calls)

## 🔒 Privacy & Security

- **Local Data Storage**: All vocabulary and progress data stored locally
- **API Key Security**: Grok3 API key stored locally, never shared
- **No Account Required**: Works completely offline after initial setup
- **Data Control**: You own and control all your data

## 🌐 Browser Compatibility

- **Chrome**: Full support (recommended)
- **Firefox**: Full support
- **Safari**: Full support
- **Edge**: Full support
- **Mobile Browsers**: Responsive design works on all modern mobile browsers

## 🛠️ Development

### Architecture
- **Modular Design**: Separate classes for different functionalities
- **Event-Driven**: Clean separation between UI and business logic
- **Async/Await**: Modern JavaScript patterns for API calls
- **Error Handling**: Comprehensive error handling with user feedback

### Extending the Application
- **New AI Providers**: Add support for other AI APIs in `aiService.js`
- **Additional Import Formats**: Extend `dataManager.js` for new file types
- **Enhanced Analytics**: Add new metrics in `progressTracker.js`
- **UI Improvements**: Modify styles in `main.css`

## 📈 Performance Optimization

- **Lazy Loading**: Components initialized only when needed
- **Efficient Storage**: Optimized local storage usage
- **Image Processing**: OCR with image optimization for better performance
- **Responsive UI**: Smooth animations and transitions

## 🤝 Contributing

This is an open-source project. Contributions are welcome! Areas for improvement:
- Additional AI provider integrations
- Enhanced OCR accuracy
- More sophisticated progress analytics
- Accessibility improvements
- Mobile app version

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **Grok-1.5 Vision API** by x.ai for AI sentence generation
- **Tesseract.js** for OCR functionality
- **Chart.js** for data visualization
- **Font Awesome** for icons
- **XLSX.js** for Excel file processing

## 📞 Support

For questions, issues, or feature requests, please open an issue on GitHub or contact the development team.

---

**Start learning vocabulary with AI-powered dictation today!** 🎓
