const API_BASE_URL = 'http://localhost:5000/api';

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
};
