import { useState } from "react";
import { motion } from "framer-motion";
import { Edit, Save, X, DollarSign, Calendar, Clock, FileText } from "lucide-react";
import { payrollData } from "@/data/dummyData";
import { formatCurrency } from "@/lib/utils";

export default function Salary() {
  const [editingSalary, setEditingSalary] = useState<number | null>(null);
  const [editedData, setEditedData] = useState<any>({});

  // Get current employee's salary data (assuming employee ID 1 for demo)
  const employeeSalary = payrollData.filter(p => p.employeeId === 1)[0];

  const handleEditSalary = () => {
    if (employeeSalary) {
      setEditedData({
        salaryCredited: employeeSalary.salaryCredited,
        creditedDateTime: employeeSalary.creditedDateTime || '',
        paymentMonthYear: employeeSalary.paymentMonthYear,
        amountCredited: employeeSalary.amountCredited,
        remarks: employeeSalary.remarks || ''
      });
      setEditingSalary(employeeSalary.id);
    }
  };

  const handleSaveSalary = () => {
    // In a real app, this would make an API call to update the data
    console.log('Saving salary data:', editedData);
    // For demo purposes, we'll just close the edit mode
    setEditingSalary(null);
    setEditedData({});
  };

  const handleCancelEdit = () => {
    setEditingSalary(null);
    setEditedData({});
  };

  if (!employeeSalary) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Salary Information Found</h3>
          <p className="text-gray-600">Your salary information is not available at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Salary Information</h1>
            <p className="text-gray-600 mt-1">View and update your salary details</p>
          </div>
          {editingSalary === null && (
            <button
              onClick={handleEditSalary}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors font-medium"
            >
              <Edit className="w-5 h-5" />
              Update Salary Info
            </button>
          )}
        </div>

        {/* Salary Information Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Salary Details
            </h2>
          </div>

          <div className="p-6">
            {editingSalary === employeeSalary.id ? (
              <div className="space-y-6">
                {/* Edit Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Salary Credited */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Salary Credited
                    </label>
                    <select
                      value={editedData.salaryCredited ? 'true' : 'false'}
                      onChange={(e) => setEditedData({...editedData, salaryCredited: e.target.value === 'true'})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  </div>

                  {/* Credited Date & Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Credited Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={editedData.creditedDateTime}
                      onChange={(e) => setEditedData({...editedData, creditedDateTime: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Month & Year of Payment */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Month & Year of Payment
                    </label>
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Amount Credited */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount Credited
                    </label>
                    <input
                      type="number"
                      value={editedData.amountCredited}
                      onChange={(e) => setEditedData({...editedData, amountCredited: parseFloat(e.target.value) || 0})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                      step="0.01"
                      placeholder="Enter amount"
                    />
                  </div>
                </div>

                {/* Remarks */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Remarks
                  </label>
                  <textarea
                    value={editedData.remarks}
                    onChange={(e) => setEditedData({...editedData, remarks: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                    placeholder="Enter any remarks or notes..."
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={handleSaveSalary}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors font-medium"
                  >
                    <Save className="w-5 h-5" />
                    Save Changes
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white hover:bg-gray-700 rounded-lg transition-colors font-medium"
                  >
                    <X className="w-5 h-5" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              /* View Mode */
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Salary Credited */}
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <div className={`w-3 h-3 rounded-full ${employeeSalary.salaryCredited ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <div>
                      <p className="text-sm text-gray-600">Salary Credited</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {employeeSalary.salaryCredited ? 'Yes' : 'No'}
                      </p>
                    </div>
                  </div>

                  {/* Credited Date & Time */}
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Credited Date & Time</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {employeeSalary.creditedDateTime ? new Date(employeeSalary.creditedDateTime).toLocaleString() : 'Not credited yet'}
                      </p>
                    </div>
                  </div>

                  {/* Month & Year of Payment */}
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-600">Month & Year of Payment</p>
                      <p className="text-lg font-semibold text-gray-900">{employeeSalary.paymentMonthYear}</p>
                    </div>
                  </div>

                  {/* Amount Credited */}
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Amount Credited</p>
                      <p className="text-lg font-semibold text-gray-900">{formatCurrency(employeeSalary.amountCredited)}</p>
                    </div>
                  </div>
                </div>

                {/* Remarks */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-gray-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-1">Remarks</p>
                      <p className="text-gray-900">
                        {employeeSalary.remarks || 'No remarks available'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Additional Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-blue-50 border border-blue-200 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Important Notes</h3>
          <ul className="text-blue-800 space-y-1 text-sm">
            <li>• Salary information is updated monthly by the HR department</li>
            <li>• Changes you make here will be reviewed by HR before final approval</li>
            <li>• Contact HR if you notice any discrepancies in your salary details</li>
            <li>• All salary updates are subject to company policies and approval</li>
          </ul>
        </motion.div>
      </motion.div>
    </div>
  );
}
