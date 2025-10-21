import { useState } from "react";
import PayrollTable from "@/components/payroll/PayrollTable";
import PayslipCard from "@/components/payroll/PayslipCard";
import PayrollForm from "@/components/payroll/PayrollForm";
import Modal from "@/components/common/Modal";
import { payrollData } from "@/data/dummyData";

export default function Payroll() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState<any>(null);
  const [editingPayroll, setEditingPayroll] = useState<any>(null);
  const [userRole, setUserRole] = useState("hr"); // For demo purposes, set to hr

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

  return (
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-0">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Payroll Management</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage employee salaries and payslips</p>
      </div>

      <PayrollTable
        onViewPayslip={handleViewPayslip}
        onAddPayroll={handleAddPayroll}
        onEditPayroll={handleEditPayroll}
        onDeletePayroll={handleDeletePayroll}
        userRole={userRole}
      />

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
