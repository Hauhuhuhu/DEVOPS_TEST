export function getLoginErrorMessage(error) {
  const backendMessage = error?.response?.data?.message;

  if (typeof backendMessage === "string" && backendMessage.trim()) {
    return backendMessage;
  }

  if (!error?.response) {
    return "Không thể kết nối đến máy chủ. Vui lòng thử lại.";
  }

  if (error.response.status === 401) {
    return "Email hoặc mật khẩu không chính xác";
  }

  return "Đăng nhập không thành công. Vui lòng thử lại.";
}
