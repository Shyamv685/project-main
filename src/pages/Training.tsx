import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { api } from "../lib/api";
import TrainingCard from "../components/training/TrainingCard";
import TrainingTable from "../components/training/TrainingTable";
import CertificateCard from "../components/training/CertificateCard";
import FeedbackForm from "../components/training/FeedbackForm";
import TrainingCalendar from "../components/training/TrainingCalendar";

interface Training {
  id: number;
  title: string;
  trainer: string;
  date: string;
  startTime: string;
  endTime: string;
  mode: string;
  seatsAvailable: number;
  totalSeats: number;
  description: string;
  category: string;
  status: string;
  isEnrolled?: boolean;
  enrollment?: {
    id: number;
    status: string;
    progress: number;
    completedAt?: string;
    rating?: number;
    feedback?: string;
  };
}

export default function Training() {
  const [activeTab, setActiveTab] = useState<'available' | 'my' | 'certificates' | 'calendar'>('available');
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [myTrainings, setMyTrainings] = useState<Training[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTrainings();
    loadMyTrainings();
  }, []);

  const loadTrainings = async () => {
    try {
      setLoading(true);
      const response = await api.getTrainings();
      setTrainings(response.trainings);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadMyTrainings = async () => {
    try {
      const response = await api.getMyTrainings();
      setMyTrainings(response.trainings);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEnroll = async (trainingId: number) => {
    try {
      await api.enrollTraining(trainingId);
      await loadTrainings();
      await loadMyTrainings();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleComplete = async (trainingId: number) => {
    try {
      await api.completeTraining(trainingId);
      await loadMyTrainings();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleFeedback = async (trainingId: number, rating: number, feedback: string) => {
    try {
      await api.submitFeedback(trainingId, rating, feedback);
      await loadMyTrainings();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const tabs = [
    { id: 'available', label: 'Available Trainings', icon: Icons.BookOpen },
    { id: 'my', label: 'My Trainings', icon: Icons.UserCheck },
    { id: 'certificates', label: 'Certificates', icon: Icons.Award },
    { id: 'calendar', label: 'Training Calendar', icon: Icons.Calendar }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Training & Development</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Enhance your skills and track your professional growth
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Icons.GraduationCap className="w-8 h-8 text-blue-600" />
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
          {activeTab === 'available' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Available Trainings</h2>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Icons.Info className="w-4 h-4" />
                  <span>{trainings.filter(t => t.status === 'Open').length} trainings available</span>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Icons.Loader className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {trainings.map((training) => (
                    <TrainingCard
                      key={training.id}
                      training={training}
                      onEnroll={handleEnroll}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'my' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">My Trainings</h2>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Icons.CheckCircle className="w-4 h-4" />
                  <span>{myTrainings.filter(t => t.enrollment?.status === 'Completed').length} completed</span>
                </div>
              </div>

              <TrainingTable
                trainings={myTrainings}
                onComplete={handleComplete}
                onFeedback={handleFeedback}
              />
            </div>
          )}

          {activeTab === 'certificates' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">My Certificates</h2>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Icons.Award className="w-4 h-4" />
                  <span>{certificates.length} certificates earned</span>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {myTrainings
                  .filter(t => t.enrollment?.status === 'Completed')
                  .map((training) => (
                    <CertificateCard
                      key={training.id}
                      training={training}
                    />
                  ))}
              </div>
            </div>
          )}

          {activeTab === 'calendar' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Training Calendar</h2>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Icons.Calendar className="w-4 h-4" />
                  <span>View scheduled trainings</span>
                </div>
              </div>

              <TrainingCalendar trainings={trainings} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
