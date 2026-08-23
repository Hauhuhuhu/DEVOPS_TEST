import { useQuery } from "@tanstack/react-query";
import { fetchCategories } from "../../services/CategoryService";

export function useCategories() {
  const { isPending: isLoading, data: categories, error } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  return { isLoading, error, categories };
}
