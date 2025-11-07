import { useState, useEffect } from "react";
import { Search, Eye, Plus, Trash2 } from "lucide-react";
import CandidateDetails from "../components/candidates/CandidateDetails";
import InterviewScheduler from "../components/interviews/InterviewScheduler";
import JobManager from "../components/jobs/JobManager";
import JobForm from "../components/jobs/JobForm";
import Modal from "../components/common/Modal";
import Alert from "../components/common/Alert";

interface Job {
  id: number;
  title: string;
  department: string;
  location: string;
  type: string;
  status: 'active' | 'draft' | 'closed';
  applicants?: number;
  postedDate: string;
  description: string;
  requirements: string;
  salary: string;
  benefits: string;
}

export default function Jobs() {
  const [userRole, setUserRole] = useState<string>("employee");
  const [jobs, setJobs] = useState<Job[]>([
    {
      id: 1,
      title: "Senior Software Engineer",
      department: "Engineering",
      location: "New York, NY",
      type: "Full-time",
      status: 'active',
      applicants: 24,
      postedDate: "2025-10-10",
      description: "We are looking for a Senior Software Engineer to join our engineering team...",
      requirements: "5+ years of experience, React, Node.js, TypeScript",
      salary: "$120,000 - $160,000",
      benefits: "Health insurance, 401k, remote work options"
    },
    {
      id: 2,
      title: "Product Manager",
      department: "Product",
      location: "San Francisco, CA",
      type: "Full-time",
      status: 'active',
      applicants: 18,
      postedDate: "2025-10-08",
      description: "Lead product strategy and execution for our core products...",
      requirements: "3+ years PM experience, analytics skills, leadership",
      salary: "$130,000 - $170,000",
      benefits: "Stock options, health/dental/vision, flexible PTO"
    },
    {
      id: 3,
      title: "UX Designer",
      department: "Design",
      location: "Remote",
      type: "Contract",
      status: 'draft',
      applicants: 0,
      postedDate: "2025-10-12",
      description: "Create intuitive user experiences for our web applications...",
      requirements: "3+ years UX design, Figma, user research skills",
      salary: "$80 - $120/hour",
      benefits: "Flexible schedule, project-based work"
    }
  ]);

  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showCandidateDetails, setShowCandidateDetails] = useState(false);
  const [showInterviewScheduler, setShowInterviewScheduler] = useState(false);
  const [showJobManager, setShowJobManager] = useState(false);
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [alert, setAlert] = useState<{
    type: "success" | "error" | "warning" | "info";
    message: string;
    isVisible: boolean;
  }>({ type: "success", message: "", isVisible: false });

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      setUserRole(userData.role);
    }
  }, []);

  const handleDeleteJob = (jobId: number) => {
    if (window.confirm('Are you sure you want to delete this job posting?')) {
      setJobs(jobs.filter(job => job.id !== jobId));
      setAlert({
        type: "success",
        message: "Job deleted successfully",
        isVisible: true
      });
      setTimeout(() => setAlert({ ...alert, isVisible: false }), 3000);
    }
  };

  const handleSaveJob = (jobData: Partial<Job>) => {
    if (editingJob) {
      // Update existing job
      setJobs(jobs.map(job =>
        job.id === editingJob.id
          ? { ...job, ...jobData }
          : job
      ));
      setAlert({
        type: "success",
        message: "Job updated successfully",
        isVisible: true
      });
    } else {
      // Add new job
      const newJob: Job = {
        id: Math.max(...jobs.map(j => j.id)) + 1,
        title: jobData.title || '',
        department: jobData.department || '',
        location: jobData.location || '',
        type: jobData.type || 'Full-time',
        status: jobData.status || 'draft',
        applicants: 0,
        postedDate: new Date().toISOString().split('T')[0],
        description: jobData.description || '',
        requirements: jobData.requirements || '',
        salary: jobData.salary || '',
        benefits: jobData.benefits || ''
      };
      setJobs([...jobs, newJob]);
      setAlert({
        type: "success",
        message: "Job created successfully",
        isVisible: true
      });
    }
    setShowJobForm(false);
    setEditingJob(null);
    setTimeout(() => setAlert({ ...alert, isVisible: false }), 3000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'draft': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'closed': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const filteredJobs = filter === 'all'
    ? jobs.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : jobs.filter(job =>
        job.status === filter &&
        (job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
         job.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
         job.location.toLowerCase().includes(searchTerm.toLowerCase()))
      );



  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Jobs</h1>
            <p className="text-gray-600 dark:text-gray-400">View available job postings</p>
          </div>
          {userRole === "hr" && (
            <button
              onClick={() => setShowJobManager(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Manage Jobs
            </button>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Job Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Applicants
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Posted Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredJobs.map((job) => (
                <tr key={job.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {job.title}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {job.department}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {job.location}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {job.type}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(job.status)}`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {job.applicants}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(job.postedDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedJob(job);
                          setShowCandidateDetails(true);
                        }}
                        title="View Details"
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {userRole === "hr" && (
                        <button
                          onClick={() => handleDeleteJob(job.id)}
                          title="Delete Job"
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredJobs.length === 0 && (
          <div className="p-8 text-center">
            <div className="text-gray-400 mb-4">
              <Search className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No jobs found</h3>
            <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>



      {/* Candidate Details Modal */}
      {selectedJob && (
        <CandidateDetails
          candidate={{
            id: selectedJob.id,
            name: "Sample Candidate", // This would come from actual candidate data
            email: "candidate@example.com",
            phone: "+1 (555) 123-4567",
            position: selectedJob.title,
            experience: "3-5 years",
            status: 'new',
            rating: 4,
            appliedDate: new Date().toISOString().split('T')[0],
            notes: "Strong candidate with relevant experience"
          }}
          isOpen={showCandidateDetails}
          onClose={() => {
            setShowCandidateDetails(false);
            setSelectedJob(null);
          }}
          onUpdate={(candidate) => {
            console.log('Candidate updated:', candidate);
            // Here you would typically update the candidate in your backend
          }}
          onScheduleInterview={(candidateId: number) => {
            setShowCandidateDetails(false);
            setShowInterviewScheduler(true);
          }}
        />
      )}

      {/* Interview Scheduler Modal */}
      {selectedJob && (
        <InterviewScheduler
          candidateId={0} // This would come from the selected candidate
          candidateName="" // This would come from the selected candidate
          position={selectedJob.title}
          isOpen={showInterviewScheduler}
          onClose={() => {
            setShowInterviewScheduler(false);
            setSelectedJob(null);
          }}
          onSave={(interview) => {
            console.log('Interview scheduled:', interview);
            // Here you would typically save the interview to your backend
          }}
        />
      )}

      {/* Job Manager Modal */}
      {showJobManager && (
        <JobManager
          jobs={jobs}
          isOpen={showJobManager}
          onClose={() => setShowJobManager(false)}
          onCreate={() => {
            setEditingJob(null);
            setShowJobForm(true);
          }}
          onEdit={(job) => {
            setEditingJob(job);
            setShowJobForm(true);
          }}
        />
      )}

      {/* Job Form Modal */}
      {showJobForm && (
        <JobForm
          job={editingJob}
          isOpen={showJobForm}
          onClose={() => {
            setShowJobForm(false);
            setEditingJob(null);
          }}
          onSave={handleSaveJob}
        />
      )}

      {/* Alert */}
      {alert.isVisible && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert({ ...alert, isVisible: false })}
        />
      )}
    </div>
  );
}
