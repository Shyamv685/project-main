import { motion } from "framer-motion";
import * as Icons from "lucide-react";

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
}

interface TrainingCardProps {
  training: Training;
  onEnroll: (trainingId: number) => void;
}

export default function TrainingCard({ training, onEnroll }: TrainingCardProps) {
  const isFull = training.seatsAvailable === 0;
  const isEnrolled = training.isEnrolled;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            {training.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            by {training.trainer}
          </p>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          training.category === 'Technical'
            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
            : training.category === 'Soft Skills'
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
        }`}>
          {training.category}
        </span>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
        {training.description}
      </p>

      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Icons.Calendar className="w-4 h-4" />
          <span>{new Date(training.date).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Icons.Clock className="w-4 h-4" />
          <span>{training.startTime} - {training.endTime}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Icons.MapPin className="w-4 h-4" />
          <span>{training.mode}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Icons.Users className="w-4 h-4" />
          <span>{training.seatsAvailable} seats available</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
          training.status === 'Open'
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        }`}>
          {training.status}
        </span>

        <button
          onClick={() => onEnroll(training.id)}
          disabled={isFull || isEnrolled}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            isEnrolled
              ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed'
              : isFull
              ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isEnrolled ? 'Enrolled' : isFull ? 'Full' : 'Enroll'}
        </button>
      </div>
    </motion.div>
  );
}
