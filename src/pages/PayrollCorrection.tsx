import PayrollCorrectionTable from "@/components/payroll/PayrollCorrectionTable";

export default function PayrollCorrection() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payroll Correction</h1>
          <p className="text-gray-600 mt-1">Manage payroll corrections and adjustments</p>
        </div>
      </div>

      <PayrollCorrectionTable />
    </div>
  );
}
