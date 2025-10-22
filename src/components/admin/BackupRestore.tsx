import { useState } from 'react';

interface Backup {
  id: number;
  name: string;
  type: 'full' | 'incremental';
  size: string;
  createdAt: string;
  status: 'completed' | 'failed' | 'in_progress';
}

export default function BackupRestore() {
  const [backups, setBackups] = useState<Backup[]>([
    {
      id: 1,
      name: 'Full_Backup_2024_01_15',
      type: 'full',
      size: '2.4 GB',
      createdAt: '2024-01-15T10:00:00Z',
      status: 'completed'
    },
    {
      id: 2,
      name: 'Incremental_Backup_2024_01_14',
      type: 'incremental',
      size: '156 MB',
      createdAt: '2024-01-14T10:00:00Z',
      status: 'completed'
    },
    {
      id: 3,
      name: 'Full_Backup_2024_01_08',
      type: 'full',
      size: '2.1 GB',
      createdAt: '2024-01-08T10:00:00Z',
      status: 'completed'
    }
  ]);

  const [creatingBackup, setCreatingBackup] = useState(false);
  const [restoringBackup, setRestoringBackup] = useState<number | null>(null);
  const [backupType, setBackupType] = useState<'full' | 'incremental'>('full');
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduleFrequency, setScheduleFrequency] = useState('daily');
  const [scheduleTime, setScheduleTime] = useState('02:00');

  const createBackup = async () => {
    setCreatingBackup(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/api/admin/backup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': JSON.parse(localStorage.getItem('user') || '{}').email,
          'X-User-Role': 'admin'
        },
        body: JSON.stringify({ type: backupType }),
      });

      if (response.ok) {
        const newBackup = await response.json();
        setBackups([newBackup, ...backups]);
        alert('Backup created successfully!');
      } else {
        alert('Failed to create backup. Please try again.');
      }
    } catch (error) {
      console.error('Failed to create backup:', error);
      alert('Network error. Please check your connection.');
    } finally {
      setCreatingBackup(false);
    }
  };

  const restoreBackup = async (backupId: number) => {
    if (!confirm('Are you sure you want to restore this backup? This will overwrite current data.')) return;

    setRestoringBackup(backupId);
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/admin/backup/${backupId}/restore`, {
        method: 'POST',
        headers: {
          'X-User-Email': JSON.parse(localStorage.getItem('user') || '{}').email,
          'X-User-Role': 'admin'
        },
      });

      if (response.ok) {
        alert('Backup restored successfully!');
      } else {
        alert('Failed to restore backup. Please try again.');
      }
    } catch (error) {
      console.error('Failed to restore backup:', error);
      alert('Network error. Please check your connection.');
    } finally {
      setRestoringBackup(null);
    }
  };

  const deleteBackup = async (backupId: number) => {
    if (!confirm('Are you sure you want to delete this backup?')) return;

    try {
      const response = await fetch(`http://127.0.0.1:5000/api/admin/backup/${backupId}`, {
        method: 'DELETE',
        headers: {
          'X-User-Email': JSON.parse(localStorage.getItem('user') || '{}').email,
          'X-User-Role': 'admin'
        },
      });

      if (response.ok) {
        setBackups(backups.filter(backup => backup.id !== backupId));
        alert('Backup deleted successfully!');
      } else {
        alert('Failed to delete backup. Please try again.');
      }
    } catch (error) {
      console.error('Failed to delete backup:', error);
      alert('Network error. Please check your connection.');
    }
  };

  const downloadBackup = async (backupId: number) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/admin/backup/${backupId}/download`, {
        headers: {
          'X-User-Email': JSON.parse(localStorage.getItem('user') || '{}').email,
          'X-User-Role': 'admin'
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup_${backupId}.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Failed to download backup. Please try again.');
      }
    } catch (error) {
      console.error('Failed to download backup:', error);
      alert('Network error. Please check your connection.');
    }
  };

  const updateSchedule = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/admin/backup/schedule', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': JSON.parse(localStorage.getItem('user') || '{}').email,
          'X-User-Role': 'admin'
        },
        body: JSON.stringify({
          enabled: scheduleEnabled,
          frequency: scheduleFrequency,
          time: scheduleTime,
        }),
      });

      if (response.ok) {
        alert('Backup schedule updated successfully!');
      } else {
        alert('Failed to update backup schedule. Please try again.');
      }
    } catch (error) {
      console.error('Failed to update backup schedule:', error);
      alert('Network error. Please check your connection.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Backup & Restore</h2>

      {/* Create Backup */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium mb-4 text-gray-900">Create New Backup</h3>
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Backup Type</label>
            <select
              value={backupType}
              onChange={(e) => setBackupType(e.target.value as 'full' | 'incremental')}
              className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="full">Full Backup</option>
              <option value="incremental">Incremental Backup</option>
            </select>
          </div>
          <button
            onClick={createBackup}
            disabled={creatingBackup}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {creatingBackup ? (
              <span className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </span>
            ) : (
              'Create Backup'
            )}
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {backupType === 'full'
            ? 'Full backup includes all system data and may take longer to complete.'
            : 'Incremental backup only includes changes since the last full backup.'
          }
        </p>
      </div>

      {/* Backup Schedule */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium mb-4 text-gray-900">Automated Backup Schedule</h3>
        <div className="space-y-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={scheduleEnabled}
              onChange={(e) => setScheduleEnabled(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm font-medium text-gray-700">Enable automated backups</span>
          </label>

          {scheduleEnabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                <select
                  value={scheduleFrequency}
                  onChange={(e) => setScheduleFrequency(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          <button
            onClick={updateSchedule}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
          >
            Update Schedule
          </button>
        </div>
      </div>

      {/* Backup List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Available Backups</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {backups.map((backup) => (
                <tr key={backup.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {backup.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                    {backup.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {backup.size}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(backup.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(backup.status)}`}>
                      {backup.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => downloadBackup(backup.id)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                      >
                        Download
                      </button>
                      <button
                        onClick={() => restoreBackup(backup.id)}
                        disabled={restoringBackup === backup.id}
                        className="text-green-600 hover:text-green-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {restoringBackup === backup.id ? 'Restoring...' : 'Restore'}
                      </button>
                      <button
                        onClick={() => deleteBackup(backup.id)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* System Health */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium mb-4 text-gray-900">System Health Check</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className="text-2xl mb-2">💾</div>
            <p className="font-medium text-gray-900">Storage</p>
            <p className="text-sm text-gray-500">2.4 GB / 10 GB used</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '24%' }}></div>
            </div>
          </div>
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className="text-2xl mb-2">⚡</div>
            <p className="font-medium text-gray-900">Performance</p>
            <p className="text-sm text-green-600">Good</p>
          </div>
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className="text-2xl mb-2">🔒</div>
            <p className="font-medium text-gray-900">Security</p>
            <p className="text-sm text-green-600">Secure</p>
          </div>
        </div>
      </div>
    </div>
  );
}
