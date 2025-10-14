import { Users, Calendar, Clock, TrendingUp } from "lucide-react";
import StatsCard from "@/components/dashboard/StatsCard";
import DashboardAnalytics from "@/components/analytics/DashboardAnalytics";
import { dashboardStats } from "@/data/dummyData";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's your overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          icon={Users}
          title="Total Employees"
          value={dashboardStats.totalEmployees}
          trend={{ value: 12, isPositive: true }}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
        />
        <StatsCard
          icon={Calendar}
          title="Active Leaves"
          value={dashboardStats.activeLeaves}
          iconBgColor="bg-yellow-100"
          iconColor="text-yellow-600"
        />
        <StatsCard
          icon={Clock}
          title="Present Today"
          value={dashboardStats.presentToday}
          iconBgColor="bg-green-100"
          iconColor="text-green-600"
        />
        <StatsCard
          icon={TrendingUp}
          title="Monthly Attendance"
          value={`${dashboardStats.monthlyAttendance}%`}
          trend={{ value: 5, isPositive: true }}
          iconBgColor="bg-purple-100"
          iconColor="text-purple-600"
        />
      </div>

      <DashboardAnalytics />
    </div>
  );
}
