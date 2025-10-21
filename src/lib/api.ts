const API_BASE_URL = 'http://127.0.0.1:5000/api';

export const api = {
  login: async (credentials: { email: string; password: string; role: string }) => {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }
    return response.json();
  },
  signup: async (userData: { email: string; password: string; role: string; name: string; phone?: string }) => {
    const response = await fetch(`${API_BASE_URL}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Signup failed');
    }
    return response.json();
  },
  updateProfile: async (profileData: FormData | { name: string; phone: string; qualification?: string }) => {
    const userData = localStorage.getItem('user');
    if (!userData) throw new Error('User not authenticated');

    const user = JSON.parse(userData);
    const headers: Record<string, string> = {
      'X-User-Email': user.email,
      'X-User-Role': user.role
    };

    let body: string | FormData;
    if (profileData instanceof FormData) {
      body = profileData;
    } else {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(profileData);
    }

    const response = await fetch(`${API_BASE_URL}/update_profile`, {
      method: 'PUT',
      headers,
      body,
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Profile update failed');
    }
    return response.json();
  },
  checkin: async () => {
    const userData = localStorage.getItem('user');
    if (!userData) throw new Error('User not authenticated');

    const user = JSON.parse(userData);
    const response = await fetch(`${API_BASE_URL}/checkin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Email': user.email,
        'X-User-Role': user.role
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Check-in failed');
    }
    return response.json();
  },
  checkout: async () => {
    const userData = localStorage.getItem('user');
    if (!userData) throw new Error('User not authenticated');

    const user = JSON.parse(userData);
    const response = await fetch(`${API_BASE_URL}/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Email': user.email,
        'X-User-Role': user.role
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Check-out failed');
    }
    return response.json();
  },
  getAttendance: async () => {
    const userData = localStorage.getItem('user');
    if (!userData) throw new Error('User not authenticated');

    const user = JSON.parse(userData);
    const response = await fetch(`${API_BASE_URL}/attendance`, {
      method: 'GET',
      headers: {
        'X-User-Email': user.email,
        'X-User-Role': user.role
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch attendance');
    }
    return response.json();
  },
  getTripets: async () => {
    const userData = localStorage.getItem('user');
    if (!userData) throw new Error('User not authenticated');

    const user = JSON.parse(userData);
    const response = await fetch(`${API_BASE_URL}/tripets`, {
      method: 'GET',
      headers: {
        'X-User-Email': user.email,
        'X-User-Role': user.role
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch tripets');
    }
    return response.json();
  },
  createTripet: async (data: {
    destination: string;
    purpose: string;
    startDate: string;
    endDate: string;
    accommodation?: string;
    transportation?: string;
  }) => {
    const userData = localStorage.getItem('user');
    if (!userData) throw new Error('User not authenticated');

    const user = JSON.parse(userData);
    const response = await fetch(`${API_BASE_URL}/tripets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Email': user.email,
        'X-User-Role': user.role
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create tripet');
    }
    return response.json();
  },
  updateTripet: async (id: number, data: any) => {
    const userData = localStorage.getItem('user');
    if (!userData) throw new Error('User not authenticated');

    const user = JSON.parse(userData);
    const response = await fetch(`${API_BASE_URL}/tripets/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Email': user.email,
        'X-User-Role': user.role
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update tripet');
    }
    return response.json();
  },
  deleteTripet: async (id: number) => {
    const userData = localStorage.getItem('user');
    if (!userData) throw new Error('User not authenticated');

    const user = JSON.parse(userData);
    const response = await fetch(`${API_BASE_URL}/tripets/${id}`, {
      method: 'DELETE',
      headers: {
        'X-User-Email': user.email,
        'X-User-Role': user.role
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete tripet');
    }
    return response.json();
  },
  getMeetings: async () => {
    const userData = localStorage.getItem('user');
    if (!userData) throw new Error('User not authenticated');

    const user = JSON.parse(userData);
    const response = await fetch(`${API_BASE_URL}/meetings`, {
      method: 'GET',
      headers: {
        'X-User-Email': user.email,
        'X-User-Role': user.role
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch meetings');
    }
    return response.json();
  },
  createMeeting: async (data: {
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    location?: string;
    agenda?: string;
    participants?: number[];
  }) => {
    const userData = localStorage.getItem('user');
    if (!userData) throw new Error('User not authenticated');

    const user = JSON.parse(userData);
    const response = await fetch(`${API_BASE_URL}/meetings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Email': user.email,
        'X-User-Role': user.role
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create meeting');
    }
    return response.json();
  },
  updateMeeting: async (id: number, data: any) => {
    const userData = localStorage.getItem('user');
    if (!userData) throw new Error('User not authenticated');

    const user = JSON.parse(userData);
    const response = await fetch(`${API_BASE_URL}/meetings/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Email': user.email,
        'X-User-Role': user.role
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update meeting');
    }
    return response.json();
  },
  deleteMeeting: async (id: number) => {
    const userData = localStorage.getItem('user');
    if (!userData) throw new Error('User not authenticated');

    const user = JSON.parse(userData);
    const response = await fetch(`${API_BASE_URL}/meetings/${id}`, {
      method: 'DELETE',
      headers: {
        'X-User-Email': user.email,
        'X-User-Role': user.role
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete meeting');
    }
    return response.json();
  },
  getTimesheets: async (startDate?: string, endDate?: string) => {
    const userData = localStorage.getItem('user');
    if (!userData) throw new Error('User not authenticated');

    const user = JSON.parse(userData);
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);

    const response = await fetch(`${API_BASE_URL}/timesheets?${params}`, {
      method: 'GET',
      headers: {
        'X-User-Email': user.email,
        'X-User-Role': user.role
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch timesheets');
    }
    return response.json();
  },
  createTimesheet: async (data: {
    date: string;
    project?: string;
    task?: string;
    hours: number;
    description?: string;
  }) => {
    const userData = localStorage.getItem('user');
    if (!userData) throw new Error('User not authenticated');

    const user = JSON.parse(userData);
    const response = await fetch(`${API_BASE_URL}/timesheets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Email': user.email,
        'X-User-Role': user.role
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create timesheet entry');
    }
    return response.json();
  },
  updateTimesheet: async (id: number, data: any) => {
    const userData = localStorage.getItem('user');
    if (!userData) throw new Error('User not authenticated');

    const user = JSON.parse(userData);
    const response = await fetch(`${API_BASE_URL}/timesheets/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Email': user.email,
        'X-User-Role': user.role
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update timesheet entry');
    }
    return response.json();
  },
  deleteTimesheet: async (id: number) => {
    const userData = localStorage.getItem('user');
    if (!userData) throw new Error('User not authenticated');

    const user = JSON.parse(userData);
    const response = await fetch(`${API_BASE_URL}/timesheets/${id}`, {
      method: 'DELETE',
      headers: {
        'X-User-Email': user.email,
        'X-User-Role': user.role
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete timesheet entry');
    }
    return response.json();
  },
  getTimesheetSummary: async (period?: string, startDate?: string, endDate?: string) => {
    const userData = localStorage.getItem('user');
    if (!userData) throw new Error('User not authenticated');

    const user = JSON.parse(userData);
    const params = new URLSearchParams();
    if (period) params.append('period', period);
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);

    const response = await fetch(`${API_BASE_URL}/timesheets/summary?${params}`, {
      method: 'GET',
      headers: {
        'X-User-Email': user.email,
        'X-User-Role': user.role
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch timesheet summary');
    }
    return response.json();
  },
  getTrainings: async () => {
    const userData = localStorage.getItem('user');
    if (!userData) throw new Error('User not authenticated');

    const user = JSON.parse(userData);
    const response = await fetch(`${API_BASE_URL}/trainings`, {
      method: 'GET',
      headers: {
        'X-User-Email': user.email,
        'X-User-Role': user.role
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch trainings');
    }
    return response.json();
  },
  enrollTraining: async (trainingId: number) => {
    const userData = localStorage.getItem('user');
    if (!userData) throw new Error('User not authenticated');

    const user = JSON.parse(userData);
    const response = await fetch(`${API_BASE_URL}/trainings/enroll`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Email': user.email,
        'X-User-Role': user.role
      },
      body: JSON.stringify({ trainingId }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to enroll in training');
    }
    return response.json();
  },
  getMyTrainings: async () => {
    const userData = localStorage.getItem('user');
    if (!userData) throw new Error('User not authenticated');

    const user = JSON.parse(userData);
    const response = await fetch(`${API_BASE_URL}/trainings/my`, {
      method: 'GET',
      headers: {
        'X-User-Email': user.email,
        'X-User-Role': user.role
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch my trainings');
    }
    return response.json();
  },
  completeTraining: async (trainingId: number) => {
    const userData = localStorage.getItem('user');
    if (!userData) throw new Error('User not authenticated');

    const user = JSON.parse(userData);
    const response = await fetch(`${API_BASE_URL}/trainings/${trainingId}/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Email': user.email,
        'X-User-Role': user.role
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to complete training');
    }
    return response.json();
  },
  getCertificate: async (trainingId: number) => {
    const userData = localStorage.getItem('user');
    if (!userData) throw new Error('User not authenticated');

    const user = JSON.parse(userData);
    const response = await fetch(`${API_BASE_URL}/trainings/${trainingId}/certificate`, {
      method: 'GET',
      headers: {
        'X-User-Email': user.email,
        'X-User-Role': user.role
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch certificate');
    }
    return response.json();
  },
  submitFeedback: async (trainingId: number, rating: number, feedback: string) => {
    const userData = localStorage.getItem('user');
    if (!userData) throw new Error('User not authenticated');

    const user = JSON.parse(userData);
    const response = await fetch(`${API_BASE_URL}/trainings/${trainingId}/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Email': user.email,
        'X-User-Role': user.role
      },
      body: JSON.stringify({ rating, feedback }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to submit feedback');
    }
    return response.json();
  },
  getFeedbacks: async () => {
    const userData = localStorage.getItem('user');
    if (!userData) throw new Error('User not authenticated');

    const user = JSON.parse(userData);
    const response = await fetch(`${API_BASE_URL}/feedbacks`, {
      method: 'GET',
      headers: {
        'X-User-Email': user.email,
        'X-User-Role': user.role
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch feedbacks');
    }
    return response.json();
  },
  submitEmployeeFeedback: async (feedbackData: {
    type: string;
    title: string;
    description: string;
    rating: number;
    category: string;
    anonymous: boolean;
  }) => {
    const userData = localStorage.getItem('user');
    if (!userData) throw new Error('User not authenticated');

    const user = JSON.parse(userData);
    const response = await fetch(`${API_BASE_URL}/feedbacks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Email': user.email,
        'X-User-Role': user.role
      },
      body: JSON.stringify(feedbackData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to submit feedback');
    }
    return response.json();
  },
  updateFeedbackStatus: async (feedbackId: number, status: string) => {
    const userData = localStorage.getItem('user');
    if (!userData) throw new Error('User not authenticated');

    const user = JSON.parse(userData);
    const response = await fetch(`${API_BASE_URL}/feedbacks/${feedbackId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Email': user.email,
        'X-User-Role': user.role
      },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update feedback status');
    }
    return response.json();
  },
  getFeedbackStats: async () => {
    const userData = localStorage.getItem('user');
    if (!userData) throw new Error('User not authenticated');

    const user = JSON.parse(userData);
    const response = await fetch(`${API_BASE_URL}/feedbacks/stats`, {
      method: 'GET',
      headers: {
        'X-User-Email': user.email,
        'X-User-Role': user.role
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch feedback stats');
    }
    return response.json();
  },
  chat: async (message: string) => {
    const userData = localStorage.getItem('user');
    if (!userData) throw new Error('User not authenticated');

    const user = JSON.parse(userData);
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Email': user.email,
        'X-User-Role': user.role
      },
      body: JSON.stringify({ message }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Chat failed');
    }
    return response.json();
  },
  getAnnouncements: async () => {
    const userData = localStorage.getItem('user');
    if (!userData) throw new Error('User not authenticated');

    const user = JSON.parse(userData);
    const response = await fetch(`${API_BASE_URL}/announcements`, {
      method: 'GET',
      headers: {
        'X-User-Email': user.email,
        'X-User-Role': user.role
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch announcements');
    }
    return response.json();
  },
  createAnnouncement: async (data: {
    title: string;
    content: string;
    type?: string;
    priority?: string;
    targetAudience?: string;
  }) => {
    const userData = localStorage.getItem('user');
    if (!userData) throw new Error('User not authenticated');

    const user = JSON.parse(userData);
    const response = await fetch(`${API_BASE_URL}/announcements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Email': user.email,
        'X-User-Role': user.role
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create announcement');
    }
    return response.json();
  },
  uploadDocument: async (data: FormData) => {
    const userData = localStorage.getItem('user');
    if (!userData) throw new Error('User not authenticated');

    const user = JSON.parse(userData);
    const response = await fetch(`${API_BASE_URL}/documents`, {
      method: 'POST',
      headers: {
        'X-User-Email': user.email,
        'X-User-Role': user.role
      },
      body: data,
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Document upload failed');
    }
    return response.json();
  },
  getDocuments: async () => {
    const userData = localStorage.getItem('user');
    if (!userData) throw new Error('User not authenticated');

    const user = JSON.parse(userData);
    const response = await fetch(`${API_BASE_URL}/documents`, {
      method: 'GET',
      headers: {
        'X-User-Email': user.email,
        'X-User-Role': user.role
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch documents');
    }
    return response.json();
  },
  updateDocumentStatus: async (id: number, data: { status: string; comments?: string }) => {
    const userData = localStorage.getItem('user');
    if (!userData) throw new Error('User not authenticated');

    const user = JSON.parse(userData);
    const response = await fetch(`${API_BASE_URL}/documents/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Email': user.email,
        'X-User-Role': user.role
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update document status');
    }
    return response.json();
  },
  downloadDocument: async (id: number) => {
    const userData = localStorage.getItem('user');
    if (!userData) throw new Error('User not authenticated');

    const user = JSON.parse(userData);
    const response = await fetch(`${API_BASE_URL}/documents/${id}/download`, {
      method: 'GET',
      headers: {
        'X-User-Email': user.email,
        'X-User-Role': user.role
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to download document');
    }
    return response.blob();
  },
  getSalaries: async () => {
    const userData = localStorage.getItem('user');
    if (!userData) throw new Error('User not authenticated');

    const user = JSON.parse(userData);
    const response = await fetch(`${API_BASE_URL}/salaries`, {
      method: 'GET',
      headers: {
        'X-User-Email': user.email,
        'X-User-Role': user.role
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch salaries');
    }
    return response.json();
  },
  updateSalary: async (salaryId: number, data: any) => {
    const userData = localStorage.getItem('user');
    if (!userData) throw new Error('User not authenticated');

    const user = JSON.parse(userData);
    const response = await fetch(`${API_BASE_URL}/salaries/${salaryId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Email': user.email,
        'X-User-Role': user.role
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update salary');
    }
    return response.json();
  },
  createSalary: async (data: {
    employeeId: number;
    basicSalary: number;
    allowances?: Record<string, number>;
    deductions?: Record<string, number>;
  }) => {
    const userData = localStorage.getItem('user');
    if (!userData) throw new Error('User not authenticated');

    const user = JSON.parse(userData);
    const response = await fetch(`${API_BASE_URL}/salaries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Email': user.email,
        'X-User-Role': user.role
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create salary');
    }
    return response.json();
  },
};
