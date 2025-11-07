import { useState } from "react";
import { X, Calendar, Clock, Users, Save } from "lucide-react";

interface Interview {
  id?: number;
  candidateId: number;
  candidateName: string;
  position: string;
  date: string;
  time: string;
  duration: number; // in minutes
  interviewers: string[];
  type: 'phone' | 'video' | 'in-person';
  location?: string;
  notes?: string;
}

interface InterviewSchedulerProps {
  candidateId?: number;
  candidateName?: string;
  position?: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (interview: Interview) => void;
}

export default function InterviewScheduler({
  candidateId,
  candidateName,
  position,
  isOpen,
  onClose,
  onSave
}: InterviewSchedulerProps) {
  const [formData, setFormData] = useState<Interview>({
    candidateId: candidateId || 0,
    candidateName: candidateName || "",
    position: position || "",
    date: "",
    time: "",
    duration: 60,
    interviewers: [],
    type: 'video',
    location: "",
    notes: "",
  });

  const [newInterviewer, setNewInterviewer] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const interviewData = {
      ...formData,
      id: Date.now(),
    };
    onSave(interviewData);
    onClose();
  };

  const handleChange = (field: keyof Interview, value: string | number | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addInterviewer = () => {
    if (newInterviewer.trim() && !formData.interviewers.includes(newInterviewer.trim())) {
      setFormData(prev => ({
        ...prev,
        interviewers: [...prev.interviewers, newInterviewer.trim()]
      }));
      setNewInterviewer("");
    }
  };

  const removeInterviewer = (interviewer: string) => {
    setFormData(prev => ({
      ...prev,
      interviewers: prev.interviewers.filter(i => i !== interviewer)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Schedule Interview
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Candidate Info */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Candidate Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Name</label>
                <p className="text-gray-900 dark:text-white font-medium">{candidateName}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Position</label>
                <p className="text-gray-900 dark:text-white font-medium">{position}</p>
              </div>
            </div>
          </div>

          {/* Interview Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date *
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => handleChange("date", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Time *
              </label>
              <input
                type="time"
                required
                value={formData.time}
                onChange={(e) => handleChange("time", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Duration (minutes)
              </label>
              <select
                value={formData.duration}
                onChange={(e) => handleChange("duration", parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>1 hour</option>
                <option value={90}>1.5 hours</option>
                <option value={120}>2 hours</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Interview Type *
              </label>
              <select
                required
                value={formData.type}
                onChange={(e) => handleChange("type", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="phone">Phone</option>
                <option value="video">Video Call</option>
                <option value="in-person">In-Person</option>
              </select>
            </div>
          </div>

          {/* Location (conditional) */}
          {(formData.type === 'in-person') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Location *
              </label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => handleChange("location", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="e.g., Conference Room A, 123 Main St"
              />
            </div>
          )}

          {/* Interviewers */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Interviewers
            </label>
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newInterviewer}
                  onChange={(e) => setNewInterviewer(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterviewer())}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Add interviewer name..."
                />
                <button
                  type="button"
                  onClick={addInterviewer}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
              {formData.interviewers.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.interviewers.map((interviewer, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 rounded-full text-sm"
                    >
                      {interviewer}
                      <button
                        type="button"
                        onClick={() => removeInterviewer(interviewer)}
                        className="hover:text-red-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notes
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Any special instructions or notes for the interview..."
            />
          </div>

          {/* Preview */}
          {formData.date && formData.time && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Interview Preview</h4>
              <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <p><Calendar className="w-4 h-4 inline mr-2" />{new Date(formData.date).toLocaleDateString()}</p>
                <p><Clock className="w-4 h-4 inline mr-2" />{formData.time} ({formData.duration} minutes)</p>
                <p><Users className="w-4 h-4 inline mr-2" />{formData.interviewers.length} interviewer(s)</p>
                <p>Type: {formData.type}</p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Save className="w-4 h-4" />
              Schedule Interview
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
