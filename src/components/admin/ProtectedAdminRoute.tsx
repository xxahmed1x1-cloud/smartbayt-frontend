import { useAuth } from "@/context/AuthContext";
import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">جارٍ التحقق...</div>
      </div>
    );
  }
  if (!user) return <Navigate to="/admin/login" state={{ from: location }} replace />;
  if (!isAdmin) return <Navigate to="/admin/login?error=unauthorized" replace />;
  return <>{children}</>;
}