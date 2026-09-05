import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { usePromotions } from "../features/Promotions/usePromotions";
import { useCreatePromotion } from "../features/Promotions/useCreatePromotion";
import { useUpdatePromotion } from "../features/Promotions/useUpdatePromotion";
import { useTogglePromotion } from "../features/Promotions/useTogglePromotion";
import { useDeletePromotion } from "../features/Promotions/useDeletePromotion";
import { formatCurrency } from "../utils/formatCurrency";
import Spinner from "../ui/Spinner";

const DAYS_OF_WEEK = [
  { key: "MONDAY", label: "Mon" },
  { key: "TUESDAY", label: "Tue" },
  { key: "WEDNESDAY", label: "Wed" },
  { key: "THURSDAY", label: "Thu" },
  { key: "FRIDAY", label: "Fri" },
  { key: "SATURDAY", label: "Sat" },
  { key: "SUNDAY", label: "Sun" },
];

function ManagePromotions() {
  const [filterType, setFilterType] = useState("ALL");
  const [editingPromo, setEditingPromo] = useState(null);

  const { promotions, isLoading } = usePromotions();
  const { isCreating, addPromotion } = useCreatePromotion();
  const { isUpdating, editPromotion } = useUpdatePromotion();
  const { isToggling, toggleActive } = useTogglePromotion();
  const { isDeleting, removePromotion } = useDeletePromotion();

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      description: "",
      type: "COUPON",
      code: "",
      discountType: "PERCENTAGE",
      discountValue: "",
      maxDiscountAmount: "",
      minOrderAmount: "",
      startDate: "",
      endDate: "",
      startTime: "",
      endTime: "",
      daysOfWeek: [],
      buyVariantId: "",
      getVariantId: "",
      bogoDiscountPercent: 100,
      usageLimit: "",
      isActive: true,
    },
  });

  const selectedType = useWatch({ control, name: "type" });
  const discountType = useWatch({ control, name: "discountType" });

  function startEdit(promo) {
    setEditingPromo(promo);
    setValue("name", promo.name);
    setValue("description", promo.description || "");
    setValue("type", promo.type);
    setValue("code", promo.code || "");
    setValue("discountType", promo.discountType || "PERCENTAGE");
    setValue("discountValue", promo.discountValue != null ? promo.discountValue : "");
    setValue("maxDiscountAmount", promo.maxDiscountAmount != null ? promo.maxDiscountAmount : "");
    setValue("minOrderAmount", promo.minOrderAmount != null ? promo.minOrderAmount : "");
    setValue("startDate", promo.startDate || "");
    setValue("endDate", promo.endDate || "");
    setValue("startTime", promo.startTime ? promo.startTime.substring(0, 5) : "");
    setValue("endTime", promo.endTime ? promo.endTime.substring(0, 5) : "");
    setValue("daysOfWeek", promo.daysOfWeek ? promo.daysOfWeek.split(",") : []);
    setValue("buyVariantId", promo.buyVariantId || "");
    setValue("getVariantId", promo.getVariantId || "");
    setValue("bogoDiscountPercent", promo.bogoDiscountPercent != null ? promo.bogoDiscountPercent : 100);
    setValue("usageLimit", promo.usageLimit != null ? promo.usageLimit : "");
    setValue("isActive", promo.isActive != null ? promo.isActive : true);
  }

  function cancelEdit() {
    setEditingPromo(null);
    reset({
      name: "",
      description: "",
      type: "COUPON",
      code: "",
      discountType: "PERCENTAGE",
      discountValue: "",
      maxDiscountAmount: "",
      minOrderAmount: "",
      startDate: "",
      endDate: "",
      startTime: "",
      endTime: "",
      daysOfWeek: [],
      buyVariantId: "",
      getVariantId: "",
      bogoDiscountPercent: 100,
      usageLimit: "",
      isActive: true,
    });
  }

  function onSubmit(data) {
    const payload = {
      ...data,
      code: data.code ? data.code.trim().toUpperCase() : null,
      discountValue: data.discountValue ? parseFloat(data.discountValue) : 0,
      maxDiscountAmount: data.maxDiscountAmount ? parseFloat(data.maxDiscountAmount) : null,
      minOrderAmount: data.minOrderAmount ? parseFloat(data.minOrderAmount) : 0,
      bogoDiscountPercent: data.bogoDiscountPercent ? parseFloat(data.bogoDiscountPercent) : 100,
      usageLimit: data.usageLimit ? parseInt(data.usageLimit, 10) : null,
      daysOfWeek: Array.isArray(data.daysOfWeek) ? data.daysOfWeek.join(",") : data.daysOfWeek,
      startDate: data.startDate || null,
      endDate: data.endDate || null,
      startTime: data.startTime ? `${data.startTime}:00` : null,
      endTime: data.endTime ? `${data.endTime}:00` : null,
    };

    if (editingPromo) {
      editPromotion(
        { promotionId: editingPromo.promotionId, ...payload },
        { onSuccess: () => cancelEdit() }
      );
    } else {
      addPromotion(payload, {
        onSuccess: () => cancelEdit(),
      });
    }
  }

  const filteredPromotions = promotions?.filter((p) => {
    if (filterType === "ALL") return true;
    return p.type === filterType;
  });

  return (
    <div className="item-container p-3">
      <div className="left-column">
        <div className="card shadow-sm border-0">
          <div className="card-header bg-primary text-white py-2">
            <h5 className="mb-0 fs-6">
              <i className="bi bi-tag-fill me-2"></i>
              {editingPromo ? "Edit Promotion" : "Create Promotion"}
            </h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Promotion Type *</label>
                <select
                  className="form-select form-select-sm"
                  {...register("type", { required: true })}
                >
                  <option value="COUPON">Coupon Code (Voucher)</option>
                  <option value="HAPPY_HOUR">Happy Hour (Time-Window)</option>
                  <option value="BOGO">Buy One Get One (BOGO)</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold">Promotion Name *</label>
                <input
                  type="text"
                  className={`form-control form-control-sm ${errors.name ? "is-invalid" : ""}`}
                  placeholder="e.g. Summer Mega Discount"
                  {...register("name", { required: "Promotion name is required" })}
                />
                {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold">Description</label>
                <textarea
                  rows="2"
                  className="form-control form-control-sm"
                  placeholder="Details about this promo..."
                  {...register("description")}
                />
              </div>

              {selectedType === "COUPON" && (
                <div className="border rounded p-2 mb-3 bg-light">
                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Coupon Code *</label>
                    <input
                      type="text"
                      className={`form-control form-control-sm text-uppercase fw-bold ${
                        errors.code ? "is-invalid" : ""
                      }`}
                      placeholder="e.g. SUMMER2026"
                      {...register("code", {
                        required: selectedType === "COUPON" ? "Coupon code is required" : false,
                      })}
                    />
                    {errors.code && <div className="invalid-feedback">{errors.code.message}</div>}
                  </div>

                  <div className="row g-2 mb-2">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Discount Type</label>
                      <select
                        className="form-select form-select-sm"
                        {...register("discountType")}
                      >
                        <option value="PERCENTAGE">Percentage (%)</option>
                        <option value="FIXED_AMOUNT">Fixed Cash (VND)</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">
                        Value ({discountType === "PERCENTAGE" ? "%" : "VND"}) *
                      </label>
                      <input
                        type="number"
                        step="any"
                        className="form-control form-control-sm"
                        placeholder={discountType === "PERCENTAGE" ? "e.g. 15" : "e.g. 20000"}
                        {...register("discountValue", { required: true, min: 0 })}
                      />
                    </div>
                  </div>

                  <div className="row g-2 mb-2">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Min Order (VND)</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        placeholder="e.g. 50000"
                        {...register("minOrderAmount")}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Max Cap (VND)</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        placeholder="e.g. 100000"
                        {...register("maxDiscountAmount")}
                      />
                    </div>
                  </div>

                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Usage Limit (Max Uses)</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      placeholder="Leave empty for unlimited"
                      {...register("usageLimit")}
                    />
                  </div>
                </div>
              )}

              {selectedType === "HAPPY_HOUR" && (
                <div className="border rounded p-2 mb-3 bg-light">
                  <div className="row g-2 mb-2">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Discount Type</label>
                      <select
                        className="form-select form-select-sm"
                        {...register("discountType")}
                      >
                        <option value="PERCENTAGE">Percentage (%)</option>
                        <option value="FIXED_AMOUNT">Fixed Cash (VND)</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">
                        Discount Value *
                      </label>
                      <input
                        type="number"
                        step="any"
                        className="form-control form-control-sm"
                        placeholder={discountType === "PERCENTAGE" ? "e.g. 20" : "e.g. 15000"}
                        {...register("discountValue", { required: true, min: 0 })}
                      />
                    </div>
                  </div>

                  <div className="row g-2 mb-2">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Start Time</label>
                      <input
                        type="time"
                        className="form-control form-control-sm"
                        {...register("startTime")}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">End Time</label>
                      <input
                        type="time"
                        className="form-control form-control-sm"
                        {...register("endTime")}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="form-label small fw-semibold d-block mb-1">
                      Active Days of Week
                    </label>
                    <div className="d-flex flex-wrap gap-2">
                      {DAYS_OF_WEEK.map((day) => (
                        <div key={day.key} className="form-check form-check-inline">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            value={day.key}
                            id={`day-${day.key}`}
                            {...register("daysOfWeek")}
                          />
                          <label className="form-check-label small" htmlFor={`day-${day.key}`}>
                            {day.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {selectedType === "BOGO" && (
                <div className="border rounded p-2 mb-3 bg-light">
                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Buy Variant ID / Keyword</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Target variant ID"
                      {...register("buyVariantId")}
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Get Variant ID / Keyword</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Free/discounted variant ID"
                      {...register("getVariantId")}
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Discount % on Gift Item</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      placeholder="100 for Free"
                      {...register("bogoDiscountPercent")}
                    />
                  </div>
                </div>
              )}

              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-semibold">Start Date</label>
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    {...register("startDate")}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-semibold">End Date</label>
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    {...register("endDate")}
                  />
                </div>
              </div>

              <div className="d-flex gap-2 mt-4">
                <button
                  type="submit"
                  className="btn btn-primary btn-sm flex-grow-1"
                  disabled={isCreating || isUpdating}
                >
                  {isCreating || isUpdating ? (
                    "Saving..."
                  ) : editingPromo ? (
                    <>
                      <i className="bi bi-check-lg me-1"></i> Update Promo
                    </>
                  ) : (
                    <>
                      <i className="bi bi-plus-lg me-1"></i> Save Promo
                    </>
                  )}
                </button>
                {editingPromo && (
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={cancelEdit}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="right-column">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="btn-group btn-group-sm" role="group">
            <button
              type="button"
              className={`btn ${filterType === "ALL" ? "btn-dark" : "btn-outline-dark"}`}
              onClick={() => setFilterType("ALL")}
            >
              All
            </button>
            <button
              type="button"
              className={`btn ${filterType === "COUPON" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setFilterType("COUPON")}
            >
              Coupons
            </button>
            <button
              type="button"
              className={`btn ${filterType === "HAPPY_HOUR" ? "btn-warning text-dark" : "btn-outline-warning text-dark"}`}
              onClick={() => setFilterType("HAPPY_HOUR")}
            >
              Happy Hour
            </button>
            <button
              type="button"
              className={`btn ${filterType === "BOGO" ? "btn-success" : "btn-outline-success"}`}
              onClick={() => setFilterType("BOGO")}
            >
              BOGO
            </button>
          </div>
          <span className="badge bg-secondary fs-6">
            Total: {filteredPromotions?.length || 0} Promos
          </span>
        </div>

        {isLoading ? (
          <Spinner />
        ) : (
          <div className="table-responsive bg-white rounded shadow-sm">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Type & Name</th>
                  <th>Discount Rule</th>
                  <th>Valid Window</th>
                  <th className="text-center">Usage</th>
                  <th className="text-center">Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPromotions?.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">
                      <i className="bi bi-tag fs-2 d-block mb-2"></i>
                      No promotions found
                    </td>
                  </tr>
                ) : (
                  filteredPromotions?.map((promo) => (
                    <tr key={promo.promotionId}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <span
                            className={`badge ${
                              promo.type === "COUPON"
                                ? "bg-primary"
                                : promo.type === "HAPPY_HOUR"
                                ? "bg-warning text-dark"
                                : "bg-success"
                            }`}
                          >
                            {promo.type}
                          </span>
                          <span className="fw-bold">{promo.name}</span>
                        </div>
                        {promo.code && (
                          <div className="mt-1">
                            <span className="badge bg-dark text-white font-monospace">
                              {promo.code}
                            </span>
                          </div>
                        )}
                      </td>
                      <td>
                        {promo.type === "BOGO" ? (
                          <div>Buy 1 get 1 (-{promo.bogoDiscountPercent}%)</div>
                        ) : (
                          <div>
                            <span className="fw-bold text-danger">
                              {promo.discountType === "PERCENTAGE"
                                ? `-${promo.discountValue}%`
                                : `-${formatCurrency(promo.discountValue)}`}
                            </span>
                            {promo.minOrderAmount > 0 && (
                              <small className="text-muted d-block">
                                Min: {formatCurrency(promo.minOrderAmount)}
                              </small>
                            )}
                          </div>
                        )}
                      </td>
                      <td>
                        {promo.type === "HAPPY_HOUR" && promo.startTime && (
                          <small className="d-block text-primary fw-semibold">
                            <i className="bi bi-clock me-1"></i>
                            {promo.startTime.substring(0, 5)} - {promo.endTime.substring(0, 5)}
                          </small>
                        )}
                        {promo.startDate || promo.endDate ? (
                          <small className="text-muted d-block">
                            {promo.startDate || "Any"} to {promo.endDate || "Ongoing"}
                          </small>
                        ) : (
                          <small className="text-muted">Always active</small>
                        )}
                      </td>
                      <td className="text-center">
                        <span className="badge bg-light text-dark border">
                          {promo.timesUsed} {promo.usageLimit ? `/ ${promo.usageLimit}` : "uses"}
                        </span>
                      </td>
                      <td className="text-center">
                        <div className="form-check form-switch d-inline-block">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            checked={Boolean(promo.isActive)}
                            onChange={() => toggleActive(promo.promotionId)}
                            disabled={isToggling}
                            title="Toggle active status"
                          />
                        </div>
                      </td>
                      <td className="text-center">
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => startEdit(promo)}
                          title="Edit Promotion"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => {
                            if (window.confirm(`Delete promotion "${promo.name}"?`)) {
                              removePromotion(promo.promotionId);
                            }
                          }}
                          disabled={isDeleting}
                          title="Delete Promotion"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default ManagePromotions;
