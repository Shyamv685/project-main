import { useState } from "react";
import PayrollTable from "@/components/payroll/PayrollTable";
import PayslipCard from "@/components/payroll/PayslipCard";
import Modal from "@/components/common/Modal";
import { payrollData } from "@/data/dummyData";

export default function Payroll() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState<any>(null);

  const handleViewPayslip = (id: number) => {
    const payslip = payrollData.find((p) => p.id === id);
    if (payslip) {
      setSelectedPayslip(payslip);
      setIsModalOpen(true);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Payroll Management</h1>
        <p className="text-gray-600 mt-1">Manage employee salaries and payslips</p>
      </div>

      <PayrollTable onViewPayslip={handleViewPayslip} />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Payslip Details"
        size="lg"
      >
        {selectedPayslip && <PayslipCard data={selectedPayslip} />}
      </Modal>
    </div>
  );
}
