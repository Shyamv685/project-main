import { useState } from "react";
import { UserPlus } from "lucide-react";
import EmployeeList from "@/components/employee/EmployeeList";
import EmployeeForm from "@/components/employee/EmployeeForm";
import Modal from "@/components/common/Modal";

export default function Employees() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);

  const handleAddEmployee = () => {
    setSelectedEmployee(null);
    setIsModalOpen(true);
  };

  const handleEditEmployee = (id: number) => {
    setSelectedEmployee(id);
    setIsModalOpen(true);
  };

  const handleSubmit = (data: any) => {
    console.log("Employee data:", data);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employees</h1>
          <p className="text-gray-600 mt-1">Manage your team members</p>
        </div>
        <button
          onClick={handleAddEmployee}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <UserPlus className="w-5 h-5" />
          Add Employee
        </button>
      </div>

      <EmployeeList
        onEdit={handleEditEmployee}
        onView={(id) => console.log("View employee:", id)}
        onDelete={(id) => console.log("Delete employee:", id)}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedEmployee ? "Edit Employee" : "Add New Employee"}
        size="lg"
      >
        <EmployeeForm onSubmit={handleSubmit} />
      </Modal>
    </div>
  );
}
