/**
 * VI-ReadMe - JavaScript Application
 * Handles camera access, image capture, OCR, and text-to-speech
 */

// Global variables
let videoStream = null;
let speechSynthesis = window.speechSynthesis;
let currentUtterance = null;
let isPaused = false;

// DOM Elements
const videoElement = document.getElementById('video');
const canvasElement = document.getElementById('canvas');
const startCameraBtn = document.getElementById('startCamera');
const captureBtn = document.getElementById('captureBtn');
const retakeBtn = document.getElementById('retakeBtn');
const readBtn = document.getElementById('readBtn');
const pauseBtn = document.getElementById('pauseBtn');
const stopBtn = document.getElementById('stopBtn');
const copyBtn = document.getElementById('copyBtn');
const previewContainer = document.getElementById('previewContainer');
const previewImage = document.getElementById('previewImage');
const extractedTextDiv = document.getElementById('extractedText');
const textSection = document.getElementById('textSection');
const statusMessage = document.getElementById('statusMessage');
const loadingOverlay = document.getElementById('loadingOverlay');
const languageSelect = document.getElementById('languageSelect');
const rateSlider = document.getElementById('rateSlider');
const rateValue = document.getElementById('rateValue');

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    console.log('VI-ReadMe initialized');
    
    // Load supported languages
    loadSupportedLanguages();
    
    // Setup event listeners
    setupEventListeners();
    
    // Check browser support
    checkBrowserSupport();
});

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    startCameraBtn.addEventListener('click', startCamera);
    captureBtn.addEventListener('click', captureImage);
    retakeBtn.addEventListener('click', retakePhoto);
    readBtn.addEventListener('click', readTextAloud);
    pauseBtn.addEventListener('click', pauseSpeech);
    stopBtn.addEventListener('click', stopSpeech);
    copyBtn.addEventListener('click', copyText);
    
    // Speech rate slider
    rateSlider.addEventListener('input', (e) => {
        rateValue.textContent = e.target.value;
    });
}

/**
 * Check browser support for required features
 */
function checkBrowserSupport() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showStatus('Camera access not supported in this browser', 'error');
        startCameraBtn.disabled = true;
    }
    
    if (!window.speechSynthesis) {
        showStatus('Text-to-speech not supported in this browser', 'error');
    }
}

/**
 * Load supported OCR languages from backend
 */
