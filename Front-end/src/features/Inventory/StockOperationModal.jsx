import { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useRecordTransaction, useStockCheck } from "./useRecordTransaction";
import { useVariantTransactions } from "./useVariantTransactions";
import Spinner from "../../ui/Spinner";
import { 
  Package, X, ArrowLeftRight, ClipboardCheck, History, 
  ArrowDownCircle, ArrowUpCircle, HardDrive, ClipboardList, 
  Calculator, CheckCircle2, FileX
} from "lucide-react";

function StockOperationModal({ variant, itemName, isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState("quick");
  const { recordTransaction, isRecording } = useRecordTransaction();
  const { executeStockCheck, isChecking } = useStockCheck();
  const { transactions, isLoading: isTxLoading } = useVariantTransactions(
    variant?.variantId
  );

  // Form for Stock IN / OUT
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      transactionType: "IN",
      quantity: 1,
      referenceId: "",
      note: "",
    },
  });

  const transactionType = useWatch({ control, name: "transactionType" });

  // Form for Stock Check (Kiểm kê)
  const {
    register: registerCheck,
    handleSubmit: handleSubmitCheck,
    reset: resetCheck,
    control: controlCheck,
    formState: { errors: errorsCheck },
  } = useForm({
    defaultValues: {
      actualCount: variant?.cachedStockQuantity ?? 0,
      referenceId: "",
      note: "",
    },
  });

  useEffect(() => {
    if (variant) {
      resetCheck({
        actualCount: variant.cachedStockQuantity ?? 0,
        referenceId: "",
        note: "",
      });
    }
  }, [variant, resetCheck]);

  const countedValue = useWatch({
    control: controlCheck,
    name: "actualCount",
  });
  const currentStock = variant?.cachedStockQuantity ?? 0;
  const countedNum =
    countedValue !== "" && countedValue != null && !isNaN(Number(countedValue))
      ? Number(countedValue)
      : null;
  const discrepancy = countedNum != null ? countedNum - currentStock : null;

  if (!isOpen || !variant) return null;

  const isSubmitting = isRecording || isChecking;

  const onSubmitQuick = (data) => {
    recordTransaction(
      {
        variantId: variant.variantId,
        transactionType: data.transactionType,
        quantity: Number(data.quantity),
        referenceId: data.referenceId?.trim() || null,
        note: data.note?.trim() || null,
      },
      {
        onSuccess: () => {
          reset({
            transactionType: "IN",
            quantity: 1,
            referenceId: "",
            note: "",
          });
          setActiveTab("history");
        },
      }
    );
  };

  const onSubmitCheck = (data) => {
    executeStockCheck(
      {
        variantId: variant.variantId,
        actualCount: Number(data.actualCount),
        referenceId: data.referenceId?.trim() || null,
        note: data.note?.trim() || null,
      },
      {
        onSuccess: () => {
          resetCheck({
            actualCount: Number(data.actualCount),
            referenceId: "",
            note: "",
          });
          setActiveTab("history");
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" 
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
              <Package size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Stock Operations: {itemName}
              </h3>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <span>SKU: <strong className="text-slate-800 font-mono">{variant.sku}</strong></span>
                <span>•</span>
                <span>Current Stock:</span>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full font-semibold ${
                    (variant.cachedStockQuantity ?? 0) > 0
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {variant.cachedStockQuantity ?? 0}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            onClick={onClose}
            disabled={isSubmitting}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 border-b border-slate-200 bg-white">
          <div className="flex gap-2 -mb-px">
            <button
              type="button"
              className={`inline-flex items-center gap-1.5 py-3 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                activeTab === "quick"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
              onClick={() => setActiveTab("quick")}
            >
              <ArrowLeftRight size={14} /> Stock IN / OUT
            </button>
            <button
              type="button"
              className={`inline-flex items-center gap-1.5 py-3 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                activeTab === "check"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
              onClick={() => setActiveTab("check")}
            >
              <ClipboardCheck size={14} /> Stock Check (Kiểm kê)
            </button>
            <button
              type="button"
              className={`inline-flex items-center gap-1.5 py-3 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                activeTab === "history"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
              onClick={() => setActiveTab("history")}
            >
              <History size={14} /> Ledger History ({transactions?.length || 0})
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === "quick" && (
            <form onSubmit={handleSubmit(onSubmitQuick)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Transaction Type:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-colors ${
                      transactionType === "IN"
                        ? "border-emerald-500 bg-emerald-50/50 text-emerald-900"
                        : "border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <input
                      type="radio"
                      value="IN"
                      className="sr-only"
                      {...register("transactionType", { required: true })}
                    />
                    <ArrowDownCircle size={18} className="text-emerald-600 flex-shrink-0" />
                    <div>
                      <div className="text-xs font-bold">Stock IN</div>
                      <div className="text-[11px] text-slate-500">Nhập kho hàng mới</div>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-colors ${
                      transactionType === "OUT"
                        ? "border-red-500 bg-red-50/50 text-red-900"
                        : "border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <input
                      type="radio"
                      value="OUT"
                      className="sr-only"
                      {...register("transactionType", { required: true })}
                    />
                    <ArrowUpCircle size={18} className="text-red-600 flex-shrink-0" />
                    <div>
                      <div className="text-xs font-bold">Stock OUT</div>
                      <div className="text-[11px] text-slate-500">Xuất huỷ / Hao hụt</div>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Quantity:
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-500 text-sm">
                    {transactionType === "IN" ? "+" : "-"}
                  </span>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 10"
                    {...register("quantity", {
                      required: "Quantity is required",
                      min: { value: 1, message: "Quantity must be at least 1" },
                      valueAsNumber: true,
                    })}
                    className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {errors.quantity && (
                  <p className="text-xs text-red-600 mt-1">{errors.quantity.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reference ID (Optional):
                </label>
                <input
                  type="text"
                  placeholder="e.g. PO-2026-001, WASTAGE-TICKET-5"
                  {...register("referenceId")}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-[11px] text-slate-400 block mt-1">
                  Source document tracking ID (Purchase order, wastage ticket, etc.)
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason / Note (Optional):
                </label>
                <textarea
                  rows="2"
                  placeholder="e.g. Nhập hàng từ nhà cung cấp XYZ..."
                  {...register("note")}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  className="px-4 py-2 text-xs font-medium text-slate-700 rounded-lg border border-slate-300 hover:bg-slate-50 cursor-pointer"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white rounded-lg shadow-sm transition-colors cursor-pointer ${
                    transactionType === "IN" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {isRecording ? (
                    <Spinner className="text-white" />
                  ) : (
                    <>
                      {transactionType === "IN" ? <ArrowDownCircle size={14} /> : <ArrowUpCircle size={14} />}
                      <span>Submit {transactionType === "IN" ? "Stock IN" : "Stock OUT"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {activeTab === "check" && (
            <form onSubmit={handleSubmitCheck(onSubmitCheck)} className="space-y-4">
              {/* Comparison Card */}
              <div className="grid grid-cols-3 gap-2 p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <div>
                  <div className="text-[11px] text-slate-500 flex items-center justify-center gap-1 mb-1">
                    <HardDrive size={13} /> System Stock
                  </div>
                  <div className="text-lg font-bold text-slate-900">{currentStock}</div>
                </div>
                <div className="border-x border-slate-200">
                  <div className="text-[11px] text-slate-500 flex items-center justify-center gap-1 mb-1">
                    <ClipboardList size={13} /> Physical Count
                  </div>
                  <div className="text-lg font-bold text-blue-600">
                    {countedNum != null ? countedNum : "—"}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500 flex items-center justify-center gap-1 mb-1">
                    <Calculator size={13} /> Discrepancy (Adj)
                  </div>
                  <div className="text-lg font-bold">
                    {discrepancy == null ? (
                      "—"
                    ) : discrepancy > 0 ? (
                      <span className="text-emerald-600">+{discrepancy} (Surplus)</span>
                    ) : discrepancy < 0 ? (
                      <span className="text-red-600">{discrepancy} (Shortage)</span>
                    ) : (
                      <span className="text-slate-600">0 (Match)</span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Actual Physical Count (Số lượng thực tế kiểm đếm) *:
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="Enter actual counted stock..."
                  {...registerCheck("actualCount", {
                    required: "Physical count is required",
                    min: { value: 0, message: "Count cannot be negative" },
                    valueAsNumber: true,
                  })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errorsCheck.actualCount && (
                  <p className="text-xs text-red-600 mt-1">{errorsCheck.actualCount.message}</p>
                )}
                <span className="text-[11px] text-slate-400 block mt-1">
                  The ledger will automatically record an ADJUSTMENT transaction for the discrepancy.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Audit Reference (Mã đợt kiểm kê / Biên bản - Optional):
                </label>
                <input
                  type="text"
                  placeholder="e.g. AUDIT-2026-03, KIEM-KE-T3"
                  {...registerCheck("referenceId")}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Audit Reason / Note (Ghi chú lý do chênh lệch - Optional):
                </label>
                <textarea
                  rows="2"
                  placeholder="e.g. Định kỳ kiểm kê cuối tháng, phát hiện hao hụt do vỡ..."
                  {...registerCheck("note")}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  className="px-4 py-2 text-xs font-medium text-slate-700 rounded-lg border border-slate-300 hover:bg-slate-50 cursor-pointer"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  {isChecking ? (
                    <Spinner className="text-white" />
                  ) : (
                    <>
                      <CheckCircle2 size={14} />
                      <span>Confirm Stock Check & Adjust</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {activeTab === "history" && (
            <div>
              {isTxLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Spinner size={32} className="text-blue-600" />
                </div>
              ) : transactions?.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <FileX size={36} className="mx-auto mb-2 text-slate-300" />
                  <p className="text-sm">No inventory transactions found for this variant yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="min-w-full divide-y divide-slate-200 text-xs">
                    <thead className="bg-slate-50 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold text-slate-600">Type</th>
                        <th className="px-3 py-2 text-left font-semibold text-slate-600">Qty</th>
                        <th className="px-3 py-2 text-left font-semibold text-slate-600">Balance</th>
                        <th className="px-3 py-2 text-left font-semibold text-slate-600">Reference</th>
                        <th className="px-3 py-2 text-left font-semibold text-slate-600">Note</th>
                        <th className="px-3 py-2 text-left font-semibold text-slate-600">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {transactions.map((tx) => (
                        <tr key={tx.transactionId} className="hover:bg-slate-50/80">
                          <td className="px-3 py-2 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                                tx.transactionType === "IN"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : tx.transactionType === "OUT"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {tx.transactionType === "ADJUSTMENT"
                                ? "ADJUSTMENT (Audit)"
                                : tx.transactionType}
                            </span>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap font-bold">
                            <span className={tx.quantity > 0 ? "text-emerald-600" : tx.quantity < 0 ? "text-red-600" : "text-slate-600"}>
                              {tx.quantity > 0 ? `+${tx.quantity}` : tx.quantity}
                            </span>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap font-semibold text-slate-900">
                            {tx.balanceAfter != null ? tx.balanceAfter : "—"}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-slate-600">
                            {tx.referenceId || "—"}
                          </td>
                          <td className="px-3 py-2 text-slate-500 max-w-xs truncate" title={tx.note}>
                            {tx.note || "—"}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-slate-400 text-[11px]">
                            {tx.createdAt ? new Date(tx.createdAt).toLocaleString() : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StockOperationModal;
