import { useQuery } from "@tanstack/react-query";
import { fetchUsers } from "../../services/UserService";

export function useUsers() {
  const { isPending: isLoading, data: users } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  return { isLoading, users };
}
