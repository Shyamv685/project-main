import { useState, useEffect } from "react";
import { employees } from "@/data/dummyData";
import { api } from "@/lib/api";
import { Plus, X } from "lucide-react";

interface PayrollFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingPayroll?: any;
}

export default function PayrollForm({ isOpen, onClose, onSuccess, editingPayroll }: PayrollFormProps) {
  const [formData, setFormData] = useState({
    employeeId: "",
    month: "",
    basicSalary: "",
    allowances: "",
    deductions: "",
    status: "Pending"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (editingPayroll) {
      setFormData({
        employeeId: editingPayroll.employeeId.toString(),
        month: editingPayroll.month,
        basicSalary: editingPayroll.basicSalary.toString(),
        allowances: editingPayroll.allowances.toString(),
        deductions: editingPayroll.deductions.toString(),
        status: editingPayroll.status
      });
    } else {
      setFormData({
        employeeId: "",
        month: "",
        basicSalary: "",
        allowances: "",
        deductions: "",
        status: "Pending"
      });
    }
  }, [editingPayroll, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = {
        employeeId: parseInt(formData.employeeId),
        basicSalary: parseFloat(formData.basicSalary),
        allowances: formData.allowances ? { total: parseFloat(formData.allowances) } : undefined,
        deductions: formData.deductions ? { total: parseFloat(formData.deductions) } : undefined,
        month: formData.month,
        status: formData.status
      };

      if (editingPayroll) {
        await api.updateSalary(editingPayroll.id, data);
      } else {
        await api.createSalary(data);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save payroll data");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {editingPayroll ? "Edit Payroll" : "Add New Payroll"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employee
            </label>
            <select
              value={formData.employeeId}
              onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select Employee</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Month
            </label>
            <input
              type="month"
              value={formData.month}
              onChange={(e) => setFormData({ ...formData, month: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Basic Salary
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.basicSalary}
              onChange={(e) => setFormData({ ...formData, basicSalary: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Allowances
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.allowances}
              onChange={(e) => setFormData({ ...formData, allowances: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deductions
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.deductions}
              onChange={(e) => setFormData({ ...formData, deductions: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Paid">Paid</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  {editingPayroll ? "Update" : "Add"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
