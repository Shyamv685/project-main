import { useState } from "react";
import { FileText, Image, Download, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";

interface Document {
  id: number;
  employeeId: number;
  documentType: string;
  description: string;
  filename: string;
  fileUrl: string;
  uploadedAt: string;
  status: 'pending' | 'verified' | 'rejected';
  reviewedBy?: number;
  reviewedAt?: string;
  comments?: string;
  employeeName: string;
}

interface DocumentCardProps {
  document: Document;
  isHR: boolean;
  onStatusUpdate?: () => void;
}

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  aadhaar_card: 'Aadhaar Card',
  pan_card: 'PAN Card',
  passport: 'Passport',
  voter_id: 'Voter ID',
  driving_license: 'Driving License',
  rental_agreement: 'Rental Agreement',
  electricity_bill: 'Electricity Bill',
  ration_card: 'Ration Card',
  tenth_marksheet: '10th Mark Sheet',
  twelfth_marksheet: '12th Mark Sheet',
  degree_certificate: 'Degree Certificate',
  diploma_certificate: 'Diploma Certificate',
  pg_certificate: 'PG Certificate',
  skill_certificates: 'Course/Skill Certificates',
  offer_letter: 'Offer Letter',
  experience_letter: 'Experience Letter',
  relieving_letter: 'Relieving Letter',
  salary_slips: 'Salary Slips',
  resume_cv: 'Resume/CV',
  bank_passbook: 'Bank Passbook',
  cancelled_cheque: 'Cancelled Cheque',
  pf_uan_details: 'PF/UAN Details',
  medical_fitness: 'Medical Fitness Certificate',
  health_insurance: 'Health Insurance Card',
  medical_reports: 'Medical Reports',
  emergency_contact: 'Emergency Contact Form',
  family_id: 'Family ID/Dependents Info',
  employee_id: 'Employee ID',
  nda: 'NDA',
  joining_form: 'Joining Form/Appointment Letter',
  policy_acceptance: 'Policy Acceptance Form',
};

export default function DocumentCard({ document, isHR, onStatusUpdate }: DocumentCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState('');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    }
  };

  const getFileIcon = (filename: string) => {
    if (filename.toLowerCase().endsWith('.pdf')) {
      return <FileText className="w-8 h-8 text-red-500" />;
    }
    return <Image className="w-8 h-8 text-blue-500" />;
  };

  const handleDownload = async () => {
    try {
      const blob = await api.downloadDocument(document.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = document.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download document');
    }
  };

  const handleStatusUpdate = async (status: 'verified' | 'rejected') => {
    if (!comments.trim() && status === 'rejected') {
      alert('Please provide comments for rejection');
      return;
    }

    setIsUpdating(true);
    try {
      await api.updateDocumentStatus(document.id, {
        status,
        comments: comments.trim() || undefined
      });
      onStatusUpdate?.();
      setShowComments(false);
      setComments('');
    } catch (error) {
      console.error('Status update failed:', error);
      alert('Failed to update document status');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {getFileIcon(document.filename)}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {DOCUMENT_TYPE_LABELS[document.documentType] || document.documentType}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {document.employeeName}
            </p>
          </div>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(document.status)}`}>
          {getStatusIcon(document.status)}
          {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
        </div>
      </div>

      {document.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {document.description}
        </p>
      )}

      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
        <span>Uploaded: {new Date(document.uploadedAt).toLocaleDateString()}</span>
        {document.reviewedAt && (
          <span>Reviewed: {new Date(document.reviewedAt).toLocaleDateString()}</span>
        )}
      </div>

      {document.comments && (
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Comments</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{document.comments}</p>
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Download
        </button>

        {isHR && document.status === 'pending' && (
          <>
            <button
              onClick={() => setShowComments(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              disabled={isUpdating}
            >
              <CheckCircle className="w-4 h-4" />
              Approve
            </button>
            <button
              onClick={() => setShowComments(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              disabled={isUpdating}
            >
              <XCircle className="w-4 h-4" />
              Reject
            </button>
          </>
        )}
      </div>

      {/* Comments Modal */}
      {showComments && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Add Comments
            </h3>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Add comments for this document..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={() => handleStatusUpdate('verified')}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                disabled={isUpdating}
              >
                {isUpdating ? 'Approving...' : 'Approve'}
              </button>
              <button
                onClick={() => handleStatusUpdate('rejected')}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                disabled={isUpdating || !comments.trim()}
              >
                {isUpdating ? 'Rejecting...' : 'Reject'}
              </button>
              <button
                onClick={() => setShowComments(false)}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
