import { useQuery } from "@tanstack/react-query";
import { fetchItems } from "../../services/ItemService";

export function useItems() {
  const { isPending: isLoading, data: items, error } = useQuery({
    queryKey: ["items"],
    queryFn: fetchItems,
  });

  return { isLoading, error, items };
}