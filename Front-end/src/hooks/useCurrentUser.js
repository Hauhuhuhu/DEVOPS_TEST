import { useQuery } from "@tanstack/react-query";

export function useCurrentUser() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["user"],
    queryFn: () => {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");
      return token ? { token, role } : null;
    },
    initialData: () => {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");
      return token ? { token, role } : null;
    },
    staleTime: Infinity,
  });

  const isAdmin = user?.role === "ROLE_ADMIN";

  return { user, isAdmin, isLoading };
}

export default useCurrentUser;
