#!/usr/bin/env python3
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import re
import os
import json
from pathlib import Path
from datetime import datetime, timedelta
from chatbot import get_chatbot
# import magic
# import spacy
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import make_pipeline
import hashlib
import logging

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

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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

# In-memory meetings storage (for demo, persist to file)
MEETINGS_FILE = BASE_DIR / "meetings.json"
meetings_records = []
if MEETINGS_FILE.exists():
    with MEETINGS_FILE.open() as f:
        meetings_records = json.load(f)

def save_meetings():
    with MEETINGS_FILE.open('w') as f:
        json.dump(meetings_records, f)

# In-memory timesheets storage (for demo, persist to file)
TIMESHEETS_FILE = BASE_DIR / "timesheets.json"
timesheets_records = []
if TIMESHEETS_FILE.exists():
    with TIMESHEETS_FILE.open() as f:
        timesheets_records = json.load(f)

def save_timesheets():
    with TIMESHEETS_FILE.open('w') as f:
        json.dump(timesheets_records, f)

# In-memory trainings storage (for demo, persist to file)
TRAININGS_FILE = BASE_DIR / "trainings.json"
trainings_records = []
if TRAININGS_FILE.exists():
    with TRAININGS_FILE.open() as f:
        trainings_records = json.load(f)

def save_trainings():
    with TRAININGS_FILE.open('w') as f:
        json.dump(trainings_records, f)

# In-memory enrollments storage (for demo, persist to file)
ENROLLMENTS_FILE = BASE_DIR / "enrollments.json"
enrollments_records = []
if ENROLLMENTS_FILE.exists():
    with ENROLLMENTS_FILE.open() as f:
        enrollments_records = json.load(f)

def save_enrollments():
    with ENROLLMENTS_FILE.open('w') as f:
        json.dump(enrollments_records, f)

# In-memory certificates storage (for demo, persist to file)
CERTIFICATES_FILE = BASE_DIR / "certificates.json"
certificates_records = []
if CERTIFICATES_FILE.exists():
    with CERTIFICATES_FILE.open() as f:
        certificates_records = json.load(f)

def save_certificates():
    with CERTIFICATES_FILE.open('w') as f:
        json.dump(certificates_records, f)

# In-memory feedbacks storage (for demo, persist to file)
FEEDBACKS_FILE = BASE_DIR / "feedbacks.json"
feedbacks_records = []
if FEEDBACKS_FILE.exists():
    with FEEDBACKS_FILE.open() as f:
        feedbacks_records = json.load(f)

def save_feedbacks():
    with FEEDBACKS_FILE.open('w') as f:
        json.dump(feedbacks_records, f)

# In-memory announcements storage (for demo, persist to file)
ANNOUNCEMENTS_FILE = BASE_DIR / "announcements.json"
announcements_records = []
if ANNOUNCEMENTS_FILE.exists():
    with ANNOUNCEMENTS_FILE.open() as f:
        announcements_records = json.load(f)

def save_announcements():
    with ANNOUNCEMENTS_FILE.open('w') as f:
        json.dump(announcements_records, f)

# In-memory documents storage (for demo, persist to file)
DOCUMENTS_FILE = BASE_DIR / "documents.json"
documents_records = []
if DOCUMENTS_FILE.exists():
    with DOCUMENTS_FILE.open() as f:
        documents_records = json.load(f)

def save_documents():
    with DOCUMENTS_FILE.open('w') as f:
        json.dump(documents_records, f)

# In-memory payroll storage (for demo, persist to file)
PAYROLL_FILE = BASE_DIR / "payroll.json"
payroll_records = []
if PAYROLL_FILE.exists():
    with PAYROLL_FILE.open() as f:
        payroll_records = json.load(f)

def save_payroll():
    with PAYROLL_FILE.open('w') as f:
        json.dump(payroll_records, f)

# In-memory leave storage (for demo, persist to file)
LEAVE_FILE = BASE_DIR / "leaves.json"
leave_records = []
if LEAVE_FILE.exists():
    with LEAVE_FILE.open() as f:
        leave_records = json.load(f)

def save_leaves():
    with LEAVE_FILE.open('w') as f:
        json.dump(leave_records, f)

# In-memory settings storage (for demo, persist to file)
SETTINGS_FILE = BASE_DIR / "settings.json"
settings = {
    'companyName': '',
    'companyEmail': '',
    'companyPhone': '',
    'workingHours': {'start': '09:00', 'end': '17:00'},
    'leavePolicy': {'annualLeave': 25, 'sickLeave': 10},
    'notifications': {'email': True, 'sms': False}
}
if SETTINGS_FILE.exists():
    with SETTINGS_FILE.open() as f:
        settings = json.load(f)

def save_settings():
    with SETTINGS_FILE.open('w') as f:
        json.dump(settings, f)

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

    logger.info(f"Signup attempt for email: {email}, role: {role}")

    if not email or not password or not role or not name:
        logger.warning("Signup failed: Missing required fields")
        return jsonify({'error': 'Missing required fields'}), 400

    if any(u['email'] == email for u in users):
        logger.warning(f"Signup failed: User already exists with email {email}")
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
    logger.info(f"User created successfully: {user['id']}")
    return jsonify({'message': 'User created successfully', 'user': {k: v for k, v in user.items() if k != 'password'}})

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    role = data.get('role')

    logger.info(f"Login attempt for email: {email}, role: {role}")

    user = next((u for u in users if u['email'] == email and u['role'] == role), None)
    if not user or user['password'] != hash_password(password):
        logger.warning(f"Login failed for email: {email}")
        return jsonify({'error': 'Invalid credentials'}), 401

    logger.info(f"Login successful for user: {user['id']}")
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
        logger.warning("Check-in request without authentication")
        return jsonify({'error': 'Authentication required'}), 401

    user = next((u for u in users if u['email'] == user_email and u['role'] == user_role), None)
    if not user:
        logger.warning(f"Check-in request for non-existent user: {user_email}")
        return jsonify({'error': 'User not found'}), 404

    today = datetime.now().strftime('%Y-%m-%d')
    # Check if already checked in today
    existing = next((r for r in attendance_records if r['employeeId'] == user['id'] and r['date'] == today), None)
    if existing and existing['checkIn']:
        logger.warning(f"User {user['id']} attempted to check in again on {today}")
        return jsonify({'error': 'Already checked in today'}), 400

    checkin_time = datetime.now().strftime('%I:%M %p')
    if existing:
        existing['checkIn'] = checkin_time
        existing['status'] = 'Present'
        logger.info(f"User {user['id']} updated check-in time to {checkin_time} on {today}")
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
        logger.info(f"User {user['id']} checked in at {checkin_time} on {today}")

    save_attendance()
    return jsonify({'message': 'Checked in successfully', 'checkInTime': checkin_time})

