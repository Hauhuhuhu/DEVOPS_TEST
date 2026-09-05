import { useState } from "react";
import { useForm } from "react-hook-form";
import { useCustomers } from "../features/Customers/useCustomers";
import { useCreateCustomer } from "../features/Customers/useCreateCustomer";
import { useUpdateCustomer } from "../features/Customers/useUpdateCustomer";
import { useDeleteCustomer } from "../features/Customers/useDeleteCustomer";
import { formatCurrency } from "../utils/formatCurrency";
import Spinner from "../ui/Spinner";

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
    <div className="item-container p-3">
      <div className="left-column">
        <div className="card shadow-sm border-0">
          <div className="card-header bg-primary text-white py-2">
            <h5 className="mb-0 fs-6">
              <i className="bi bi-person-plus me-2"></i>
              {editingCustomer ? "Edit Customer" : "Add New Customer"}
            </h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Customer Name *</label>
                <input
                  type="text"
                  className={`form-control form-control-sm ${errors.name ? "is-invalid" : ""}`}
                  placeholder="e.g. Nguyen Van A"
                  {...register("name", { required: "Name is required" })}
                />
                {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold">Phone Number *</label>
                <input
                  type="tel"
                  className={`form-control form-control-sm ${errors.phoneNumber ? "is-invalid" : ""}`}
                  placeholder="e.g. 0912345678"
                  {...register("phoneNumber", {
                    required: "Phone number is required",
                    pattern: {
                      value: /^[0-9+ ]{8,15}$/,
                      message: "Invalid phone number format",
                    },
                  })}
                />
                {errors.phoneNumber && (
                  <div className="invalid-feedback">{errors.phoneNumber.message}</div>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold">Email (Optional)</label>
                <input
                  type="email"
                  className="form-control form-control-sm"
                  placeholder="e.g. customer@example.com"
                  {...register("email")}
                />
              </div>

              <div className="d-flex gap-2 mt-4">
                <button
                  type="submit"
                  className="btn btn-primary btn-sm flex-grow-1"
                  disabled={isCreating || isUpdating}
                >
                  {isCreating || isUpdating ? (
                    "Saving..."
                  ) : editingCustomer ? (
                    <>
                      <i className="bi bi-check-lg me-1"></i> Update
                    </>
                  ) : (
                    <>
                      <i className="bi bi-plus-lg me-1"></i> Save Customer
                    </>
                  )}
                </button>
                {editingCustomer && (
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
          <div className="input-group" style={{ maxWidth: "360px" }}>
            <span className="input-group-text bg-white border-end-0">
              <i className="bi bi-search text-muted"></i>
            </span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder="Search by name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="btn btn-outline-secondary border-start-0"
                onClick={() => setSearchQuery("")}
              >
                <i className="bi bi-x"></i>
              </button>
            )}
          </div>
          <span className="badge bg-secondary fs-6">
            Total: {customers?.length || 0} Customers
          </span>
        </div>

        {isLoading ? (
          <Spinner />
        ) : (
          <div className="table-responsive bg-white rounded shadow-sm">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Customer</th>
                  <th>Phone Number</th>
                  <th>Email</th>
                  <th className="text-center">Orders</th>
                  <th className="text-end">Total Spent</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers?.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">
                      <i className="bi bi-people fs-2 d-block mb-2"></i>
                      No customers found
                    </td>
                  </tr>
                ) : (
                  customers?.map((customer) => (
                    <tr key={customer.customerId}>
                      <td>
                        <div className="fw-bold">{customer.name}</div>
                        <small className="text-muted">ID: {customer.customerId.substring(0, 8)}...</small>
                      </td>
                      <td>
                        <i className="bi bi-telephone text-primary me-1"></i>
                        {customer.phoneNumber}
                      </td>
                      <td>{customer.email || <span className="text-muted">-</span>}</td>
                      <td className="text-center">
                        <span className="badge bg-info text-dark rounded-pill px-2">
                          {customer.orderCount} orders
                        </span>
                      </td>
                      <td className="text-end fw-semibold text-success">
                        {formatCurrency(customer.totalSpent || 0)}
                      </td>
                      <td className="text-center">
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => startEdit(customer)}
                          title="Edit Customer"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => {
                            if (window.confirm(`Delete customer "${customer.name}"?`)) {
                              removeCustomer(customer.customerId);
                            }
                          }}
                          disabled={isDeleting}
                          title="Delete Customer"
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

export default ManageCustomers;
