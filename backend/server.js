const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');
const { getChatbot } = require('./chatbot');

const app = express();
const PORT = process.env.PORT || 5000;
const BASE_DIR = __dirname;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from parent directory (frontend)
app.use(express.static(path.join(BASE_DIR, '..', 'frontend')));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(BASE_DIR, 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const userId = req.body.userId || 'unknown';
        cb(null, `profile_${userId}_${Date.now()}_${file.originalname}`);
    }
});
const upload = multer({ storage });

// Utility functions
function loadJsonFile(filename) {
    const filePath = path.join(BASE_DIR, filename);
    try {
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error(`Error loading ${filename}:`, error);
    }
    return [];
}

function saveJsonFile(filename, data) {
    const filePath = path.join(BASE_DIR, filename);
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error(`Error saving ${filename}:`, error);
    }
}

function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

// Load initial data
let users = loadJsonFile('users.json');
let attendanceRecords = loadJsonFile('attendance.json');
let tripetsRecords = loadJsonFile('tripets.json');
let meetingsRecords = loadJsonFile('meetings.json');
let timesheetsRecords = loadJsonFile('timesheets.json');
let trainingsRecords = loadJsonFile('trainings.json');
let enrollmentsRecords = loadJsonFile('enrollments.json');
let certificatesRecords = loadJsonFile('certificates.json');
let feedbacksRecords = loadJsonFile('feedbacks.json');
let announcementsRecords = loadJsonFile('announcements.json');

// Save functions
function saveUsers() { saveJsonFile('users.json', users); }
function saveAttendance() { saveJsonFile('attendance.json', attendanceRecords); }
function saveTripets() { saveJsonFile('tripets.json', tripetsRecords); }
function saveMeetings() { saveJsonFile('meetings.json', meetingsRecords); }
function saveTimesheets() { saveJsonFile('timesheets.json', timesheetsRecords); }
function saveTrainings() { saveJsonFile('trainings.json', trainingsRecords); }
function saveEnrollments() { saveJsonFile('enrollments.json', enrollmentsRecords); }
function saveCertificates() { saveJsonFile('certificates.json', certificatesRecords); }
function saveFeedbacks() { saveJsonFile('feedbacks.json', feedbacksRecords); }
function saveAnnouncements() { saveJsonFile('announcements.json', announcementsRecords); }

// Authentication middleware
function requireAuth(req, res, next) {
    const userEmail = req.headers['x-user-email'];
    const userRole = req.headers['x-user-role'];

    if (!userEmail || !userRole) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    const user = users.find(u => u.email === userEmail && u.role === userRole);
    if (!user) {
        return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
}

// Routes

// Authentication routes
app.post('/api/signup', (req, res) => {
    const { email, password, role, name, phone, qualification } = req.body;

    if (!email || !password || !role || !name) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    if (users.some(u => u.email === email)) {
        return res.status(400).json({ error: 'User already exists' });
    }

    const user = {
        id: users.length + 1,
        email,
        password: hashPassword(password),
        role,
        name,
        phone: phone || '',
        qualification: qualification || ''
    };

    users.push(user);
    saveUsers();

    const { password: _, ...userWithoutPassword } = user;
    res.json({ message: 'User created successfully', user: userWithoutPassword });
});

app.post('/api/login', (req, res) => {
    const { email, password, role } = req.body;

    const user = users.find(u => u.email === email && u.role === role);
    if (!user || user.password !== hashPassword(password)) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json({ message: 'Login successful', user: userWithoutPassword });
});

// Profile update route
app.put('/api/update_profile', upload.single('profilePic'), requireAuth, (req, res) => {
    const { name, phone, qualification } = req.body;
    const user = req.user;

    if (!name) {
        return res.status(400).json({ error: 'Name is required' });
    }

    user.name = name;
    user.phone = phone || '';
    user.qualification = qualification || '';

    if (req.file) {
        user.profilePic = `/uploads/${req.file.filename}`;
    }

    saveUsers();
    const { password: _, ...userWithoutPassword } = user;
    res.json({ message: 'Profile updated successfully', user: userWithoutPassword });
});

// Attendance routes
app.post('/api/checkin', requireAuth, (req, res) => {
    const user = req.user;
    const today = new Date().toISOString().split('T')[0];
    const existing = attendanceRecords.find(r => r.employeeId === user.id && r.date === today);

    if (existing && existing.checkIn) {
        return res.status(400).json({ error: 'Already checked in today' });
    }

    const checkinTime = new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });

    if (existing) {
        existing.checkIn = checkinTime;
        existing.status = 'Present';
    } else {
        const record = {
            id: attendanceRecords.length + 1,
            employeeId: user.id,
            date: today,
            checkIn: checkinTime,
            checkOut: null,
            hours: 0,
            status: 'Present'
        };
        attendanceRecords.push(record);
    }

    saveAttendance();
    res.json({ message: 'Checked in successfully', checkInTime });
});

