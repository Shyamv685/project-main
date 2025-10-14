import { useState, useEffect, useCallback } from "react";
import AttendanceTable from "@/components/attendance/AttendanceTable";
import CheckInOutPanel from "@/components/attendance/CheckInOutPanel";

export default function Attendance() {
  const [userRole, setUserRole] = useState<string>('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setUserRole(user.role);
    }
  }, []);

  const handleAttendanceUpdate = useCallback(() => {
    // Trigger refresh of attendance table
    setRefreshKey(prev => prev + 1);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Attendance</h1>
        <p className="text-gray-600 mt-1">
          {userRole === 'hr'
            ? 'View and manage all employee attendance records'
            : 'Track your attendance and work hours'
          }
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AttendanceTable key={refreshKey} />
        </div>
        <div>
          <CheckInOutPanel onAttendanceUpdate={handleAttendanceUpdate} />
        </div>
      </div>
    </div>
  );
}
