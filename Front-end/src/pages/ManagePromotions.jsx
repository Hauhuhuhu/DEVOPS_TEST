import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import toast from "react-hot-toast";
import { usePromotions } from "../features/Promotions/usePromotions";
import { useCreatePromotion } from "../features/Promotions/useCreatePromotion";
import { useUpdatePromotion } from "../features/Promotions/useUpdatePromotion";
import { useTogglePromotion } from "../features/Promotions/useTogglePromotion";
import { useDeletePromotion } from "../features/Promotions/useDeletePromotion";
import { formatCurrency } from "../utils/formatCurrency";
import Spinner from "../ui/Spinner";
import ConfirmDeleteModal from "../ui/ConfirmDeleteModal";
import { Tag, Check, Plus, Clock, Pencil, Trash2 } from "lucide-react";

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
  const [promoToDelete, setPromoToDelete] = useState(null);

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

  function onError(errors) {
    const firstError = Object.values(errors)[0];
    if (firstError) {
      toast.error(firstError.message || "Please check the required fields");
    } else {
      toast.error("Please check the required fields");
    }
  }

  const filteredPromotions = promotions?.filter((p) => {
    if (filterType === "ALL") return true;
    return p.type === filterType;
  });

  return (
    <div className="flex gap-6 p-6 h-[calc(100vh-4rem)] bg-slate-50 overflow-hidden">
      {/* Left Column - Promotion Form */}
      <div className="w-96 flex-shrink-0 bg-white rounded-xl shadow-sm border border-slate-200 p-5 overflow-y-auto">
        <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Tag size={18} />
          </div>
          <h2 className="text-base font-semibold text-slate-900">
            {editingPromo ? "Edit Promotion" : "Create Promotion"}
          </h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit, onError)} noValidate className="space-y-3.5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Promotion Type *
            </label>
            <select
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              {...register("type", { required: true })}
            >
              <option value="COUPON">Coupon Code (Voucher)</option>
              <option value="HAPPY_HOUR">Happy Hour (Time-Window)</option>
              <option value="BOGO">Buy One Get One (BOGO)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Promotion Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Summer Mega Discount"
              {...register("name", { required: "Promotion name is required" })}
              className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                errors.name ? "border-red-500 focus:ring-red-500 bg-red-50/10" : "border-slate-300 focus:border-blue-500"
              }`}
            />
            {errors.name && (
              <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              placeholder="Details about this promo..."
              {...register("description")}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Conditional Type Fields */}
          {selectedType === "COUPON" && (
            <div className="border border-slate-200 rounded-lg p-3 bg-slate-50 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  placeholder="e.g. SUMMER2026"
                  {...register("code", {
                    required: selectedType === "COUPON" ? "Coupon code is required" : false,
                  })}
                  className={`w-full rounded-lg border px-3 py-1.5 text-sm uppercase font-bold text-slate-900 placeholder-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.code ? "border-red-500 focus:ring-red-500 bg-red-50/10" : "border-slate-300 focus:border-blue-500"
                  }`}
                />
                {errors.code && (
                  <p className="text-xs text-red-600 mt-1">{errors.code.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Discount Type</label>
                  <select
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    {...register("discountType")}
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED_AMOUNT">Fixed Cash (VND)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Value ({discountType === "PERCENTAGE" ? "%" : "VND"}) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder={discountType === "PERCENTAGE" ? "e.g. 15" : "e.g. 20000"}
                    {...register("discountValue", {
                      required: "Discount value is required",
                      min: { value: 0, message: "Discount value cannot be negative" },
                    })}
                    className={`w-full rounded-lg border px-2.5 py-1.5 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 transition-colors ${
                      errors.discountValue
                        ? "border-red-500 focus:ring-red-500 bg-red-50/10"
                        : "border-slate-300 focus:ring-blue-500"
                    }`}
                  />
                  {errors.discountValue && (
                    <p className="text-xs text-red-600 mt-1">{errors.discountValue.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Min Order (VND)</label>
                  <input
                    type="number"
                    placeholder="e.g. 50000"
                    {...register("minOrderAmount")}
                    className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Max Cap (VND)</label>
                  <input
                    type="number"
                    placeholder="e.g. 100000"
                    {...register("maxDiscountAmount")}
                    className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Usage Limit (Max Uses)</label>
                <input
                  type="number"
                  placeholder="Leave empty for unlimited"
                  {...register("usageLimit")}
                  className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {selectedType === "HAPPY_HOUR" && (
            <div className="border border-slate-200 rounded-lg p-3 bg-slate-50 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Discount Type</label>
                  <select
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    {...register("discountType")}
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED_AMOUNT">Fixed Cash (VND)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Value *
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder={discountType === "PERCENTAGE" ? "e.g. 20" : "e.g. 15000"}
                    {...register("discountValue", {
                      required: "Discount value is required",
                      min: { value: 0, message: "Discount value cannot be negative" },
                    })}
                    className={`w-full rounded-lg border px-2.5 py-1.5 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 transition-colors ${
                      errors.discountValue
                        ? "border-red-500 focus:ring-red-500 bg-red-50/10"
                        : "border-slate-300 focus:ring-blue-500"
                    }`}
                  />
                  {errors.discountValue && (
                    <p className="text-xs text-red-600 mt-1">{errors.discountValue.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    {...register("startTime")}
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">End Time</label>
                  <input
                    type="time"
                    {...register("endTime")}
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Active Days of Week
                </label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {DAYS_OF_WEEK.map((day) => (
                    <label key={day.key} className="inline-flex items-center gap-1.5 text-xs text-slate-700 bg-white px-2 py-1 rounded border border-slate-200 cursor-pointer hover:bg-slate-50">
                      <input
                        type="checkbox"
                        value={day.key}
                        className="rounded text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                        {...register("daysOfWeek")}
                      />
                      <span>{day.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {selectedType === "BOGO" && (
            <div className="border border-slate-200 rounded-lg p-3 bg-slate-50 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Buy Variant ID / Keyword</label>
                <input
                  type="text"
                  placeholder="Target variant ID"
                  {...register("buyVariantId")}
                  className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Get Variant ID / Keyword</label>
                <input
                  type="text"
                  placeholder="Free/discounted variant ID"
                  {...register("getVariantId")}
                  className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Discount % on Gift Item</label>
                <input
                  type="number"
                  placeholder="100 for Free"
                  {...register("bogoDiscountPercent")}
                  className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Start Date</label>
              <input
                type="date"
                {...register("startDate")}
                className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">End Date</label>
              <input
                type="date"
                {...register("endDate")}
                className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={isCreating || isUpdating}
              className="flex-1 inline-flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isCreating || isUpdating ? (
                <Spinner className="text-white" />
              ) : editingPromo ? (
                <>
                  <Check size={16} /> Update Promo
                </>
              ) : (
                <>
                  <Plus size={16} /> Save Promo
                </>
              )}
            </button>
            {editingPromo && (
              <button
                type="button"
                onClick={cancelEdit}
                className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Right Column - Promotions List */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col overflow-hidden">
        <div className="flex justify-between items-center mb-4 gap-4">
          {/* Filter Pills */}
          <div className="inline-flex rounded-lg border border-slate-200 p-1 bg-slate-50">
            <button
              type="button"
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                filterType === "ALL"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              onClick={() => setFilterType("ALL")}
            >
              All
            </button>
            <button
              type="button"
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                filterType === "COUPON"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              onClick={() => setFilterType("COUPON")}
            >
              Coupons
            </button>
            <button
              type="button"
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                filterType === "HAPPY_HOUR"
                  ? "bg-amber-500 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              onClick={() => setFilterType("HAPPY_HOUR")}
            >
              Happy Hour
            </button>
            <button
              type="button"
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                filterType === "BOGO"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              onClick={() => setFilterType("BOGO")}
            >
              BOGO
            </button>
          </div>

          <span className="bg-blue-100 text-blue-700 rounded-full px-3 py-1 text-sm font-medium">
            Total: {filteredPromotions?.length || 0} Promos
          </span>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center flex-1">
            <Spinner size={32} className="text-blue-600" />
          </div>
        ) : (
          <div className="flex-1 overflow-auto rounded-lg border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50 sticky top-0">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Type & Name</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Discount Rule</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Valid Window</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Usage</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredPromotions?.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-slate-400">
                      <Tag size={36} className="mx-auto mb-2 text-slate-300" />
                      <p className="text-sm">No promotions found</p>
                    </td>
                  </tr>
                ) : (
                  filteredPromotions?.map((promo) => {
                    const isCoupon = promo.type === "COUPON";
                    const isHappyHour = promo.type === "HAPPY_HOUR";

                    return (
                      <tr key={promo.promotionId} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                                isCoupon
                                  ? "bg-blue-100 text-blue-800"
                                  : isHappyHour
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-emerald-100 text-emerald-800"
                              }`}
                            >
                              {promo.type}
                            </span>
                            <span className="text-sm font-semibold text-slate-900">{promo.name}</span>
                          </div>
                          {promo.code && (
                            <div className="mt-1">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-100 text-slate-800 border border-slate-200">
                                {promo.code}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap text-sm">
                          {promo.type === "BOGO" ? (
                            <div className="text-slate-700">Buy 1 get 1 (-{promo.bogoDiscountPercent}%)</div>
                          ) : (
                            <div>
                              <span className="font-semibold text-red-600">
                                {promo.discountType === "PERCENTAGE"
                                  ? `-${promo.discountValue}%`
                                  : `-${formatCurrency(promo.discountValue)}`}
                              </span>
                              {promo.minOrderAmount > 0 && (
                                <div className="text-xs text-slate-500 mt-0.5">
                                  Min: {formatCurrency(promo.minOrderAmount)}
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap text-sm text-slate-600">
                          {promo.type === "HAPPY_HOUR" && promo.startTime && (
                            <div className="inline-flex items-center gap-1 text-xs text-blue-600 font-semibold mb-0.5">
                              <Clock size={12} />
                              <span>{promo.startTime ? promo.startTime.substring(0, 5) : ""} - {promo.endTime ? promo.endTime.substring(0, 5) : ""}</span>
                            </div>
                          )}
                          {promo.startDate || promo.endDate ? (
                            <div className="text-xs text-slate-500">
                              {promo.startDate || "Any"} to {promo.endDate || "Ongoing"}
                            </div>
                          ) : (
                            <div className="text-xs text-slate-400">Always active</div>
                          )}
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap text-center text-xs">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                            {promo.timesUsed} {promo.usageLimit ? `/ ${promo.usageLimit}` : "uses"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap text-center">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={Boolean(promo.isActive)}
                              onChange={() => toggleActive(promo.promotionId)}
                              disabled={isToggling}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap text-center">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors cursor-pointer"
                              onClick={() => startEdit(promo)}
                              title="Edit Promotion"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                              onClick={() => setPromoToDelete(promo)}
                              disabled={isDeleting}
                              title="Delete Promotion"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDeleteModal
        isOpen={Boolean(promoToDelete)}
        onClose={() => setPromoToDelete(null)}
        onConfirm={() => {
          if (promoToDelete) {
            removePromotion(promoToDelete.promotionId, {
              onSettled: () => setPromoToDelete(null),
            });
          }
        }}
        title="Delete Promotion"
        entityName={promoToDelete?.name || ""}
        message="Are you sure you want to delete this promotion? Active discounts and coupons will no longer apply to customer orders."
        isLoading={isDeleting}
      />
    </div>
  );
}

export default ManagePromotions;
