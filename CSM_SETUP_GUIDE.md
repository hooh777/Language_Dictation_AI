# CSM (Conversational Speech Model) Setup Guide

This guide helps you set up CSM for ultra-realistic, conversational text-to-speech in Language Dictation AI.

## 🎯 What is CSM?

**CSM (Conversational Speech Model)** is an advanced AI that generates natural, human-like speech with:
- **Conversation Context Memory** - Remembers previous sentences for natural flow
- **Multiple Speaker Personalities** - Different voice characteristics and styles  
- **Contextual Adaptation** - Adjusts tone and pace based on conversation
- **Ultra-Realistic Quality** - Near-human speech synthesis

## 💻 System Requirements

### ✅ **Recommended (Full Features):**
- NVIDIA RTX 3060 or better (8GB+ VRAM)
- Windows 10/11, macOS, or Linux
- Modern browser with WebGPU support
- 8GB+ RAM
- Stable internet (for initial setup)

### ⚠️ **Minimum (Limited Features):**
- Any modern GPU with 4GB+ VRAM
- WebAssembly support (all modern browsers)
- 4GB+ RAM

### ❌ **Not Compatible:**
- Systems without dedicated GPU
- Very old browsers (IE, old Safari)
- Mobile devices (phone/tablet)

## 🔧 Setup Options

### **Option 1: Automatic Browser Setup (Recommended)**

1. **Check Compatibility:**
   - Open Language Dictation AI
   - Go to Setup → Speech Configuration
   - Select "CSM (Ultra-Premium)" from Voice Provider
   - Click "Setup CSM"

2. **Follow Auto-Setup:**
   - The app will check your system automatically
   - Download required models (~2GB)
   - Configure everything for you

### **Option 2: Manual Local Installation**

For advanced users who want local control:

1. **Install Prerequisites:**
   ```bash
   # Ensure you have Python 3.10+
   python --version
   
   # Install CUDA 12.4+ if not present
   # Download from: https://developer.nvidia.com/cuda-downloads
   ```

2. **Clone CSM Repository:**
   ```bash
   git clone https://github.com/SesameAILabs/csm.git
   cd csm
   ```

3. **Setup Environment:**
   ```bash
   python -m venv .venv
   # Windows:
   .venv\Scripts\activate
   # macOS/Linux:
   source .venv/bin/activate
   
   pip install -r requirements.txt
   ```

4. **Get Model Access:**
   ```bash
   # Login to Hugging Face
   huggingface-cli login
   # Enter your HF token when prompted
   ```

5. **Test Installation:**
   ```bash
   python run_csm.py
   ```

## 🚫 **For Users Without CUDA GPU**

If you don't have a CUDA-compatible GPU, here are your alternatives:

### **🌩️ Cloud Solutions:**
1. **Google Colab Pro** - Run CSM in the cloud
2. **AWS EC2 with GPU** - Rent GPU time
3. **Paperspace Gradient** - GPU cloud computing
4. **RunPod** - Affordable GPU rentals

### **🔄 Alternative TTS Options:**
1. **ElevenLabs** - Premium cloud TTS (realistic but no context)
2. **OpenAI TTS** - Good quality cloud voices
3. **Azure Speech** - Microsoft's neural voices
4. **Browser TTS** - Free, built-in (basic quality)

### **📱 Mobile/Integrated GPU Users:**
Unfortunately, CSM requires dedicated GPU memory and compute power that mobile devices and integrated graphics cannot provide. We recommend:
- Use ElevenLabs for premium voices
- Use Browser TTS for free option
- Consider upgrading to a system with dedicated GPU

## 🎤 **Voice Configuration**

Once CSM is setup, you can:

### **Speaker Selection:**
- **Speaker 1**: Clear and articulate (great for learning)
- **Speaker 2**: Warm and friendly (casual conversations)  
- **Speaker 3**: Professional tone (formal content)
- **Speaker 4**: Energetic style (engaging delivery)

### **Context Management:**
- CSM remembers last 5 interactions
- Context carries across vocabulary words in a session
- Use "Clear Context" to reset conversation memory
- Each session starts fresh for new topics

## ✨ **CSM Features in Language Dictation AI**

### **Conversational Flow:**
- Previous sentences influence current speech
- Natural pauses and intonation changes
- Contextual emphasis on vocabulary words
- Smooth transitions between topics

### **Adaptive Speech:**
- Adjusts to difficulty level context
- Emphasizes new vocabulary naturally
- Maintains conversation personality
- Responds to session progress

### **Session Integration:**
- Remembers vocabulary focus areas
- Adapts to user's learning pace
- Provides contextual pronunciation
- Creates narrative flow between words

## 🔧 **Troubleshooting**

### **CSM Won't Load:**
1. Check GPU compatibility (run `nvidia-smi`)
2. Verify browser supports WebGPU
3. Clear browser cache and try again
4. Check internet connection for model download

### **Poor Audio Quality:**
1. Ensure VRAM isn't full (close other GPU apps)
2. Try different speaker personality
3. Clear conversation context and restart
4. Check if fallback to browser TTS occurred

### **Slow Generation:**
1. Close other GPU-intensive applications
2. Reduce context length (clear context more often)
3. Check system RAM usage
4. Consider upgrading GPU if consistently slow

### **Context Not Working:**
1. Verify CSM is actually running (not fallback)
2. Check conversation context in developer tools
3. Try clearing and rebuilding context
4. Restart the application if needed

## 📊 **Performance Comparison**

| TTS Provider | Quality | Context | Setup | Cost | Offline |
|--------------|---------|---------|--------|------|---------|
| Browser TTS | Good | None | None | Free | ✅ Yes |
| ElevenLabs | Excellent | None | API Key | Paid | ❌ No |
| CSM | Outstanding | ✅ Yes | Complex | Free* | ✅ Yes |

*Free after initial GPU/setup investment

## 🆘 **Getting Help**

1. **Check System Requirements** first
2. **Try Alternative TTS** if CSM isn't compatible
3. **Use Browser Console** to check for errors
4. **Clear Browser Data** if issues persist
5. **Report Issues** on GitHub for app bugs

## 🎓 **Best Practices**

### **For Learning:**
- Use CSM for vocabulary sessions (context helps)
- Clear context between different topics
- Choose appropriate speaker for content type
- Let CSM build narrative flow across words

### **For Performance:**
- Close unnecessary applications before using CSM
- Monitor GPU memory usage
- Use shorter sessions if generation is slow
- Clear context periodically to prevent memory issues

### **For Quality:**
- Ensure stable internet for initial download
- Keep browser updated for best WebGPU support
- Use headphones for best audio experience
- Adjust speech speed to preference

---

**CSM provides the most advanced conversational speech available for language learning. While setup is more complex, the contextual, natural speech generation creates an unparalleled learning experience.** 🚀
