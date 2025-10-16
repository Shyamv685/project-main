#!/usr/bin/env python3
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import re
import os
import json
from pathlib import Path
from datetime import datetime, timedelta
# import magic
# import spacy
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import make_pipeline
import hashlib

BASE_DIR = Path(__file__).resolve().parent

# Load spaCy model
nlp = None
# try:
#     nlp = spacy.load("en_core_web_sm")
# except OSError:
#     print("spaCy model not found. Please run: python -m spacy download en_core_web_sm")
#     nlp = None

app = Flask(__name__, static_folder=str(BASE_DIR.parent / "frontend"))

# Enable CORS for all routes
CORS(app)

# Load sample training data and train a simple TF-IDF + NB classifier on startup
TRAIN_FILE = BASE_DIR / "sample_training_data.json"
if TRAIN_FILE.exists():
    with TRAIN_FILE.open() as f:
        samples = json.load(f)
else:
    samples = []

texts = [s['text'] for s in samples]
labels = [s['label'] for s in samples]

classifier = None
if texts and labels:
    try:
        clf = make_pipeline(TfidfVectorizer(), MultinomialNB())
        clf.fit(texts, labels)
        classifier = clf
    except Exception as e:
        print(f"Error training classifier: {e}")

# Regex patterns for quick evidence extraction
EMAIL_RE = re.compile(r"[\w\.-]+@[\w\.-]+")
PHONE_RE = re.compile(r"\+?\d[\d\-\s]{7,}\d")
IP_RE = re.compile(r"\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b")
URL_RE = re.compile(r"https?://[\w\./\-_%?=&]+")
MONEY_RE = re.compile(r"\$\s?\d+[\d,]*(\.\d+)?|\d+[\d,]*\s?(?:USD|INR|Rs\.?|₹)")
DATE_RE = re.compile(r"\b(?:\d{1,2}[\-/]\d{1,2}[\-/]\d{2,4}|\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4})")

def extract_evidence_from_text(text):
    evidence = {}
    evidence['emails'] = EMAIL_RE.findall(text)
    evidence['phones'] = PHONE_RE.findall(text)
    evidence['ips'] = IP_RE.findall(text)
    evidence['urls'] = URL_RE.findall(text)
    evidence['money'] = MONEY_RE.findall(text)
    evidence['dates'] = DATE_RE.findall(text)

    # spaCy NER for persons/orgs/locations
    if nlp:
        doc = nlp(text)
        ents = {'PERSON': [], 'ORG': [], 'GPE': []}
        for ent in doc.ents:
            if ent.label_ in ents:
                ents[ent.label_].append(ent.text)
        evidence['entities'] = ents
    else:
        evidence['entities'] = {'PERSON': [], 'ORG': [], 'GPE': []}
    
    return evidence

def classify_text(text):
    # Prefer trained classifier if available
    if classifier:
        try:
            pred = classifier.predict([text])[0]
            proba = classifier.predict_proba([text])[0].max()
            return {'label': pred, 'confidence': float(proba)}
        except Exception as e:
            print(f"Error in classification: {e}")

    # Fallback: tiny rule-based classifier
    text_l = text.lower()
    if any(tok in text_l for tok in ['transfer', 'account', 'withdraw', 'payment', 'bank', 'credit card', 'password', 'verify']):
        return {'label': 'Fraud', 'confidence': 0.6}
    if any(tok in text_l for tok in ['kill', 'hurt', 'threat', 'attack', 'harm']):
        return {'label': 'Harassment', 'confidence': 0.7}
    if any(tok in text_l for tok in ['malware', 'c2', 'exploit', 'ransom', 'virus', 'trojan', 'backdoor']):
        return {'label': 'Malware', 'confidence': 0.8}
    return {'label': 'Normal', 'confidence': 0.6}

@app.route('/api/analyze_text', methods=['POST'])
def api_analyze_text():
    data = request.json
    text = data.get('text', '')
    if not text:
        return jsonify({'error': 'No text provided'}), 400

    evidence = extract_evidence_from_text(text)
    classification = classify_text(text)
    # simple scoring for priority
    priority_score = len(evidence['emails']) + len(evidence['phones']) + len(evidence['money'])

    response = {
        'evidence': evidence,
        'classification': classification,
        'priority_score': priority_score,
        'summary': f"Found {sum(len(v) for v in evidence['entities'].values())} named entities and {priority_score} high-value hits"
    }
    return jsonify(response)

