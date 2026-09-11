import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login as loginApi } from "../../services/AuthService";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { setSession } from "../../utils/authSession";

export function useLogin() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutate: login, isPending: isLoading } = useMutation({
    mutationFn: ({ email, password }) => loginApi({ email, password }),
    onSuccess: (user) => {
      // 1. Lưu vào cache của React Query để các component khác có thể dùng ngay
      queryClient.setQueryData(["user"], setSession(user.data));

      navigate("/dashboard", { replace: true });
      toast.success("Đăng nhập thành công");
    },
    onError: () => {
      toast.error("Email hoặc mật khẩu không đúng");
    },
  });

  return { login, isLoading };
}
