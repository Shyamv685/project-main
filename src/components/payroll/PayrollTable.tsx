import { payrollData } from "@/data/dummyData";
import { formatCurrency } from "@/lib/utils";
import { Download, Eye, Edit, Trash2, Plus, Save, X } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

interface PayrollTableProps {
  onViewPayslip?: (id: number) => void;
  onEditPayroll?: (payroll: any) => void;
  onDeletePayroll?: (id: number) => void;
  onAddPayroll?: () => void;
  userRole?: string;
}

export default function PayrollTable({ onViewPayslip, onEditPayroll, onDeletePayroll, onAddPayroll, userRole }: PayrollTableProps) {
  const [editingSalary, setEditingSalary] = useState<number | null>(null);
  const [editedData, setEditedData] = useState<any>({});

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-800";
      case "Processing":
        return "bg-yellow-100 text-yellow-800";
      case "Pending":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const isHR = userRole === "hr";
  const isEmployee = userRole === "employee";

  const handleEditSalary = (payrollId: number) => {
    const payroll = payrollData.find(p => p.id === payrollId);
    if (payroll) {
      setEditedData({
        salaryCredited: payroll.salaryCredited,
        creditedDateTime: payroll.creditedDateTime || '',
        paymentMonthYear: payroll.paymentMonthYear,
        amountCredited: payroll.amountCredited,
        remarks: payroll.remarks || ''
      });
      setEditingSalary(payrollId);
    }
  };

  const handleSaveSalary = (payrollId: number) => {
    // In a real app, this would make an API call to update the data
    console.log('Saving salary data for payroll ID:', payrollId, editedData);
    // For demo purposes, we'll just close the edit mode
    setEditingSalary(null);
    setEditedData({});
  };

  const handleCancelEdit = () => {
    setEditingSalary(null);
    setEditedData({});
  };

  return (
    <>
      {/* Header with Add Button for HR */}
      {isHR && (
        <div className="flex justify-between items-center mb-4">
          <div></div>
          <button
            onClick={onAddPayroll}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Payroll
          </button>
        </div>
      )}

      {/* Employee Salary Info */}
      {isEmployee && (
        <>
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Salary Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Basic Salary</p>
                <p className="text-xl font-bold text-blue-600">$95,000</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Allowances</p>
                <p className="text-xl font-bold text-green-600">$5,000</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Deductions</p>
                <p className="text-xl font-bold text-red-600">$8,500</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Net Salary</p>
                <p className="text-xl font-bold text-purple-600">$91,500</p>
              </div>
            </div>
          </div>

          {/* Salary Information Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Salary Information</h3>
              {editingSalary === null && (
                <button
                  onClick={() => handleEditSalary(payrollData.filter(p => p.employeeId === 1)[0]?.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors text-sm"
                >
                  <Edit className="w-4 h-4" />
                  Edit Salary Info
                </button>
              )}
            </div>
            <div className="space-y-4">
              {payrollData.filter(p => p.employeeId === 1).map((payroll) => (
                <div key={payroll.id} className="border border-gray-200 rounded-lg p-4">
                  {editingSalary === payroll.id ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Salary Credited</label>
                          <select
                            value={editedData.salaryCredited ? 'true' : 'false'}
                            onChange={(e) => setEditedData({...editedData, salaryCredited: e.target.value === 'true'})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Credited Date & Time</label>
                          <input
                            type="datetime-local"
                            value={editedData.creditedDateTime}
                            onChange={(e) => setEditedData({...editedData, creditedDateTime: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Month & Year of Payment</label>
                          <input
                            type="month"
                            value={(() => {
                              const [month, year] = editedData.paymentMonthYear.split(' ');
                              const monthIndex = new Date(`${month} 1, ${year}`).getMonth() + 1;
                              return `${year}-${monthIndex.toString().padStart(2, '0')}`;
                            })()}
                            onChange={(e) => {
                              const [year, month] = e.target.value.split('-');
                              const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'long' });
                              setEditedData({...editedData, paymentMonthYear: `${monthName} ${year}`});
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Amount Credited</label>
                          <input
                            type="number"
                            value={editedData.amountCredited}
                            onChange={(e) => setEditedData({...editedData, amountCredited: parseFloat(e.target.value) || 0})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                          <textarea
                            value={editedData.remarks}
                            onChange={(e) => setEditedData({...editedData, remarks: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={2}
                            placeholder="Enter remarks..."
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => handleSaveSalary(payroll.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors"
                        >
                          <Save className="w-4 h-4" />
                          Save Changes
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Salary Credited</p>
                        <p className={`text-lg font-semibold ${payroll.salaryCredited ? 'text-green-600' : 'text-red-600'}`}>
                          {payroll.salaryCredited ? 'Yes' : 'No'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Credited Date & Time</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {payroll.creditedDateTime ? new Date(payroll.creditedDateTime).toLocaleString() : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Month & Year of Payment</p>
                        <p className="text-lg font-semibold text-gray-900">{payroll.paymentMonthYear}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Amount Credited</p>
                        <p className="text-lg font-semibold text-gray-900">{formatCurrency(payroll.amountCredited)}</p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-sm text-gray-600">Remarks</p>
                        <p className="text-lg font-semibold text-gray-900">{payroll.remarks || 'No remarks'}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Desktop Table View - Only for HR */}
      {isHR && (
        <div className="hidden md:block bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Month
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Basic Salary
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Allowances
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deductions
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Net Salary
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payrollData.map((payroll, index) => (
                  <motion.tr
                    key={payroll.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {payroll.employeeName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {payroll.month}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {formatCurrency(payroll.basicSalary)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 text-right">
                      +{formatCurrency(payroll.allowances)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 text-right">
                      -{formatCurrency(payroll.deductions)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                      {formatCurrency(payroll.netSalary)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          payroll.status
                        )}`}
                      >
                        {payroll.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onViewPayslip?.(payroll.id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Payslip"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => window.print()}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Download Payslip"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        {isHR && (
                          <>
                            <button
                              onClick={() => onEditPayroll?.(payroll)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Edit Payroll"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onDeletePayroll?.(payroll.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Payroll"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mobile Card View - Only for HR */}
      {isHR && (
        <div className="md:hidden space-y-4">
          {payrollData.map((payroll, index) => (
            <motion.div
              key={payroll.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{payroll.employeeName}</h3>
                  <p className="text-sm text-gray-600">{payroll.month}</p>
                </div>
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
                    payroll.status
                  )}`}
                >
                  {payroll.status}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Basic Salary</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(payroll.basicSalary)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-600">Allowances</span>
                  <span className="text-sm font-medium text-green-600">
                    +{formatCurrency(payroll.allowances)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-red-600">Deductions</span>
                  <span className="text-sm font-medium text-red-600">
                    -{formatCurrency(payroll.deductions)}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-semibold text-gray-900">Net Salary</span>
                    <span className="text-lg font-bold text-blue-600">
                      {formatCurrency(payroll.netSalary)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => onViewPayslip?.(payroll.id)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  View
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                {isHR && (
                  <>
                    <button
                      onClick={() => onEditPayroll?.(payroll)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => onDeletePayroll?.(payroll.id)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </>
  );
}
