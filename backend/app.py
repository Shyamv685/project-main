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
