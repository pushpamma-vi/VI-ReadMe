# VI-ReadMe 📷🔊

**Visual Text Reader with Text-to-Speech**

A mobile-friendly web application that uses your camera to capture text from the real world and reads it aloud. Perfect for accessibility, reading assistance, and learning.

## ✨ Features

- 📷 **Real-time Camera Access** - Use your phone or laptop camera
- 🔍 **OCR Text Extraction** - Powered by Tesseract OCR engine
- 🔊 **Text-to-Speech** - Natural voice reading using Web Speech API
- 📱 **Mobile-Friendly** - Responsive design, works on any device
- 🌍 **Multi-Language Support** - English, Spanish, French, German, and more
- ⚡ **Fast & Free** - Open source, no signup required
- 🎯 **Simple Interface** - Point, capture, listen!

## 🎯 Use Cases

- **Accessibility**: Help visually impaired users read printed text
- **Language Learning**: Hear pronunciation of foreign text
- **Reading Assistance**: Read books, signs, documents aloud
- **Quick Information**: Capture and listen to labels, instructions, receipts
- **On-the-Go Reading**: Read without looking at screen

## 🚀 Quick Start

### Try It Online

Visit the deployed application: [https://vi-readme.onrender.com](https://vi-readme.onrender.com) *(update after deployment)*

### Run Locally

```bash
# Clone the repository
git clone https://github.com/your-username/VI-ReadMe.git
cd VI-ReadMe

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Install Tesseract OCR (system dependency)
# On Ubuntu/Debian:
sudo apt-get install tesseract-ocr tesseract-ocr-eng

# On macOS:
brew install tesseract

# On Windows: Download from https://github.com/UB-Mannheim/tesseract/wiki

# Run the application
python app.py

# Open browser to http://localhost:5000
```

## 📖 How to Use

1. **Start Camera**: Click "Start Camera" and grant permission
2. **Point at Text**: Aim your camera at any printed or digital text
3. **Capture**: Click "Capture & Read" to take a photo
4. **Listen**: Text is automatically extracted and read aloud
5. **Control**: Use pause, stop, speed controls as needed

### Tips for Best Results

- ✅ Good lighting (avoid shadows)
- ✅ Hold camera steady
- ✅ Clear, printed text works best
- ✅ Keep text parallel to camera
- ✅ Avoid glare and reflections
- ✅ Use higher contrast (black text on white)

## 🛠️ Technology Stack

### Backend
- **Flask 3.0** - Web framework
- **Tesseract OCR** - Text extraction engine
- **pytesseract** - Python wrapper for Tesseract
- **Pillow** - Image processing
- **Gunicorn** - Production server

### Frontend
- **Vanilla JavaScript** - No frameworks, fast and lightweight
- **Web Speech API** - Browser-native text-to-speech
- **MediaDevices API** - Camera access
- **Responsive CSS** - Mobile-first design

### Deployment
- **Docker** - Containerization
- **Render.com** - Hosting platform (free tier supported)

## 🌍 Supported Languages

OCR (Text Extraction):
- English (eng)
- Spanish (spa)
- French (fra)
- German (deu)
- Italian (ita)
- Portuguese (por)
- And 100+ more languages (install additional Tesseract language packs)

Text-to-Speech:
- Uses browser's built-in voices (varies by device/browser)
- Most modern browsers support multiple languages

## 📁 Project Structure

```
VI-ReadMe/
├── app.py                    # Flask application
├── requirements.txt          # Python dependencies
├── Dockerfile               # Docker configuration
├── render.yaml              # Render.com deployment config
├── .gitignore              # Git ignore rules
├── README.md               # This file
├── static/
│   ├── css/
│   │   └── style.css       # Responsive styles
│   └── js/
│       └── app.js          # Frontend logic
├── templates/
│   └── index.html          # Main web interface
└── uploads/                # Temporary image storage (auto-cleaned)
```

## 🚢 Deployment

### Deploy to Render.com (Free)

1. **Push to GitHub**
   ```bash
   git add -A
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy on Render**
   - Go to [render.com](https://render.com)
   - New → Blueprint
   - Connect your repository
   - Click "Apply"
   - Wait 2-5 minutes for build

3. **Access Your App**
   - URL: `https://vi-readme.onrender.com`
   - Note: Free tier has cold starts (30-60s first request)

### Deploy with Docker

```bash
# Build image
docker build -t vi-readme .

# Run container
docker run -p 5000:5000 vi-readme

# Access at http://localhost:5000
```

## 🔧 Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 5000 | Server port |
| `FLASK_ENV` | production | Flask environment |
| `PYTHONUNBUFFERED` | 1 | Python output buffering |

### Adding More OCR Languages

Install additional Tesseract language packs:

```bash
# Ubuntu/Debian
sudo apt-get install tesseract-ocr-all

# Or specific languages
sudo apt-get install tesseract-ocr-jpn  # Japanese
sudo apt-get install tesseract-ocr-chi-sim  # Chinese Simplified
```

Update Dockerfile to include languages:
```dockerfile
RUN apt-get install -y tesseract-ocr-jpn tesseract-ocr-chi-sim
```

## 🐛 Troubleshooting

### Camera Not Working

**Issue**: Camera permission denied
- **Solution**: Check browser permissions, try HTTPS (required for camera on some browsers)

**Issue**: Camera not starting on mobile
- **Solution**: Ensure using HTTPS, check if another app is using camera

### OCR Not Detecting Text

**Issue**: No text found in image
- **Solution**: Improve lighting, hold steadier, use clearer text, check language selection

**Issue**: Wrong language detected
- **Solution**: Select correct language from dropdown before capturing

### Text-to-Speech Issues

**Issue**: No audio output
- **Solution**: Check device volume, ensure browser supports Speech API, try different browser

**Issue**: Poor voice quality
- **Solution**: Browser voices vary - Chrome/Edge usually have better quality than Safari/Firefox

## 📊 Performance

- **OCR Processing**: 1-3 seconds per image (depends on image size)
- **Camera Capture**: Instant
- **Text-to-Speech**: Starts immediately after OCR
- **Mobile Performance**: Optimized for low-end devices

## 🔒 Privacy & Security

- ✅ **No data storage**: Images are processed and immediately deleted
- ✅ **No tracking**: No analytics or user tracking
- ✅ **Local processing**: All OCR happens on server (open source)
- ✅ **HTTPS**: Secure connection required for camera access
- ✅ **No signup**: No accounts, no personal data collected

## 🤝 Contributing

Contributions welcome! Please feel free to submit issues or pull requests.

### Development Setup

```bash
# Clone and setup
git clone https://github.com/your-username/VI-ReadMe.git
cd VI-ReadMe
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Run in debug mode
python app.py

# Make changes and test
# Submit PR with description
```

## 📄 License

This project is open source and free to use. No restrictions.

## 🙏 Acknowledgments

- **Tesseract OCR** - Google's open source OCR engine
- **Flask** - Lightweight Python web framework
- **Web Speech API** - W3C standard for browser TTS
- **Render.com** - Free hosting platform

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/VI-ReadMe/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/VI-ReadMe/discussions)

## 🗺️ Roadmap

Future enhancements:
- [ ] Offline PWA support
- [ ] Multiple language voice selection
- [ ] Save reading history
- [ ] Batch processing multiple pages
- [ ] QR code scanning
- [ ] Export to audio file
- [ ] Dark mode
- [ ] Voice commands

---

**Built with ❤️ for accessibility and learning**

**Version**: 1.0.0  
**Last Updated**: February 2026  
**Status**: ✅ Production Ready
