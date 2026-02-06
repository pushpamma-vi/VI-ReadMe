"""
VI-ReadMe - Visual Reader with Text-to-Speech
Camera-based OCR application that reads text aloud
Uses: Flask, Tesseract OCR, Web Speech API
"""

from flask import Flask, render_template, request, jsonify
from werkzeug.utils import secure_filename
import os
import pytesseract
from PIL import Image
import time
import threading
from pathlib import Path
import base64
import io

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
app.config['UPLOAD_FOLDER'] = 'uploads'

# Create necessary folders
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Tesseract configuration - will work on most Linux systems
# On render.com, we'll install tesseract in the Dockerfile
# pytesseract.pytesseract.tesseract_cmd = '/usr/bin/tesseract'  # Default Linux path

# Track uploaded files with timestamps for cleanup
file_timestamps = {}
file_lock = threading.Lock()

def cleanup_file(file_path, delay=300):
    """Delete a file after specified delay (default 5 minutes)"""
    def delete_after_delay():
        time.sleep(delay)
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                print(f"Auto-deleted file: {file_path}")
                with file_lock:
                    if file_path in file_timestamps:
                        del file_timestamps[file_path]
        except Exception as e:
            print(f"Error deleting file {file_path}: {str(e)}")
    
    thread = threading.Thread(target=delete_after_delay, daemon=True)
    thread.start()

def delete_file_immediately(file_path):
    """Delete a file immediately"""
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            print(f"Deleted file: {file_path}")
            with file_lock:
                if file_path in file_timestamps:
                    del file_timestamps[file_path]
    except Exception as e:
        print(f"Error deleting file {file_path}: {str(e)}")

def extract_text_from_image(image_path, lang='eng'):
    """
    Extract text from image using Tesseract OCR
    
    Args:
        image_path: Path to the image file
        lang: Language code (eng, spa, fra, etc.)
    
    Returns:
        Extracted text as string
    """
    try:
        # Open image
        image = Image.open(image_path)
        
        # Perform OCR with configuration for better accuracy
        # --oem 3: Use LSTM OCR Engine Mode
        # --psm 3: Automatic page segmentation (default)
        custom_config = r'--oem 3 --psm 3'
        
        text = pytesseract.image_to_string(image, lang=lang, config=custom_config)
        
        return text.strip()
    except Exception as e:
        print(f"Error extracting text: {str(e)}")
        raise

def preprocess_image(image):
    """
    Preprocess image for better OCR results
    
    Args:
        image: PIL Image object
    
    Returns:
        Preprocessed PIL Image object
    """
    # Convert to grayscale
    image = image.convert('L')
    
    # Enhance contrast (optional, can improve OCR accuracy)
    from PIL import ImageEnhance
    enhancer = ImageEnhance.Contrast(image)
    image = enhancer.enhance(2)
    
    return image

@app.route('/')
def index():
    """Serve the main web interface"""
    return render_template('index.html')

@app.route('/health')
def health():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'timestamp': time.time()}), 200

@app.route('/extract-text', methods=['POST'])
def extract_text():
    """
    Extract text from uploaded image
    Accepts: multipart/form-data with 'image' field
    Returns: JSON with extracted text
    """
    try:
        # Check if image data is in request
        if 'image' not in request.files and 'imageData' not in request.form:
            return jsonify({'success': False, 'error': 'No image provided'}), 400
        
        # Handle file upload
        if 'image' in request.files:
            file = request.files['image']
            
            if file.filename == '':
                return jsonify({'success': False, 'error': 'No file selected'}), 400
            
            # Save uploaded file temporarily
            filename = secure_filename(f"{int(time.time())}_{file.filename}")
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(file_path)
        
        # Handle base64 image data (from camera)
        elif 'imageData' in request.form:
            image_data = request.form['imageData']
            
            # Remove data URL prefix if present
            if ',' in image_data:
                image_data = image_data.split(',')[1]
            
            # Decode base64 image
            image_bytes = base64.b64decode(image_data)
            image = Image.open(io.BytesIO(image_bytes))
            
            # Save to temporary file
            filename = f"{int(time.time())}_camera.jpg"
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            image.save(file_path)
        
        # Get language parameter (default: English)
        lang = request.form.get('lang', 'eng')
        
        # Get preprocessing option
        preprocess = request.form.get('preprocess', 'true').lower() == 'true'
        
        # Preprocess image if requested
        if preprocess:
            img = Image.open(file_path)
            img = preprocess_image(img)
            img.save(file_path)
        
        # Extract text using OCR
        extracted_text = extract_text_from_image(file_path, lang=lang)
        
        # Delete the image file immediately after processing
        delete_file_immediately(file_path)
        
        if not extracted_text:
            return jsonify({
                'success': True,
                'text': '',
                'message': 'No text found in image'
            })
        
        return jsonify({
            'success': True,
            'text': extracted_text,
            'message': 'Text extracted successfully'
        })
        
    except Exception as e:
        print(f"Error in extract_text: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/supported-languages')
def supported_languages():
    """
    Return list of supported OCR languages
    """
    try:
        # Get installed languages from Tesseract
        langs = pytesseract.get_languages(config='')
        
        # Common language names mapping
        lang_names = {
            'eng': 'English',
            'spa': 'Spanish',
            'fra': 'French',
            'deu': 'German',
            'ita': 'Italian',
            'por': 'Portuguese',
            'rus': 'Russian',
            'chi_sim': 'Chinese (Simplified)',
            'chi_tra': 'Chinese (Traditional)',
            'jpn': 'Japanese',
            'kor': 'Korean',
            'ara': 'Arabic',
            'hin': 'Hindi'
        }
        
        languages = []
        for lang_code in langs:
            languages.append({
                'code': lang_code,
                'name': lang_names.get(lang_code, lang_code.upper())
            })
        
        return jsonify({
            'success': True,
            'languages': languages
        })
    except Exception as e:
        # Return default languages if can't detect
        return jsonify({
            'success': True,
            'languages': [
                {'code': 'eng', 'name': 'English'}
            ]
        })

if __name__ == '__main__':
    print("=" * 60)
    print("VI-ReadMe - Visual Text Reader")
    print("=" * 60)
    print("Server will run at: http://localhost:5000")
    print("Press CTRL+C to stop the server")
    print("=" * 60)
    
    # Get port from environment variable or use 5000
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, host='0.0.0.0', port=port)
