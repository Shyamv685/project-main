import { formatCurrency } from "@/lib/utils";
import { Building2 } from "lucide-react";

interface PayslipCardProps {
  data: {
    employeeName: string;
    month: string;
    basicSalary: number;
    allowances: number;
    deductions: number;
    netSalary: number;
  };
}

export default function PayslipCard({ data }: PayslipCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 md:p-8 max-w-2xl w-full mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-4 sm:mb-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">SmartHRMS</h2>
            <p className="text-sm text-gray-600">Payslip</p>
          </div>
        </div>
        <div className="text-left sm:text-right w-full sm:w-auto">
          <p className="text-sm text-gray-600">Period</p>
          <p className="font-semibold text-gray-900">{data.month}</p>
        </div>
      </div>

      <div className="mb-6 sm:mb-8">
        <p className="text-sm text-gray-600 mb-1">Employee Name</p>
        <p className="text-lg sm:text-xl font-semibold text-gray-900">{data.employeeName}</p>
      </div>

      <div className="space-y-3 sm:space-y-4 mb-6">
        <div className="flex justify-between items-center py-2 sm:py-3 border-b border-gray-100">
          <span className="text-sm sm:text-base text-gray-700">Basic Salary</span>
          <span className="font-semibold text-gray-900 text-sm sm:text-base">
            {formatCurrency(data.basicSalary)}
          </span>
        </div>

        <div className="flex justify-between items-center py-2 sm:py-3 border-b border-gray-100">
          <span className="text-sm sm:text-base text-green-700">Allowances</span>
          <span className="font-semibold text-green-600 text-sm sm:text-base">
            +{formatCurrency(data.allowances)}
          </span>
        </div>

        <div className="flex justify-between items-center py-2 sm:py-3 border-b border-gray-100">
          <span className="text-sm sm:text-base text-red-700">Deductions</span>
          <span className="font-semibold text-red-600 text-sm sm:text-base">
            -{formatCurrency(data.deductions)}
          </span>
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-3 sm:p-4 border border-blue-200">
        <div className="flex justify-between items-center">
          <span className="text-base sm:text-lg font-semibold text-gray-900">Net Salary</span>
          <span className="text-xl sm:text-2xl font-bold text-blue-600">
            {formatCurrency(data.netSalary)}
          </span>
        </div>
      </div>

      <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200 text-center text-xs sm:text-sm text-gray-500">
        <p>This is a computer-generated payslip and does not require a signature</p>
      </div>
    </div>
  );
}
