import { useState, useRef } from "react";
import { Upload, FileText, Image, X, CheckCircle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";

interface DocumentUploadProps {
  onUploadSuccess?: () => void;
}

const DOCUMENT_TYPES = [
  // Personal Identification Documents
  { value: 'aadhaar_card', label: 'Aadhaar Card', category: 'Personal Identification' },
  { value: 'pan_card', label: 'PAN Card', category: 'Personal Identification' },
  { value: 'passport', label: 'Passport', category: 'Personal Identification' },
  { value: 'voter_id', label: 'Voter ID', category: 'Personal Identification' },
  { value: 'driving_license', label: 'Driving License', category: 'Personal Identification' },

  // Address Proof
  { value: 'rental_agreement', label: 'Rental Agreement', category: 'Address Proof' },
  { value: 'electricity_bill', label: 'Electricity Bill', category: 'Address Proof' },
  { value: 'ration_card', label: 'Ration Card', category: 'Address Proof' },

  // Educational Certificates
  { value: 'tenth_marksheet', label: '10th Mark Sheet', category: 'Educational Certificates' },
  { value: 'twelfth_marksheet', label: '12th Mark Sheet', category: 'Educational Certificates' },
  { value: 'degree_certificate', label: 'Degree Certificate', category: 'Educational Certificates' },
  { value: 'diploma_certificate', label: 'Diploma Certificate', category: 'Educational Certificates' },
  { value: 'pg_certificate', label: 'PG Certificate', category: 'Educational Certificates' },
  { value: 'skill_certificates', label: 'Course/Skill Certificates', category: 'Educational Certificates' },

  // Employment Documents
  { value: 'offer_letter', label: 'Offer Letter', category: 'Employment Documents' },
  { value: 'experience_letter', label: 'Experience Letter', category: 'Employment Documents' },
  { value: 'relieving_letter', label: 'Relieving Letter', category: 'Employment Documents' },
  { value: 'salary_slips', label: 'Salary Slips', category: 'Employment Documents' },
  { value: 'resume_cv', label: 'Resume/CV', category: 'Employment Documents' },

  // Bank & Finance Documents
  { value: 'bank_passbook', label: 'Bank Passbook', category: 'Bank & Finance' },
  { value: 'cancelled_cheque', label: 'Cancelled Cheque', category: 'Bank & Finance' },
  { value: 'pf_uan_details', label: 'PF/UAN Details', category: 'Bank & Finance' },

  // Medical / Health Documents
  { value: 'medical_fitness', label: 'Medical Fitness Certificate', category: 'Medical / Health' },
  { value: 'health_insurance', label: 'Health Insurance Card', category: 'Medical / Health' },
  { value: 'medical_reports', label: 'Medical Reports', category: 'Medical / Health' },

  // Emergency & Family Details
  { value: 'emergency_contact', label: 'Emergency Contact Form', category: 'Emergency & Family' },
  { value: 'family_id', label: 'Family ID/Dependents Info', category: 'Emergency & Family' },

  // Company-Specific Documents
  { value: 'employee_id', label: 'Employee ID', category: 'Company-Specific' },
  { value: 'nda', label: 'NDA', category: 'Company-Specific' },
  { value: 'joining_form', label: 'Joining Form/Appointment Letter', category: 'Company-Specific' },
  { value: 'policy_acceptance', label: 'Policy Acceptance Form', category: 'Company-Specific' },
];

export default function DocumentUpload({ onUploadSuccess }: DocumentUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState('');
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        setErrorMessage('Please select a PDF or image file (JPG, PNG)');
        setSelectedFile(null);
        return;
      }

      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage('File size must be less than 10MB');
        setSelectedFile(null);
        return;
      }

      setSelectedFile(file);
      setErrorMessage('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !documentType) {
      setErrorMessage('Please select a file and document type');
      return;
    }

    setIsUploading(true);
    setUploadStatus('idle');
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('documentType', documentType);
      formData.append('description', description);

      await api.uploadDocument(formData);

      setUploadStatus('success');
      setSelectedFile(null);
      setDocumentType('');
      setDescription('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Call success callback
      onUploadSuccess?.();

      // Reset success message after 3 seconds
      setTimeout(() => setUploadStatus('idle'), 3000);
    } catch (error: any) {
      setUploadStatus('error');
      setErrorMessage(error.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type === 'application/pdf') {
      return <FileText className="w-8 h-8 text-red-500" />;
    }
    return <Image className="w-8 h-8 text-blue-500" />;
  };

  const groupedDocumentTypes = DOCUMENT_TYPES.reduce((acc, doc) => {
    if (!acc[doc.category]) {
      acc[doc.category] = [];
    }
    acc[doc.category].push(doc);
    return acc;
  }, {} as Record<string, typeof DOCUMENT_TYPES>);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
    >
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Upload Document
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Upload your documents for HR verification. Only PDF and image files are accepted.
        </p>
      </div>

      <div className="space-y-6">
        {/* Document Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Document Type *
          </label>
          <select
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Select document type</option>
            {Object.entries(groupedDocumentTypes).map(([category, docs]) => (
              <optgroup key={category} label={category}>
                {docs.map((doc) => (
                  <option key={doc.value} value={doc.value}>
                    {doc.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description (Optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add any additional notes about this document..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select File *
          </label>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileSelect}
              className="hidden"
            />

            {!selectedFile ? (
              <div className="text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Click to select a file or drag and drop
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  PDF, JPG, PNG up to 10MB
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Choose File
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  {getFileIcon(selectedFile)}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedFile.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
            <AlertCircle className="w-4 h-4" />
            {errorMessage}
          </div>
        )}

        {/* Success Message */}
        {uploadStatus === 'success' && (
          <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
            <CheckCircle className="w-4 h-4" />
            Document uploaded successfully! It will be reviewed by HR.
          </div>
        )}

        {/* Upload Button */}
        <button
          type="button"
          onClick={handleUpload}
          disabled={!selectedFile || !documentType || isUploading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isUploading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Upload Document
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
