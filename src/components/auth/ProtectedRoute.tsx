import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export default function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const user = localStorage.getItem('user');
  if (!user) {
    return <Navigate to="/" replace />;
  }

  const userData = JSON.parse(user);
  if (adminOnly && userData.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