@app.route('/api/analyze_file', methods=['POST'])
def api_analyze_file():
    # Accepts file upload and performs text extraction (if possible) then calls text analysis
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    f = request.files['file']
    data = f.read()
    mime = magic.from_buffer(data, mime=True)
    text = ''
    
    # If text-like
    if mime and (mime.startswith('text') or 'json' in mime):
        try:
            text = data.decode('utf-8', errors='ignore')
        except:
            text = ''
    
    # If image and pytesseract available, do OCR (optional)
    elif mime and mime.startswith('image'):
        try:
            from PIL import Image
            import io
            import pytesseract
            img = Image.open(io.BytesIO(data))
            text = pytesseract.image_to_string(img)
        except ImportError:
            return jsonify({'error': 'OCR not available. Please install pytesseract and Pillow'}), 400
        except Exception as e:
            # OCR not available or failed
            text = ''
    
    # else: binary file -> no text
    if not text:
        return jsonify({'error': 'No readable text found in file (try uploading .txt or image with pytesseract installed)'}), 400

    evidence = extract_evidence_from_text(text)
    classification = classify_text(text)
    priority_score = len(evidence['emails']) + len(evidence['phones']) + len(evidence['money'])
    response = {
        'evidence': evidence,
        'classification': classification,
        'priority_score': priority_score,
        'summary': f"Found {sum(len(v) for v in evidence['entities'].values())} named entities and {priority_score} high-value hits"
    }
    return jsonify(response)

# In-memory users storage (for demo, persist to file)
USERS_FILE = BASE_DIR / "users.json"
users = []
if USERS_FILE.exists():
    with USERS_FILE.open() as f:
        users = json.load(f)

def save_users():
    with USERS_FILE.open('w') as f:
        json.dump(users, f)

# In-memory attendance storage (for demo, persist to file)
ATTENDANCE_FILE = BASE_DIR / "attendance.json"
attendance_records = []
if ATTENDANCE_FILE.exists():
    with ATTENDANCE_FILE.open() as f:
        attendance_records = json.load(f)

def save_attendance():
    with ATTENDANCE_FILE.open('w') as f:
        json.dump(attendance_records, f)

# In-memory tripets storage (for demo, persist to file)
TRIPETS_FILE = BASE_DIR / "tripets.json"
tripets_records = []
if TRIPETS_FILE.exists():
    with TRIPETS_FILE.open() as f:
        tripets_records = json.load(f)

def save_tripets():
    with TRIPETS_FILE.open('w') as f:
        json.dump(tripets_records, f)

def hash_password(password):
    import hashlib
    return hashlib.sha256(password.encode()).hexdigest()

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    role = data.get('role')  # 'hr' or 'employee'
    name = data.get('name')
    phone = data.get('phone', '')
    qualification = data.get('qualification', '')

    if not email or not password or not role or not name:
        return jsonify({'error': 'Missing required fields'}), 400

    if any(u['email'] == email for u in users):
        return jsonify({'error': 'User already exists'}), 400

    user = {
        'id': len(users) + 1,
        'email': email,
        'password': hash_password(password),
        'role': role,
        'name': name,
        'phone': phone,
        'qualification': qualification
    }
    users.append(user)
    save_users()
    return jsonify({'message': 'User created successfully', 'user': {k: v for k, v in user.items() if k != 'password'}})

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    role = data.get('role')

    user = next((u for u in users if u['email'] == email and u['role'] == role), None)
    if not user or user['password'] != hash_password(password):
        return jsonify({'error': 'Invalid credentials'}), 401

    return jsonify({'message': 'Login successful', 'user': {k: v for k, v in user.items() if k != 'password'}})

@app.route('/api/update_profile', methods=['PUT'])
def update_profile():
    # Handle both JSON and FormData
    if request.content_type and 'multipart/form-data' in request.content_type:
        name = request.form.get('name')
        phone = request.form.get('phone')
        qualification = request.form.get('qualification')
        profile_pic = request.files.get('profilePic')
    else:
        data = request.json
        name = data.get('name')
        phone = data.get('phone')
        qualification = data.get('qualification', '')
        profile_pic = None
    
    if not name:
        return jsonify({'error': 'Name is required'}), 400
    
    # Get user from localStorage-like context (in a real app, use JWT/session)
    # For demo, we'll assume the user is authenticated and get from request context
    # In production, you'd get user_id from JWT token
    user_email = request.headers.get('X-User-Email')  # This would come from frontend auth
    user_role = request.headers.get('X-User-Role')
    
    if not user_email or not user_role:
        return jsonify({'error': 'Authentication required'}), 401
    
    user = next((u for u in users if u['email'] == user_email and u['role'] == user_role), None)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    user['name'] = name
    user['phone'] = phone
    user['qualification'] = qualification
    
    # Handle profile picture upload
    if profile_pic:
        # Save the file (in a real app, you'd use a proper file storage service)
        filename = f"profile_{user['id']}_{profile_pic.filename}"
        upload_dir = BASE_DIR / "uploads"
        upload_dir.mkdir(exist_ok=True)
        profile_pic.save(str(upload_dir / filename))
        user['profilePic'] = f"/uploads/{filename}"
    
    save_users()
    
    return jsonify({'message': 'Profile updated successfully', 'user': {k: v for k, v in user.items() if k != 'password'}})

