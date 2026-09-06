export const formatCurrency = (amount) => {
  const numeric = Number(amount);
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Number.isFinite(numeric) ? numeric : 0);
};
