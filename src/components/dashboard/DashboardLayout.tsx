import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import SidebarMenu from "./SidebarMenu";
import HeaderBar from "./HeaderBar";

export default function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [role, setRole] = useState("employee");

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      setRole(userData.role);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <SidebarMenu
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        role={role}
      />
      <HeaderBar sidebarCollapsed={sidebarCollapsed} role={role} onRoleChange={setRole} />
      <main
        className="transition-all duration-300 pt-20 p-6"
        style={{ marginLeft: sidebarCollapsed ? "80px" : "256px" }}
      >
        <Outlet />
      </main>
    </div>
  );
}