# Attendance endpoints
@app.route('/api/checkin', methods=['POST'])
def checkin():
    user_email = request.headers.get('X-User-Email')
    user_role = request.headers.get('X-User-Role')

    if not user_email or not user_role:
        return jsonify({'error': 'Authentication required'}), 401

    user = next((u for u in users if u['email'] == user_email and u['role'] == user_role), None)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    today = datetime.now().strftime('%Y-%m-%d')
    # Check if already checked in today
    existing = next((r for r in attendance_records if r['employeeId'] == user['id'] and r['date'] == today), None)
    if existing and existing['checkIn']:
        return jsonify({'error': 'Already checked in today'}), 400

    checkin_time = datetime.now().strftime('%I:%M %p')
    if existing:
        existing['checkIn'] = checkin_time
        existing['status'] = 'Present'
    else:
        record = {
            'id': len(attendance_records) + 1,
            'employeeId': user['id'],
            'date': today,
            'checkIn': checkin_time,
            'checkOut': None,
            'hours': 0,
            'status': 'Present'
        }
        attendance_records.append(record)

    save_attendance()
    return jsonify({'message': 'Checked in successfully', 'checkInTime': checkin_time})

@app.route('/api/checkout', methods=['POST'])
def checkout():
    user_email = request.headers.get('X-User-Email')
    user_role = request.headers.get('X-User-Role')

    if not user_email or not user_role:
        return jsonify({'error': 'Authentication required'}), 401

    user = next((u for u in users if u['email'] == user_email and u['role'] == user_role), None)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    now = datetime.now()
    today = now.strftime('%Y-%m-%d')

    # First, check if there's an open check-in from today
    record = next((r for r in attendance_records if r['employeeId'] == user['id'] and r['date'] == today and r['checkIn'] and not r['checkOut']), None)

    # If no open check-in today, check yesterday for overnight shifts
    if not record:
        yesterday = (now.replace(hour=0, minute=0, second=0, microsecond=0) - timedelta(days=1)).strftime('%Y-%m-%d')
        record = next((r for r in attendance_records if r['employeeId'] == user['id'] and r['date'] == yesterday and r['checkIn'] and not r['checkOut']), None)

    if not record or not record['checkIn']:
        return jsonify({'error': 'No open check-in found'}), 400

    if record['checkOut']:
        return jsonify({'error': 'Already checked out'}), 400

    checkout_time = now.strftime('%I:%M %p')
    record['checkOut'] = checkout_time

    # Calculate hours - handle cross-day checkouts
    checkin_datetime = datetime.strptime(f"{record['date']} {record['checkIn']}", '%Y-%m-%d %I:%M %p')
    checkout_datetime = now

    # If checkout is before checkin (shouldn't happen normally), assume next day
    if checkout_datetime < checkin_datetime:
        checkout_datetime += timedelta(days=1)

    hours = (checkout_datetime - checkin_datetime).total_seconds() / 3600
    record['hours'] = round(hours, 1)

    save_attendance()
    return jsonify({'message': 'Checked out successfully', 'checkOutTime': checkout_time, 'hours': record['hours']})

@app.route('/api/attendance', methods=['GET'])
def get_attendance():
    user_email = request.headers.get('X-User-Email')
    user_role = request.headers.get('X-User-Role')

    if not user_email or not user_role:
        return jsonify({'error': 'Authentication required'}), 401

    user = next((u for u in users if u['email'] == user_email and u['role'] == user_role), None)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    if user_role == 'hr':
        # HR can see all attendance
        records = attendance_records
    else:
        # Employees can only see their own
        records = [r for r in attendance_records if r['employeeId'] == user['id']]

    # Sort by date descending
    records.sort(key=lambda x: x['date'], reverse=True)

    # Add employee names to records
    for record in records:
        employee = next((u for u in users if u['id'] == record['employeeId']), None)
        record['employeeName'] = employee['name'] if employee else 'Unknown'

    return jsonify({'attendance': records})

