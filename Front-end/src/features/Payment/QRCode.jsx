import { QRCodeSVG } from "qrcode.react";
import { formatCurrency } from "../../utils/formatCurrency";
import Spinner from "../../ui/Spinner";
import { ExternalLink } from "lucide-react";

function QRCode({ currentData }) {
  const subtotal = currentData.subtotal;
  const discountAmount = currentData.discountAmount || 0;
  const tax = currentData.tax;
  const grandTotal = currentData.grandTotal || 0;
  const checkoutUrl =
    currentData.paymentDetails?.checkoutUrl || currentData.checkoutUrl;

  return (
    <div className="mt-3 p-5 border border-slate-200 bg-slate-50/70 rounded-2xl text-center shadow-xs">
      <h5 className="text-base font-bold text-slate-900 mb-3">
        Quét mã QR để thanh toán (PayOS)
      </h5>

      {currentData.paymentDetails?.qrCode ? (
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-white rounded-xl shadow-xs inline-block border border-slate-200">
            <QRCodeSVG
              value={currentData.paymentDetails.qrCode}
              size={200}
              bgColor={"#ffffff"}
              fgColor={"#000000"}
              level={"H"}
              includeMargin={false}
            />
          </div>
        </div>
      ) : (
        <div className="my-8 flex justify-center">
          <Spinner size={32} className="text-blue-600" />
        </div>
      )}

      <div className="text-slate-800 text-left bg-white p-4 rounded-xl border border-slate-200 max-w-sm mx-auto shadow-2xs space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-slate-500">Mã đơn hàng:</span>
          <span className="font-semibold text-slate-900">#{currentData.orderId}</span>
        </div>

        {subtotal !== undefined && subtotal !== null && (
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">Tạm tính:</span>
            <span className="text-slate-900">{formatCurrency(subtotal)}</span>
          </div>
        )}

        {discountAmount > 0 && (
          <div className="flex justify-between text-xs text-red-600 font-semibold">
            <span>
              🏷️ Giảm giá {currentData.promotionName ? `(${currentData.promotionName})` : ""}:
            </span>
            <span>-{formatCurrency(discountAmount)}</span>
          </div>
        )}

        {tax !== undefined && tax !== null && (
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">Thuế VAT (10%):</span>
            <span className="text-slate-900">{formatCurrency(tax)}</span>
          </div>
        )}

        <div className="border-t border-slate-200 pt-2 mt-2 flex justify-between items-center">
          <span className="text-sm font-bold text-slate-900">Tổng thanh toán:</span>
          <span className="text-base font-bold text-red-600">
            {formatCurrency(grandTotal)}
          </span>
        </div>

        {discountAmount > 0 && (
          <div className="mt-2 py-1 px-2 rounded-lg bg-emerald-50 text-emerald-700 text-center text-xs font-semibold border border-emerald-100">
            Đã áp dụng ưu đãi: Tiết kiệm {formatCurrency(discountAmount)}
          </div>
        )}

        <p className="text-[11px] text-slate-400 mt-2 text-center">
          * Đơn hàng sẽ tự động cập nhật trạng thái ngay sau khi bạn chuyển khoản thành công.
        </p>
      </div>

      {checkoutUrl && (
        <a
          href={checkoutUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2 mt-4 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50 text-xs font-semibold transition-colors cursor-pointer"
        >
          <span>Hoặc mở trang thanh toán PayOS</span>
          <ExternalLink size={13} />
        </a>
      )}
    </div>
  );
}

export default QRCode;
