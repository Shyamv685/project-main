import { useState } from "react";
import PayrollTable from "@/components/payroll/PayrollTable";
import PayslipCard from "@/components/payroll/PayslipCard";
import PayrollForm from "@/components/payroll/PayrollForm";
import PayrollCorrectionTable from "@/components/payroll/PayrollCorrectionTable";
import Modal from "@/components/common/Modal";
import { payrollData } from "@/data/dummyData";

export default function Payroll() {
  const [activeTab, setActiveTab] = useState("records");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState<any>(null);
  const [editingPayroll, setEditingPayroll] = useState<any>(null);
  const [userRole, setUserRole] = useState("hr"); // For demo purposes, set to hr to show corrections functionality

  const handleViewPayslip = (id: number) => {
    const payslip = payrollData.find((p) => p.id === id);
    if (payslip) {
      setSelectedPayslip(payslip);
      setIsModalOpen(true);
    }
  };

  const handleAddPayroll = () => {
    setEditingPayroll(null);
    setIsFormOpen(true);
  };

  const handleEditPayroll = (payroll: any) => {
    setEditingPayroll(payroll);
    setIsFormOpen(true);
  };

  const handleDeletePayroll = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this payroll record?")) {
      try {
        // await api.deleteSalary(id);
        console.log("Delete payroll:", id);
        // Refresh data here
      } catch (error) {
        console.error("Failed to delete payroll:", error);
      }
    }
  };

  const handleFormSuccess = () => {
    // Refresh payroll data
    console.log("Payroll data updated");
    setIsFormOpen(false);
  };

  const isHR = userRole === "hr";

  return (
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-0">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Payroll Management</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage employee salaries and payslips</p>
      </div>

      {/* Tabs for HR */}
      {isHR && (
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("records")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "records"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Payroll Records
            </button>
            <button
              onClick={() => setActiveTab("corrections")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "corrections"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Corrections
            </button>
          </nav>
        </div>
      )}

      {/* Payroll Records Tab */}
      {activeTab === "records" && (
        <PayrollTable
          onViewPayslip={handleViewPayslip}
          onAddPayroll={handleAddPayroll}
          onEditPayroll={handleEditPayroll}
          onDeletePayroll={handleDeletePayroll}
          userRole={userRole}
        />
      )}

      {/* Corrections Tab - HR Only */}
      {activeTab === "corrections" && isHR && (
        <PayrollCorrectionTable />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Payslip Details"
        size="lg"
      >
        {selectedPayslip && <PayslipCard data={selectedPayslip} />}
      </Modal>

      <PayrollForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={handleFormSuccess}
        editingPayroll={editingPayroll}
      />
    </div>
  );
}
