import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 px-4">
      <div className="text-center max-w-md">
        <h1 className="text-7xl font-extrabold text-red-500 mb-2">404</h1>
        <p className="text-2xl font-semibold text-slate-800 mb-2">
          <span className="text-red-500">Rất tiếc!</span> Trang bạn tìm kiếm không tồn tại.
        </p>
        <p className="text-slate-600 mb-6">
          Đường dẫn có thể đã bị thay đổi, hoặc bạn đã nhập sai địa chỉ.
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center justify-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors"
        >
          Quay lại trang chủ
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
