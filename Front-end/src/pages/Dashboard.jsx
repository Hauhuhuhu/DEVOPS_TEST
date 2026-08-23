import { useDashboard } from "../features/Dashboard/useDashboard";
import Spinner from "../ui/Spinner";
import { formatCurrency } from "../utils/formatCurrency";

function Dashboard() {
  const { isLoading, dashboardData } = useDashboard();

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <Spinner />;
      </div>
    );
  }
  if (!dashboardData) {
    return (
      <div className="dashboard-error">
        <h2>Không tìm thấy dữ liệu</h2>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <i class="bi bi-piggy-bank-fill"></i>
            </div>
            <div className="stat-content">
              <h3>Today's Sales</h3>
              <p>{dashboardData.todaySales}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <i className="bi bi-cart-check"></i>
            </div>
            <div className="stat-content">
              <h3>Total Orders</h3>
              <p>{dashboardData.totalOrderCount}</p>
            </div>
          </div>
        </div>
        <div className="recent-orders-card">
          <h3 className="recent-orders-title">
            <i className="bi bi-clock-history"></i>
            Recent Orders
          </h3>
          <div className="orders-table-container">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order Id</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.recentOrders.map((order) => (
                  <tr key={order.orderId}>
                    <td>{order.orderId.substring(0, 8)}...</td>
                    <td>{order.customerName}</td>
                    <td>{formatCurrency(order.grandTotal)}</td>
                    <td>
                      <span
                        className={`payment-method ${order.paymentMethod.toLowerCase()}}`}
                      >
                        {order.paymentMethod}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`status-badge ${order.paymentDetails.status.toLowerCase()}`}
                      >
                        {order.paymentDetails.status}
                      </span>
                    </td>
                    <td>
                      {new Date(order.createdAt).toLocaleTimeString([], {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Dashboard;
