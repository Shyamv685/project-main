import { Download, FileText, BarChart3, TrendingUp } from "lucide-react";
import DashboardAnalytics from "@/components/analytics/DashboardAnalytics";
import { motion } from "framer-motion";

export default function Reports() {
  const reportTypes = [
    {
      icon: FileText,
      title: "Attendance Report",
      description: "Detailed attendance records and statistics",
      color: "bg-blue-100 text-blue-600"
    },
    {
      icon: BarChart3,
      title: "Leave Report",
      description: "Leave requests, approvals, and balances",
      color: "bg-green-100 text-green-600"
    },
    {
      icon: TrendingUp,
      title: "Payroll Report",
      description: "Salary disbursements and deductions",
      color: "bg-yellow-100 text-yellow-600"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-600 mt-1">Generate and download comprehensive reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reportTypes.map((report, index) => (
          <motion.div
            key={index}
            whileHover={{ y: -4 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          >
            <div className={`${report.color} p-3 rounded-lg w-fit mb-4`}>
              <report.icon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {report.title}
            </h3>
            <p className="text-sm text-gray-600 mb-4">{report.description}</p>
            <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm">
              <Download className="w-4 h-4" />
              Download Report
            </button>
          </motion.div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Analytics Overview
        </h2>
        <DashboardAnalytics />
      </div>
    </div>
  );
}
