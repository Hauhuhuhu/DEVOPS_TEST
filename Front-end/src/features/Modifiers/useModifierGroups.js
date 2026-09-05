import { useQuery } from "@tanstack/react-query";
import { fetchModifierGroups } from "../../services/ModifierService";

export function useModifierGroups() {
  const {
    isPending: isLoading,
    data: modifierGroups,
    error,
  } = useQuery({
    queryKey: ["modifierGroups"],
    queryFn: fetchModifierGroups,
  });

  return { isLoading, error, modifierGroups };
}
