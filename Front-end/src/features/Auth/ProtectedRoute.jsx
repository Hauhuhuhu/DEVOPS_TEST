import { Navigate, Outlet } from 'react-router-dom';

function ProtectedRoute() {
  // Lấy token từ localStorage (nơi bạn đã lưu ở hook useLogin)
  const token = localStorage.getItem('token');

  // Nếu không có token (chưa đăng nhập hoặc đã đăng xuất)
  if (!token) {
    // Điều hướng về trang login và dùng replace: true 
    // để user không thể dùng nút "Back" trên trình duyệt quay lại route này
    return <Navigate to="/login" replace />;
  }

  // Nếu có token hợp lệ, cho phép render các component con bên trong
  return <Outlet />;
}

export default ProtectedRoute;