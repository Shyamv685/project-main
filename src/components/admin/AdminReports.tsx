import { useState } from 'react';

export default function AdminReports() {
  const [reportType, setReportType] = useState('attendance');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: '',
  });
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const generateReport = async () => {
    if (!dateRange.start || !dateRange.end) {
      setError('Please select both start and end dates.');
      return;
    }

    setGenerating(true);
    setError(null);
    setSuccess(null);

    try {
      // Simulate API call - replace with actual API endpoint
      const response = await fetch(`http://127.0.0.1:5000/api/admin/reports/${reportType}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': JSON.parse(localStorage.getItem('user') || '{}').email,
          'X-User-Role': 'admin'
        },
        body: JSON.stringify({
          startDate: dateRange.start,
          endDate: dateRange.end,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportType}_report_${dateRange.start}_to_${dateRange.end}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        setSuccess('Report generated and downloaded successfully!');
      } else {
        setError('Failed to generate report. Please try again.');
      }
    } catch (error) {
      console.error('Failed to generate report:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setGenerating(false);
    }
  };

  const reports = [
    { id: 'attendance', label: 'Attendance Report', description: 'Employee attendance summary', icon: '📊' },
    { id: 'payroll', label: 'Payroll Report', description: 'Salary and payroll details', icon: '💰' },
    { id: 'leave', label: 'Leave Report', description: 'Employee leave statistics', icon: '🏖️' },
    { id: 'training', label: 'Training Report', description: 'Training completion and feedback', icon: '🎓' },
    { id: 'feedback', label: 'Feedback Report', description: 'Employee feedback analytics', icon: '💬' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Reports</h2>

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

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium mb-4 text-gray-900">Generate Report</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            >
              {reports.map(report => (
                <option key={report.id} value={report.id}>
                  {report.icon} {report.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            />
          </div>
        </div>
        <button
          onClick={generateReport}
          disabled={generating}
          className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-sm hover:shadow-md"
        >
          {generating ? (
            <span className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Generating...
            </span>
          ) : (
            'Generate Report'
          )}
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium mb-4 text-gray-900">Available Reports</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.map(report => (
            <div
              key={report.id}
              className={`p-4 border rounded-lg transition-all duration-200 hover:shadow-md cursor-pointer ${
                reportType === report.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setReportType(report.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <span className="text-2xl mr-3">{report.icon}</span>
                    <h4 className="font-medium text-gray-900">{report.label}</h4>
                  </div>
                  <p className="text-sm text-gray-600">{report.description}</p>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 ml-3 mt-1 ${
                  reportType === report.id
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-300'
                }`}>
                  {reportType === report.id && (
                    <div className="w-full h-full rounded-full bg-white scale-50"></div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
