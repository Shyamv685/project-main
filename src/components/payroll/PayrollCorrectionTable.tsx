import { useState, useEffect } from "react";
import { Plus, Trash2, Edit3, Save, X } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";

interface PayrollCorrection {
  id: number;
  employeeId: number;
  employeeName: string;
  correctionType: string;
  amount: number;
  reason: string;
  effectiveDate: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export default function PayrollCorrectionTable() {
  const [corrections, setCorrections] = useState<PayrollCorrection[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newCorrection, setNewCorrection] = useState<Partial<PayrollCorrection>>({
    employeeId: 0,
    employeeName: '',
    correctionType: 'bonus',
    amount: 0,
    reason: '',
    effectiveDate: new Date().toISOString().split('T')[0],
    status: 'pending'
  });
  const [isAdding, setIsAdding] = useState(false);

  const fetchCorrections = async () => {
    try {
      // Assuming there's an API endpoint for payroll corrections
      // For now, using dummy data
      const dummyCorrections: PayrollCorrection[] = [
        {
          id: 1,
          employeeId: 1,
          employeeName: 'John Doe',
          correctionType: 'bonus',
          amount: 5000,
          reason: 'Performance bonus',
          effectiveDate: '2024-01-15',
          status: 'approved',
          createdAt: '2024-01-10',
          updatedAt: '2024-01-12'
        },
        {
          id: 2,
          employeeId: 2,
          employeeName: 'Jane Smith',
          correctionType: 'deduction',
          amount: -1000,
          reason: 'Late payment penalty',
          effectiveDate: '2024-01-20',
          status: 'pending',
          createdAt: '2024-01-15',
          updatedAt: '2024-01-15'
        }
      ];
      setCorrections(dummyCorrections);
    } catch (error) {
      console.error('Failed to fetch payroll corrections:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCorrections();
  }, []);

  const handleAdd = () => {
    setIsAdding(true);
    setNewCorrection({
      employeeId: 0,
      employeeName: '',
      correctionType: 'bonus',
      amount: 0,
      reason: '',
      effectiveDate: new Date().toISOString().split('T')[0],
      status: 'pending'
    });
  };

  const handleSaveNew = async () => {
    if (!newCorrection.employeeName || !newCorrection.reason) return;

    try {
      // API call to save new correction
      const newId = Math.max(...corrections.map(c => c.id)) + 1;
      const correction: PayrollCorrection = {
        ...newCorrection,
        id: newId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as PayrollCorrection;

      setCorrections([...corrections, correction]);
      setIsAdding(false);
    } catch (error) {
      console.error('Failed to save payroll correction:', error);
    }
  };

  const handleEdit = (id: number) => {
    setEditingId(id);
  };

  const handleSave = async (id: number) => {
    try {
      // API call to update correction
      setCorrections(corrections.map(c =>
        c.id === id ? { ...c, updatedAt: new Date().toISOString() } : c
      ));
      setEditingId(null);
    } catch (error) {
      console.error('Failed to update payroll correction:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this payroll correction?')) return;

    try {
      // API call to delete correction
      setCorrections(corrections.filter(c => c.id !== id));
    } catch (error) {
      console.error('Failed to delete payroll correction:', error);
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
  };

  const updateCorrection = (id: number, field: keyof PayrollCorrection, value: any) => {
    setCorrections(corrections.map(c =>
      c.id === id ? { ...c, [field]: value } : c
    ));
  };

  const updateNewCorrection = (field: keyof PayrollCorrection, value: any) => {
    setNewCorrection({ ...newCorrection, [field]: value });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Payroll Corrections</h2>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Correction
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Effective Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isAdding && (
                <tr className="bg-blue-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="text"
                      value={newCorrection.employeeName}
                      onChange={(e) => updateNewCorrection('employeeName', e.target.value)}
                      placeholder="Employee Name"
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={newCorrection.correctionType}
                      onChange={(e) => updateNewCorrection('correctionType', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="bonus">Bonus</option>
                      <option value="deduction">Deduction</option>
                      <option value="adjustment">Adjustment</option>
                      <option value="overtime">Overtime</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="number"
                      value={newCorrection.amount}
                      onChange={(e) => updateNewCorrection('amount', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="text"
                      value={newCorrection.reason}
                      onChange={(e) => updateNewCorrection('reason', e.target.value)}
                      placeholder="Reason"
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="date"
                      value={newCorrection.effectiveDate}
                      onChange={(e) => updateNewCorrection('effectiveDate', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      Pending
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveNew}
                        className="text-green-600 hover:text-green-900"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleCancel}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )}

              {corrections.map((correction) => (
                <tr key={correction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === correction.id ? (
                      <input
                        type="text"
                        value={correction.employeeName}
                        onChange={(e) => updateCorrection(correction.id, 'employeeName', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    ) : (
                      <div className="text-sm font-medium text-gray-900">
                        {correction.employeeName}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === correction.id ? (
                      <select
                        value={correction.correctionType}
                        onChange={(e) => updateCorrection(correction.id, 'correctionType', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="bonus">Bonus</option>
                        <option value="deduction">Deduction</option>
                        <option value="adjustment">Adjustment</option>
                        <option value="overtime">Overtime</option>
                      </select>
                    ) : (
                      <span className="capitalize text-sm text-gray-900">
                        {correction.correctionType}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === correction.id ? (
                      <input
                        type="number"
                        value={correction.amount}
                        onChange={(e) => updateCorrection(correction.id, 'amount', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    ) : (
                      <span className={`text-sm font-medium ${correction.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {correction.amount < 0 ? '-' : '+'}${Math.abs(correction.amount).toLocaleString()}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === correction.id ? (
                      <input
                        type="text"
                        value={correction.reason}
                        onChange={(e) => updateCorrection(correction.id, 'reason', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    ) : (
                      <span className="text-sm text-gray-900">
                        {correction.reason}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === correction.id ? (
                      <input
                        type="date"
                        value={correction.effectiveDate}
                        onChange={(e) => updateCorrection(correction.id, 'effectiveDate', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    ) : (
                      <span className="text-sm text-gray-900">
                        {new Date(correction.effectiveDate).toLocaleDateString()}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      correction.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : correction.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {correction.status.charAt(0).toUpperCase() + correction.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      {editingId === correction.id ? (
                        <>
                          <button
                            onClick={() => handleSave(correction.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handleCancel}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(correction.id)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(correction.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {corrections.length === 0 && !isAdding && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Plus className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No payroll corrections found
            </h3>
            <p className="text-gray-600">
              Click "Add Correction" to create your first payroll correction.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