@app.route('/api/checkout', methods=['POST'])
def checkout():
    user_email = request.headers.get('X-User-Email')
    user_role = request.headers.get('X-User-Role')

    if not user_email or not user_role:
        logger.warning("Check-out request without authentication")
        return jsonify({'error': 'Authentication required'}), 401

    user = next((u for u in users if u['email'] == user_email and u['role'] == user_role), None)
    if not user:
        logger.warning(f"Check-out request for non-existent user: {user_email}")
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
        logger.warning(f"No open check-in found for user {user['id']}")
        return jsonify({'error': 'No open check-in found'}), 400

    if record['checkOut']:
        logger.warning(f"User {user['id']} attempted to check out again")
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

    logger.info(f"User {user['id']} checked out at {checkout_time}, worked {record['hours']} hours")

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

# Meetings endpoints
@app.route('/api/meetings', methods=['GET'])
def get_meetings():
    user_email = request.headers.get('X-User-Email')
    user_role = request.headers.get('X-User-Role')

    if not user_email or not user_role:
        return jsonify({'error': 'Authentication required'}), 401

    user = next((u for u in users if u['email'] == user_email and u['role'] == user_role), None)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    if user_role == 'hr':
        # HR can see all meetings
        records = meetings_records
    else:
        # Employees can see meetings they're invited to or created
        records = [r for r in meetings_records if r['organizerId'] == user['id'] or user['id'] in r.get('participants', [])]

    # Sort by date and time descending
    records.sort(key=lambda x: (x['date'], x['startTime']), reverse=True)

    # Add organizer names to records
    for record in records:
        organizer = next((u for u in users if u['id'] == record['organizerId']), None)
        record['organizerName'] = organizer['name'] if organizer else 'Unknown'

    return jsonify({'meetings': records})

@app.route('/api/meetings', methods=['POST'])
def create_meeting():
    user_email = request.headers.get('X-User-Email')
    user_role = request.headers.get('X-User-Role')

    if not user_email or not user_role:
        return jsonify({'error': 'Authentication required'}), 401

    user = next((u for u in users if u['email'] == user_email and u['role'] == user_role), None)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.json
    title = data.get('title')
    date = data.get('date')
    start_time = data.get('startTime')
    end_time = data.get('endTime')
    location = data.get('location', '')
    agenda = data.get('agenda', '')
    participants = data.get('participants', [])

    if not title or not date or not start_time or not end_time:
        return jsonify({'error': 'Missing required fields'}), 400

    meeting = {
        'id': len(meetings_records) + 1,
        'organizerId': user['id'],
        'title': title,
        'date': date,
        'startTime': start_time,
        'endTime': end_time,
        'location': location,
        'agenda': agenda,
        'participants': participants,
        'status': 'Scheduled',
        'createdAt': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    }
    meetings_records.append(meeting)
    save_meetings()

    return jsonify({'message': 'Meeting created successfully', 'meeting': meeting})

@app.route('/api/meetings/<int:meeting_id>', methods=['PUT'])
def update_meeting(meeting_id):
    user_email = request.headers.get('X-User-Email')
    user_role = request.headers.get('X-User-Role')

    if not user_email or not user_role:
        return jsonify({'error': 'Authentication required'}), 401

    user = next((u for u in users if u['email'] == user_email and u['role'] == user_role), None)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    meeting = next((m for m in meetings_records if m['id'] == meeting_id), None)
    if not meeting:
        return jsonify({'error': 'Meeting not found'}), 404

    # Only organizer or HR can update meetings
    if user_role != 'hr' and meeting['organizerId'] != user['id']:
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.json
    for field in ['title', 'date', 'startTime', 'endTime', 'location', 'agenda', 'participants', 'status']:
        if field in data:
            meeting[field] = data[field]

    save_meetings()
    return jsonify({'message': 'Meeting updated successfully', 'meeting': meeting})

@app.route('/api/meetings/<int:meeting_id>', methods=['DELETE'])
def delete_meeting(meeting_id):
    user_email = request.headers.get('X-User-Email')
    user_role = request.headers.get('X-User-Role')

    if not user_email or not user_role:
        return jsonify({'error': 'Authentication required'}), 401

    user = next((u for u in users if u['email'] == user_email and u['role'] == user_role), None)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    meeting = next((m for m in meetings_records if m['id'] == meeting_id), None)
    if not meeting:
        return jsonify({'error': 'Meeting not found'}), 404

    # Only organizer or HR can delete meetings
    if user_role != 'hr' and meeting['organizerId'] != user['id']:
        return jsonify({'error': 'Unauthorized'}), 403

    meetings_records.remove(meeting)
    save_meetings()
    return jsonify({'message': 'Meeting deleted successfully'})

# Timesheets endpoints
@app.route('/api/timesheets', methods=['GET'])
def get_timesheets():
    user_email = request.headers.get('X-User-Email')
    user_role = request.headers.get('X-User-Role')

    if not user_email or not user_role:
        return jsonify({'error': 'Authentication required'}), 401

    user = next((u for u in users if u['email'] == user_email and u['role'] == user_role), None)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    # Get query parameters for filtering
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')

    if user_role == 'hr':
        # HR can see all timesheets
        records = timesheets_records
    else:
        # Employees can only see their own timesheets
        records = [r for r in timesheets_records if r['employeeId'] == user['id']]

    # Filter by date range if provided
    if start_date and end_date:
        records = [r for r in records if start_date <= r['date'] <= end_date]

    # Sort by date descending
    records.sort(key=lambda x: x['date'], reverse=True)

    # Add employee names to records
    for record in records:
        employee = next((u for u in users if u['id'] == record['employeeId']), None)
        record['employeeName'] = employee['name'] if employee else 'Unknown'

    return jsonify({'timesheets': records})

@app.route('/api/timesheets', methods=['POST'])
def create_timesheet():
    user_email = request.headers.get('X-User-Email')
    user_role = request.headers.get('X-User-Role')

    if not user_email or not user_role:
        return jsonify({'error': 'Authentication required'}), 401

    user = next((u for u in users if u['email'] == user_email and u['role'] == user_role), None)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.json
    date = data.get('date')
    project = data.get('project', '')
    task = data.get('task', '')
    hours = data.get('hours')
    description = data.get('description', '')

    if not date or hours is None:
        return jsonify({'error': 'Missing required fields'}), 400

    if not isinstance(hours, (int, float)) or hours < 0 or hours > 24:
        return jsonify({'error': 'Invalid hours value'}), 400

    timesheet = {
        'id': len(timesheets_records) + 1,
        'employeeId': user['id'],
        'date': date,
        'project': project,
        'task': task,
        'hours': float(hours),
        'description': description,
        'createdAt': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'updatedAt': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    }
    timesheets_records.append(timesheet)
    save_timesheets()

    return jsonify({'message': 'Timesheet entry created successfully', 'timesheet': timesheet})

