import { useState, useEffect } from 'react';

interface Stats {
  totalUsers: number;
  activeUsers: number;
  totalDepartments: number;
  pendingRequests: number;
}

export default function DashboardOverview() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    activeUsers: 0,
    totalDepartments: 0,
    pendingRequests: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      // Simulate API calls - replace with actual endpoints
      const [usersRes, departmentsRes, requestsRes] = await Promise.all([
        fetch('http://127.0.0.1:5000/api/admin/users', {
          headers: {
            'X-User-Email': JSON.parse(localStorage.getItem('user') || '{}').email,
            'X-User-Role': 'admin'
          }
        }),
        fetch('http://127.0.0.1:5000/api/admin/departments', {
          headers: {
            'X-User-Email': JSON.parse(localStorage.getItem('user') || '{}').email,
            'X-User-Role': 'admin'
          }
        }),
        fetch('http://127.0.0.1:5000/api/admin/requests', {
          headers: {
            'X-User-Email': JSON.parse(localStorage.getItem('user') || '{}').email,
            'X-User-Role': 'admin'
          }
        })
      ]);

      const users = usersRes.ok ? (await usersRes.json()).users || [] : [];
      const departments = departmentsRes.ok ? await departmentsRes.json() : [];
      const requests = requestsRes.ok ? await requestsRes.json() : [];

      setStats({
        totalUsers: users.length,
        activeUsers: users.filter((u: any) => u.status === 'active').length,
        totalDepartments: Array.isArray(departments) ? departments.length : 0,
        pendingRequests: Array.isArray(requests) ? requests.filter((r: any) => r.status === 'pending').length : 0,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: '👥',
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'increase'
    },
    {
      title: 'Active Users',
      value: stats.activeUsers,
      icon: '✅',
      color: 'bg-green-500',
      change: '+8%',
      changeType: 'increase'
    },
    {
      title: 'Departments',
      value: stats.totalDepartments,
      icon: '🏢',
      color: 'bg-purple-500',
      change: '+2',
      changeType: 'increase'
    },
    {
      title: 'Pending Requests',
      value: stats.pendingRequests,
      icon: '⏳',
      color: 'bg-orange-500',
      change: '-5%',
      changeType: 'decrease'
    }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Dashboard Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
              </div>
              <div className="mt-4 h-8 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Dashboard Overview</h2>
        <button
          onClick={fetchStats}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.color} text-white`}>
                <span className="text-xl">{stat.icon}</span>
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className={`text-sm font-medium ${
                stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change}
              </span>
              <span className="text-sm text-gray-500 ml-2">from last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">New user registered</p>
              <p className="text-sm text-gray-500">john.doe@example.com joined the system</p>
            </div>
            <span className="text-sm text-gray-500">2 hours ago</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Leave request approved</p>
              <p className="text-sm text-gray-500">Sarah Wilson - Annual Leave (3 days)</p>
            </div>
            <span className="text-sm text-gray-500">4 hours ago</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">System backup completed</p>
              <p className="text-sm text-gray-500">Daily backup finished successfully</p>
            </div>
            <span className="text-sm text-gray-500">6 hours ago</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-blue-600">👤</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Add New User</p>
                <p className="text-sm text-gray-500">Create employee account</p>
              </div>
            </div>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-green-600">📊</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Generate Report</p>
                <p className="text-sm text-gray-500">Export system data</p>
              </div>
            </div>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-purple-600">⚙️</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">System Settings</p>
                <p className="text-sm text-gray-500">Configure preferences</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
