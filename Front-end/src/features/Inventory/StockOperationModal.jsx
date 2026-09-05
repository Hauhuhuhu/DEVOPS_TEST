import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useRecordTransaction } from "./useRecordTransaction";
import { useVariantTransactions } from "./useVariantTransactions";
import Spinner from "../../ui/Spinner";

function StockOperationModal({ variant, itemName, isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState("form");
  const { recordTransaction, isRecording } = useRecordTransaction();
  const { transactions, isLoading: isTxLoading } = useVariantTransactions(
    variant?.variantId
  );

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

  if (!isOpen || !variant) return null;

  const onSubmit = (data) => {
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

  return (
    <div
      className="modal show d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(0,0,0,0.65)" }}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content bg-dark text-light border border-secondary shadow">
          {/* Header */}
          <div className="modal-header border-secondary">
            <div>
              <h5 className="modal-title text-warning fw-bold">
                <i className="bi bi-box-seam me-2"></i>
                Stock Operations: {itemName}
              </h5>
              <div className="small text-muted">
                SKU: <span className="text-light fw-bold">{variant.sku}</span> |
                Current Stock:{" "}
                <span
                  className={`badge ${
                    (variant.cachedStockQuantity ?? 0) > 0
                      ? "bg-success"
                      : "bg-danger"
                  }`}
                >
                  {variant.cachedStockQuantity ?? 0}
                </span>
              </div>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              disabled={isRecording}
            ></button>
          </div>

          {/* Navigation Tabs */}
          <div className="modal-body border-bottom border-secondary pb-0">
            <ul className="nav nav-tabs border-secondary">
              <li className="nav-item">
                <button
                  className={`nav-link ${
                    activeTab === "form"
                      ? "active bg-secondary text-light fw-bold border-secondary"
                      : "text-muted"
                  }`}
                  onClick={() => setActiveTab("form")}
                  type="button"
                >
                  <i className="bi bi-plus-slash-minus me-1"></i> New Transaction
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${
                    activeTab === "history"
                      ? "active bg-secondary text-light fw-bold border-secondary"
                      : "text-muted"
                  }`}
                  onClick={() => setActiveTab("history")}
                  type="button"
                >
                  <i className="bi bi-clock-history me-1"></i> Ledger History (
                  {transactions?.length || 0})
                </button>
              </li>
            </ul>
          </div>

          {/* Modal Content */}
          <div className="modal-body">
            {activeTab === "form" ? (
              <form onSubmit={handleSubmit(onSubmit)}>
                {/* Transaction Type */}
                <div className="mb-3">
                  <label className="form-label text-warning small fw-bold">
                    Transaction Type:
                  </label>
                  <div className="d-flex gap-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        id="txIn"
                        value="IN"
                        {...register("transactionType", { required: true })}
                      />
                      <label
                        className="form-check-label text-success fw-bold"
                        htmlFor="txIn"
                      >
                        <i className="bi bi-arrow-down-circle me-1"></i> Stock
                        IN (Nhập kho)
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        id="txOut"
                        value="OUT"
                        {...register("transactionType", { required: true })}
                      />
                      <label
                        className="form-check-label text-danger fw-bold"
                        htmlFor="txOut"
                      >
                        <i className="bi bi-arrow-up-circle me-1"></i> Stock OUT
                        (Xuất huỷ / Hao hụt)
                      </label>
                    </div>
                  </div>
                </div>

                {/* Quantity */}
                <div className="mb-3">
                  <label className="form-label text-warning small fw-bold">
                    Quantity:
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-secondary text-light border-secondary">
                      {transactionType === "IN" ? "+" : "-"}
                    </span>
                    <input
                      type="number"
                      min="1"
                      className={`form-control bg-dark text-light border-secondary ${
                        errors.quantity ? "is-invalid" : ""
                      }`}
                      placeholder="e.g. 10"
                      {...register("quantity", {
                        required: "Quantity is required",
                        min: { value: 1, message: "Quantity must be at least 1" },
                        valueAsNumber: true,
                      })}
                    />
                  </div>
                  {errors.quantity && (
                    <div className="text-danger small mt-1">
                      {errors.quantity.message}
                    </div>
                  )}
                </div>

                {/* Reference ID */}
                <div className="mb-3">
                  <label className="form-label text-warning small fw-bold">
                    Reference ID (Optional):
                  </label>
                  <input
                    type="text"
                    className="form-control bg-dark text-light border-secondary"
                    placeholder="e.g. PO-2026-001, WASTAGE-TICKET-5"
                    {...register("referenceId")}
                  />
                  <div className="form-text text-muted" style={{ fontSize: "0.75rem" }}>
                    Source document tracking ID (Purchase order, wastage ticket, etc.)
                  </div>
                </div>

                {/* Note */}
                <div className="mb-3">
                  <label className="form-label text-warning small fw-bold">
                    Reason / Note (Optional):
                  </label>
                  <textarea
                    rows="2"
                    className="form-control bg-dark text-light border-secondary"
                    placeholder="e.g. Nhập hàng từ nhà cung cấp XYZ..."
                    {...register("note")}
                  ></textarea>
                </div>

                <div className="d-flex justify-content-end gap-2 mt-4">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={onClose}
                    disabled={isRecording}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`btn ${
                      transactionType === "IN" ? "btn-success" : "btn-danger"
                    }`}
                    disabled={isRecording}
                  >
                    {isRecording ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        ></span>
                        Recording...
                      </>
                    ) : (
                      <>
                        <i
                          className={`bi ${
                            transactionType === "IN"
                              ? "bi-download"
                              : "bi-upload"
                          } me-1`}
                        ></i>
                        Submit {transactionType === "IN" ? "Stock IN" : "Stock OUT"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              /* Ledger History Tab */
              <div>
                {isTxLoading ? (
                  <Spinner />
                ) : transactions.length === 0 ? (
                  <div className="text-center text-muted py-4">
                    <i className="bi bi-journal-x fs-2 d-block mb-2"></i>
                    No inventory transactions found for this variant yet.
                  </div>
                ) : (
                  <div
                    className="table-responsive"
                    style={{ maxHeight: "350px", overflowY: "auto" }}
                  >
                    <table className="table table-dark table-striped table-hover table-sm small align-middle mb-0">
                      <thead className="table-secondary text-dark sticky-top">
                        <tr>
                          <th>Type</th>
                          <th>Qty</th>
                          <th>Balance</th>
                          <th>Reference</th>
                          <th>Note</th>
                          <th>Timestamp</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.map((tx) => (
                          <tr key={tx.transactionId}>
                            <td>
                              <span
                                className={`badge ${
                                  tx.transactionType === "IN"
                                    ? "bg-success"
                                    : "bg-danger"
                                }`}
                              >
                                {tx.transactionType}
                              </span>
                            </td>
                            <td
                              className={
                                tx.quantity > 0
                                  ? "text-success fw-bold"
                                  : "text-danger fw-bold"
                              }
                            >
                              {tx.quantity > 0 ? `+${tx.quantity}` : tx.quantity}
                            </td>
                            <td className="text-warning fw-semibold">
                              {tx.balanceAfter != null ? tx.balanceAfter : "—"}
                            </td>
                            <td>{tx.referenceId || "—"}</td>
                            <td
                              className="text-truncate"
                              style={{ maxWidth: "150px" }}
                              title={tx.note}
                            >
                              {tx.note || "—"}
                            </td>
                            <td className="text-muted" style={{ fontSize: "0.75rem" }}>
                              {tx.createdAt
                                ? new Date(tx.createdAt).toLocaleString()
                                : "—"}
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
    </div>
  );
}

export default StockOperationModal;
