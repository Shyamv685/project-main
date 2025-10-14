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
    <div className="bg-white border border-gray-200 rounded-xl p-8 max-w-2xl">
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">SmartHRMS</h2>
            <p className="text-sm text-gray-600">Payslip</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Period</p>
          <p className="font-semibold text-gray-900">{data.month}</p>
        </div>
      </div>

      <div className="mb-8">
        <p className="text-sm text-gray-600 mb-1">Employee Name</p>
        <p className="text-xl font-semibold text-gray-900">{data.employeeName}</p>
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex justify-between items-center py-3 border-b border-gray-100">
          <span className="text-gray-700">Basic Salary</span>
          <span className="font-semibold text-gray-900">
            {formatCurrency(data.basicSalary)}
          </span>
        </div>

        <div className="flex justify-between items-center py-3 border-b border-gray-100">
          <span className="text-green-700">Allowances</span>
          <span className="font-semibold text-green-600">
            +{formatCurrency(data.allowances)}
          </span>
        </div>

        <div className="flex justify-between items-center py-3 border-b border-gray-100">
          <span className="text-red-700">Deductions</span>
          <span className="font-semibold text-red-600">
            -{formatCurrency(data.deductions)}
          </span>
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-gray-900">Net Salary</span>
          <span className="text-2xl font-bold text-blue-600">
            {formatCurrency(data.netSalary)}
          </span>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
        <p>This is a computer-generated payslip and does not require a signature</p>
      </div>
    </div>
  );
}
