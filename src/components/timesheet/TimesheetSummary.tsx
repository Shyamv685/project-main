import { motion } from "framer-motion";
import { Clock, Users, Briefcase, TrendingUp } from "lucide-react";

interface TimesheetSummaryProps {
  summary: {
    period: {
      start_date: string;
      end_date: string;
      type: string;
    };
    total_hours: number;
    total_entries: number;
    project_summary: Record<string, { hours: number; entries: number }>;
    employee_summary?: Record<string, { hours: number; entries: number }> | null;
  };
  userRole: string;
}

export default function TimesheetSummary({ summary, userRole }: TimesheetSummaryProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatHours = (hours: number) => {
    return hours % 1 === 0 ? hours.toString() : hours.toFixed(1);
  };

  const getPeriodLabel = () => {
    const { start_date, end_date, type } = summary.period;
    if (type === 'weekly') {
      return `Week of ${formatDate(start_date)}`;
    } else if (type === 'monthly') {
      return new Date(start_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } else {
      return `${formatDate(start_date)} - ${formatDate(end_date)}`;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Timesheet Summary
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {getPeriodLabel()}
        </span>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Hours</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {formatHours(summary.total_hours)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400" />
            <div>
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">Total Entries</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                {summary.total_entries}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            <div>
              <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Projects</p>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {Object.keys(summary.project_summary).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Project Summary */}
      <div className="mb-6">
        <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <Briefcase className="w-5 h-5" />
          Project Breakdown
        </h4>
        <div className="space-y-2">
          {Object.entries(summary.project_summary).map(([project, data]) => (
            <div key={project} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex-1">
                <span className="font-medium text-gray-900 dark:text-white">
                  {project || 'No Project'}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                  ({data.entries} entries)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {formatHours(data.hours)}h
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Employee Summary (HR only) */}
      {userRole === 'hr' && summary.employee_summary && Object.keys(summary.employee_summary).length > 0 && (
        <div>
          <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Employee Breakdown
          </h4>
          <div className="space-y-2">
            {Object.entries(summary.employee_summary).map(([employee, data]) => (
              <div key={employee} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex-1">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {employee}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                    ({data.entries} entries)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-green-500" />
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    {formatHours(data.hours)}h
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
