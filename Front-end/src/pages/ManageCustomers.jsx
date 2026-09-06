import { useState } from "react";
import { useForm } from "react-hook-form";
import { useCustomers } from "../features/Customers/useCustomers";
import { useCreateCustomer } from "../features/Customers/useCreateCustomer";
import { useUpdateCustomer } from "../features/Customers/useUpdateCustomer";
import { useDeleteCustomer } from "../features/Customers/useDeleteCustomer";
import { formatCurrency } from "../utils/formatCurrency";
import Spinner from "../ui/Spinner";
import { UserPlus, Search, X, Phone, Pencil, Trash2, Users, Check } from "lucide-react";

function ManageCustomers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingCustomer, setEditingCustomer] = useState(null);

  const { customers, isLoading } = useCustomers(searchQuery);
  const { isCreating, addCustomer } = useCreateCustomer();
  const { isUpdating, editCustomer } = useUpdateCustomer();
  const { isDeleting, removeCustomer } = useDeleteCustomer();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      phoneNumber: "",
      email: "",
    },
  });

  function startEdit(customer) {
    setEditingCustomer(customer);
    setValue("name", customer.name);
    setValue("phoneNumber", customer.phoneNumber);
    setValue("email", customer.email || "");
  }

  function cancelEdit() {
    setEditingCustomer(null);
    reset({ name: "", phoneNumber: "", email: "" });
  }

  function onSubmit(data) {
    if (editingCustomer) {
      editCustomer(
        { customerId: editingCustomer.customerId, ...data },
        {
          onSuccess: () => cancelEdit(),
        }
      );
    } else {
      addCustomer(data, {
        onSuccess: () => reset({ name: "", phoneNumber: "", email: "" }),
      });
    }
  }

  return (
    <div className="flex gap-6 p-6 h-[calc(100vh-4rem)] bg-slate-50 overflow-hidden">
      {/* Left Column - Form */}
      <div className="w-96 flex-shrink-0 bg-white rounded-xl shadow-sm border border-slate-200 p-5 overflow-y-auto">
        <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <UserPlus size={18} />
          </div>
          <h2 className="text-base font-semibold text-slate-900">
            {editingCustomer ? "Edit Customer" : "Add New Customer"}
          </h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Customer Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Nguyen Van A"
              {...register("name", { required: "Name is required" })}
              className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                errors.name ? "border-red-500 focus:ring-red-500" : "border-slate-300 focus:border-blue-500"
              }`}
            />
            {errors.name && (
              <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              placeholder="e.g. 0912345678"
              {...register("phoneNumber", {
                required: "Phone number is required",
                pattern: {
                  value: /^[0-9+ ]{8,15}$/,
                  message: "Invalid phone number format",
                },
              })}
              className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                errors.phoneNumber ? "border-red-500 focus:ring-red-500" : "border-slate-300 focus:border-blue-500"
              }`}
            />
            {errors.phoneNumber && (
              <p className="text-xs text-red-600 mt-1">{errors.phoneNumber.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email (Optional)
            </label>
            <input
              type="email"
              placeholder="e.g. customer@example.com"
              {...register("email")}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={isCreating || isUpdating}
              className="flex-1 inline-flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isCreating || isUpdating ? (
                <Spinner className="text-white" />
              ) : editingCustomer ? (
                <>
                  <Check size={16} /> Update
                </>
              ) : (
                <>
                  <UserPlus size={16} /> Save Customer
                </>
              )}
            </button>
            {editingCustomer && (
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

      {/* Right Column - List */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col overflow-hidden">
        <div className="flex justify-between items-center mb-4 gap-4">
          <div className="relative w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-sm rounded-lg border border-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <span className="bg-blue-100 text-blue-700 rounded-full px-3 py-1 text-sm font-medium">
            Total: {customers?.length || 0} Customers
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
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone Number</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Orders</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Spent</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {customers?.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-slate-400">
                      <Users size={36} className="mx-auto mb-2 text-slate-300" />
                      <p className="text-sm">No customers found</p>
                    </td>
                  </tr>
                ) : (
                  customers?.map((customer) => (
                    <tr key={customer.customerId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="text-sm font-semibold text-slate-900">{customer.name}</div>
                        <div className="text-xs text-slate-400">
                          ID: {customer.customerId ? (customer.customerId.length > 8 ? `${customer.customerId.substring(0, 8)}...` : customer.customerId) : "—"}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-sm text-slate-600">
                        <div className="inline-flex items-center gap-1">
                          <Phone size={14} className="text-blue-600" />
                          <span>{customer.phoneNumber}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-sm text-slate-600">
                        {customer.email || <span className="text-slate-400">-</span>}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                          {customer.orderCount} orders
                        </span>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-right text-sm font-semibold text-emerald-600">
                        {formatCurrency(customer.totalSpent || 0)}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors cursor-pointer"
                            onClick={() => startEdit(customer)}
                            title="Edit Customer"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                            onClick={() => {
                              if (window.confirm(`Delete customer "${customer.name}"?`)) {
                                removeCustomer(customer.customerId);
                              }
                            }}
                            disabled={isDeleting}
                            title="Delete Customer"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
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

export default ManageCustomers;
