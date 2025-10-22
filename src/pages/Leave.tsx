import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import LeaveTable from "@/components/leave/LeaveTable";
import LeaveRequestForm from "@/components/leave/LeaveRequestForm";
import Modal from "@/components/common/Modal";
import Alert from "@/components/common/Alert";
import { api } from "@/lib/api";

export default function Leave() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userRole, setUserRole] = useState<string>("employee");
  const [leaveData, setLeaveData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/leaves', {
        headers: {
          'X-User-Email': JSON.parse(localStorage.getItem('user') || '{}').email,
          'X-User-Role': JSON.parse(localStorage.getItem('user') || '{}').role
        }
      });
      if (response.ok) {
        const data = await response.json();
        setLeaveData(data.leaves);
      }
    } catch (error) {
      console.error('Failed to fetch leaves:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/leaves', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': JSON.parse(localStorage.getItem('user') || '{}').email,
          'X-User-Role': JSON.parse(localStorage.getItem('user') || '{}').role
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const result = await response.json();
        setLeaveData(prev => [result.leave, ...prev]);
        setIsModalOpen(false);
        setAlert({
          type: "success",
          message: "Leave request submitted successfully!",
          isVisible: true
        });
        setTimeout(() => setAlert((prev) => ({ ...prev, isVisible: false })), 3000);
      } else {
        const error = await response.json();
        setAlert({
          type: "error",
          message: error.error || "Failed to submit leave request",
          isVisible: true
        });
        setTimeout(() => setAlert((prev) => ({ ...prev, isVisible: false })), 3000);
      }
    } catch (error) {
      console.error('Failed to submit leave request:', error);
      setAlert({
        type: "error",
        message: "Failed to submit leave request",
        isVisible: true
      });
      setTimeout(() => setAlert((prev) => ({ ...prev, isVisible: false })), 3000);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/leaves/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': JSON.parse(localStorage.getItem('user') || '{}').email,
          'X-User-Role': JSON.parse(localStorage.getItem('user') || '{}').role
        },
        body: JSON.stringify({ status: 'Approved' })
      });

      if (response.ok) {
        setLeaveData(prev => prev.map(request =>
          request.id === id ? { ...request, status: "Approved" } : request
        ));
        setAlert({
          type: "success",
          message: "Leave request approved!",
          isVisible: true
        });
        setTimeout(() => setAlert((prev) => ({ ...prev, isVisible: false })), 3000);
      } else {
        const error = await response.json();
        setAlert({
          type: "error",
          message: error.error || "Failed to approve leave request",
          isVisible: true
        });
        setTimeout(() => setAlert((prev) => ({ ...prev, isVisible: false })), 3000);
      }
    } catch (error) {
      console.error('Failed to approve leave request:', error);
      setAlert({
        type: "error",
        message: "Failed to approve leave request",
        isVisible: true
      });
      setTimeout(() => setAlert((prev) => ({ ...prev, isVisible: false })), 3000);
    }
  };

  const handleReject = async (id: number) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/leaves/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': JSON.parse(localStorage.getItem('user') || '{}').email,
          'X-User-Role': JSON.parse(localStorage.getItem('user') || '{}').role
        },
        body: JSON.stringify({ status: 'Rejected' })
      });

      if (response.ok) {
        setLeaveData(prev => prev.map(request =>
          request.id === id ? { ...request, status: "Rejected" } : request
        ));
        setAlert({
          type: "error",
          message: "Leave request rejected!",
          isVisible: true
        });
        setTimeout(() => setAlert((prev) => ({ ...prev, isVisible: false })), 3000);
      } else {
        const error = await response.json();
        setAlert({
          type: "error",
          message: error.error || "Failed to reject leave request",
          isVisible: true
        });
        setTimeout(() => setAlert((prev) => ({ ...prev, isVisible: false })), 3000);
      }
    } catch (error) {
      console.error('Failed to reject leave request:', error);
      setAlert({
        type: "error",
        message: "Failed to reject leave request",
        isVisible: true
      });
      setTimeout(() => setAlert((prev) => ({ ...prev, isVisible: false })), 3000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leave Management</h1>
          <p className="text-gray-600 mt-1">Manage leave requests and approvals</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Request
        </button>
      </div>

      <Alert
        type={alert.type}
        message={alert.message}
        isVisible={alert.isVisible}
      />

      {loading ? (
        <div className="text-center py-8">Loading leave requests...</div>
      ) : (
        <LeaveTable onApprove={handleApprove} onReject={handleReject} userRole={userRole} leaveData={leaveData} />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Submit Leave Request"
        size="md"
      >
        <LeaveRequestForm onSubmit={handleSubmit} />
      </Modal>
    </div>
  );
}
