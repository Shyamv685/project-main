import { useState, useEffect } from 'react';

interface Settings {
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  workingHours: {
    start: string;
    end: string;
  };
  leavePolicy: {
    annualLeave: number;
    sickLeave: number;
  };
  notifications: {
    email: boolean;
    sms: boolean;
  };
}

export default function SystemSettings() {
  const [settings, setSettings] = useState<Settings>({
    companyName: '',
    companyEmail: '',
    companyPhone: '',
    workingHours: { start: '09:00', end: '17:00' },
    leavePolicy: { annualLeave: 25, sickLeave: 10 },
    notifications: { email: true, sms: false },
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setFetching(true);
      setError(null);
      const response = await fetch('http://127.0.0.1:5000/api/admin/settings', {
        headers: {
          'X-User-Email': JSON.parse(localStorage.getItem('user') || '{}').email,
          'X-User-Role': 'admin'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      } else {
        setError('Failed to fetch settings. Please try again.');
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('http://127.0.0.1:5000/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': JSON.parse(localStorage.getItem('user') || '{}').email,
          'X-User-Role': 'admin'
        },
        body: JSON.stringify(settings),
      });
      if (response.ok) {
        setSuccess('Settings updated successfully!');
      } else {
        setError('Failed to update settings. Please try again.');
      }
    } catch (error) {
      console.error('Failed to update settings:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = (field: string, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setError(null);
    setSuccess(null);
  };

  const updateNestedSettings = (parent: keyof Settings, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [parent]: { ...(prev[parent] as any), [field]: value }
    }));
    setError(null);
    setSuccess(null);
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">System Settings</h2>

      {/* Status Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Information */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 transition-all duration-200 hover:shadow-md">
          <h3 className="text-lg font-medium mb-4 text-gray-900">Company Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
              <input
                type="text"
                value={settings.companyName}
                onChange={(e) => updateSettings('companyName', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Enter company name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company Email</label>
              <input
                type="email"
                value={settings.companyEmail}
                onChange={(e) => updateSettings('companyEmail', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Enter company email"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Company Phone</label>
              <input
                type="tel"
                value={settings.companyPhone}
                onChange={(e) => updateSettings('companyPhone', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Enter company phone"
                required
              />
            </div>
          </div>
        </div>

        {/* Working Hours */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 transition-all duration-200 hover:shadow-md">
          <h3 className="text-lg font-medium mb-4 text-gray-900">Working Hours</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
              <input
                type="time"
                value={settings.workingHours.start}
                onChange={(e) => updateNestedSettings('workingHours', 'start', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
              <input
                type="time"
                value={settings.workingHours.end}
                onChange={(e) => updateNestedSettings('workingHours', 'end', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Leave Policy */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 transition-all duration-200 hover:shadow-md">
          <h3 className="text-lg font-medium mb-4 text-gray-900">Leave Policy</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Annual Leave (days)</label>
              <input
                type="number"
                value={settings.leavePolicy.annualLeave}
                onChange={(e) => updateNestedSettings('leavePolicy', 'annualLeave', parseInt(e.target.value) || 0)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                min="0"
                placeholder="25"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sick Leave (days)</label>
              <input
                type="number"
                value={settings.leavePolicy.sickLeave}
                onChange={(e) => updateNestedSettings('leavePolicy', 'sickLeave', parseInt(e.target.value) || 0)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                min="0"
                placeholder="10"
              />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 transition-all duration-200 hover:shadow-md">
          <h3 className="text-lg font-medium mb-4 text-gray-900">Notifications</h3>
          <div className="space-y-4">
            <label className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.email}
                onChange={(e) => updateNestedSettings('notifications', 'email', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-3 text-sm font-medium text-gray-700">Enable Email Notifications</span>
            </label>
            <label className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.sms}
                onChange={(e) => updateNestedSettings('notifications', 'sms', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-3 text-sm font-medium text-gray-700">Enable SMS Notifications</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-sm hover:shadow-md"
          >
            {loading ? (
              <span className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </span>
            ) : (
              'Save Settings'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
