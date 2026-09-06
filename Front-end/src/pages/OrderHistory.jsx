import { useState } from "react";
import { useOrders } from "../features/Orders/useOrders";
import Spinner from "../ui/Spinner";
import { formatCurrency } from "../utils/formatCurrency";
import ReceiptPopup from "../features/Explore/ReceiptPopup";
import { Receipt, PackageOpen } from "lucide-react";

function OrderHistory() {
  const { isLoading, orders } = useOrders();
  const [selectedOrderForReceipt, setSelectedOrderForReceipt] = useState(null);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size={32} className="text-blue-600" />
      </div>
    );
  }

  const formatItems = (items) => {
    return items?.map((item) => `${item.name} x ${item.quantity}`).join(", ") || "";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("vi-VN", options);
  };

  if (!orders || orders.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <PackageOpen size={48} className="mx-auto text-slate-400 mb-3" />
        <h3 className="text-lg font-medium text-slate-800">Không có đơn hàng nào</h3>
        <p className="text-sm text-slate-500 mt-1">Chưa có dữ liệu đơn hàng được ghi nhận trong hệ thống.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Danh sách đơn hàng</h2>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
          {orders.length} đơn hàng
        </span>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50 sticky top-0">
              <tr>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Mã ĐH</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Khách hàng</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Sản phẩm</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Khuyến mãi</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng tiền</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Thanh toán</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Thời gian</th>
                <th className="px-5 py-3.5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 bg-white">
              {orders.map((order) => {
                const status = order.paymentDetails?.status || "PENDING";
                const isCompleted = status === "COMPLETED";
                const isPending = status === "PENDING";

                return (
                  <tr key={order.orderId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">
                      #{order.orderId}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm">
                      <div className="font-medium text-slate-900">{order.customerName}</div>
                      <div className="text-xs text-slate-500">{order.phoneNumber}</div>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600 max-w-xs truncate" title={formatItems(order.items)}>
                      {formatItems(order.items)}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm">
                      {order.discountAmount > 0 || order.promotionName ? (
                        <div>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                            {order.promotionName || "Ưu đãi"}
                          </span>
                          {order.discountAmount > 0 && (
                            <div className="text-xs text-red-600 font-semibold mt-0.5">
                              -{formatCurrency(order.discountAmount)}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm font-bold text-slate-900">
                      {formatCurrency(order.grandTotal)}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                        {order.paymentMethod}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          isCompleted
                            ? "bg-emerald-100 text-emerald-800"
                            : isPending
                            ? "bg-amber-100 text-amber-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {status}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-xs text-slate-500">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-center text-sm">
                      <button
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
                        title="Xem & In hóa đơn"
                        onClick={() => setSelectedOrderForReceipt(order)}
                      >
                        <Receipt size={14} className="text-blue-600" />
                        <span>In hóa đơn</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt Modal */}
      {selectedOrderForReceipt && (
        <ReceiptPopup
          order={selectedOrderForReceipt}
          isOpen={Boolean(selectedOrderForReceipt)}
          onClose={() => setSelectedOrderForReceipt(null)}
        />
      )}
    </div>
  );
}

export default OrderHistory;
