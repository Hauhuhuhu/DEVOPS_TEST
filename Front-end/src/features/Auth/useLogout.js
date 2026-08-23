import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

function useLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");

    // Xoá cache của React Query
    queryClient.removeQueries();

    navigate("/login", { replace: true });
  };

  // Trả về hàm logout để component khác có thể gọi
  return { logout };
}

export default useLogout;
