import * as Icons from "lucide-react";

interface Training {
  id: number;
  title: string;
  trainer: string;
  date: string;
  category: string;
  enrollment: {
    completedAt?: string;
  };
}

interface CertificateCardProps {
  training: Training;
}

export default function CertificateCard({ training }: CertificateCardProps) {
  const handleDownload = () => {
    // In a real app, this would download the actual certificate PDF
    alert('Certificate download feature would be implemented here');
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
          <Icons.Award className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Certificate of Completion
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {training.title}
          </p>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Icons.User className="w-4 h-4" />
          <span>Trainer: {training.trainer}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Icons.Calendar className="w-4 h-4" />
          <span>Completed: {training.enrollment.completedAt ? new Date(training.enrollment.completedAt).toLocaleDateString() : 'N/A'}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Icons.Tag className="w-4 h-4" />
          <span>Category: {training.category}</span>
        </div>
      </div>

      <button
        onClick={handleDownload}
        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
      >
        <Icons.Download className="w-4 h-4" />
        Download Certificate
      </button>
    </div>
  );
}
