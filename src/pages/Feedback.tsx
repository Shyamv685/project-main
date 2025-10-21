import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { api } from "../lib/api";
import FeedbackForm from "../components/feedback/FeedbackForm";
import FeedbackCard from "../components/feedback/FeedbackCard";
import FeedbackStats from "../components/feedback/FeedbackStats";

interface Feedback {
  id: number;
  employeeId: number;
  employeeName: string;
  type: string;
  title: string;
  description: string;
  rating: number;
  category: string;
  anonymous: boolean;
  submittedAt: string;
  status: string;
  reviewedAt?: string;
}

export default function Feedback() {
  const [activeTab, setActiveTab] = useState<'submit' | 'my' | 'all' | 'stats'>('submit');
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setUserRole(user.role);
    }
    loadFeedbacks();
    if (userRole === 'hr') {
      loadStats();
    }
  }, [userRole]);

  const loadFeedbacks = async () => {
    try {
      setLoading(true);
      const response = await api.getFeedbacks();
      setFeedbacks(response.feedbacks);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await api.getFeedbackStats();
      setStats(response.stats);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSubmitFeedback = async (feedbackData: any) => {
    try {
      await api.submitEmployeeFeedback(feedbackData);
      await loadFeedbacks();
      setActiveTab('my');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUpdateStatus = async (feedbackId: number, status: string) => {
    try {
      await api.updateFeedbackStatus(feedbackId, status);
      await loadFeedbacks();
      await loadStats();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const tabs = [
    { id: 'submit', label: 'Submit Feedback', icon: Icons.MessageSquare, roles: ['employee'] },
    { id: 'my', label: 'My Feedback', icon: Icons.User, roles: ['employee'] },
    { id: 'all', label: 'All Feedback', icon: Icons.List, roles: ['hr'] },
    { id: 'stats', label: 'Statistics', icon: Icons.BarChart3, roles: ['hr'] }
  ].filter(tab => tab.roles.includes(userRole));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {userRole === 'hr' ? 'Employee Feedback' : 'Feedback'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {userRole === 'hr'
              ? 'View and manage employee feedback and satisfaction surveys'
              : 'Share your thoughts about work environment, policies, and management'
            }
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Icons.MessageSquare className="w-8 h-8 text-blue-600" />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Icons.AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-800 dark:text-red-200">{error}</span>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'submit' && userRole === 'employee' && (
            <div className="max-w-2xl">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Submit Your Feedback
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Your feedback helps us improve the workplace. All submissions are confidential.
                </p>
              </div>
              <FeedbackForm onSubmit={handleSubmitFeedback} />
            </div>
          )}

          {activeTab === 'my' && userRole === 'employee' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">My Feedback History</h2>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Icons.MessageSquare className="w-4 h-4" />
                  <span>{feedbacks.length} submissions</span>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Icons.Loader className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : (
                <div className="space-y-4">
                  {feedbacks.map((feedback) => (
                    <FeedbackCard
                      key={feedback.id}
                      feedback={feedback}
                      isHR={false}
                      onUpdateStatus={handleUpdateStatus}
                    />
                  ))}
                </div>
              )}

              {feedbacks.length === 0 && !loading && (
                <div className="text-center py-12">
                  <Icons.MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No feedback submitted yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Share your thoughts to help improve our workplace.
                  </p>
                  <button
                    onClick={() => setActiveTab('submit')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Submit Your First Feedback
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'all' && userRole === 'hr' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">All Employee Feedback</h2>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span>Total: {feedbacks.length}</span>
                  <span>Pending: {feedbacks.filter(f => f.status === 'pending').length}</span>
                  <span>Reviewed: {feedbacks.filter(f => f.status === 'reviewed').length}</span>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Icons.Loader className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : (
                <div className="space-y-4">
                  {feedbacks.map((feedback) => (
                    <FeedbackCard
                      key={feedback.id}
                      feedback={feedback}
                      isHR={true}
                      onUpdateStatus={handleUpdateStatus}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'stats' && userRole === 'hr' && stats && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Feedback Statistics</h2>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Icons.BarChart3 className="w-4 h-4" />
                  <span>Real-time insights</span>
                </div>
              </div>

              <FeedbackStats stats={stats} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
