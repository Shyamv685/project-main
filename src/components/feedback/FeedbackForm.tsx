import { useState } from "react";
import * as Icons from "lucide-react";

interface FeedbackFormProps {
  onSubmit: (feedbackData: {
    type: string;
    title: string;
    description: string;
    rating: number;
    category: string;
    anonymous: boolean;
  }) => void;
}

export default function FeedbackForm({ onSubmit }: FeedbackFormProps) {
  const [type, setType] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [category, setCategory] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);

  const feedbackTypes = [
    { value: 'work_environment', label: 'Work Environment', icon: Icons.Building },
    { value: 'policies', label: 'Policies', icon: Icons.FileText },
    { value: 'management', label: 'Management', icon: Icons.Users },
    { value: 'monthly_survey', label: 'Monthly Satisfaction Survey', icon: Icons.BarChart3 },
    { value: 'other', label: 'Other', icon: Icons.MessageSquare }
  ];

  const categories = [
    'Work Environment',
    'Management',
    'Policies',
    'Benefits',
    'Communication',
    'Work-Life Balance',
    'Career Development',
    'Team Collaboration',
    'Tools & Technology',
    'Other'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!type || !title || rating === 0 || !category) return;

    setLoading(true);
    try {
      await onSubmit({
        type,
        title,
        description,
        rating,
        category,
        anonymous
      });

      // Reset form
      setType('');
      setTitle('');
      setDescription('');
      setRating(0);
      setCategory('');
      setAnonymous(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Feedback Type *
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {feedbackTypes.map((feedbackType) => (
            <button
              key={feedbackType.value}
              type="button"
              onClick={() => setType(feedbackType.value)}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                type === feedbackType.value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              <feedbackType.icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {feedbackType.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Category *
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
        >
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Title *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          placeholder="Brief title for your feedback"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          placeholder="Provide detailed feedback..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Overall Rating *
        </label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-1"
            >
              <Icons.Star
                className={`w-8 h-8 ${
                  star <= (hoverRating || rating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>
        {rating > 0 && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {rating === 1 && "Poor"}
            {rating === 2 && "Fair"}
            {rating === 3 && "Good"}
            {rating === 4 && "Very Good"}
            {rating === 5 && "Excellent"}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="anonymous"
          checked={anonymous}
          onChange={(e) => setAnonymous(e.target.checked)}
          className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700"
        />
        <label htmlFor="anonymous" className="text-sm text-gray-700 dark:text-gray-300">
          Submit anonymously
        </label>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          type="submit"
          disabled={!type || !title || rating === 0 || !category || loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {loading && <Icons.Loader className="w-4 h-4 animate-spin" />}
          Submit Feedback
        </button>
      </div>
    </form>
  );
}
