import { useState } from "react";
import { X, Star, Download, MessageSquare, Calendar, Edit, Save } from "lucide-react";

interface Candidate {
  id: number;
  name: string;
  email: string;
  phone: string;
  position: string;
  experience: string;
  status: 'new' | 'reviewed' | 'interviewed' | 'hired' | 'rejected';
  rating: number;
  appliedDate: string;
  resumeUrl?: string;
  notes?: string;
  skills?: string[];
  education?: string;
  portfolio?: string;
}

interface CandidateDetailsProps {
  candidate: Candidate;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (candidate: Candidate) => void;
  onScheduleInterview: (candidateId: number) => void;
}

export default function CandidateDetails({
  candidate,
  isOpen,
  onClose,
  onUpdate,
  onScheduleInterview
}: CandidateDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedNotes, setEditedNotes] = useState(candidate.notes || "");
  const [editedRating, setEditedRating] = useState(candidate.rating);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'reviewed': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'interviewed': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'hired': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const renderStars = (rating: number, interactive = false) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'} ${interactive ? 'cursor-pointer hover:text-yellow-500' : ''}`}
        onClick={interactive ? () => setEditedRating(i + 1) : undefined}
      />
    ));
  };

  const handleSaveNotes = () => {
    const updatedCandidate = {
      ...candidate,
      notes: editedNotes,
      rating: editedRating
    };
    onUpdate(updatedCandidate);
    setIsEditing(false);
  };

  const updateStatus = (newStatus: Candidate['status']) => {
    const updatedCandidate = { ...candidate, status: newStatus };
    onUpdate(updatedCandidate);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 h-16 w-16">
              <div className="h-16 w-16 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white font-bold text-xl">
                  {candidate.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {candidate.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Applied for {candidate.position}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <p className="text-gray-900 dark:text-white">{candidate.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone
                  </label>
                  <p className="text-gray-900 dark:text-white">{candidate.phone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Experience
                  </label>
                  <p className="text-gray-900 dark:text-white">{candidate.experience}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Applied Date
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {new Date(candidate.appliedDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Skills */}
              {candidate.skills && candidate.skills.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Skills
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {candidate.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {candidate.education && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Education
                  </label>
                  <p className="text-gray-900 dark:text-white">{candidate.education}</p>
                </div>
              )}

              {/* Portfolio */}
              {candidate.portfolio && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Portfolio
                  </label>
                  <a
                    href={candidate.portfolio}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {candidate.portfolio}
                  </a>
                </div>
              )}

              {/* Notes */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Notes
                  </label>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {isEditing ? (
                  <div className="space-y-3">
                    <textarea
                      value={editedNotes}
                      onChange={(e) => setEditedNotes(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Add notes about this candidate..."
                    />
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-700 dark:text-gray-300">Rating:</span>
                        <div className="flex">
                          {renderStars(editedRating, true)}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveNotes}
                          className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          <Save className="w-3 h-3" />
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setIsEditing(false);
                            setEditedNotes(candidate.notes || "");
                            setEditedRating(candidate.rating);
                          }}
                          className="px-3 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-gray-900 dark:text-white">
                      {candidate.notes || "No notes added yet."}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-700 dark:text-gray-300">Rating:</span>
                      <div className="flex">
                        {renderStars(candidate.rating)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(candidate.status)}`}>
                  {candidate.status}
                </span>
              </div>

              {/* Status Actions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Update Status
                </label>
                <div className="space-y-2">
                  {candidate.status === 'new' && (
                    <button
                      onClick={() => updateStatus('reviewed')}
                      className="w-full px-3 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm"
                    >
                      Mark as Reviewed
                    </button>
                  )}
                  {candidate.status === 'reviewed' && (
                    <button
                      onClick={() => onScheduleInterview(candidate.id)}
                      className="w-full px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
                    >
                      Schedule Interview
                    </button>
                  )}
                  {candidate.status === 'interviewed' && (
                    <>
                      <button
                        onClick={() => updateStatus('hired')}
                        className="w-full px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                      >
                        Mark as Hired
                      </button>
                      <button
                        onClick={() => updateStatus('rejected')}
                        className="w-full px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                      >
                        Reject Candidate
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Actions
                </label>
                <div className="space-y-2">
                  <button className="w-full flex items-center gap-2 px-3 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded">
                    <MessageSquare className="w-4 h-4" />
                    Send Message
                  </button>
                  {candidate.resumeUrl && (
                    <button className="w-full flex items-center gap-2 px-3 py-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded">
                      <Download className="w-4 h-4" />
                      Download Resume
                    </button>
                  )}
                  <button
                    onClick={() => onScheduleInterview(candidate.id)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                  >
                    <Calendar className="w-4 h-4" />
                    Schedule Interview
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