@app.route('/api/timesheets/<int:timesheet_id>', methods=['PUT'])
def update_timesheet(timesheet_id):
    user_email = request.headers.get('X-User-Email')
    user_role = request.headers.get('X-User-Role')

    if not user_email or not user_role:
        return jsonify({'error': 'Authentication required'}), 401

    user = next((u for u in users if u['email'] == user_email and u['role'] == user_role), None)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    timesheet = next((t for t in timesheets_records if t['id'] == timesheet_id), None)
    if not timesheet:
        return jsonify({'error': 'Timesheet entry not found'}), 404

    # Only the owner or HR can update timesheets
    if user_role != 'hr' and timesheet['employeeId'] != user['id']:
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.json
    for field in ['date', 'project', 'task', 'description']:
        if field in data:
            timesheet[field] = data[field]

    if 'hours' in data:
        hours = data['hours']
        if not isinstance(hours, (int, float)) or hours < 0 or hours > 24:
            return jsonify({'error': 'Invalid hours value'}), 400
        timesheet['hours'] = float(hours)

    timesheet['updatedAt'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    save_timesheets()
    return jsonify({'message': 'Timesheet entry updated successfully', 'timesheet': timesheet})

@app.route('/api/timesheets/<int:timesheet_id>', methods=['DELETE'])
def delete_timesheet(timesheet_id):
    user_email = request.headers.get('X-User-Email')
    user_role = request.headers.get('X-User-Role')

    if not user_email or not user_role:
        return jsonify({'error': 'Authentication required'}), 401

    user = next((u for u in users if u['email'] == user_email and u['role'] == user_role), None)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    timesheet = next((t for t in timesheets_records if t['id'] == timesheet_id), None)
    if not timesheet:
        return jsonify({'error': 'Timesheet entry not found'}), 404

    # Only the owner or HR can delete timesheets
    if user_role != 'hr' and timesheet['employeeId'] != user['id']:
        return jsonify({'error': 'Unauthorized'}), 403

    timesheets_records.remove(timesheet)
    save_timesheets()
    return jsonify({'message': 'Timesheet entry deleted successfully'})

@app.route('/api/timesheets/summary', methods=['GET'])
def get_timesheet_summary():
    user_email = request.headers.get('X-User-Email')
    user_role = request.headers.get('X-User-Role')

    if not user_email or not user_role:
        return jsonify({'error': 'Authentication required'}), 401

    user = next((u for u in users if u['email'] == user_email and u['role'] == user_role), None)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    # Get query parameters
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    period = request.args.get('period', 'weekly')  # weekly, monthly, custom

    if user_role == 'hr':
        # HR can see all summaries
        all_records = timesheets_records
    else:
        # Employees can only see their own summaries
        all_records = [r for r in timesheets_records if r['employeeId'] == user['id']]

    # Filter by date range
    if start_date and end_date:
        filtered_records = [r for r in all_records if start_date <= r['date'] <= end_date]
    else:
        # Default to current week/month
        today = datetime.now()
        if period == 'weekly':
            start_of_week = today - timedelta(days=today.weekday())
            end_of_week = start_of_week + timedelta(days=6)
        elif period == 'monthly':
            start_of_month = today.replace(day=1)
            end_of_month = (start_of_month + timedelta(days=32)).replace(day=1) - timedelta(days=1)
        else:
            # Default to current week
            start_of_week = today - timedelta(days=today.weekday())
            end_of_week = start_of_week + timedelta(days=6)

        start_date = start_of_week.strftime('%Y-%m-%d') if period == 'weekly' else start_of_month.strftime('%Y-%m-%d')
        end_date = end_of_week.strftime('%Y-%m-%d') if period == 'weekly' else end_of_month.strftime('%Y-%m-%d')
        filtered_records = [r for r in all_records if start_date <= r['date'] <= end_date]

    # Calculate summary
    total_hours = sum(r['hours'] for r in filtered_records)
    total_entries = len(filtered_records)

    # Group by project
    project_summary = {}
    for record in filtered_records:
        project = record.get('project', 'No Project')
        if project not in project_summary:
            project_summary[project] = {'hours': 0, 'entries': 0}
        project_summary[project]['hours'] += record['hours']
        project_summary[project]['entries'] += 1

    # Group by employee (for HR view)
    employee_summary = {}
    if user_role == 'hr':
        for record in filtered_records:
            employee_id = record['employeeId']
            employee = next((u for u in users if u['id'] == employee_id), None)
            employee_name = employee['name'] if employee else 'Unknown'
            if employee_name not in employee_summary:
                employee_summary[employee_name] = {'hours': 0, 'entries': 0}
            employee_summary[employee_name]['hours'] += record['hours']
            employee_summary[employee_name]['entries'] += 1

    summary = {
        'period': {
            'start_date': start_date,
            'end_date': end_date,
            'type': period
        },
        'total_hours': total_hours,
        'total_entries': total_entries,
        'project_summary': project_summary,
        'employee_summary': employee_summary if user_role == 'hr' else None
    }

    return jsonify(summary)

# Training endpoints
@app.route('/api/trainings', methods=['GET'])
def get_trainings():
    user_email = request.headers.get('X-User-Email')
    user_role = request.headers.get('X-User-Role')

    if not user_email or not user_role:
        return jsonify({'error': 'Authentication required'}), 401

    user = next((u for u in users if u['email'] == user_email and u['role'] == user_role), None)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    # Get enrolled trainings for this user
    enrolled_training_ids = [e['trainingId'] for e in enrollments_records if e['employeeId'] == user['id']]

    # Add enrollment status to trainings
    trainings_with_status = []
    for training in trainings_records:
        training_copy = training.copy()
        training_copy['isEnrolled'] = training['id'] in enrolled_training_ids
        trainings_with_status.append(training_copy)

    return jsonify({'trainings': trainings_with_status})

@app.route('/api/trainings/enroll', methods=['POST'])
def enroll_training():
    user_email = request.headers.get('X-User-Email')
    user_role = request.headers.get('X-User-Role')

    if not user_email or not user_role:
        return jsonify({'error': 'Authentication required'}), 401

    user = next((u for u in users if u['email'] == user_email and u['role'] == user_role), None)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.json
    training_id = data.get('trainingId')

    if not training_id:
        return jsonify({'error': 'Training ID required'}), 400

    training = next((t for t in trainings_records if t['id'] == training_id), None)
    if not training:
        return jsonify({'error': 'Training not found'}), 404

    if training['seatsAvailable'] <= 0:
        return jsonify({'error': 'No seats available'}), 400

    # Check if already enrolled
    existing = next((e for e in enrollments_records if e['employeeId'] == user['id'] and e['trainingId'] == training_id), None)
    if existing:
        return jsonify({'error': 'Already enrolled'}), 400

    enrollment = {
        'id': len(enrollments_records) + 1,
        'employeeId': user['id'],
        'trainingId': training_id,
        'enrolledAt': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'status': 'Enrolled',
        'progress': 0
    }
    enrollments_records.append(enrollment)

    # Decrease available seats
    training['seatsAvailable'] -= 1
    save_trainings()
    save_enrollments()

    return jsonify({'message': 'Successfully enrolled', 'enrollment': enrollment})

@app.route('/api/trainings/my', methods=['GET'])
def get_my_trainings():
    user_email = request.headers.get('X-User-Email')
    user_role = request.headers.get('X-User-Role')

    if not user_email or not user_role:
        return jsonify({'error': 'Authentication required'}), 401

    user = next((u for u in users if u['email'] == user_email and u['role'] == user_role), None)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    # Get user's enrollments
    user_enrollments = [e for e in enrollments_records if e['employeeId'] == user['id']]

    # Combine with training details
    my_trainings = []
    for enrollment in user_enrollments:
        training = next((t for t in trainings_records if t['id'] == enrollment['trainingId']), None)
        if training:
            combined = {
                **training,
                'enrollment': enrollment
            }
            my_trainings.append(combined)

    return jsonify({'trainings': my_trainings})

@app.route('/api/trainings/<int:training_id>/complete', methods=['POST'])
def complete_training(training_id):
    user_email = request.headers.get('X-User-Email')
    user_role = request.headers.get('X-User-Role')

    if not user_email or not user_role:
        return jsonify({'error': 'Authentication required'}), 401

    user = next((u for u in users if u['email'] == user_email and u['role'] == user_role), None)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    enrollment = next((e for e in enrollments_records if e['employeeId'] == user['id'] and e['trainingId'] == training_id), None)
    if not enrollment:
        return jsonify({'error': 'Not enrolled in this training'}), 404

    enrollment['status'] = 'Completed'
    enrollment['progress'] = 100
    enrollment['completedAt'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    # Generate certificate
    training = next((t for t in trainings_records if t['id'] == training_id), None)
    certificate = {
        'id': len(certificates_records) + 1,
        'employeeId': user['id'],
        'trainingId': training_id,
        'trainingTitle': training['title'],
        'trainer': training['trainer'],
        'completionDate': enrollment['completedAt'],
        'certificateUrl': f'/certificates/{len(certificates_records) + 1}.pdf'
    }
    certificates_records.append(certificate)

    save_enrollments()
    save_certificates()

    return jsonify({'message': 'Training completed', 'certificate': certificate})

@app.route('/api/trainings/<int:training_id>/certificate', methods=['GET'])
def get_certificate(training_id):
    user_email = request.headers.get('X-User-Email')
    user_role = request.headers.get('X-User-Role')

    if not user_email or not user_role:
        return jsonify({'error': 'Authentication required'}), 401

    user = next((u for u in users if u['email'] == user_email and u['role'] == user_role), None)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    certificate = next((c for c in certificates_records if c['employeeId'] == user['id'] and c['trainingId'] == training_id), None)
    if not certificate:
        return jsonify({'error': 'Certificate not found'}), 404

    return jsonify({'certificate': certificate})

@app.route('/api/trainings/<int:training_id>/feedback', methods=['POST'])
def submit_feedback(training_id):
    user_email = request.headers.get('X-User-Email')
    user_role = request.headers.get('X-User-Role')

    if not user_email or not user_role:
        return jsonify({'error': 'Authentication required'}), 401

    user = next((u for u in users if u['email'] == user_email and u['role'] == user_role), None)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.json
    rating = data.get('rating')
    feedback = data.get('feedback', '')

    if rating is None or not (1 <= rating <= 5):
        return jsonify({'error': 'Rating must be between 1 and 5'}), 400

    enrollment = next((e for e in enrollments_records if e['employeeId'] == user['id'] and e['trainingId'] == training_id), None)
    if not enrollment:
        return jsonify({'error': 'Not enrolled in this training'}), 404

    enrollment['rating'] = rating
    enrollment['feedback'] = feedback
    enrollment['feedbackSubmittedAt'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    save_enrollments()

    return jsonify({'message': 'Feedback submitted successfully'})

# Feedback endpoints
@app.route('/api/feedbacks', methods=['GET'])
def get_feedbacks():
    user_email = request.headers.get('X-User-Email')
    user_role = request.headers.get('X-User-Role')

    if not user_email or not user_role:
        return jsonify({'error': 'Authentication required'}), 401

    user = next((u for u in users if u['email'] == user_email and u['role'] == user_role), None)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    if user_role == 'hr':
        # HR can see all feedbacks
        return jsonify({'feedbacks': feedbacks_records})
    else:
        # Employees can see only their own feedbacks
        user_feedbacks = [f for f in feedbacks_records if f['employeeId'] == user['id']]
        return jsonify({'feedbacks': user_feedbacks})

@app.route('/api/feedbacks', methods=['POST'])
def submit_general_feedback():
    user_email = request.headers.get('X-User-Email')
    user_role = request.headers.get('X-User-Role')

    if not user_email or not user_role:
        return jsonify({'error': 'Authentication required'}), 401

    if user_role != 'employee':
        return jsonify({'error': 'Only employees can submit feedback'}), 403

    user = next((u for u in users if u['email'] == user_email and u['role'] == user_role), None)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.json
    feedback_type = data.get('type')
    title = data.get('title')
    description = data.get('description', '')
    rating = data.get('rating')
    category = data.get('category')
    anonymous = data.get('anonymous', False)

    if not all([feedback_type, title, rating is not None, category]):
        return jsonify({'error': 'Type, title, rating, and category are required'}), 400

    if rating < 1 or rating > 5:
        return jsonify({'error': 'Rating must be between 1 and 5'}), 400

    feedback = {
        'id': len(feedbacks_records) + 1,
        'employeeId': user['id'],
        'employeeName': user['name'] if not anonymous else 'Anonymous',
        'type': feedback_type,
        'title': title,
        'description': description,
        'rating': rating,
        'category': category,
        'anonymous': anonymous,
        'submittedAt': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'status': 'pending'
    }
    feedbacks_records.append(feedback)
    save_feedbacks()

    return jsonify({'message': 'Feedback submitted successfully', 'feedback': feedback})

@app.route('/api/feedbacks/<int:feedback_id>/status', methods=['PUT'])
def update_feedback_status(feedback_id):
    user_email = request.headers.get('X-User-Email')
    user_role = request.headers.get('X-User-Role')

    if not user_email or not user_role:
        return jsonify({'error': 'Authentication required'}), 401

    if user_role != 'hr':
        return jsonify({'error': 'Only HR can update feedback status'}), 403

    data = request.json
    status = data.get('status')

    if status not in ['pending', 'reviewed', 'resolved']:
        return jsonify({'error': 'Invalid status'}), 400

    feedback = next((f for f in feedbacks_records if f['id'] == feedback_id), None)
    if not feedback:
        return jsonify({'error': 'Feedback not found'}), 404

    feedback['status'] = status
    feedback['reviewedAt'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    save_feedbacks()

    return jsonify({'message': 'Feedback status updated successfully'})

@app.route('/api/feedbacks/stats', methods=['GET'])
def get_feedback_stats():
    user_email = request.headers.get('X-User-Email')
    user_role = request.headers.get('X-User-Role')

    if not user_email or not user_role:
        return jsonify({'error': 'Authentication required'}), 401

    if user_role != 'hr':
        return jsonify({'error': 'Only HR can view feedback statistics'}), 403

    total_feedbacks = len(feedbacks_records)
    pending_feedbacks = len([f for f in feedbacks_records if f['status'] == 'pending'])
    reviewed_feedbacks = len([f for f in feedbacks_records if f['status'] == 'reviewed'])
    resolved_feedbacks = len([f for f in feedbacks_records if f['status'] == 'resolved'])

    # Calculate average rating
    ratings = [f['rating'] for f in feedbacks_records if f['rating']]
    avg_rating = sum(ratings) / len(ratings) if ratings else 0

    # Category breakdown
    categories = {}
    for feedback in feedbacks_records:
        cat = feedback['category']
        if cat not in categories:
            categories[cat] = 0
        categories[cat] += 1

    return jsonify({
        'stats': {
            'total': total_feedbacks,
            'pending': pending_feedbacks,
            'reviewed': reviewed_feedbacks,
            'resolved': resolved_feedbacks,
            'averageRating': round(avg_rating, 1),
            'categories': categories
        }
    })

# Announcements endpoints
@app.route('/api/announcements', methods=['GET'])
def get_announcements():
    user_email = request.headers.get('X-User-Email')
    user_role = request.headers.get('X-User-Role')

    if not user_email or not user_role:
        return jsonify({'error': 'Authentication required'}), 401

    user = next((u for u in users if u['email'] == user_email and u['role'] == user_role), None)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    # Filter active announcements
    active_announcements = [a for a in announcements_records if a.get('isActive', True)]

    # Sort by creation date descending (newest first)
    active_announcements.sort(key=lambda x: x.get('createdAt', ''), reverse=True)

    # Add creator names
    for announcement in active_announcements:
        creator = next((u for u in users if u['id'] == announcement.get('createdBy')), None)
        announcement['createdByName'] = creator['name'] if creator else 'HR Team'

    return jsonify({'announcements': active_announcements})

@app.route('/api/announcements', methods=['POST'])
def create_announcement():
    user_email = request.headers.get('X-User-Email')
    user_role = request.headers.get('X-User-Role')

    if not user_email or not user_role:
        return jsonify({'error': 'Authentication required'}), 401

    if user_role != 'hr':
        return jsonify({'error': 'Only HR can create announcements'}), 403

    user = next((u for u in users if u['email'] == user_email and u['role'] == user_role), None)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.json
    title = data.get('title')
    content = data.get('content')
    announcement_type = data.get('type', 'general')
    priority = data.get('priority', 'normal')
    target_audience = data.get('targetAudience', 'all')

    if not title or not content:
        return jsonify({'error': 'Title and content are required'}), 400

    announcement = {
        'id': len(announcements_records) + 1,
        'title': title,
        'content': content,
        'type': announcement_type,
        'priority': priority,
        'createdBy': user['id'],
        'createdAt': datetime.now().strftime('%Y-%m-%dT%H:%M:%SZ'),
        'isActive': True,
        'targetAudience': target_audience
    }
    announcements_records.append(announcement)
    save_announcements()

    return jsonify({'message': 'Announcement created successfully', 'announcement': announcement})

@app.route('/api/announcements/<int:announcement_id>', methods=['PUT'])
def update_announcement(announcement_id):
    user_email = request.headers.get('X-User-Email')
    user_role = request.headers.get('X-User-Role')

    if not user_email or not user_role:
        return jsonify({'error': 'Authentication required'}), 401

    if user_role != 'hr':
        return jsonify({'error': 'Only HR can update announcements'}), 403

    announcement = next((a for a in announcements_records if a['id'] == announcement_id), None)
    if not announcement:
        return jsonify({'error': 'Announcement not found'}), 404

    data = request.json
    for field in ['title', 'content', 'type', 'priority', 'isActive', 'targetAudience']:
        if field in data:
            announcement[field] = data[field]

    save_announcements()
    return jsonify({'message': 'Announcement updated successfully', 'announcement': announcement})

@app.route('/api/announcements/<int:announcement_id>', methods=['DELETE'])
def delete_announcement(announcement_id):
    user_email = request.headers.get('X-User-Email')
    user_role = request.headers.get('X-User-Role')

    if not user_email or not user_role:
        return jsonify({'error': 'Authentication required'}), 401

    if user_role != 'hr':
        return jsonify({'error': 'Only HR can delete announcements'}), 403

    announcement = next((a for a in announcements_records if a['id'] == announcement_id), None)
    if not announcement:
        return jsonify({'error': 'Announcement not found'}), 404

    announcements_records.remove(announcement)
    save_announcements()
    return jsonify({'message': 'Announcement deleted successfully'})

# Documents endpoints
@app.route('/api/documents', methods=['GET'])
def get_documents():
    user_email = request.headers.get('X-User-Email')
    user_role = request.headers.get('X-User-Role')

    if not user_email or not user_role:
        return jsonify({'error': 'Authentication required'}), 401

    user = next((u for u in users if u['email'] == user_email and u['role'] == user_role), None)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    if user_role == 'hr':
        # HR can see all documents
        records = documents_records
    else:
        # Employees can only see their own documents
        records = [d for d in documents_records if d['employeeId'] == user['id']]

    # Sort by upload date descending
    records.sort(key=lambda x: x['uploadedAt'], reverse=True)

    # Add employee names to records
    for record in records:
        employee = next((u for u in users if u['id'] == record['employeeId']), None)
        record['employeeName'] = employee['name'] if employee else 'Unknown'

    return jsonify({'documents': records})

@app.route('/api/documents', methods=['POST'])
def upload_document():
    user_email = request.headers.get('X-User-Email')
    user_role = request.headers.get('X-User-Role')

    if not user_email or not user_role:
        return jsonify({'error': 'Authentication required'}), 401

    user = next((u for u in users if u['email'] == user_email and u['role'] == user_role), None)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    document_type = request.form.get('documentType')
    description = request.form.get('description', '')

    if not file or not document_type:
        return jsonify({'error': 'File and document type are required'}), 400

    # Validate file type
    allowed_extensions = {'pdf', 'jpg', 'jpeg', 'png'}
    if '.' not in file.filename or file.filename.rsplit('.', 1)[1].lower() not in allowed_extensions:
        return jsonify({'error': 'Invalid file type. Only PDF and image files are allowed'}), 400

    # Validate file size (10MB limit)
    if len(file.read()) > 10 * 1024 * 1024:
        return jsonify({'error': 'File size too large. Maximum 10MB allowed'}), 400
    file.seek(0)  # Reset file pointer

    # Save file
    filename = f"doc_{user['id']}_{document_type}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.{file.filename.rsplit('.', 1)[1].lower()}"
    upload_dir = BASE_DIR / "uploads"
    upload_dir.mkdir(exist_ok=True)
    file_path = upload_dir / filename
    file.save(str(file_path))

    document = {
        'id': len(documents_records) + 1,
        'employeeId': user['id'],
        'documentType': document_type,
        'description': description,
        'filename': filename,
        'fileUrl': f'/uploads/{filename}',
        'uploadedAt': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'status': 'pending',  # pending, verified, rejected
        'reviewedBy': None,
        'reviewedAt': None,
        'comments': None
    }
    documents_records.append(document)
    save_documents()

    return jsonify({'message': 'Document uploaded successfully', 'document': document})

@app.route('/api/documents/<int:document_id>/status', methods=['PUT'])
def update_document_status(document_id):
    user_email = request.headers.get('X-User-Email')
    user_role = request.headers.get('X-User-Role')

    if not user_email or not user_role:
        return jsonify({'error': 'Authentication required'}), 401

    if user_role != 'hr':
        return jsonify({'error': 'Only HR can update document status'}), 403

    user = next((u for u in users if u['email'] == user_email and u['role'] == user_role), None)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    document = next((d for d in documents_records if d['id'] == document_id), None)
    if not document:
        return jsonify({'error': 'Document not found'}), 404

    data = request.json
    status = data.get('status')
    comments = data.get('comments', '')

    if status not in ['pending', 'verified', 'rejected']:
        return jsonify({'error': 'Invalid status'}), 400

    document['status'] = status
    document['reviewedBy'] = user['id']
    document['reviewedAt'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    document['comments'] = comments

    save_documents()
    return jsonify({'message': 'Document status updated successfully', 'document': document})

@app.route('/api/documents/<int:document_id>/download', methods=['GET'])
def download_document(document_id):
    user_email = request.headers.get('X-User-Email')
    user_role = request.headers.get('X-User-Role')

    if not user_email or not user_role:
        return jsonify({'error': 'Authentication required'}), 401

    user = next((u for u in users if u['email'] == user_email and u['role'] == user_role), None)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    document = next((d for d in documents_records if d['id'] == document_id), None)
    if not document:
        return jsonify({'error': 'Document not found'}), 404

    # Only HR or the document owner can download
    if user_role != 'hr' and document['employeeId'] != user['id']:
        return jsonify({'error': 'Unauthorized'}), 403

    return send_from_directory(str(BASE_DIR / "uploads"), document['filename'], as_attachment=True)

# Serve uploaded files
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(str(BASE_DIR / "uploads"), filename)

# Salary management endpoints
@app.route('/api/salaries', methods=['GET'])
def get_salaries():
    user_email = request.headers.get('X-User-Email')
    user_role = request.headers.get('X-User-Role')

    if not user_email or not user_role:
        return jsonify({'error': 'Authentication required'}), 401

    user = next((u for u in users if u['email'] == user_email and u['role'] == user_role), None)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    if user_role == 'hr':
        # HR can see all salaries
        salaries = payroll_records
    else:
        # Employees can only see their own salary
        salaries = [s for s in payroll_records if s['employeeId'] == user['id'] and s['type'] == 'salary']

    # Add employee names to records
    for salary in salaries:
        employee = next((u for u in users if u['id'] == salary['employeeId']), None)
        salary['employeeName'] = employee['name'] if employee else 'Unknown'

    return jsonify({'salaries': salaries})

@app.route('/api/salaries', methods=['POST'])
def create_salary():
    user_email = request.headers.get('X-User-Email')
    user_role = request.headers.get('X-User-Role')

    if not user_email or not user_role:
        return jsonify({'error': 'Authentication required'}), 401

    if user_role != 'hr':
        return jsonify({'error': 'Only HR can create salaries'}), 403

    user = next((u for u in users if u['email'] == user_email and u['role'] == user_role), None)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.json
    employee_id = data.get('employeeId')
    basic_salary = data.get('basicSalary')
    allowances = data.get('allowances', {})
    deductions = data.get('deductions', {})

    if not employee_id or basic_salary is None:
        return jsonify({'error': 'Employee ID and basic salary are required'}), 400

    if basic_salary < 0:
        return jsonify({'error': 'Basic salary cannot be negative'}), 400

    # Check if employee exists
    employee = next((u for u in users if u['id'] == employee_id), None)
    if not employee:
        return jsonify({'error': 'Employee not found'}), 404

    # Check if salary already exists for this employee
    existing_salary = next((s for s in payroll_records if s['employeeId'] == employee_id and s['type'] == 'salary'), None)
    if existing_salary:
        return jsonify({'error': 'Salary already exists for this employee'}), 400

    salary = {
        'id': len(payroll_records) + 1,
        'employeeId': employee_id,
        'type': 'salary',
        'basicSalary': float(basic_salary),
        'allowances': allowances,
        'deductions': deductions,
        'createdAt': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'updatedAt': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    }
    payroll_records.append(salary)
    save_payroll()

    return jsonify({'message': 'Salary created successfully', 'salary': salary})

@app.route('/api/salaries/<int:salary_id>', methods=['PUT'])
def update_salary(salary_id):
    user_email = request.headers.get('X-User-Email')
    user_role = request.headers.get('X-User-Role')

    if not user_email or not user_role:
        return jsonify({'error': 'Authentication required'}), 401

    if user_role != 'hr':
        return jsonify({'error': 'Only HR can update salaries'}), 403

    user = next((u for u in users if u['email'] == user_email and u['role'] == user_role), None)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    salary = next((s for s in payroll_records if s['id'] == salary_id and s['type'] == 'salary'), None)
    if not salary:
        return jsonify({'error': 'Salary not found'}), 404

    data = request.json
    for field in ['basicSalary', 'allowances', 'deductions']:
        if field in data:
            if field == 'basicSalary':
                if data[field] < 0:
                    return jsonify({'error': 'Basic salary cannot be negative'}), 400
                salary[field] = float(data[field])
            else:
                salary[field] = data[field]

    salary['updatedAt'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    save_payroll()
    return jsonify({'message': 'Salary updated successfully', 'salary': salary})

# Payroll processing endpoints
@app.route('/api/payroll/process', methods=['POST'])
def process_payroll():
    user_email = request.headers.get('X-User-Email')
    user_role = request.headers.get('X-User-Role')

    if not user_email or not user_role:
        return jsonify({'error': 'Authentication required'}), 401

    if user_role != 'hr':
        return jsonify({'error': 'Only HR can process payroll'}), 403

    user = next((u for u in users if u['email'] == user_email and u['role'] == user_role), None)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.json
    month = data.get('month')
    year = data.get('year')

    if not month or not year:
        return jsonify({'error': 'Month and year are required'}), 400

    try:
        month = int(month)
        year = int(year)
        if not (1 <= month <= 12):
            return jsonify({'error': 'Invalid month'}), 400
        if year < 2020 or year > 2030:
            return jsonify({'error': 'Invalid year'}), 400
    except ValueError:
        return jsonify({'error': 'Month and year must be numbers'}), 400

    period = f"{year:04d}-{month:02d}"

    # Check if payroll already processed for this period
    existing_payslips = [p for p in payroll_records if p['type'] == 'payslip' and p.get('period') == period]
    if existing_payslips:
        return jsonify({'error': f'Payroll already processed for {period}'}), 400

    # Get all active salaries
    salaries = [s for s in payroll_records if s['type'] == 'salary']

    payslips = []
    for salary in salaries:
        # Calculate total allowances and deductions
        total_allowances = sum(salary['allowances'].values()) if salary['allowances'] else 0
        total_deductions = sum(salary['deductions'].values()) if salary['deductions'] else 0

        # Calculate gross and net salary
        gross_salary = salary['basicSalary'] + total_allowances
        net_salary = gross_salary - total_deductions

        payslip = {
            'id': len(payroll_records) + len(payslips) + 1,
            'employeeId': salary['employeeId'],
            'type': 'payslip',
            'period': period,
            'basicSalary': salary['basicSalary'],
            'allowances': salary['allowances'],
            'deductions': salary['deductions'],
            'grossSalary': gross_salary,
            'netSalary': net_salary,
            'processedAt': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'processedBy': user['id']
        }
        payslips.append(payslip)

    # Save all payslips
    payroll_records.extend(payslips)
    save_payroll()

    return jsonify({
        'message': f'Payroll processed successfully for {period}',
        'payslips': payslips,
        'count': len(payslips)
    })

# Payslip endpoints
@app.route('/api/payslips', methods=['GET'])
def get_payslips():
    user_email = request.headers.get('X-User-Email')
    user_role = request.headers.get('X-User-Role')

    if not user_email or not user_role:
        return jsonify({'error': 'Authentication required'}), 401

    user = next((u for u in users if u['email'] == user_email and u['role'] == user_role), None)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    # Get query parameters
    period = request.args.get('period')

    if user_role == 'hr':
        # HR can see all payslips
        payslips = [p for p in payroll_records if p['type'] == 'payslip']
    else:
        # Employees can only see their own payslips
        payslips = [p for p in payroll_records if p['type'] == 'payslip' and p['employeeId'] == user['id']]

    # Filter by period if provided
    if period:
        payslips = [p for p in payslips if p.get('period') == period]

    # Sort by period descending
    payslips.sort(key=lambda x: x.get('period', ''), reverse=True)

    # Add employee names to records
    for payslip in payslips:
        employee = next((u for u in users if u['id'] == payslip['employeeId']), None)
        payslip['employeeName'] = employee['name'] if employee else 'Unknown'

    return jsonify({'payslips': payslips})

@app.route('/api/payslips/<int:payslip_id>', methods=['GET'])
def get_payslip(payslip_id):
    user_email = request.headers.get('X-User-Email')
    user_role = request.headers.get('X-User-Role')

    if not user_email or not user_role:
        return jsonify({'error': 'Authentication required'}), 401

    user = next((u for u in users if u['email'] == user_email and u['role'] == user_role), None)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    payslip = next((p for p in payroll_records if p['id'] == payslip_id and p['type'] == 'payslip'), None)
    if not payslip:
        return jsonify({'error': 'Payslip not found'}), 404

    # Only HR or the payslip owner can view
    if user_role != 'hr' and payslip['employeeId'] != user['id']:
        return jsonify({'error': 'Unauthorized'}), 403

    # Add employee name
    employee = next((u for u in users if u['id'] == payslip['employeeId']), None)
    payslip['employeeName'] = employee['name'] if employee else 'Unknown'

    return jsonify({'payslip': payslip})

# Admin endpoints
@app.route('/api/admin/users', methods=['GET'])
def get_users():
    user_email = request.headers.get('X-User-Email')
    user_role = request.headers.get('X-User-Role')

    if not user_email or not user_role:
        return jsonify({'error': 'Authentication required'}), 401

    if user_role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    user = next((u for u in users if u['email'] == user_email and u['role'] == user_role), None)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    # Return all users without passwords
    users_list = [{k: v for k, v in u.items() if k != 'password'} for u in users]
    return jsonify({'users': users_list})

@app.route('/api/admin/users', methods=['POST'])
def create_user():
    user_email = request.headers.get('X-User-Email')
    user_role = request.headers.get('X-User-Role')

    if not user_email or not user_role:
        return jsonify({'error': 'Authentication required'}), 401

    if user_role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    user = next((u for u in users if u['email'] == user_email and u['role'] == user_role), None)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.json
    email = data.get('email')
    password = data.get('password')
    role = data.get('role')
    name = data.get('name')
    phone = data.get('phone', '')
    qualification = data.get('qualification', '')

    if not email or not password or not role or not name:
        return jsonify({'error': 'Missing required fields'}), 400

    if any(u['email'] == email for u in users):
        return jsonify({'error': 'User already exists'}), 400

    new_user = {
        'id': len(users) + 1,
        'email': email,
        'password': hash_password(password),
        'role': role,
        'name': name,
        'phone': phone,
        'qualification': qualification
    }
    users.append(new_user)
    save_users()
    return jsonify({'message': 'User created successfully', 'user': {k: v for k, v in new_user.items() if k != 'password'}})

@app.route('/api/admin/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    user_email = request.headers.get('X-User-Email')
    user_role = request.headers.get('X-User-Role')

    if not user_email or not user_role:
        return jsonify({'error': 'Authentication required'}), 401

    if user_role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    user = next((u for u in users if u['email'] == user_email and u['role'] == user_role), None)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    target_user = next((u for u in users if u['id'] == user_id), None)
    if not target_user:
        return jsonify({'error': 'Target user not found'}), 404

    data = request.json
    for field in ['email', 'role', 'name', 'phone', 'qualification']:
        if field in data:
            target_user[field] = data[field]

    if 'password' in data and data['password']:
        target_user['password'] = hash_password(data['password'])

    save_users()
    return jsonify({'message': 'User updated successfully', 'user': {k: v for k, v in target_user.items() if k != 'password'}})

@app.route('/api/admin/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    user_email = request.headers.get('X-User-Email')
    user_role = request.headers.get('X-User-Role')

    if not user_email or not user_role:
        return jsonify({'error': 'Authentication required'}), 401

    if user_role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    user = next((u for u in users if u['email'] == user_email and u['role'] == user_role), None)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    target_user = next((u for u in users if u['id'] == user_id), None)
    if not target_user:
        return jsonify({'error': 'Target user not found'}), 404

    users.remove(target_user)
    save_users()
    return jsonify({'message': 'User deleted successfully'})

@app.route('/api/admin/settings', methods=['GET'])
def get_settings():
    user_email = request.headers.get('X-User-Email')
    user_role = request.headers.get('X-User-Role')

    if not user_email or not user_role:
        return jsonify({'error': 'Authentication required'}), 401

    if user_role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    user = next((u for u in users if u['email'] == user_email and u['role'] == user_role), None)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    return jsonify(settings)

@app.route('/api/admin/settings', methods=['PUT'])
def update_settings():
    user_email = request.headers.get('X-User-Email')
    user_role = request.headers.get('X-User-Role')

    if not user_email or not user_role:
        return jsonify({'error': 'Authentication required'}), 401

    if user_role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    user = next((u for u in users if u['email'] == user_email and u['role'] == user_role), None)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.json
    global settings
    for key, value in data.items():
        if key in settings:
            settings[key] = value

    save_settings()
    return jsonify({'message': 'Settings updated successfully', 'settings': settings})

@app.route('/api/welcome', methods=['GET'])
def welcome():
    logger.info(f"Request received: {request.method} {request.path}")
    return jsonify({'message': 'Welcome to the Flask API Service!'})

# Leave endpoints
@app.route('/api/leaves', methods=['GET'])
def get_leaves():
    user_email = request.headers.get('X-User-Email')
    user_role = request.headers.get('X-User-Role')

    if not user_email or not user_role:
        return jsonify({'error': 'Authentication required'}), 401

    user = next((u for u in users if u['email'] == user_email and u['role'] == user_role), None)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    if user_role == 'hr':
        # HR can see all leave requests
        records = leave_records
    else:
        # Employees can only see their own leave requests
        records = [r for r in leave_records if r['employeeId'] == user['id']]

    # Sort by applied date descending
    records.sort(key=lambda x: x['appliedDate'], reverse=True)

    # Add employee names to records
    for record in records:
        employee = next((u for u in users if u['id'] == record['employeeId']), None)
        record['employeeName'] = employee['name'] if employee else 'Unknown'

    return jsonify({'leaves': records})

@app.route('/api/leaves', methods=['POST'])
def create_leave():
    user_email = request.headers.get('X-User-Email')
    user_role = request.headers.get('X-User-Role')

    if not user_email or not user_role:
        return jsonify({'error': 'Authentication required'}), 401

    user = next((u for u in users if u['email'] == user_email and u['role'] == user_role), None)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.json
    leave_type = data.get('leaveType')
    start_date = data.get('startDate')
    end_date = data.get('endDate')
    reason = data.get('reason', '')

    if not all([leave_type, start_date, end_date]):
        return jsonify({'error': 'Missing required fields'}), 400

    # Calculate number of days
    from datetime import datetime
    start = datetime.strptime(start_date, '%Y-%m-%d')
    end = datetime.strptime(end_date, '%Y-%m-%d')
    days = (end - start).days + 1  # Include both start and end dates

    if days <= 0:
        return jsonify({'error': 'End date must be after start date'}), 400

    leave = {
        'id': len(leave_records) + 1,
        'employeeId': user['id'],
        'leaveType': leave_type,
        'startDate': start_date,
        'endDate': end_date,
        'days': days,
        'reason': reason,
        'status': 'Pending',
        'appliedDate': datetime.now().strftime('%Y-%m-%d')
    }
    leave_records.append(leave)
    save_leaves()

    return jsonify({'message': 'Leave request submitted successfully', 'leave': leave})

@app.route('/api/leaves/<int:leave_id>', methods=['PUT'])
def update_leave(leave_id):
    user_email = request.headers.get('X-User-Email')
    user_role = request.headers.get('X-User-Role')

    if not user_email or not user_role:
        return jsonify({'error': 'Authentication required'}), 401

    user = next((u for u in users if u['email'] == user_email and u['role'] == user_role), None)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    leave = next((l for l in leave_records if l['id'] == leave_id), None)
    if not leave:
        return jsonify({'error': 'Leave request not found'}), 404

    # Only HR can update status, employees can only update their own pending requests
    if user_role != 'hr' and leave['employeeId'] != user['id']:
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.json
    if 'status' in data and user_role == 'hr':
        if data['status'] not in ['Pending', 'Approved', 'Rejected']:
            return jsonify({'error': 'Invalid status'}), 400
        leave['status'] = data['status']
    elif user_role != 'hr' and leave['status'] == 'Pending':
        # Employees can update details but not status
        for field in ['leaveType', 'startDate', 'endDate', 'reason']:
            if field in data:
                leave[field] = data[field]
                if field in ['startDate', 'endDate']:
                    # Recalculate days if dates changed
                    from datetime import datetime
                    start = datetime.strptime(leave['startDate'], '%Y-%m-%d')
                    end = datetime.strptime(leave['endDate'], '%Y-%m-%d')
                    leave['days'] = (end - start).days + 1

    save_leaves()
    return jsonify({'message': 'Leave request updated successfully', 'leave': leave})

# Chatbot endpoint
@app.route('/api/chat', methods=['POST'])
def chat():
    user_email = request.headers.get('X-User-Email')
    user_role = request.headers.get('X-User-Role')

    if not user_email or not user_role:
        logger.warning("Chat request without authentication headers")
        return jsonify({'error': 'Authentication required'}), 401

    user = next((u for u in users if u['email'] == user_email and u['role'] == user_role), None)
    if not user:
        logger.warning(f"Chat request for non-existent user: {user_email}")
        return jsonify({'error': 'User not found'}), 404

    data = request.json
    message = data.get('message', '')

    if not message:
        logger.warning(f"Empty message from user {user['id']}")
        return jsonify({'error': 'Message is required'}), 400

    logger.info(f"Chat request from user {user['id']}: {message[:50]}...")

    chatbot = get_chatbot(BASE_DIR)
    response = chatbot.get_response(user['id'], message)

    logger.info(f"Chat response to user {user['id']}: {response[:50]}...")

    return jsonify({'response': response})

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
