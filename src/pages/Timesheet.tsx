import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Filter, Calendar, Download, BarChart3 } from "lucide-react";
import { api } from "../lib/api";
import TimesheetEntry from "../components/timesheet/TimesheetEntry";
import TimesheetForm from "../components/timesheet/TimesheetForm";
import TimesheetSummary from "../components/timesheet/TimesheetSummary";
import Loader from "../components/common/Loader";
import Alert from "../components/common/Alert";

interface TimesheetEntryType {
  id: number;
  employeeId: number;
  date: string;
  project: string;
  task: string;
  hours: number;
  description: string;
  employeeName: string;
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default function Timesheet() {
  const [entries, setEntries] = useState<TimesheetEntryType[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [period, setPeriod] = useState<string>("weekly");
  const [viewMode, setViewMode] = useState<"entries" | "summary">("entries");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimesheetEntryType | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    loadData();
  }, [startDate, endDate, period]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user
      const userData = localStorage.getItem('user');
      if (userData) {
        setCurrentUser(JSON.parse(userData));
      }

      // Load timesheet entries
      const entriesResponse = await api.getTimesheets(startDate, endDate);
      setEntries(entriesResponse.timesheets || []);

      // Load summary
      const summaryResponse = await api.getTimesheetSummary(period, startDate, endDate);
      setSummary(summaryResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load timesheet data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEntry = async (entryData: any) => {
    try {
      await api.createTimesheet(entryData);
      setIsFormOpen(false);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create timesheet entry');
    }
  };

  const handleUpdateEntry = async (entryData: any) => {
    if (!editingEntry) return;

    try {
      await api.updateTimesheet(editingEntry.id, entryData);
      setIsFormOpen(false);
      setEditingEntry(null);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update timesheet entry');
    }
  };

  const handleDeleteEntry = async (entryId: number) => {
    if (!confirm('Are you sure you want to delete this timesheet entry?')) return;

    try {
      await api.deleteTimesheet(entryId);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete timesheet entry');
    }
  };

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.task.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.employeeName.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const handleExport = () => {
    // Simple CSV export
    const csvContent = [
      ['Date', 'Employee', 'Project', 'Task', 'Hours', 'Description'],
      ...filteredEntries.map(entry => [
        entry.date,
        entry.employeeName,
        entry.project,
        entry.task,
        entry.hours.toString(),
        entry.description
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timesheet-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <Loader />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Timesheet
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Track and manage your work hours
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setViewMode(viewMode === 'entries' ? 'summary' : 'entries')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
            >
              <BarChart3 className="w-5 h-5" />
              {viewMode === 'entries' ? 'View Summary' : 'View Entries'}
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <Download className="w-5 h-5" />
              Export CSV
            </button>
            <button
              onClick={() => setIsFormOpen(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Entry
            </button>
          </div>
        </div>

        {error && (
          <Alert type="error" message={error} isVisible={true} />
        )}

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Period
              </label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            {viewMode === 'entries' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search entries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        {viewMode === 'summary' && summary ? (
          <TimesheetSummary summary={summary} userRole={currentUser?.role || ''} />
        ) : (
          <div className="space-y-6">
            {filteredEntries.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No timesheet entries found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {searchTerm || startDate || endDate
                    ? "Try adjusting your search or date filters"
                    : "Get started by adding your first timesheet entry"
                  }
                </p>
                {!searchTerm && !startDate && !endDate && (
                  <button
                    onClick={() => setIsFormOpen(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Entry
                  </button>
                )}
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredEntries.map((entry) => (
                  <TimesheetEntry
                    key={entry.id}
                    entry={entry}
                    onEdit={(entry) => {
                      setEditingEntry(entry);
                      setIsFormOpen(true);
                    }}
                    onDelete={handleDeleteEntry}
                    currentUserRole={currentUser?.role || ''}
                    currentUserId={currentUser?.id || 0}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Timesheet Form Modal */}
        <TimesheetForm
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingEntry(null);
          }}
          onSubmit={editingEntry ? handleUpdateEntry : handleCreateEntry}
          entry={editingEntry}
        />
      </div>
    </motion.div>
  );
}
