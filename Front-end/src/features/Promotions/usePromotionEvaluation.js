import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useMemo } from "react";
import { evaluatePromotion } from "../../services/PromotionService";

export function getCartSignature(cartItems) {
  if (!cartItems || cartItems.length === 0) return "";
  return cartItems
    .map((item) => {
      const modIds = (item.selectedModifiers || [])
        .map((m) => m.modifierId)
        .sort()
        .join(",");
      return `${item.itemId}:${item.variantId || "null"}:${item.quantity}:${item.price || item.basePrice || 0}:${modIds}`;
    })
    .sort()
    .join("|");
}

export function formatCartItems(cartItems) {
  if (!cartItems) return [];
  return cartItems.map((item) => ({
    itemId: item.itemId,
    variantId: item.variantId || null,
    name: item.name,
    basePrice: item.basePrice || item.price,
    price: item.price,
    quantity: item.quantity,
    selectedModifiers: item.selectedModifiers || [],
  }));
}

export function usePromotionEvaluation({ cartItems = [], couponCode = "" } = {}) {
  const cartSignature = useMemo(() => getCartSignature(cartItems), [cartItems]);
  const formattedCartItems = useMemo(() => formatCartItems(cartItems), [cartItems]);

  const hasItems = Boolean(cartItems && cartItems.length > 0);

  const {
    data: evaluation,
    isPending: isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ["promotion-evaluation", cartSignature, couponCode || ""],
    queryFn: async ({ signal }) => {
      if (!hasItems) return null;
      return await evaluatePromotion(
        {
          couponCode: couponCode || undefined,
          cartItems: formattedCartItems,
        },
        { signal }
      );
    },
    enabled: hasItems,
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
    retry: false,
  });

  return {
    evaluation: hasItems ? (evaluation ?? null) : null,
    isLoading: hasItems && isLoading,
    isFetching: hasItems && isFetching,
    error,
    refetch,
    cartSignature,
    formattedCartItems,
  };
}
