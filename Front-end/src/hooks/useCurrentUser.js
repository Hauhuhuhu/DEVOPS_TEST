import { useQuery } from "@tanstack/react-query";
import { refreshSession } from "../services/AuthService";
import { getSession, setSession } from "../utils/authSession";

export function useCurrentUser() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const currentSession = getSession();
      if (currentSession) return currentSession;

      try {
        return setSession(await refreshSession());
      } catch {
        return null;
      }
    },
    retry: false,
    staleTime: Infinity,
  });

  const isAdmin = user?.role === "ROLE_ADMIN";

  return { user, isAdmin, isLoading };
}

export default useCurrentUser;
