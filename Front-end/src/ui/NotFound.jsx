function NotFound() {
  return (
    <div class="d-flex align-items-center justify-content-center vh-100 bg-light">
      <div class="text-center">
        <h1 class="display-1 fw-bold text-danger">404</h1>
        <p class="fs-3">
          <span class="text-danger">Rất tiếc!</span> Trang bạn tìm kiếm không
          tồn tại.
        </p>
        <p class="lead mb-4">
          Đường dẫn có thể đã bị thay đổi, hoặc bạn đã nhập sai địa chỉ.
        </p>
        <a href="/dashboard" class="btn btn-primary btn-lg">
          Quay lại trang chủ
        </a>
      </div>
    </div>
  );
}
export default NotFound;