async function loadSupportedLanguages() {
    try {
        const response = await fetch('/supported-languages');
        const data = await response.json();
        
        if (data.success && data.languages) {
            languageSelect.innerHTML = '';
            data.languages.forEach(lang => {
                const option = document.createElement('option');
                option.value = lang.code;
                option.textContent = lang.name;
                languageSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading languages:', error);
        // Keep default English option
    }
}

/**
 * Start camera stream
 */
async function startCamera() {
    try {
        showStatus('Requesting camera access...', 'info');
        
        // Request camera access with mobile-optimized constraints
        const constraints = {
            video: {
                facingMode: 'environment', // Use back camera on mobile
                width: { ideal: 1920 },
                height: { ideal: 1080 }
            },
            audio: false
        };
        
        videoStream = await navigator.mediaDevices.getUserMedia(constraints);
        videoElement.srcObject = videoStream;
        
        // Update UI
        startCameraBtn.style.display = 'none';
        captureBtn.style.display = 'inline-flex';
        showStatus('Camera started! Point at text and capture.', 'success');
        
        // Hide status after 3 seconds
        setTimeout(() => hideStatus(), 3000);
        
    } catch (error) {
        console.error('Error accessing camera:', error);
        showStatus('Failed to access camera. Please grant permission.', 'error');
    }
}

/**
 * Stop camera stream
 */
function stopCamera() {
    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
        videoStream = null;
        videoElement.srcObject = null;
    }
}

/**
 * Capture image from video stream
 */
async function captureImage() {
    try {
        showStatus('Capturing image...', 'info');
        
        // Set canvas dimensions to match video
        canvasElement.width = videoElement.videoWidth;
        canvasElement.height = videoElement.videoHeight;
        
        // Draw current video frame to canvas
        const ctx = canvasElement.getContext('2d');
        ctx.drawImage(videoElement, 0, 0);
        
        // Get image as base64 data URL
        const imageData = canvasElement.toDataURL('image/jpeg', 0.9);
        
        // Show preview
        previewImage.src = imageData;
        previewContainer.style.display = 'block';
        videoElement.style.display = 'none';
        
        // Update UI
        captureBtn.style.display = 'none';
        retakeBtn.style.display = 'inline-flex';
        
        // Stop camera to save battery
        stopCamera();
        
        // Process image with OCR
        await processImage(imageData);
        
    } catch (error) {
        console.error('Error capturing image:', error);
        showStatus('Failed to capture image', 'error');
    }
}

/**
 * Retake photo - restart camera
 */
function retakePhoto() {
    // Hide preview
    previewContainer.style.display = 'none';
    videoElement.style.display = 'block';
    
    // Hide text section
    textSection.style.display = 'none';
    
    // Update UI
    retakeBtn.style.display = 'none';
    
    // Restart camera
    startCamera();
    
    // Stop any ongoing speech
    stopSpeech();
}

/**
 * Process captured image with OCR
 */
async function processImage(imageData) {
    try {
        // Show loading overlay
        loadingOverlay.style.display = 'flex';
        showStatus('Extracting text from image...', 'info');
        
        // Prepare form data
        const formData = new FormData();
        formData.append('imageData', imageData.split(',')[1]); // Remove data URL prefix
        formData.append('lang', languageSelect.value);
        formData.append('preprocess', 'true');
        
        // Send to backend for OCR processing
        const response = await fetch('/extract-text', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        // Hide loading overlay
        loadingOverlay.style.display = 'none';
        
        if (data.success) {
            if (data.text && data.text.trim()) {
                // Display extracted text
                extractedTextDiv.textContent = data.text;
                textSection.style.display = 'block';
                
                showStatus('Text extracted successfully!', 'success');
                
                // Automatically read the text
                setTimeout(() => {
                    readTextAloud();
                }, 500);
                
            } else {
                showStatus('No text found in image. Try again with clearer text.', 'error');
            }
        } else {
            showStatus('Error: ' + (data.error || 'Failed to extract text'), 'error');
        }
        
    } catch (error) {
        console.error('Error processing image:', error);
        loadingOverlay.style.display = 'none';
        showStatus('Failed to process image: ' + error.message, 'error');
    }
}

/**
 * Read extracted text aloud using Web Speech API
 */
function readTextAloud() {
    const text = extractedTextDiv.textContent;
    
    if (!text || !text.trim()) {
        showStatus('No text to read', 'error');
        return;
    }
    
    // Stop any ongoing speech
    if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
    }
    
    // Create new utterance
    currentUtterance = new SpeechSynthesisUtterance(text);
    
    // Set speech properties
    currentUtterance.rate = parseFloat(rateSlider.value);
    currentUtterance.pitch = 1.0;
    currentUtterance.volume = 1.0;
    
    // Try to use a good quality voice
    const voices = speechSynthesis.getVoices();
    if (voices.length > 0) {
        // Prefer Google or Microsoft voices for better quality
        const preferredVoice = voices.find(voice => 
            voice.name.includes('Google') || voice.name.includes('Microsoft')
        );
        if (preferredVoice) {
            currentUtterance.voice = preferredVoice;
        }
    }
    
    // Event listeners
    currentUtterance.onstart = () => {
        isPaused = false;
        readBtn.style.display = 'none';
        pauseBtn.style.display = 'inline-flex';
        stopBtn.style.display = 'inline-flex';
        showStatus('Reading text...', 'info');
    };
    
    currentUtterance.onend = () => {
        readBtn.style.display = 'inline-flex';
        pauseBtn.style.display = 'none';
        stopBtn.style.display = 'none';
        showStatus('Finished reading', 'success');
        setTimeout(() => hideStatus(), 2000);
    };
    
    currentUtterance.onerror = (event) => {
        console.error('Speech error:', event);
        showStatus('Error reading text: ' + event.error, 'error');
        readBtn.style.display = 'inline-flex';
        pauseBtn.style.display = 'none';
        stopBtn.style.display = 'none';
    };
    
    // Start speaking
    speechSynthesis.speak(currentUtterance);
}

/**
 * Pause/Resume speech
 */
function pauseSpeech() {
    if (speechSynthesis.speaking) {
        if (isPaused) {
            speechSynthesis.resume();
            pauseBtn.innerHTML = '<span class="icon">⏸️</span> Pause';
            isPaused = false;
            showStatus('Resumed', 'info');
        } else {
            speechSynthesis.pause();
            pauseBtn.innerHTML = '<span class="icon">▶️</span> Resume';
            isPaused = true;
            showStatus('Paused', 'info');
        }
    }
}

/**
 * Stop speech
 */
function stopSpeech() {
    if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
        readBtn.style.display = 'inline-flex';
        pauseBtn.style.display = 'none';
        stopBtn.style.display = 'none';
        isPaused = false;
        pauseBtn.innerHTML = '<span class="icon">⏸️</span> Pause';
        showStatus('Stopped', 'info');
        setTimeout(() => hideStatus(), 2000);
    }
}

/**
 * Copy extracted text to clipboard
 */
async function copyText() {
    const text = extractedTextDiv.textContent;
    
    if (!text || !text.trim()) {
        showStatus('No text to copy', 'error');
        return;
    }
    
    try {
        await navigator.clipboard.writeText(text);
        showStatus('Text copied to clipboard!', 'success');
        
        // Visual feedback on button
        copyBtn.textContent = '✓ Copied!';
        setTimeout(() => {
            copyBtn.innerHTML = '<span class="icon">📋</span> Copy Text';
        }, 2000);
        
        setTimeout(() => hideStatus(), 2000);
    } catch (error) {
        console.error('Error copying text:', error);
        showStatus('Failed to copy text', 'error');
    }
}

/**
 * Show status message
 */
function showStatus(message, type = 'info') {
    statusMessage.textContent = message;
    statusMessage.className = 'status-message show ' + type;
}

/**
 * Hide status message
 */
function hideStatus() {
    statusMessage.classList.remove('show');
}

// Load voices when they're ready (some browsers load them async)
if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = () => {
        console.log('Voices loaded:', speechSynthesis.getVoices().length);
    };
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    stopCamera();
    if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
    }
});
