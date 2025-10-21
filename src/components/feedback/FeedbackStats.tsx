import * as Icons from "lucide-react";

interface FeedbackStatsProps {
  stats: {
    total: number;
    pending: number;
    reviewed: number;
    resolved: number;
    averageRating: number;
    categories: Record<string, number>;
  };
}

export default function FeedbackStats({ stats }: FeedbackStatsProps) {
  const statCards = [
    {
      title: 'Total Feedback',
      value: stats.total,
      icon: Icons.MessageSquare,
      color: 'bg-blue-500'
    },
    {
      title: 'Pending Review',
      value: stats.pending,
      icon: Icons.Clock,
      color: 'bg-yellow-500'
    },
    {
      title: 'Reviewed',
      value: stats.reviewed,
      icon: Icons.CheckCircle,
      color: 'bg-blue-500'
    },
    {
      title: 'Resolved',
      value: stats.resolved,
      icon: Icons.CheckCircle2,
      color: 'bg-green-500'
    }
  ];

  const topCategories = Object.entries(stats.categories)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Average Rating */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Average Rating
          </h3>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Icons.Star
                key={star}
                className={`w-5 h-5 ${
                  star <= Math.round(stats.averageRating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
        <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {stats.averageRating.toFixed(1)}/5
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Based on {stats.total} feedback submissions
        </p>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Feedback by Category
        </h3>
        <div className="space-y-3">
          {topCategories.map(([category, count]) => {
            const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
            return (
              <div key={category} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-900 dark:text-white min-w-0 flex-1">
                    {category}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {count}
                  </span>
                </div>
                <div className="flex-1 ml-4">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400 ml-2 min-w-[3rem]">
                  {percentage.toFixed(1)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status Distribution */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Status Distribution
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">Pending</span>
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {stats.pending} ({stats.total > 0 ? ((stats.pending / stats.total) * 100).toFixed(1) : 0}%)
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">Reviewed</span>
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {stats.reviewed} ({stats.total > 0 ? ((stats.reviewed / stats.total) * 100).toFixed(1) : 0}%)
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">Resolved</span>
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {stats.resolved} ({stats.total > 0 ? ((stats.resolved / stats.total) * 100).toFixed(1) : 0}%)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
