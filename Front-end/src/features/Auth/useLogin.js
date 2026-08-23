import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login as loginApi } from "../../services/AuthService";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

export function useLogin() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutate: login, isPending: isLoading } = useMutation({
    mutationFn: ({ email, password }) => loginApi({ email, password }),
    onSuccess: (user) => {
      // 1. Lưu vào cache của React Query để các component khác có thể dùng ngay
      queryClient.setQueryData(["user"], {
        token: user.data.token,
        role: user.data.role,
      });

      // 2. Lưu vào localStorage để giữ trạng thái khi người dùng F5 (reload) trang
      localStorage.setItem("token", user.data.token);
      localStorage.setItem("role", user.data.role);

      navigate("/dashboard", { replace: true });
      toast.success("Login successful");
    },
    onError: (err) => {
      console.log("ERROR", err);
      toast.error("Provided email or password are incorrect");
    },
  });

  return { login, isLoading };
}
