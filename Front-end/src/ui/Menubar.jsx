import { NavLink } from "react-router-dom"; // Thay Link bằng NavLink
import useLogout from "../features/Auth/useLogout";
import { useQuery } from "@tanstack/react-query";

function Menubar() {
  const { logout } = useLogout();
  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => null, // Hàm giả để không bị văng lỗi
    staleTime: Infinity, // Không bao giờ tự động refetch (tải lại) dữ liệu này
    gcTime: Infinity, // Tùy chọn: Giữ cache không bị xóa khi component unmount
  });
  let isAdmin = user?.role === "ROLE_ADMIN";

  // Hàm helper để render class dựa trên trạng thái active
  const navLinkClass = ({ isActive }) =>
    isActive ? "nav-link active fw-bold text-primary" : "nav-link";

  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary">
      <div className="container-fluid">
        <a className="navbar-brand" href="#">
          Navbar
        </a>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink className={navLinkClass} to={"/dashboard"}>
                Dashboard
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={navLinkClass} to={"/explore"}>
                Explore
              </NavLink>
            </li>
            {isAdmin && (
              <>
                <li className="nav-item">
                  <NavLink className={navLinkClass} to={"/items"}>
                    Manage items
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={navLinkClass} to={"/categories"}>
                    Manage categories
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={navLinkClass} to={"/users"}>
                    Manage users
                  </NavLink>
                </li>
              </>
            )}
            <li className="nav-item">
              <NavLink className={navLinkClass} to={"/orders"}>
                Order history
              </NavLink>
            </li>
          </ul>
          <div className="navbar-nav ms-auto ms-md-0 me-3 me-lg-4">
            <div className="nav-item dropdown">
              <a
                href="#"
                className="nav-link dropdown-toggle"
                id="navbarDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <img
                  src={
                    "https://www.svgrepo.com/show/341256/user-avatar-filled.svg"
                  }
                  alt=""
                  height={32}
                  width={32}
                />
              </a>
              <ul
                className="dropdown-menu dropdown-menu-end"
                aria-labelledby="navbarDropdown"
              >
                <li>
                  <a className="dropdown-item" href="#">
                    Activity Log
                  </a>
                </li>
                <li>
                  <a className="dropdown-item" href="#">
                    Settings
                  </a>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <a
                    className="dropdown-item"
                    href="#!"
                    onClick={(e) => {
                      e.preventDefault();
                      logout();
                    }}
                  >
                    Logout
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
export default Menubar;
