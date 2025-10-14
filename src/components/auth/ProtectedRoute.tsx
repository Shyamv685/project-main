import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const user = localStorage.getItem('user');
  if (!user) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
