import { useState } from 'react';
import DashboardOverview from '../components/admin/DashboardOverview';
import UserManagement from '../components/admin/UserManagement';
import SystemSettings from '../components/admin/SystemSettings';
import AdminReports from '../components/admin/AdminReports';
import AuditLogs from '../components/admin/AuditLogs';
import BackupRestore from '../components/admin/BackupRestore';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', component: DashboardOverview },
    { id: 'users', label: 'User Management', component: UserManagement },
    { id: 'settings', label: 'System Settings', component: SystemSettings },
    { id: 'reports', label: 'Reports', component: AdminReports },
    { id: 'audit', label: 'Audit Logs', component: AuditLogs },
    { id: 'backup', label: 'Backup & Restore', component: BackupRestore },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || DashboardOverview;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Admin Panel</h1>
        <div className="mt-6">
          <nav className="flex flex-wrap gap-2 md:gap-4">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-md transition-all duration-200 text-sm md:text-base font-medium ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-md transform scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 hover:shadow-sm'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 transition-all duration-300">
        <ActiveComponent />
      </div>
    </div>
  );
}
