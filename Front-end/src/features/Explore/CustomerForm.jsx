import { useState } from "react";
import { fetchCustomerByPhone, createCustomer } from "../../services/CustomerService";
import { formatCurrency } from "../../utils/formatCurrency";
import toast from "react-hot-toast";

function CustomerForm({
  customerName,
  setCustomerName,
  mobileNumber,
  setMobileNumber,
  setCustomerId,
}) {
  const [isSearching, setIsSearching] = useState(false);
  const [customerInfo, setCustomerInfo] = useState(null);
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  async function handlePhoneSearch(phoneToSearch) {
    const phone = (phoneToSearch || mobileNumber).trim();
    if (!phone || phone.length < 8) return;

    try {
      setIsSearching(true);
      const data = await fetchCustomerByPhone(phone);
      if (data) {
        setCustomerInfo(data);
        setCustomerName(data.name);
        if (setCustomerId) setCustomerId(data.customerId);
        setIsNewCustomer(false);
        toast.success(`Found customer: ${data.name}`);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setCustomerInfo(null);
        setIsNewCustomer(true);
        if (setCustomerId) setCustomerId(null);
      }
    } finally {
      setIsSearching(false);
    }
  }

  async function handleQuickSaveCustomer() {
    if (!customerName.trim()) {
      toast.error("Please enter a customer name first");
      return;
    }
    if (!mobileNumber.trim()) {
      toast.error("Please enter a phone number");
      return;
    }

    try {
      setIsSaving(true);
      const newCustomer = await createCustomer({
        name: customerName.trim(),
        phoneNumber: mobileNumber.trim(),
      });
      setCustomerInfo(newCustomer);
      if (setCustomerId) setCustomerId(newCustomer.customerId);
      setIsNewCustomer(false);
      toast.success("Saved new customer to CRM!");
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to save customer");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="p-3">
      <div className="mb-3">
        <div className="d-flex align-items-center gap-2">
          <label htmlFor="mobileNumber" className="col-4 small fw-semibold">
            Phone Number
          </label>
          <div className="input-group input-group-sm">
            <input
              type="tel"
              className="form-control"
              id="mobileNumber"
              placeholder="e.g. 0912345678"
              value={mobileNumber}
              onChange={(e) => {
                setMobileNumber(e.target.value);
                setCustomerInfo(null);
                setIsNewCustomer(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handlePhoneSearch();
                }
              }}
            />
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => handlePhoneSearch()}
              disabled={isSearching || !mobileNumber.trim()}
              title="Lookup Customer"
            >
              {isSearching ? (
                <span className="spinner-border spinner-border-sm" role="status"></span>
              ) : (
                <i className="bi bi-search"></i>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="mb-3">
        <div className="d-flex align-items-center gap-2">
          <label htmlFor="customerName" className="col-4 small fw-semibold">
            Customer Name
          </label>
          <input
            type="text"
            className="form-control form-control-sm"
            id="customerName"
            placeholder="Customer name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
        </div>
      </div>

      {customerInfo && (
        <div className="alert alert-success py-2 px-3 small mb-0 d-flex justify-content-between align-items-center">
          <div>
            <i className="bi bi-star-fill text-warning me-1"></i>
            <strong>Returning Customer</strong>
            <div className="text-muted small">
              {customerInfo.orderCount} orders &bull; Spent: {formatCurrency(customerInfo.totalSpent || 0)}
            </div>
          </div>
          <span className="badge bg-success">Verified</span>
        </div>
      )}

      {isNewCustomer && (
        <div className="alert alert-warning py-2 px-3 small mb-0 d-flex justify-content-between align-items-center">
          <div>
            <i className="bi bi-person-plus text-primary me-1"></i>
            <span className="text-muted">New customer not in CRM.</span>
          </div>
          <button
            type="button"
            className="btn btn-primary btn-sm py-0 px-2"
            onClick={handleQuickSaveCustomer}
            disabled={isSaving || !customerName.trim()}
          >
            {isSaving ? "Saving..." : "Save to CRM"}
          </button>
        </div>
      )}
    </div>
  );
}

export default CustomerForm;
