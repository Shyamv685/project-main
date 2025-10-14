import { useState, useEffect } from "react";
import { Clock, LogIn, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";

interface CheckInOutPanelProps {
  onAttendanceUpdate?: () => void;
}

export default function CheckInOutPanel({ onAttendanceUpdate }: CheckInOutPanelProps) {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTodayStatus();
    fetchUserName();
  }, []);

  const fetchUserName = () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setUserName(user.name || 'Unknown');
    }
  };

  const fetchTodayStatus = async () => {
    try {
      const response = await api.getAttendance();
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      // First check today's record
      let record = response.attendance.find((record: any) => record.date === today);

      // If no check-in today, check yesterday for overnight shifts
      if (!record || !record.checkIn) {
        record = response.attendance.find((record: any) => record.date === yesterday && record.checkIn && !record.checkOut);
      }

      if (record && record.checkIn && !record.checkOut) {
        setIsCheckedIn(true);
        setCheckInTime(record.checkIn);
      }
    } catch (err) {
      console.error('Failed to fetch attendance status:', err);
    }
  };

  const handleCheckIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.checkin();
      setCheckInTime(response.checkInTime);
      setIsCheckedIn(true);
      onAttendanceUpdate?.(); // Trigger table refresh
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    setError(null);
    try {
      await api.checkout();
      setIsCheckedIn(false);
      setCheckInTime(null);
      onAttendanceUpdate?.(); // Trigger table refresh
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-100 rounded-lg">
          <Clock className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Quick Check-In/Out</h3>
          <p className="text-sm text-gray-600">Welcome, {userName}</p>
        </div>
      </div>

      {isCheckedIn ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4"
        >
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
            <p className="text-sm text-green-800 mb-1">Checked In</p>
            <p className="text-xl sm:text-2xl font-bold text-green-900">{checkInTime}</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <button
            onClick={handleCheckOut}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
            {loading ? 'Checking Out...' : 'Check Out'}
          </button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <button
            onClick={handleCheckIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            <LogIn className="w-4 h-4 sm:w-5 sm:h-5" />
            {loading ? 'Checking In...' : 'Check In'}
          </button>
        </motion.div>
      )}

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-600 mb-1">Today</p>
            <p className="text-lg sm:text-xl font-bold text-gray-900">
              {isCheckedIn ? "In Progress" : "Not Started"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">This Week</p>
            <p className="text-lg sm:text-xl font-bold text-gray-900">36h</p>
          </div>
        </div>
      </div>
    </div>
  );
}
