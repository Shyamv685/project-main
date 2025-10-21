import { useState } from "react";
import * as Icons from "lucide-react";
import FeedbackForm from "./FeedbackForm";

interface Training {
  id: number;
  title: string;
  trainer: string;
  date: string;
  startTime: string;
  endTime: string;
  mode: string;
  category: string;
  enrollment: {
    id: number;
    status: string;
    progress: number;
    completedAt?: string;
    rating?: number;
    feedback?: string;
  };
}

interface TrainingTableProps {
  trainings: Training[];
  onComplete: (trainingId: number) => void;
  onFeedback: (trainingId: number, rating: number, feedback: string) => void;
}

export default function TrainingTable({ trainings, onComplete, onFeedback }: TrainingTableProps) {
  const [feedbackTraining, setFeedbackTraining] = useState<Training | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Enrolled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress === 100) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Training
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Date & Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Progress
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {trainings.map((training) => (
              <tr key={training.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {training.title}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {training.trainer} • {training.category}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {new Date(training.date).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {training.startTime} - {training.endTime}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getProgressColor(training.enrollment.progress)}`}
                        style={{ width: `${training.enrollment.progress}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {training.enrollment.progress}%
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(training.enrollment.status)}`}>
                    {training.enrollment.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2">
                    {training.enrollment.status === 'Enrolled' && (
                      <button
                        onClick={() => onComplete(training.id)}
                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                      >
                        <Icons.CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    {training.enrollment.status === 'Completed' && !training.enrollment.rating && (
                      <button
                        onClick={() => setFeedbackTraining(training)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <Icons.MessageSquare className="w-4 h-4" />
                      </button>
                    )}
                    {training.enrollment.rating && (
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Icons.Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < (training.enrollment.rating || 0)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {trainings.length === 0 && (
        <div className="text-center py-12">
          <Icons.BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No trainings enrolled
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Start by enrolling in available trainings from the Available Trainings tab.
          </p>
        </div>
      )}

      {feedbackTraining && (
        <FeedbackForm
          training={feedbackTraining}
          onSubmit={(rating, feedback) => {
            onFeedback(feedbackTraining.id, rating, feedback);
            setFeedbackTraining(null);
          }}
          onClose={() => setFeedbackTraining(null)}
        />
      )}
    </>
  );
}
