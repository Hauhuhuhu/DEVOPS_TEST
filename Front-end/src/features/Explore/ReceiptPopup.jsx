import { formatCurrency } from "../../utils/formatCurrency";
import { X, Printer } from "lucide-react";

function ReceiptPopup({ order, isOpen, onClose }) {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return new Date().toLocaleString("vi-VN");
    return new Date(dateStr).toLocaleString("vi-VN");
  };

  const subtotal = order.subtotal ?? order.grandTotal ?? 0;
  const discountAmount = order.discountAmount ?? 0;
  const tax = order.tax ?? 0;
  const grandTotal = order.grandTotal ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 receipt-modal-overlay">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs no-print" 
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-10 flex flex-col text-slate-900 max-h-[90vh]">
        {/* Header (Hidden in Print) */}
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 no-print">
          <h6 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Hóa đơn thanh toán</h6>
          <button
            type="button"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Printable Receipt Container */}
        <div className="p-6 overflow-y-auto receipt-printable-area font-sans text-xs space-y-3">
          {/* Store Header */}
          <div className="text-center space-y-1">
            <h5 className="text-base font-bold uppercase tracking-wider text-slate-900">
              Billing App POS
            </h5>
            <p className="text-slate-500 text-[11px]">Hệ thống bán hàng thông minh</p>
            <p className="text-slate-500 text-[11px]">Hotline: 1900 8888</p>
            <div className="pt-1">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                {order.paymentDetails?.status === "COMPLETED" ? "ĐÃ THANH TOÁN" : "CHỜ XỬ LÝ"}
              </span>
            </div>
          </div>

          {/* Receipt Metadata */}
          <div className="border-y border-dashed border-slate-300 py-2.5 space-y-1 text-slate-600">
            <div className="flex justify-between">
              <span className="text-slate-400">Mã hóa đơn:</span>
              <span className="font-semibold text-slate-900">#{order.orderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Thời gian:</span>
              <span>{formatDate(order.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Khách hàng:</span>
              <span className="font-semibold text-slate-900">{order.customerName || "Khách vãng lai"}</span>
            </div>
            {order.phoneNumber && order.phoneNumber !== "0000000000" && (
              <div className="flex justify-between">
                <span className="text-slate-400">Số điện thoại:</span>
                <span>{order.phoneNumber}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-400">Phương thức:</span>
              <span className="font-medium text-slate-900">
                {order.paymentMethod === "PAYOS" ? "Chuyển khoản (PayOS)" : "Tiền mặt"}
              </span>
            </div>
          </div>

          {/* Products Table */}
          <div>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 text-[11px]">
                  <th className="text-left pb-1.5 font-medium">Tên món</th>
                  <th className="text-center pb-1.5 font-medium">SL</th>
                  <th className="text-right pb-1.5 font-medium">Đ.Giá</th>
                  <th className="text-right pb-1.5 font-medium">T.Tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {order.items?.map((item, index) => {
                  const itemUnitPrice = item.price ?? item.basePrice ?? 0;
                  const itemTotal = itemUnitPrice * (item.quantity || 1);
                  return (
                    <tr key={index} className="align-top">
                      <td className="py-1.5 pr-2">
                        <div className="font-semibold text-slate-900">
                          {item.name}
                          {item.variantLabel && (
                            <span className="text-slate-500 text-[10px] ml-1 font-normal">
                              ({item.variantLabel})
                            </span>
                          )}
                          {item.variantSku && !item.variantLabel && (
                            <span className="text-slate-500 text-[10px] ml-1 font-normal font-mono">
                              ({item.variantSku})
                            </span>
                          )}
                        </div>
                        {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                          <div className="text-slate-400 text-[10px]">
                            {item.selectedModifiers.map((m, mi) => {
                              const priceAdj = m.priceAdjustment ?? m.price ?? 0;
                              return (
                                <span key={mi} className="mr-1">
                                  +{m.name}
                                  {priceAdj > 0 && ` (${formatCurrency(priceAdj)})`}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </td>
                      <td className="text-center py-1.5 text-slate-600">{item.quantity}</td>
                      <td className="text-right py-1.5 text-slate-500">
                        {formatCurrency(itemUnitPrice)}
                      </td>
                      <td className="text-right py-1.5 font-semibold text-slate-900">
                        {formatCurrency(itemTotal)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Totals & Promotion Savings Itemization */}
          <div className="border-t border-dashed border-slate-300 pt-2.5 space-y-1">
            <div className="flex justify-between text-slate-500">
              <span>Tạm tính (Subtotal):</span>
              <span className="font-medium text-slate-900">{formatCurrency(subtotal)}</span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-red-600 font-semibold">
                <span>
                  Giảm giá {order.promotionName ? `(${order.promotionName})` : ""}:
                </span>
                <span>-{formatCurrency(discountAmount)}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-500">
              <span>Thuế VAT (10%):</span>
              <span className="text-slate-900">{formatCurrency(tax)}</span>
            </div>

            <div className="border-t-2 border-slate-900 pt-2 flex justify-between items-center">
              <span className="font-bold text-sm text-slate-900">TỔNG THANH TOÁN:</span>
              <span className="font-bold text-base text-blue-600">
                {formatCurrency(grandTotal)}
              </span>
            </div>

            {discountAmount > 0 && (
              <div className="mt-2 p-2 rounded-lg bg-emerald-50 text-emerald-800 text-center text-[11px] font-semibold">
                🎉 Quý khách đã tiết kiệm được {formatCurrency(discountAmount)}!
              </div>
            )}
          </div>

          {/* Receipt Footer */}
          <div className="text-center text-slate-400 text-[11px] pt-3 border-t border-dashed border-slate-300 space-y-0.5">
            <p className="font-medium text-slate-600">Cảm ơn Quý Khách - Hẹn Gặp Lại!</p>
            <p>Vui lòng kiểm tra lại hóa đơn trước khi rời khỏi quầy.</p>
          </div>
        </div>

        {/* Action Buttons (Hidden in Print) */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex gap-2 no-print">
          <button
            type="button"
            className="flex-1 py-2 px-3 rounded-lg border border-slate-300 hover:bg-white text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            onClick={onClose}
          >
            Đóng
          </button>
          <button
            type="button"
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            onClick={handlePrint}
          >
            <Printer size={14} />
            <span>In hóa đơn</span>
          </button>
        </div>
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          .receipt-modal-overlay,
          .receipt-modal-overlay * {
            visibility: visible !important;
          }
          .receipt-modal-overlay {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            background: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
            display: block !important;
          }
          .receipt-modal-overlay > div:not(.no-print) {
            max-height: none !important;
            overflow: visible !important;
            border: none !important;
            box-shadow: none !important;
            width: 100% !important;
            max-width: 450px !important;
            margin: 0 auto !important;
            border-radius: 0 !important;
          }
          .receipt-printable-area {
            max-height: none !important;
            overflow: visible !important;
            padding: 0.5rem 0 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

export default ReceiptPopup;
