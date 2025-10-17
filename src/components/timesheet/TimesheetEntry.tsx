import { motion } from "framer-motion";
import { Calendar, Clock, Briefcase, FileText, Edit, Trash2 } from "lucide-react";

interface TimesheetEntry {
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

interface TimesheetEntryProps {
  entry: TimesheetEntry;
  onEdit: (entry: TimesheetEntry) => void;
  onDelete: (id: number) => void;
  currentUserRole: string;
  currentUserId: number;
}

export default function TimesheetEntry({ entry, onEdit, onDelete, currentUserRole, currentUserId }: TimesheetEntryProps) {
  const canEdit = currentUserRole === 'hr' || entry.employeeId === currentUserId;
  const canDelete = currentUserRole === 'hr' || entry.employeeId === currentUserId;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatHours = (hours: number) => {
    return hours % 1 === 0 ? hours.toString() : hours.toFixed(1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {formatDate(entry.date)}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              by {entry.employeeName}
            </span>
          </div>
          {entry.project && (
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                {entry.project}
              </span>
            </div>
          )}
          {entry.task && (
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-600 dark:text-green-400">
                {entry.task}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="flex items-center gap-1 text-lg font-semibold text-gray-900 dark:text-white">
              <Clock className="w-5 h-5 text-purple-500" />
              {formatHours(entry.hours)}h
            </div>
          </div>
          {(canEdit || canDelete) && (
            <div className="flex gap-1">
              {canEdit && (
                <button
                  onClick={() => onEdit(entry)}
                  className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  title="Edit entry"
                >
                  <Edit className="w-4 h-4" />
                </button>
              )}
              {canDelete && (
                <button
                  onClick={() => onDelete(entry.id)}
                  className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  title="Delete entry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {entry.description && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {entry.description}
          </p>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
        Created: {new Date(entry.createdAt).toLocaleString()}
        {entry.updatedAt !== entry.createdAt && (
          <span className="ml-4">
            Updated: {new Date(entry.updatedAt).toLocaleString()}
          </span>
        )}
      </div>
    </motion.div>
  );
}
