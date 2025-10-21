import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { api } from "../lib/api";

interface Announcement {
  id: number;
  title: string;
  content: string;
  type: string;
  priority: string;
  createdBy: number;
  createdByName: string;
  createdAt: string;
  isActive: boolean;
  targetAudience: string;
}

export default function Announcements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    type: "general",
    priority: "normal",
    targetAudience: "all"
  });

  useEffect(() => {
    // Get user role from localStorage first
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setUserRole(user.role || "");
    loadAnnouncements();
  }, []);

  // Separate useEffect to filter announcements when userRole changes
  useEffect(() => {
    if (userRole) {
      filterAnnouncements();
    }
  }, [userRole]);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      const response = await api.getAnnouncements();
      setAnnouncements(response.announcements);
    } catch (err) {
      setError("Failed to load announcements");
      console.error("Error loading announcements:", err);
    } finally {
      setLoading(false);
    }
  };

  const filterAnnouncements = () => {
    // Filter announcements based on user role
    if (userRole === "employee") {
      setAnnouncements(prev => prev.filter(
        (announcement: Announcement) =>
          announcement.targetAudience === "all" || announcement.targetAudience === "employees"
      ));
    }
    // HR users see all announcements, no filtering needed
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createAnnouncement(newAnnouncement);
      setNewAnnouncement({
        title: "",
        content: "",
        type: "general",
        priority: "normal",
        targetAudience: "all"
      });
      setShowCreateForm(false);
      loadAnnouncements();
    } catch (err) {
      console.error("Error creating announcement:", err);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300";
      case "medium": return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300";
      default: return "text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "training": return <Icons.BookOpen className="w-5 h-5" />;
      case "maintenance": return <Icons.Wrench className="w-5 h-5" />;
      case "policy": return <Icons.FileText className="w-5 h-5" />;
      default: return <Icons.Info className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6"
      >
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6"
      >
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 sm:p-6"
    >
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {userRole === "hr" ? "HR Announcements Management" : "Announcements"}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
            {userRole === "hr"
              ? "Manage and create company-wide announcements to keep everyone informed."
              : "Stay updated with the latest company announcements."
            }
          </p>
        </div>
        {userRole === "hr" && (
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors w-full sm:w-auto justify-center"
          >
            <Icons.Plus className="w-4 h-4" />
            Create Announcement
          </button>
        )}
      </div>

      {userRole === "hr" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 sm:p-6 border border-blue-200 dark:border-blue-800"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg flex-shrink-0">
              <Icons.Megaphone className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                HR Announcement Center
              </h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base mb-3">
                As an HR professional, you have the power to communicate important updates, policies, and information to the entire organization.
                Use this platform to create targeted announcements that reach the right audience at the right time.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Icons.Users className="w-4 h-4 text-blue-600" />
                  <span className="text-gray-600 dark:text-gray-400">Target specific groups</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icons.AlertTriangle className="w-4 h-4 text-yellow-600" />
                  <span className="text-gray-600 dark:text-gray-400">Set priority levels</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icons.Clock className="w-4 h-4 text-green-600" />
                  <span className="text-gray-600 dark:text-gray-400">Real-time delivery</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {showCreateForm && userRole === "hr" && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6 mb-6"
        >
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 dark:text-white">Create New Announcement</h2>
          <form onSubmit={handleCreateAnnouncement} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
              <input
                type="text"
                value={newAnnouncement.title}
                onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Content</label>
              <textarea
                value={newAnnouncement.content}
                onChange={(e) => setNewAnnouncement({...newAnnouncement, content: e.target.value})}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                <select
                  value={newAnnouncement.type}
                  onChange={(e) => setNewAnnouncement({...newAnnouncement, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="general">General</option>
                  <option value="training">Training</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="policy">Policy</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                <select
                  value={newAnnouncement.priority}
                  onChange={(e) => setNewAnnouncement({...newAnnouncement, priority: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="normal">Normal</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="sm:col-span-2 lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Audience</label>
                <select
                  value={newAnnouncement.targetAudience}
                  onChange={(e) => setNewAnnouncement({...newAnnouncement, targetAudience: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">All Employees</option>
                  <option value="employees">Employees Only</option>
                  <option value="hr">HR Only</option>
                </select>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Create Announcement
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="space-y-4">
        {announcements.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <p className="text-gray-500 dark:text-gray-400 text-center">No announcements available at the moment.</p>
          </div>
        ) : (
          announcements.map((announcement) => (
            <motion.div
              key={announcement.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg flex-shrink-0">
                    {getTypeIcon(announcement.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white break-words">{announcement.title}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        By {announcement.createdByName}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:inline">•</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(announcement.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(announcement.priority)} self-start`}>
                  {announcement.priority.toUpperCase()}
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed break-words">{announcement.content}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {announcement.type}
                </span>
                {announcement.targetAudience !== "all" && (
                  <>
                    <span className="text-xs text-gray-500 dark:text-gray-400">•</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      For {announcement.targetAudience}
                    </span>
                  </>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}