# Tripets endpoints
@app.route('/api/tripets', methods=['GET'])
def get_tripets():
    user_email = request.headers.get('X-User-Email')
    user_role = request.headers.get('X-User-Role')

    if not user_email or not user_role:
        return jsonify({'error': 'Authentication required'}), 401

    user = next((u for u in users if u['email'] == user_email and u['role'] == user_role), None)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    if user_role == 'hr':
        # HR can see all tripets
        records = tripets_records
    else:
        # Employees can only see their own
        records = [r for r in tripets_records if r['employeeId'] == user['id']]

    # Sort by date descending
    records.sort(key=lambda x: x['date'], reverse=True)

    # Add employee names to records
    for record in records:
        employee = next((u for u in users if u['id'] == record['employeeId']), None)
        record['employeeName'] = employee['name'] if employee else 'Unknown'

    return jsonify({'tripets': records})

@app.route('/api/tripets', methods=['POST'])
def create_tripet():
    user_email = request.headers.get('X-User-Email')
    user_role = request.headers.get('X-User-Role')

    if not user_email or not user_role:
        return jsonify({'error': 'Authentication required'}), 401

    user = next((u for u in users if u['email'] == user_email and u['role'] == user_role), None)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.json
    destination = data.get('destination')
    purpose = data.get('purpose')
    start_date = data.get('startDate')
    end_date = data.get('endDate')
    accommodation = data.get('accommodation', '')
    transportation = data.get('transportation', '')

    if not destination or not purpose or not start_date or not end_date:
        return jsonify({'error': 'Missing required fields'}), 400

    tripet = {
        'id': len(tripets_records) + 1,
        'employeeId': user['id'],
        'destination': destination,
        'purpose': purpose,
        'startDate': start_date,
        'endDate': end_date,
        'accommodation': accommodation,
        'transportation': transportation,
        'status': 'Pending',
        'date': datetime.now().strftime('%Y-%m-%d')
    }
    tripets_records.append(tripet)
    save_tripets()

    return jsonify({'message': 'Tripet created successfully', 'tripet': tripet})

@app.route('/api/tripets/<int:tripet_id>', methods=['PUT'])
def update_tripet(tripet_id):
    user_email = request.headers.get('X-User-Email')
    user_role = request.headers.get('X-User-Role')

    if not user_email or not user_role:
        return jsonify({'error': 'Authentication required'}), 401

    user = next((u for u in users if u['email'] == user_email and u['role'] == user_role), None)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    tripet = next((t for t in tripets_records if t['id'] == tripet_id), None)
    if not tripet:
        return jsonify({'error': 'Tripet not found'}), 404

    # Only HR can update status, employees can only update their own tripets
    if user_role != 'hr' and tripet['employeeId'] != user['id']:
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.json
    if 'status' in data and user_role == 'hr':
        tripet['status'] = data['status']
    elif user_role != 'hr':
        # Employees can update details but not status
        for field in ['destination', 'purpose', 'startDate', 'endDate', 'accommodation', 'transportation']:
            if field in data:
                tripet[field] = data[field]

    save_tripets()
    return jsonify({'message': 'Tripet updated successfully', 'tripet': tripet})

@app.route('/api/tripets/<int:tripet_id>', methods=['DELETE'])
def delete_tripet(tripet_id):
    user_email = request.headers.get('X-User-Email')
    user_role = request.headers.get('X-User-Role')

    if not user_email or not user_role:
        return jsonify({'error': 'Authentication required'}), 401

    user = next((u for u in users if u['email'] == user_email and u['role'] == user_role), None)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    tripet = next((t for t in tripets_records if t['id'] == tripet_id), None)
    if not tripet:
        return jsonify({'error': 'Tripet not found'}), 404

    # Only HR can delete any tripet, employees can only delete their own pending tripets
    if user_role != 'hr' and (tripet['employeeId'] != user['id'] or tripet['status'] != 'Pending'):
        return jsonify({'error': 'Unauthorized'}), 403

    tripets_records.remove(tripet)
    save_tripets()
    return jsonify({'message': 'Tripet deleted successfully'})

# Serve uploaded files
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(str(BASE_DIR / "uploads"), filename)

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'model_loaded': nlp is not None, 'classifier_loaded': classifier is not None})

# Serve frontend static files
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    # If running from file:// frontend, this isn't used. But included for completeness.
    if path != "" and (BASE_DIR.parent / 'frontend' / path).exists():
        return send_from_directory(str(BASE_DIR.parent / 'frontend'), path)
    return send_from_directory(str(BASE_DIR.parent / 'frontend'), 'index.html')

if __name__ == '__main__':
    print("Starting AI Forensics Expo Demo...")
    print("Make sure to install dependencies: pip install -r backend/requirements.txt")
    print("And download spaCy model: python -m spacy download en_core_web_sm")
    print("Server will run at http://127.0.0.1:5000")
    app.run(debug=True, host='127.0.0.1', port=5000)
