const fs = require('fs');
const path = require('path');

// Simple rule-based chatbot for HR queries
class HRChatBot {
    constructor(baseDir) {
        this.baseDir = baseDir;
        this.usersFile = path.join(baseDir, 'users.json');
        this.attendanceFile = path.join(baseDir, 'attendance.json');
        this.leavesFile = path.join(baseDir, 'leaves.json');
        this.timesheetsFile = path.join(baseDir, 'timesheets.json');

        // Load data
        this.users = this.loadJson(this.usersFile) || [];
        this.attendance = this.loadJson(this.attendanceFile) || [];
        this.leaves = this.loadJson(this.leavesFile) || [];
        this.timesheets = this.loadJson(this.timesheetsFile) || [];
    }

    loadJson(filePath) {
        try {
            if (fs.existsSync(filePath)) {
                const data = fs.readFileSync(filePath, 'utf8');
                return JSON.parse(data);
            }
        } catch (error) {
            console.error('Error loading JSON file:', filePath, error);
        }
        return [];
    }

    getResponse(userId, message) {
        const msg = message.toLowerCase().trim();

        // Greeting patterns
        if (/\b(hello|hi|hey|good morning|good afternoon)\b/.test(msg)) {
            return "Hello! I'm your HR Assistant. How can I help you today?";
        }

        // Leave balance queries
        if (/\b(leave balance|remaining leave|leave days)\b/.test(msg)) {
            return this.getLeaveBalance(userId);
        }

        // Apply for leave
        if (/\b(apply for leave|request leave|take leave)\b/.test(msg)) {
            return "To apply for leave, please visit the Leave section in your dashboard. You can submit a leave request there with the dates and reason.";
        }

        // Attendance queries
        if (/\b(attendance|check in|check out|last month|this month)\b/.test(msg)) {
            return this.getAttendanceInfo(userId, msg);
        }

        // Payroll queries
        if (/\b(payroll|salary|payslip|pay)\b/.test(msg)) {
            return "For payroll information, please check your payslips in the Timesheet section or contact HR directly.";
        }

        // HR policy queries
        if (/\b(policy|policies|rules|guidelines)\b/.test(msg)) {
            return this.getPolicyInfo(msg);
        }

        // Timesheet queries
        if (/\b(timesheet|hours worked|overtime)\b/.test(msg)) {
            return this.getTimesheetInfo(userId);
        }

        // Training queries
        if (/\b(training|course|certification)\b/.test(msg)) {
            return "For training information, please visit the Training & Development section in your dashboard.";
        }

        // Help
        if (/\b(help|what can you do|commands)\b/.test(msg)) {
            return this.getHelpMessage();
        }

        // Default response
        return "I'm sorry, I didn't understand that. Try asking about leave balance, attendance, policies, or type 'help' to see what I can assist with.";
    }

    getLeaveBalance(userId) {
        try {
            const userLeaves = this.leaves.filter(leave => leave.employeeId === userId);
            const approvedLeaves = userLeaves.filter(leave => leave.status === 'Approved');

            const totalDaysTaken = approvedLeaves.reduce((total, leave) => {
                const start = new Date(leave.startDate);
                const end = new Date(leave.endDate);
                const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
                return total + days;
            }, 0);

            // Assuming 25 days annual leave per year
            const totalLeaveDays = 25;
            const remainingDays = totalLeaveDays - totalDaysTaken;

            return `Your leave balance: ${remainingDays} days remaining out of ${totalLeaveDays} annual leave days. You've taken ${totalDaysTaken} days this year.`;
        } catch (error) {
            return "I couldn't retrieve your leave balance right now. Please check the Leave section in your dashboard.";
        }
    }

    getAttendanceInfo(userId, message) {
        try {
            const userAttendance = this.attendance.filter(att => att.employeeId === userId);

            let monthlyAttendance;
            const now = new Date();

            if (message.includes('last month')) {
                const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                monthlyAttendance = userAttendance.filter(att => new Date(att.date) >= lastMonth);
            } else {
                // This month
                const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                monthlyAttendance = userAttendance.filter(att => new Date(att.date) >= currentMonth);
            }

            const totalDays = monthlyAttendance.length;
            const presentDays = monthlyAttendance.filter(att => att.status === 'Present').length;
            const absentDays = monthlyAttendance.filter(att => att.status === 'Absent').length;

            const period = message.includes('last month') ? 'last month' : 'this month';
            return `Your attendance for ${period}: ${presentDays} present, ${absentDays} absent out of ${totalDays} working days.`;
        } catch (error) {
            return "I couldn't retrieve your attendance information right now. Please check the Attendance section in your dashboard.";
        }
    }

    getPolicyInfo(message) {
        if (message.includes('leave')) {
            return "Leave Policy: Employees are entitled to 25 days annual leave per year. Leave requests must be submitted at least 2 weeks in advance for annual leave, or as soon as possible for emergency leave.";
        } else if (message.includes('attendance')) {
            return "Attendance Policy: Regular working hours are 9 AM to 6 PM, Monday to Friday. Clock in/out using the attendance system. Late arrivals or early departures may affect leave balance.";
        } else if (message.includes('dress') || message.includes('code')) {
            return "Dress Code: Business casual attire is required. Smart casual on Fridays. No jeans or sneakers in client-facing roles.";
        } else {
            return "For detailed HR policies, please visit the Help Centre section or contact HR directly. I can help with common queries about leave, attendance, and general policies.";
        }
    }

    getTimesheetInfo(userId) {
        const userTimesheets = this.timesheets.filter(ts => ts.employeeId === userId);

        if (!userTimesheets.length) {
            return "No timesheet entries found. Please submit your timesheets regularly.";
        }

        // Get latest timesheet
        const latestTs = userTimesheets.reduce((latest, current) =>
            new Date(current.date) > new Date(latest.date) ? current : latest
        );

        const totalHours = latestTs.entries ? latestTs.entries.reduce((sum, entry) => sum + entry.hours, 0) : 0;

        return `Your latest timesheet (${latestTs.date}): ${totalHours} hours worked. Regular hours: 40 per week. Overtime rates apply after 40 hours.`;
    }

    getHelpMessage() {
        return `I can help you with:
• Leave balance and applications
• Attendance information
• HR policies and guidelines
• Timesheet summaries
• Training information

Try asking:
- "What's my leave balance?"
- "Show my attendance for last month"
- "Tell me about leave policy"
- "How many hours did I work this week?"

For other queries, please contact HR directly.`;
    }
}

// Global chatbot instance
let chatbot = null;

function getChatbot(baseDir) {
    if (!chatbot) {
        chatbot = new HRChatBot(baseDir);
    }
    return chatbot;
}

module.exports = { getChatbot };
