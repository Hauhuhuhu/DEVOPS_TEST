import { Navigate, Outlet } from "react-router-dom";
import { toast } from "react-hot-toast";

function AdminRoute() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Nếu có token nhưng role không phải admin
  if (role !== "ROLE_ADMIN") {
    // Giả sử role admin của bạn lưu là 'admin'
    toast.error("Bạn không có quyền truy cập trang này!");
    // Đẩy về trang chủ hoặc dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default AdminRoute;