app.post('/api/checkout', requireAuth, (req, res) => {
    const user = req.user;
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    let record = attendanceRecords.find(r => r.employeeId === user.id && r.date === today && r.checkIn && !r.checkOut);

    if (!record) {
        // Check yesterday for overnight shifts
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        record = attendanceRecords.find(r => r.employeeId === user.id && r.date === yesterdayStr && r.checkIn && !r.checkOut);
    }

    if (!record || !record.checkIn) {
        return res.status(400).json({ error: 'No open check-in found' });
    }

    if (record.checkOut) {
        return res.status(400).json({ error: 'Already checked out' });
    }

    const checkoutTime = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
    record.checkOut = checkoutTime;

    const checkinDatetime = new Date(`${record.date} ${record.checkIn}`);
    let checkoutDatetime = now;

    if (checkoutDatetime < checkinDatetime) {
        checkoutDatetime.setDate(checkoutDatetime.getDate() + 1);
    }

    const hours = (checkoutDatetime - checkinDatetime) / (1000 * 60 * 60);
    record.hours = Math.round(hours * 10) / 10;

    saveAttendance();
    res.json({ message: 'Checked out successfully', checkOutTime: checkoutTime, hours: record.hours });
});

app.get('/api/attendance', requireAuth, (req, res) => {
    const user = req.user;

    let records;
    if (user.role === 'hr') {
        records = attendanceRecords;
    } else {
        records = attendanceRecords.filter(r => r.employeeId === user.id);
    }

    records.sort((a, b) => new Date(b.date) - new Date(a.date));

    records.forEach(record => {
        const employee = users.find(u => u.id === record.employeeId);
        record.employeeName = employee ? employee.name : 'Unknown';
    });

    res.json({ attendance: records });
});

// Tripets routes
app.get('/api/tripets', requireAuth, (req, res) => {
    const user = req.user;

    let records;
    if (user.role === 'hr') {
        records = tripetsRecords;
    } else {
        records = tripetsRecords.filter(r => r.employeeId === user.id);
    }

    records.sort((a, b) => new Date(b.date) - new Date(a.date));

    records.forEach(record => {
        const employee = users.find(u => u.id === record.employeeId);
        record.employeeName = employee ? employee.name : 'Unknown';
    });

    res.json({ tripets: records });
});

app.post('/api/tripets', requireAuth, (req, res) => {
    const user = req.user;
    const { destination, purpose, startDate, endDate, accommodation, transportation } = req.body;

    if (!destination || !purpose || !startDate || !endDate) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const tripet = {
        id: tripetsRecords.length + 1,
        employeeId: user.id,
        destination,
        purpose,
        startDate,
        endDate,
        accommodation: accommodation || '',
        transportation: transportation || '',
        status: 'Pending',
        date: new Date().toISOString().split('T')[0]
    };

    tripetsRecords.push(tripet);
    saveTripets();
    res.json({ message: 'Tripet created successfully', tripet });
});

