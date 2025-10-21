import { useState } from "react";
import { UserPlus, FileText } from "lucide-react";
import EmployeeList from "@/components/employee/EmployeeList";
import EmployeeForm from "@/components/employee/EmployeeForm";
import DocumentList from "@/components/documents/DocumentList";
import Modal from "@/components/common/Modal";

export default function Employees() {
  const [activeTab, setActiveTab] = useState<'employees' | 'documents'>('employees');
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
          <p className="text-gray-600 mt-1">Manage your team members and documents</p>
        </div>
        {activeTab === 'employees' && (
          <button
            onClick={handleAddEmployee}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <UserPlus className="w-5 h-5" />
            Add Employee
          </button>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex">
          <button
            onClick={() => setActiveTab('employees')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'employees'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <UserPlus className="w-4 h-4 inline mr-2" />
            Employees
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'documents'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Documents
          </button>
        </nav>
      </div>

      {activeTab === 'employees' ? (
        <>
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
        </>
      ) : (
        <DocumentList isHR={true} />
      )}
    </div>
  );
}
