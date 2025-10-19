import { leaveRequests } from "@/data/dummyData";
import { formatDate } from "@/lib/utils";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";

interface LeaveTableProps {
  onApprove?: (id: number) => void;
  onReject?: (id: number) => void;
  userRole?: string;
}

export default function LeaveTable({ onApprove, onReject, userRole }: LeaveTableProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "Approved":
        return {
          color: "bg-green-100 text-green-800",
          icon: CheckCircle,
          iconColor: "text-green-600"
        };
      case "Rejected":
        return {
          color: "bg-red-100 text-red-800",
          icon: XCircle,
          iconColor: "text-red-600"
        };
      default:
        return {
          color: "bg-yellow-100 text-yellow-800",
          icon: Clock,
          iconColor: "text-yellow-600"
        };
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Employee
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Leave Type
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Start Date
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              End Date
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Days
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            {userRole === "hr" && (
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {leaveRequests.map((request, index) => {
            const statusConfig = getStatusConfig(request.status);
            const StatusIcon = statusConfig.icon;

            return (
              <motion.tr
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-gray-50"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {request.employeeName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {request.leaveType}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {formatDate(request.startDate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {formatDate(request.endDate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {request.days}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full flex items-center gap-1 w-fit ${statusConfig.color}`}
                  >
                    <StatusIcon className={`w-3 h-3 ${statusConfig.iconColor}`} />
                    {request.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {request.status === "Pending" && userRole === "hr" && (
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onApprove?.(request.id)}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => onReject?.(request.id)}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