app.put('/api/tripets/:tripetId', requireAuth, (req, res) => {
    const user = req.user;
    const tripetId = parseInt(req.params.tripetId);
    const tripet = tripetsRecords.find(t => t.id === tripetId);

    if (!tripet) {
        return res.status(404).json({ error: 'Tripet not found' });
    }

    if (user.role !== 'hr' && tripet.employeeId !== user.id) {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    const { status, ...updateData } = req.body;

    if (status && user.role === 'hr') {
        tripet.status = status;
    } else if (user.role !== 'hr') {
        Object.assign(tripet, updateData);
    }

    saveTripets();
    res.json({ message: 'Tripet updated successfully', tripet });
});

app.delete('/api/tripets/:tripetId', requireAuth, (req, res) => {
    const user = req.user;
    const tripetId = parseInt(req.params.tripetId);
    const tripetIndex = tripetsRecords.findIndex(t => t.id === tripetId);

    if (tripetIndex === -1) {
        return res.status(404).json({ error: 'Tripet not found' });
    }

    const tripet = tripetsRecords[tripetIndex];

    if (user.role !== 'hr' && (tripet.employeeId !== user.id || tripet.status !== 'Pending')) {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    tripetsRecords.splice(tripetIndex, 1);
    saveTripets();
    res.json({ message: 'Tripet deleted successfully' });
});

// Meetings routes
app.get('/api/meetings', requireAuth, (req, res) => {
    const user = req.user;

    let records;
    if (user.role === 'hr') {
        records = meetingsRecords;
    } else {
        records = meetingsRecords.filter(r =>
            r.organizerId === user.id || r.participants.includes(user.id)
        );
    }

    records.sort((a, b) => {
        const dateCompare = new Date(b.date) - new Date(a.date);
        if (dateCompare !== 0) return dateCompare;
        return b.startTime.localeCompare(a.startTime);
    });

    records.forEach(record => {
        const organizer = users.find(u => u.id === record.organizerId);
        record.organizerName = organizer ? organizer.name : 'Unknown';
    });

    res.json({ meetings: records });
});

app.post('/api/meetings', requireAuth, (req, res) => {
    const user = req.user;
    const { title, date, startTime, endTime, location, agenda, participants } = req.body;

    if (!title || !date || !startTime || !endTime) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const meeting = {
        id: meetingsRecords.length + 1,
        organizerId: user.id,
        title,
        date,
        startTime,
        endTime,
        location: location || '',
        agenda: agenda || '',
        participants: participants || [],
        status: 'Scheduled',
        createdAt: new Date().toISOString()
    };

    meetingsRecords.push(meeting);
    saveMeetings();
    res.json({ message: 'Meeting created successfully', meeting });
});

app.put('/api/meetings/:meetingId', requireAuth, (req, res) => {
    const user = req.user;
    const meetingId = parseInt(req.params.meetingId);
    const meeting = meetingsRecords.find(m => m.id === meetingId);

    if (!meeting) {
        return res.status(404).json({ error: 'Meeting not found' });
    }

    if (user.role !== 'hr' && meeting.organizerId !== user.id) {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    const updateData = req.body;
    Object.assign(meeting, updateData);

    saveMeetings();
    res.json({ message: 'Meeting updated successfully', meeting });
});

app.delete('/api/meetings/:meetingId', requireAuth, (req, res) => {
    const user = req.user;
    const meetingId = parseInt(req.params.meetingId);
    const meetingIndex = meetingsRecords.findIndex(m => m.id === meetingId);

    if (meetingIndex === -1) {
        return res.status(404).json({ error: 'Meeting not found' });
    }

    const meeting = meetingsRecords[meetingIndex];

    if (user.role !== 'hr' && meeting.organizerId !== user.id) {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    meetingsRecords.splice(meetingIndex, 1);
    saveMeetings();
    res.json({ message: 'Meeting deleted successfully' });
});

// Timesheets routes
app.get('/api/timesheets', requireAuth, (req, res) => {
    const user = req.user;
    const { start_date, end_date } = req.query;

    let records;
    if (user.role === 'hr') {
        records = timesheetsRecords;
    } else {
        records = timesheetsRecords.filter(r => r.employeeId === user.id);
    }

    if (start_date && end_date) {
        records = records.filter(r => r.date >= start_date && r.date <= end_date);
    }

    records.sort((a, b) => new Date(b.date) - new Date(a.date));

    records.forEach(record => {
        const employee = users.find(u => u.id === record.employeeId);
        record.employeeName = employee ? employee.name : 'Unknown';
    });

    res.json({ timesheets: records });
});

app.post('/api/timesheets', requireAuth, (req, res) => {
    const user = req.user;
    const { date, project, task, hours, description } = req.body;

    if (!date || hours === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    if (typeof hours !== 'number' || hours < 0 || hours > 24) {
        return res.status(400).json({ error: 'Invalid hours value' });
    }

    const timesheet = {
        id: timesheetsRecords.length + 1,
        employeeId: user.id,
        date,
        project: project || '',
        task: task || '',
        hours,
        description: description || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    timesheetsRecords.push(timesheet);
    saveTimesheets();
    res.json({ message: 'Timesheet entry created successfully', timesheet });
});

app.put('/api/timesheets/:timesheetId', requireAuth, (req, res) => {
    const user = req.user;
    const timesheetId = parseInt(req.params.timesheetId);
    const timesheet = timesheetsRecords.find(t => t.id === timesheetId);

    if (!timesheet) {
        return res.status(404).json({ error: 'Timesheet entry not found' });
    }

    if (user.role !== 'hr' && timesheet.employeeId !== user.id) {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    const { date, project, task, description, hours } = req.body;

    if (date) timesheet.date = date;
    if (project !== undefined) timesheet.project = project;
    if (task !== undefined) timesheet.task = task;
    if (description !== undefined) timesheet.description = description;

    if (hours !== undefined) {
        if (typeof hours !== 'number' || hours < 0 || hours > 24) {
            return res.status(400).json({ error: 'Invalid hours value' });
        }
        timesheet.hours = hours;
    }

    timesheet.updatedAt = new Date().toISOString();
    saveTimesheets();
    res.json({ message: 'Timesheet entry updated successfully', timesheet });
});

app.delete('/api/timesheets/:timesheetId', requireAuth, (req, res) => {
    const user = req.user;
    const timesheetId = parseInt(req.params.timesheetId);
    const timesheetIndex = timesheetsRecords.findIndex(t => t.id === timesheetId);

    if (timesheetIndex === -1) {
        return res.status(404).json({ error: 'Timesheet entry not found' });
    }

    const timesheet = timesheetsRecords[timesheetIndex];

    if (user.role !== 'hr' && timesheet.employeeId !== user.id) {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    timesheetsRecords.splice(timesheetIndex, 1);
    saveTimesheets();
    res.json({ message: 'Timesheet entry deleted successfully' });
});

app.get('/api/timesheets/summary', requireAuth, (req, res) => {
    const user = req.user;
    const { start_date, end_date, period } = req.query;

    let allRecords;
    if (user.role === 'hr') {
        allRecords = timesheetsRecords;
    } else {
        allRecords = timesheetsRecords.filter(r => r.employeeId === user.id);
    }

    let filteredRecords;
    let startDate, endDate;

    if (start_date && end_date) {
        filteredRecords = allRecords.filter(r => r.date >= start_date && r.date <= end_date);
        startDate = start_date;
        endDate = end_date;
    } else {
        const now = new Date();
        if (period === 'weekly') {
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - now.getDay());
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            startDate = startOfWeek.toISOString().split('T')[0];
            endDate = endOfWeek.toISOString().split('T')[0];
        } else {
            // monthly
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            startDate = startOfMonth.toISOString().split('T')[0];
            endDate = endOfMonth.toISOString().split('T')[0];
        }
        filteredRecords = allRecords.filter(r => r.date >= startDate && r.date <= endDate);
    }

    const totalHours = filteredRecords.reduce((sum, r) => sum + r.hours, 0);
    const totalEntries = filteredRecords.length;

    const projectSummary = {};
    filteredRecords.forEach(record => {
        const project = record.project || 'No Project';
        if (!projectSummary[project]) {
            projectSummary[project] = { hours: 0, entries: 0 };
        }
        projectSummary[project].hours += record.hours;
        projectSummary[project].entries += 1;
    });

    let employeeSummary = {};
    if (user.role === 'hr') {
        filteredRecords.forEach(record => {
            const employee = users.find(u => u.id === record.employeeId);
            const employeeName = employee ? employee.name : 'Unknown';
            if (!employeeSummary[employeeName]) {
                employeeSummary[employeeName] = { hours: 0, entries: 0 };
            }
            employeeSummary[employeeName].hours += record.hours;
            employeeSummary[employeeName].entries += 1;
        });
    }

    const summary = {
        period: { start_date: startDate, end_date: endDate, type: period || 'custom' },
        total_hours: totalHours,
        total_entries: totalEntries,
        project_summary: projectSummary,
        employee_summary: employeeSummary
    };

    res.json(summary);
});

// Training routes
app.get('/api/trainings', requireAuth, (req, res) => {
    const user = req.user;

    const enrolledTrainingIds = enrollmentsRecords
        .filter(e => e.employeeId === user.id)
        .map(e => e.trainingId);

    const trainingsWithStatus = trainingsRecords.map(training => ({
        ...training,
        isEnrolled: enrolledTrainingIds.includes(training.id)
    }));

    res.json({ trainings: trainingsWithStatus });
});

app.post('/api/trainings/enroll', requireAuth, (req, res) => {
    const user = req.user;
    const { trainingId } = req.body;

    if (!trainingId) {
        return res.status(400).json({ error: 'Training ID required' });
    }

    const training = trainingsRecords.find(t => t.id === trainingId);
    if (!training) {
        return res.status(404).json({ error: 'Training not found' });
    }

    if (training.seatsAvailable <= 0) {
        return res.status(400).json({ error: 'No seats available' });
    }

    const existing = enrollmentsRecords.find(e => e.employeeId === user.id && e.trainingId === trainingId);
    if (existing) {
        return res.status(400).json({ error: 'Already enrolled' });
    }

    const enrollment = {
        id: enrollmentsRecords.length + 1,
        employeeId: user.id,
        trainingId,
        enrolledAt: new Date().toISOString(),
        status: 'Enrolled',
        progress: 0
    };

    enrollmentsRecords.push(enrollment);
    training.seatsAvailable -= 1;

    saveEnrollments();
    saveTrainings();

    res.json({ message: 'Successfully enrolled', enrollment });
});

app.get('/api/trainings/my', requireAuth, (req, res) => {
    const user = req.user;

    const userEnrollments = enrollmentsRecords.filter(e => e.employeeId === user.id);

    const myTrainings = userEnrollments.map(enrollment => {
        const training = trainingsRecords.find(t => t.id === enrollment.trainingId);
        if (training) {
            return { ...training, enrollment };
        }
        return null;
    }).filter(Boolean);

    res.json({ trainings: myTrainings });
});

app.post('/api/trainings/:trainingId/complete', requireAuth, (req, res) => {
    const user = req.user;
    const trainingId = parseInt(req.params.trainingId);

    const enrollment = enrollmentsRecords.find(e => e.employeeId === user.id && e.trainingId === trainingId);
    if (!enrollment) {
        return res.status(404).json({ error: 'Not enrolled in this training' });
    }

    enrollment.status = 'Completed';
    enrollment.progress = 100;
    enrollment.completedAt = new Date().toISOString();

    const training = trainingsRecords.find(t => t.id === trainingId);
    const certificate = {
        id: certificatesRecords.length + 1,
        employeeId: user.id,
        trainingId,
        trainingTitle: training.title,
        trainer: training.trainer,
        completionDate: enrollment.completedAt,
        certificateUrl: `/certificates/${certificatesRecords.length + 1}.pdf`
    };

    certificatesRecords.push(certificate);
    saveEnrollments();
    saveCertificates();

    res.json({ message: 'Training completed', certificate });
});

app.get('/api/trainings/:trainingId/certificate', requireAuth, (req, res) => {
    const user = req.user;
    const trainingId = parseInt(req.params.trainingId);

    const certificate = certificatesRecords.find(c => c.employeeId === user.id && c.trainingId === trainingId);
    if (!certificate) {
        return res.status(404).json({ error: 'Certificate not found' });
    }

    res.json({ certificate });
});

app.post('/api/trainings/:trainingId/feedback', requireAuth, (req, res) => {
    const user = req.user;
    const trainingId = parseInt(req.params.trainingId);
    const { rating, feedback } = req.body;

    if (rating === undefined || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const enrollment = enrollmentsRecords.find(e => e.employeeId === user.id && e.trainingId === trainingId);
    if (!enrollment) {
        return res.status(404).json({ error: 'Not enrolled in this training' });
    }

    enrollment.rating = rating;
    enrollment.feedback = feedback || '';
    enrollment.feedbackSubmittedAt = new Date().toISOString();

    saveEnrollments();
    res.json({ message: 'Feedback submitted successfully' });
});

// Feedback routes
app.get('/api/feedbacks', requireAuth, (req, res) => {
    const user = req.user;

    let feedbacks;
    if (user.role === 'hr') {
        feedbacks = feedbacksRecords;
    } else {
        feedbacks = feedbacksRecords.filter(f => f.employeeId === user.id);
    }

    res.json({ feedbacks });
});

app.post('/api/feedbacks', requireAuth, (req, res) => {
    const user = req.user;

    if (user.role !== 'employee') {
        return res.status(403).json({ error: 'Only employees can submit feedback' });
    }

    const { type, title, description, rating, category, anonymous } = req.body;

    if (!type || !title || rating === undefined || !category) {
        return res.status(400).json({ error: 'Type, title, rating, and category are required' });
    }

    if (rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const feedback = {
        id: feedbacksRecords.length + 1,
        employeeId: user.id,
        employeeName: anonymous ? 'Anonymous' : user.name,
        type,
        title,
        description: description || '',
        rating,
        category,
        anonymous: anonymous || false,
        submittedAt: new Date().toISOString(),
        status: 'pending'
    };

    feedbacksRecords.push(feedback);
    saveFeedbacks();
    res.json({ message: 'Feedback submitted successfully', feedback });
});

app.put('/api/feedbacks/:feedbackId/status', requireAuth, (req, res) => {
    const user = req.user;

    if (user.role !== 'hr') {
        return res.status(403).json({ error: 'Only HR can update feedback status' });
    }

    const feedbackId = parseInt(req.params.feedbackId);
    const { status } = req.body;

    if (!['pending', 'reviewed', 'resolved'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    const feedback = feedbacksRecords.find(f => f.id === feedbackId);
    if (!feedback) {
        return res.status(404).json({ error: 'Feedback not found' });
    }

    feedback.status = status;
    feedback.reviewedAt = new Date().toISOString();

    saveFeedbacks();
    res.json({ message: 'Feedback status updated successfully' });
});

app.get('/api/feedbacks/stats', requireAuth, (req, res) => {
    const user = req.user;

    if (user.role !== 'hr') {
        return res.status(403).json({ error: 'Only HR can view feedback statistics' });
    }

    const totalFeedbacks = feedbacksRecords.length;
    const pendingFeedbacks = feedbacksRecords.filter(f => f.status === 'pending').length;
    const reviewedFeedbacks = feedbacksRecords.filter(f => f.status === 'reviewed').length;
    const resolvedFeedbacks = feedbacksRecords.filter(f => f.status === 'resolved').length;

    const ratings = feedbacksRecords.map(f => f.rating).filter(r => r);
    const avgRating = ratings.length ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length : 0;

    const categories = {};
    feedbacksRecords.forEach(feedback => {
        const cat = feedback.category;
        categories[cat] = (categories[cat] || 0) + 1;
    });

    res.json({
        stats: {
            total: totalFeedbacks,
            pending: pendingFeedbacks,
            reviewed: reviewedFeedbacks,
            resolved: resolvedFeedbacks,
            averageRating: Math.round(avgRating * 10) / 10,
            categories
        }
    });
});

// Announcements routes
app.get('/api/announcements', requireAuth, (req, res) => {
    const activeAnnouncements = announcementsRecords
        .filter(a => a.isActive !== false)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    activeAnnouncements.forEach(announcement => {
        const creator = users.find(u => u.id === announcement.createdBy);
        announcement.createdByName = creator ? creator.name : 'HR Team';
    });

    res.json({ announcements: activeAnnouncements });
});

app.post('/api/announcements', requireAuth, (req, res) => {
    const user = req.user;

    if (user.role !== 'hr') {
        return res.status(403).json({ error: 'Only HR can create announcements' });
    }

    const { title, content, type, priority, targetAudience } = req.body;

    if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' });
    }

    const announcement = {
        id: announcementsRecords.length + 1,
        title,
        content,
        type: type || 'general',
        priority: priority || 'normal',
        createdBy: user.id,
        createdAt: new Date().toISOString(),
        isActive: true,
        targetAudience: targetAudience || 'all'
    };

    announcementsRecords.push(announcement);
    saveAnnouncements();
    res.json({ message: 'Announcement created successfully', announcement });
});

app.put('/api/announcements/:announcementId', requireAuth, (req, res) => {
    const user = req.user;

    if (user.role !== 'hr') {
        return res.status(403).json({ error: 'Only HR can update announcements' });
    }

    const announcementId = parseInt(req.params.announcementId);
    const announcement = announcementsRecords.find(a => a.id === announcementId);

    if (!announcement) {
        return res.status(404).json({ error: 'Announcement not found' });
    }

    const { title, content, type, priority, isActive, targetAudience } = req.body;

    if (title) announcement.title = title;
    if (content) announcement.content = content;
    if (type) announcement.type = type;
    if (priority) announcement.priority = priority;
    if (isActive !== undefined) announcement.isActive = isActive;
    if (targetAudience) announcement.targetAudience = targetAudience;

    saveAnnouncements();
    res.json({ message: 'Announcement updated successfully', announcement });
});

app.delete('/api/announcements/:announcementId', requireAuth, (req, res) => {
    const user = req.user;

    if (user.role !== 'hr') {
        return res.status(403).json({ error: 'Only HR can delete announcements' });
    }

    const announcementId = parseInt(req.params.announcementId);
    const announcementIndex = announcementsRecords.findIndex(a => a.id === announcementId);

    if (announcementIndex === -1) {
        return res.status(404).json({ error: 'Announcement not found' });
    }

    announcementsRecords.splice(announcementIndex, 1);
    saveAnnouncements();
    res.json({ message: 'Announcement deleted successfully' });
});

// File serving
app.use('/uploads', express.static(path.join(BASE_DIR, 'uploads')));

// Chatbot route
app.post('/api/chat', requireAuth, (req, res) => {
    const user = req.user;
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    const chatbot = getChatbot(BASE_DIR);
    const response = chatbot.getResponse(user.id, message);

    res.json({ response });
});

// Simplified text analysis (without ML libraries)
app.post('/api/analyze_text', (req, res) => {
    const { text } = req.body;

    if (!text) {
        return res.status(400).json({ error: 'No text provided' });
    }

    // Simple regex-based evidence extraction
    const evidence = {
        emails: (text.match(/[\w\.-]+@[\w\.-]+/g) || []),
        phones: (text.match(/\+?\d[\d\-\s]{7,}\d/g) || []),
        ips: (text.match(/\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g) || []),
        urls: (text.match(/https?:\/\/[\w\.\/\-_%?=&]+/g) || []),
        money: (text.match(/\$\s?\d+[\d,]*(\.\d+)?|\d+[\d,]*\s?(?:USD|INR|Rs\.?|₹)/g) || []),
        dates: (text.match(/\b(?:\d{1,2}[\-/]\d{1,2}[\-/]\d{2,4}|\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4})/g) || []),
        entities: { PERSON: [], ORG: [], GPE: [] }
    };

    // Simple rule-based classification
    const textLower = text.toLowerCase();
    let classification = { label: 'Normal', confidence: 0.6 };

    if (/\b(?:transfer|account|withdraw|payment|bank|credit card|password|verify)\b/.test(textLower)) {
        classification = { label: 'Fraud', confidence: 0.6 };
    } else if (/\b(?:kill|hurt|threat|attack|harm)\b/.test(textLower)) {
        classification = { label: 'Harassment', confidence: 0.7 };
    } else if (/\b(?:malware|c2|exploit|ransom|virus|trojan|backdoor)\b/.test(textLower)) {
        classification = { label: 'Malware', confidence: 0.8 };
    }

    const priorityScore = evidence.emails.length + evidence.phones.length + evidence.money.length;

    const response = {
        evidence,
        classification,
        priority_score: priorityScore,
        summary: `Found ${evidence.entities.PERSON.length + evidence.entities.ORG.length + evidence.entities.GPE.length} named entities and ${priorityScore} high-value hits`
    };

    res.json(response);
});

// File analysis route (simplified)
app.post('/api/analyze_file', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file part' });
    }

    let text = '';

    // Try to read as text
    try {
        text = fs.readFileSync(req.file.path, 'utf8');
    } catch (error) {
        return res.status(400).json({ error: 'Could not read file as text' });
    }

    // Simple analysis
    const lines = text.split('\n').length;
    const words = text.split(/\s+/).length;
    const chars = text.length;

    const evidence = {
        emails: (text.match(/[\w\.-]+@[\w\.-]+/g) || []),
        phones: (text.match(/\+?\d[\d\-\s]{7,}\d/g) || []),
        ips: (text.match(/\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g) || []),
        urls: (text.match(/https?:\/\/[\w\.\/\-_%?=&]+/g) || []),
        money: (text.match(/\$\s?\d+[\d,]*(\.\d+)?|\d+[\d,]*\s?(?:USD|INR|Rs\.?|₹)/g) || []),
        dates: (text.match(/\b(?:\d{1,2}[\-/]\d{1,2}[\-/]\d{2,4}|\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4})/g) || [])
    };

    const analysis = {
        file_info: {
            filename: req.file.originalname,
            size: req.file.size,
            lines,
            words,
            characters: chars
        },
        evidence,
        summary: `File contains ${lines} lines, ${words} words, and ${evidence.emails.length + evidence.phones.length + evidence.money.length} potential sensitive items`
    };

    res.json(analysis);
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: 'Node.js/Express'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`HR Management Backend running on port ${PORT}`);
    console.log(`Environment: Node.js/Express`);
    console.log(`Data directory: ${BASE_DIR}`);
});
