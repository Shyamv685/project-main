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
};
