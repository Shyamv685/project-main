import { NavLink } from "react-router-dom";
import * as Icons from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SidebarMenuProps {
  isCollapsed: boolean;
  onToggle: () => void;
  role: string;
}

const allMenuItems = [
  { icon: Icons.LayoutDashboard, label: "Dashboard", path: "/dashboard", roles: ["hr", "employee"] },
  { icon: Icons.User, label: "Profile", path: "/profile", roles: ["employee"] },
  { icon: Icons.Inbox, label: "Inbox", path: "/inbox", roles: ["hr", "employee"] },
  { icon: Icons.Calendar, label: "Calendar", path: "/calendar", roles: ["hr"] },
  { icon: Icons.CheckSquare, label: "Todos", path: "/todos", roles: ["hr"] },
  { icon: Icons.Clock, label: "Attendance", path: "/attendance", roles: ["hr", "employee"] },
  { icon: Icons.Calendar, label: "Leave", path: "/leave", roles: ["hr"] },
  { icon: Icons.Calendar, label: "Leave Request", path: "/leave", roles: ["employee"] },
  { icon: Icons.DollarSign, label: "Payroll", path: "/payroll", roles: ["hr"] },
  { type: "heading", label: "Recruitment", roles: ["hr", "employee"] },
  { icon: Icons.Clock, label: "Timesheet", path: "/timesheet", roles: ["employee"] },
  { icon: Icons.Briefcase, label: "Jobs", path: "/jobs", roles: ["hr", "employee"] },
  { icon: Icons.UserCheck, label: "Candidates", path: "/candidates", roles: ["hr"] },
  { icon: Icons.Globe, label: "Career Site", path: "/career-site", roles: ["hr"] },
  { type: "heading", label: "Organization", roles: ["hr", "employee"] },
  { icon: Icons.Users, label: "Employees", path: "/employees", roles: ["hr", "employee"] },
  { icon: Icons.Building, label: "Structure", path: "/structure", roles: ["hr"] },
  { icon: Icons.Video, label: "Meeting", path: "/meeting", roles: ["hr", "employee"] },
  { icon: Icons.BarChart3, label: "Reports", path: "/reports", roles: ["hr", "employee"] },
  { icon: Icons.MapPin, label: "Tripets", path: "/tripets", roles: ["employee"] },
  { icon: Icons.GraduationCap, label: "Training & Development", path: "/training", roles: ["employee"] },
  { icon: Icons.MessageSquare, label: "Feedback", path: "/feedback", roles: ["employee"] },
  { icon: Icons.MessageSquare, label: "Employee Feedback", path: "/feedback", roles: ["hr"] },
  { type: "heading", label: "Support", roles: ["hr", "employee"] },
  { icon: Icons.User, label: "Profile", path: "/profile", roles: ["hr"] },
  { icon: Icons.Settings, label: "Settings", path: "/settings", roles: ["hr", "employee"] },
  { icon: Icons.Megaphone, label: "Announcements", path: "/announcements", roles: ["hr", "employee"] },
  { icon: Icons.HelpCircle, label: "Help Centre", path: "/help-centre", roles: ["hr", "employee"] }
];

export default function SidebarMenu({ isCollapsed, onToggle, role }: SidebarMenuProps) {
  const menuItems = allMenuItems.filter(item => item.roles.includes(role));
  return (
    <motion.aside
      initial={{ width: 256 }}
      animate={{ width: isCollapsed ? 80 : 256 }}
      className="bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-screen fixed left-0 top-0 z-30 transition-all duration-300 flex flex-col"
    >
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="font-bold text-xl text-gray-900 dark:text-white">SmartHRMS</span>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={onToggle}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          {isCollapsed ? <Icons.Menu className="w-5 h-5" /> : <Icons.X className="w-5 h-5" />}
        </button>
      </div>

      <nav className="p-4 space-y-2 overflow-y-auto flex-1">
        {menuItems.map((item, index) => {
          if (item.type === "heading") {
            return (
              <div key={`heading-${index}`} className="px-4 py-2">
                <motion.span
                  className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  {item.label}
                </motion.span>
              </div>
            );
          }

          return (
            <NavLink
              key={item.path}
              to={item.path!}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`
              }
            >
              {item.icon && <item.icon className="w-5 h-5 flex-shrink-0" />}
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="font-medium"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          );
        })}
      </nav>
    </motion.aside>
  );
}
