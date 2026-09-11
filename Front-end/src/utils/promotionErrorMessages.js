const PROMOTION_ERROR_MESSAGES = {
  PROMOTION_EMPTY_CART: "Giỏ hàng đang trống",
  PROMOTION_NOT_FOUND: "Mã giảm giá không tồn tại",
  PROMOTION_INACTIVE: "Mã giảm giá đang tạm ngưng hoạt động",
  PROMOTION_NOT_STARTED: "Mã giảm giá chưa đến ngày áp dụng",
  PROMOTION_EXPIRED: "Mã giảm giá đã hết hạn sử dụng",
  PROMOTION_USAGE_EXHAUSTED: "Mã giảm giá đã hết lượt sử dụng",
  PROMOTION_MIN_ORDER_NOT_MET: "Đơn hàng chưa đạt giá trị tối thiểu để áp dụng mã này",
};

export function getPromotionErrorMessage(error) {
  const responseData = error?.response?.data;
  const code = responseData?.code;
  if (code && PROMOTION_ERROR_MESSAGES[code]) {
    return PROMOTION_ERROR_MESSAGES[code];
  }

  if (error?.response?.status === 401) {
    return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
  }

  return "Mã giảm giá không hợp lệ hoặc không còn khả dụng";
}
