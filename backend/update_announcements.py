import json

data = [
    {
        "id": 1,
        "title": "Welcome to SmartHRMS",
        "content": "We're excited to have you on board! SmartHRMS is your comprehensive HR management solution.",
        "type": "general",
        "priority": "normal",
        "createdBy": 1,
        "createdByName": "HR Admin",
        "createdAt": "2025-01-15T09:00:00Z",
        "isActive": True,
        "targetAudience": "all"
    },
    {
        "id": 2,
        "title": "New Training Program Available",
        "content": "A new AI Fundamentals training program is now available. Register now to enhance your skills!",
        "type": "training",
        "priority": "high",
        "createdBy": 1,
        "createdByName": "HR Admin",
        "createdAt": "2025-01-20T10:30:00Z",
        "isActive": True,
        "targetAudience": "employees"
    },
    {
        "id": 3,
        "title": "System Maintenance Notice",
        "content": "The HR system will undergo maintenance this Saturday from 2 AM to 4 AM. Some services may be temporarily unavailable.",
        "type": "maintenance",
        "priority": "high",
        "createdBy": 1,
        "createdByName": "HR Admin",
        "createdAt": "2025-01-22T14:00:00Z",
        "isActive": True,
        "targetAudience": "all"
    },
    {
        "id": 4,
        "title": "HR Policy Update - Remote Work Guidelines",
        "content": "New remote work guidelines have been implemented. Please review the updated policy document in the HR portal.",
        "type": "policy",
        "priority": "medium",
        "createdBy": 1,
        "createdByName": "HR Admin",
        "createdAt": "2025-01-25T11:00:00Z",
        "isActive": True,
        "targetAudience": "hr"
    },
    {
        "id": 5,
        "title": "Monthly Team Meeting Reminder",
        "content": "Don't forget our monthly all-hands meeting this Friday at 3 PM. We'll discuss Q1 goals and upcoming initiatives.",
        "type": "general",
        "priority": "normal",
        "createdBy": 1,
        "createdByName": "HR Admin",
        "createdAt": "2025-01-28T08:30:00Z",
        "isActive": True,
        "targetAudience": "all"
    }
]

with open('announcements.json', 'w') as f:
    json.dump(data, f, indent=2)

print('Updated announcements.json with createdByName field')
