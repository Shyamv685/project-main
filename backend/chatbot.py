import re
import json
from datetime import datetime, timedelta
from pathlib import Path

# Simple rule-based chatbot for HR queries
class HRChatBot:
    def __init__(self, base_dir):
        self.base_dir = Path(base_dir)
        self.users_file = self.base_dir / "users.json"
        self.attendance_file = self.base_dir / "attendance.json"
        self.leaves_file = self.base_dir / "leaves.json"
        self.timesheets_file = self.base_dir / "timesheets.json"

        # Load data
        self.users = self.load_json(self.users_file) if self.users_file.exists() else []
        self.attendance = self.load_json(self.attendance_file) if self.attendance_file.exists() else []
        self.leaves = self.load_json(self.leaves_file) if self.leaves_file.exists() else []
        self.timesheets = self.load_json(self.timesheets_file) if self.timesheets_file.exists() else []

    def load_json(self, file_path):
        try:
            with open(file_path, 'r') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return []

    def get_response(self, user_id, message):
        message = message.lower().strip()

        # Greeting patterns
        if re.search(r'\b(hello|hi|hey|good morning|good afternoon)\b', message):
            return "Hello! I'm your HR Assistant. How can I help you today?"

        # Leave balance queries
        if re.search(r'\b(leave balance|remaining leave|leave days)\b', message):
            return self.get_leave_balance(user_id)

        # Apply for leave
        if re.search(r'\b(apply for leave|request leave|take leave)\b', message):
            return "To apply for leave, please visit the Leave section in your dashboard. You can submit a leave request there with the dates and reason."

        # Attendance queries
        if re.search(r'\b(attendance|check in|check out|last month|this month)\b', message):
            return self.get_attendance_info(user_id, message)

        # Payroll queries
        if re.search(r'\b(payroll|salary|payslip|pay)\b', message):
            return "For payroll information, please check your payslips in the Timesheet section or contact HR directly."

        # HR policy queries
        if re.search(r'\b(policy|policies|rules|guidelines)\b', message):
            return self.get_policy_info(message)

        # Timesheet queries
        if re.search(r'\b(timesheet|hours worked|overtime)\b', message):
            return self.get_timesheet_info(user_id)

        # Training queries
        if re.search(r'\b(training|course|certification)\b', message):
            return "For training information, please visit the Training & Development section in your dashboard."

        # Help
        if re.search(r'\b(help|what can you do|commands)\b', message):
            return self.get_help_message()

        # Default response
        return "I'm sorry, I didn't understand that. Try asking about leave balance, attendance, policies, or type 'help' to see what I can assist with."

    def get_leave_balance(self, user_id):
        try:
            user_leaves = [leave for leave in self.leaves if leave.get('employeeId') == user_id]
            approved_leaves = [leave for leave in user_leaves if leave.get('status') == 'Approved']

            total_days_taken = sum(
                (datetime.strptime(leave['endDate'], '%Y-%m-%d') - datetime.strptime(leave['startDate'], '%Y-%m-%d')).days + 1
                for leave in approved_leaves
            )

            # Assuming 25 days annual leave per year
            total_leave_days = 25
            remaining_days = total_leave_days - total_days_taken

            return f"Your leave balance: {remaining_days} days remaining out of {total_leave_days} annual leave days. You've taken {total_days_taken} days this year."
        except Exception as e:
            return "I couldn't retrieve your leave balance right now. Please check the Leave section in your dashboard."

    def get_attendance_info(self, user_id, message):
        try:
            user_attendance = [att for att in self.attendance if att.get('employeeId') == user_id]

            if 'last month' in message:
                last_month = datetime.now() - timedelta(days=30)
                monthly_attendance = [att for att in user_attendance
                                    if datetime.strptime(att['date'], '%Y-%m-%d') >= last_month]
            else:
                # This month
                current_month = datetime.now().replace(day=1)
                monthly_attendance = [att for att in user_attendance
                                    if datetime.strptime(att['date'], '%Y-%m-%d') >= current_month]

            total_days = len(monthly_attendance)
            present_days = len([att for att in monthly_attendance if att.get('status') == 'Present'])
            absent_days = len([att for att in monthly_attendance if att.get('status') == 'Absent'])

            return f"Your attendance for {'last month' if 'last month' in message else 'this month'}: {present_days} present, {absent_days} absent out of {total_days} working days."
        except Exception as e:
            return "I couldn't retrieve your attendance information right now. Please check the Attendance section in your dashboard."

    def get_policy_info(self, message):
        if 'leave' in message:
            return "Leave Policy: Employees are entitled to 25 days annual leave per year. Leave requests must be submitted at least 2 weeks in advance for annual leave, or as soon as possible for emergency leave."
        elif 'attendance' in message:
            return "Attendance Policy: Regular working hours are 9 AM to 6 PM, Monday to Friday. Clock in/out using the attendance system. Late arrivals or early departures may affect leave balance."
        elif 'dress' in message or 'code' in message:
            return "Dress Code: Business casual attire is required. Smart casual on Fridays. No jeans or sneakers in client-facing roles."
        else:
            return "For detailed HR policies, please visit the Help Centre section or contact HR directly. I can help with common queries about leave, attendance, and general policies."

    def get_timesheet_info(self, user_id):
        user_timesheets = [ts for ts in self.timesheets if ts['employeeId'] == user_id]

        if not user_timesheets:
            return "No timesheet entries found. Please submit your timesheets regularly."

        # Get latest timesheet
        latest_ts = max(user_timesheets, key=lambda x: x['date'])
        total_hours = sum(entry['hours'] for entry in latest_ts.get('entries', []))

        return f"Your latest timesheet ({latest_ts['date']}): {total_hours} hours worked. Regular hours: 40 per week. Overtime rates apply after 40 hours."

    def get_help_message(self):
        return """I can help you with:
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

For other queries, please contact HR directly."""

# Global chatbot instance
chatbot = None

def get_chatbot(base_dir):
    global chatbot
    if chatbot is None:
        chatbot = HRChatBot(base_dir)
    return chatbot
