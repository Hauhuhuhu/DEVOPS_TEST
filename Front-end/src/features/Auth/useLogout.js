import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { logout as logoutApi } from "../../services/AuthService";
import { clearSession } from "../../utils/authSession";

function useLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const logout = async () => {
    try {
      await logoutApi();
    } finally {
      clearSession();
      queryClient.clear();
      navigate("/login", { replace: true });
    }
  };

  // Trả về hàm logout để component khác có thể gọi
  return { logout };
}

export default useLogout;
