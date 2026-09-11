import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import Spinner from "../../ui/Spinner";

function AdminRoute() {
  const { user, isAdmin, isLoading } = useCurrentUser();

  useEffect(() => {
    if (user && !isAdmin) {
      toast.error("Bạn không có quyền truy cập trang này!");
    }
  }, [user, isAdmin]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Nếu có token nhưng role không phải admin
  if (!isAdmin) {
    // Đẩy về trang chủ hoặc dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default AdminRoute;
