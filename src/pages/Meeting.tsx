import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Filter } from "lucide-react";
import { api } from "../lib/api";
import MeetingCard from "../components/meeting/MeetingCard";
import MeetingForm from "../components/meeting/MeetingForm";
import Loader from "../components/common/Loader";
import Alert from "../components/common/Alert";

interface Meeting {
  id: number;
  organizerId: number;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  agenda: string;
  participants: number[];
  status: string;
  organizerName: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default function Meeting() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user
      const userData = localStorage.getItem('user');
      if (userData) {
        setCurrentUser(JSON.parse(userData));
      }

      // Load meetings and users
      const [meetingsResponse, usersResponse] = await Promise.all([
        api.getMeetings(),
        // For now, we'll assume users are available through some other means
        // In a real app, you'd have a getUsers API endpoint
        Promise.resolve({ users: [] })
      ]);

      setMeetings(meetingsResponse.meetings || []);
      setUsers(usersResponse.users || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMeeting = async (meetingData: any) => {
    try {
      await api.createMeeting(meetingData);
      setIsFormOpen(false);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create meeting');
    }
  };

  const handleUpdateMeeting = async (meetingData: any) => {
    if (!editingMeeting) return;

    try {
      await api.updateMeeting(editingMeeting.id, meetingData);
      setIsFormOpen(false);
      setEditingMeeting(null);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update meeting');
    }
  };

  const handleDeleteMeeting = async (meetingId: number) => {
    if (!confirm('Are you sure you want to delete this meeting?')) return;

    try {
      await api.deleteMeeting(meetingId);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete meeting');
    }
  };

  const filteredMeetings = meetings.filter(meeting => {
    const matchesSearch = meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         meeting.organizerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         meeting.agenda.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || meeting.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Meetings
          </h1>
          <button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Meeting
          </button>
        </div>

        {error && (
          <Alert type="error" message={error} isVisible={true} />
        )}

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search meetings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Meetings List */}
        <div className="space-y-6">
          {filteredMeetings.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No meetings found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Get started by creating your first meeting"
                }
              </p>
              {!searchTerm && statusFilter === "all" && (
                <button
                  onClick={() => setIsFormOpen(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Meeting
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredMeetings.map((meeting) => (
                <MeetingCard
                  key={meeting.id}
                  meeting={meeting}
                  onEdit={(meeting) => {
                    setEditingMeeting(meeting);
                    setIsFormOpen(true);
                  }}
                  onDelete={handleDeleteMeeting}
                  currentUserRole={currentUser?.role || ''}
                  currentUserId={currentUser?.id || 0}
                />
              ))}
            </div>
          )}
        </div>

        {/* Meeting Form Modal */}
        <MeetingForm
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingMeeting(null);
          }}
          onSubmit={editingMeeting ? handleUpdateMeeting : handleCreateMeeting}
          meeting={editingMeeting}
          users={users}
        />
      </div>
    </motion.div>
  );
}
