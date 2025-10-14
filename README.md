# AI-Driven Digital Forensics — Expo Demo

## Summary
A lightweight demo app that accepts text or image uploads and returns:
- extracted evidence (emails, phone numbers, IPs, URLs, dates, money mentions)
- NLP named entities (PERSON, ORG, GPE)
- a simple classification of the content into categories (Fraud, Harassment, Malware, Normal)

This is built for an expo: interactive, simple, and extendable.

## Project Structure
```
├── backend/
│   ├── app.py                    # Main Flask application
│   ├── requirements.txt          # Python dependencies
│   └── sample_training_data.json # Training data for classifier
├── frontend/
│   ├── index.html                # Main web interface
│   └── script.js                 # Frontend JavaScript
└── README.md                     # This file
```

## Features
- **Text Analysis**: Paste text directly for analysis
- **File Upload**: Upload .txt files or images (with OCR)
- **Evidence Extraction**: Automatically extracts emails, phone numbers, IPs, URLs, dates, and money amounts
- **Named Entity Recognition**: Identifies people, organizations, and locations
- **Classification**: Categorizes content as Fraud, Harassment, Malware, or Normal
- **Priority Scoring**: Simple scoring based on extracted evidence

## How to Run (Windows/Linux/macOS)

### Prerequisites
- Python 3.9 or higher
- pip (Python package manager)

### Installation Steps

1. **Clone or download the project** to your local machine.

2. **Navigate to the project directory**:
   ```bash
   cd path/to/project
   ```

3. **Create a virtual environment** (recommended):
   ```bash
   # On Windows
   python -m venv venv
   venv\Scripts\activate

   # On macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

4. **Install backend dependencies**:
   ```bash
   pip install -r backend/requirements.txt
   ```

5. **Download the spaCy English model**:
   ```bash
   python -m spacy download en_core_web_sm
   ```

6. **Start the backend server**:
   ```bash
   python backend/app.py
   ```
   The backend will run at http://127.0.0.1:5000

7. **Open the frontend**:
   - Open `frontend/index.html` in your web browser
   - Or serve it with a simple HTTP server:
     ```bash
     # Python 3
     python -m http.server 8000 --directory frontend
     # Then visit http://localhost:8000
     ```

### Optional: OCR Support for Images
To enable OCR for image uploads, install additional dependencies:

```bash
pip install pytesseract==0.3.10 Pillow==9.5.0
```

**Note**: You also need to install Tesseract OCR on your system:
- **Windows**: Download from https://github.com/UB-Mannheim/tesseract/wiki
- **macOS**: `brew install tesseract`
- **Linux**: `sudo apt-get install tesseract-ocr`

## Usage

1. **Text Analysis**:
   - Paste suspicious text into the text area
   - Click "Analyze Text"
   - View results in the dashboard

2. **File Upload**:
   - Click "Choose File" to select a .txt file or image
   - Click "Analyze File"
   - View results in the dashboard

3. **Results Include**:
   - **Classification**: Category and confidence score
   - **Extracted Evidence**: Emails, phone numbers, IPs, URLs, money, dates
   - **Named Entities**: People, organizations, locations
   - **Priority Score**: Based on extracted evidence

## API Endpoints

- `POST /api/analyze_text` - Analyze text content
- `POST /api/analyze_file` - Analyze uploaded file
- `GET /api/health` - Health check endpoint

## Troubleshooting

### Common Issues

1. **spaCy model not found**:
   ```
   OSError: [E050] Can't find model 'en_core_web_sm'
   ```
   **Solution**: Run `python -m spacy download en_core_web_sm`

2. **Module not found errors**:
   ```
   ModuleNotFoundError: No module named 'flask'
   ```
   **Solution**: Ensure virtual environment is activated and run `pip install -r backend/requirements.txt`

3. **Port already in use**:
   ```
   OSError: [Errno 48] Address already in use
   ```
   **Solution**: Change port in `backend/app.py` or kill the process using port 5000

4. **CORS errors in browser**:
   **Solution**: Ensure backend is running on 127.0.0.1:5000 and frontend is opened correctly

### Development Tips

- **Testing**: Use the provided sample data in `sample_training_data.json`
- **Extending**: Add more training data to improve classification
- **Debugging**: Check browser console for frontend errors and terminal for backend errors
- **Customization**: Modify regex patterns in `backend/app.py` for different evidence types

## Security Note
This is a demo application. For production use:
- Add proper authentication
- Implement rate limiting
- Sanitize file uploads
- Use HTTPS
- Add input validation

## License
This project is provided as-is for educational and demonstration purposes.
