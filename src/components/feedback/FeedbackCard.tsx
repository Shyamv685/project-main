import { useState } from "react";
import * as Icons from "lucide-react";

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

interface FeedbackCardProps {
  feedback: Feedback;
  isHR: boolean;
  onUpdateStatus: (feedbackId: number, status: string) => void;
}

export default function FeedbackCard({ feedback, isHR, onUpdateStatus }: FeedbackCardProps) {
  const [statusUpdating, setStatusUpdating] = useState(false);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'work_environment':
        return Icons.Building;
      case 'policies':
        return Icons.FileText;
      case 'management':
        return Icons.Users;
      case 'monthly_survey':
        return Icons.BarChart3;
      default:
        return Icons.MessageSquare;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setStatusUpdating(true);
    try {
      await onUpdateStatus(feedback.id, newStatus);
    } finally {
      setStatusUpdating(false);
    }
  };

  const TypeIcon = getTypeIcon(feedback.type);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
            <TypeIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              {feedback.title}
            </h3>
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span>by {feedback.employeeName}</span>
              <span>{feedback.category}</span>
              <span>{new Date(feedback.submittedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(feedback.status)}`}>
            {feedback.status}
          </span>
          {feedback.anonymous && (
            <Icons.EyeOff className="w-4 h-4 text-gray-400" title="Anonymous feedback" />
          )}
        </div>
      </div>

      {feedback.description && (
        <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
          {feedback.description}
        </p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Icons.Star
              key={star}
              className={`w-5 h-5 ${
                star <= feedback.rating
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          ))}
          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
            ({feedback.rating}/5)
          </span>
        </div>

        {isHR && (
          <div className="flex items-center gap-2">
            {statusUpdating ? (
              <Icons.Loader className="w-4 h-4 animate-spin text-blue-600" />
            ) : (
              <>
                {feedback.status !== 'reviewed' && (
                  <button
                    onClick={() => handleStatusChange('reviewed')}
                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    Mark Reviewed
                  </button>
                )}
                {feedback.status !== 'resolved' && (
                  <button
                    onClick={() => handleStatusChange('resolved')}
                    className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  >
                    Mark Resolved
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {feedback.reviewedAt && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Reviewed on {new Date(feedback.reviewedAt).toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  );
}
