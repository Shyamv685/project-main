import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Clock,
  Calendar,
  DollarSign,
  BarChart3,
  User,
  Menu,
  X,
  Inbox,
  CheckSquare
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SidebarMenuProps {
  isCollapsed: boolean;
  onToggle: () => void;
  role: string;
}

const allMenuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard", roles: ["hr", "employee"] },
  { icon: Users, label: "Employees", path: "/employees", roles: ["hr"] },
  { icon: Clock, label: "Attendance", path: "/attendance", roles: ["hr", "employee"] },
  { icon: Calendar, label: "Leave", path: "/leave", roles: ["hr", "employee"] },
  { icon: DollarSign, label: "Payroll", path: "/payroll", roles: ["hr"] },
  { icon: BarChart3, label: "Reports", path: "/reports", roles: ["hr"] },
  { icon: User, label: "Profile", path: "/profile", roles: ["hr", "employee"] },
  { icon: Inbox, label: "Inbox", path: "/inbox", roles: ["hr"] },
  { icon: Calendar, label: "Calendar", path: "/calendar", roles: ["hr"] },
  { icon: CheckSquare, label: "Todos", path: "/todos", roles: ["hr"] }
];

export default function SidebarMenu({ isCollapsed, onToggle, role }: SidebarMenuProps) {
  const menuItems = allMenuItems.filter(item => item.roles.includes(role));
  return (
    <motion.aside
      animate={{ width: isCollapsed ? 80 : 256 }}
      className="bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-screen fixed left-0 top-0 z-30 transition-all duration-300"
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
          {isCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
        </button>
      </div>

      <nav className="p-4 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
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
        ))}
      </nav>
    </motion.aside>
  );
}
