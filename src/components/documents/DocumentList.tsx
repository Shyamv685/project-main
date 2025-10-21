import { useState, useEffect } from "react";
import { Search, FileText, CheckCircle, XCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import DocumentCard from "./DocumentCard";

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

interface DocumentListProps {
  isHR?: boolean;
}

export default function DocumentList({ isHR = false }: DocumentListProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const fetchDocuments = async () => {
    try {
      const response = await api.getDocuments();
      setDocuments(response.documents);
      setFilteredDocuments(response.documents);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    let filtered = documents;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(doc =>
        doc.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.documentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(doc => doc.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(doc => doc.documentType === typeFilter);
    }

    setFilteredDocuments(filtered);
  }, [documents, searchTerm, statusFilter, typeFilter]);

  const getStatusStats = () => {
    const stats = {
      pending: documents.filter(d => d.status === 'pending').length,
      verified: documents.filter(d => d.status === 'verified').length,
      rejected: documents.filter(d => d.status === 'rejected').length,
    };
    return stats;
  };

  const stats = getStatusStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isHR ? 'Document Management' : 'My Documents'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {isHR ? 'Review and manage employee documents' : 'View your uploaded documents'}
          </p>
        </div>

        {isHR && (
          <div className="flex gap-4">
            <div className="flex items-center gap-2 px-3 py-2 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 rounded-lg">
              <Clock className="w-4 h-4" />
              <span className="font-medium">{stats.pending} Pending</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 rounded-lg">
              <CheckCircle className="w-4 h-4" />
              <span className="font-medium">{stats.verified} Verified</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 rounded-lg">
              <XCircle className="w-4 h-4" />
              <span className="font-medium">{stats.rejected} Rejected</span>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Types</option>
            <option value="aadhaar_card">Aadhaar Card</option>
            <option value="pan_card">PAN Card</option>
            <option value="passport">Passport</option>
            <option value="driving_license">Driving License</option>
            <option value="tenth_marksheet">10th Mark Sheet</option>
            <option value="twelfth_marksheet">12th Mark Sheet</option>
            <option value="degree_certificate">Degree Certificate</option>
            <option value="offer_letter">Offer Letter</option>
            <option value="experience_letter">Experience Letter</option>
            <option value="salary_slips">Salary Slips</option>
            <option value="resume_cv">Resume/CV</option>
          </select>
        </div>
      </div>

      {/* Documents Grid */}
      {filteredDocuments.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No documents found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
              ? 'Try adjusting your filters'
              : isHR
                ? 'No documents have been uploaded yet'
                : 'You haven\'t uploaded any documents yet'
            }
          </p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {filteredDocuments.map((document) => (
            <DocumentCard
              key={document.id}
              document={document}
              isHR={isHR}
              onStatusUpdate={fetchDocuments}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
}
