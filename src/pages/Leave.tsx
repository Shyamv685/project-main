import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import LeaveTable from "@/components/leave/LeaveTable";
import LeaveRequestForm from "@/components/leave/LeaveRequestForm";
import Modal from "@/components/common/Modal";
import Alert from "@/components/common/Alert";
import { leaveRequests } from "@/data/dummyData";

export default function Leave() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userRole, setUserRole] = useState<string>("employee");
  const [leaveData, setLeaveData] = useState(leaveRequests);
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

  const handleSubmit = (data: any) => {
    console.log("Leave request:", data);

    // Get current user data
    const user = localStorage.getItem('user');
    const userData = user ? JSON.parse(user) : null;

    if (userData && userRole === "employee") {
      // Create new leave request for employee
      const newLeaveRequest = {
        id: leaveData.length + 1,
        employeeId: userData.id || 1,
        employeeName: userData.name || "Current User",
        leaveType: data.leaveType,
        startDate: data.startDate,
        endDate: data.endDate,
        days: data.days,
        reason: data.reason,
        status: "Pending",
        appliedDate: new Date().toISOString().split('T')[0]
      };

      // Add to leave data
      setLeaveData(prev => [...prev, newLeaveRequest]);
    }

    setIsModalOpen(false);
    setAlert({
      type: "success",
      message: "Leave request submitted successfully!",
      isVisible: true
    });
    setTimeout(() => setAlert((prev) => ({ ...prev, isVisible: false })), 3000);
  };

  const handleApprove = (id: number) => {
    console.log("Approve leave:", id);
    setLeaveData(prev => prev.map(request =>
      request.id === id ? { ...request, status: "Approved" } : request
    ));
    setAlert({
      type: "success",
      message: "Leave request approved!",
      isVisible: true
    });
    setTimeout(() => setAlert((prev) => ({ ...prev, isVisible: false })), 3000);
  };

  const handleReject = (id: number) => {
    console.log("Reject leave:", id);
    setLeaveData(prev => prev.map(request =>
      request.id === id ? { ...request, status: "Rejected" } : request
    ));
    setAlert({
      type: "error",
      message: "Leave request rejected!",
      isVisible: true
    });
    setTimeout(() => setAlert((prev) => ({ ...prev, isVisible: false })), 3000);
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

      <LeaveTable onApprove={handleApprove} onReject={handleReject} userRole={userRole} leaveData={leaveData} />

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
