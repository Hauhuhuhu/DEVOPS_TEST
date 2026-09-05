import { useState } from "react";

export function useCartItem() {
  const [cartItems, setCartItems] = useState([]);

  function addToCart(item) {
    const cartItemId =
      item.cartItemId ||
      `${item.itemId}_${item.variantId || "default"}_${(item.selectedModifiers || [])
        .map((m) => m.modifierId)
        .sort()
        .join("-")}`;

    const itemToAdd = {
      ...item,
      cartItemId,
      quantity: item.quantity || 1,
    };

    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (ci) => ci.cartItemId === cartItemId
      );

      if (existingIndex > -1) {
        return prevItems.map((ci, idx) =>
          idx === existingIndex
            ? { ...ci, quantity: ci.quantity + itemToAdd.quantity }
            : ci
        );
      } else {
        return [...prevItems, itemToAdd];
      }
    });
  }

  function removeFromCart(cartItemId) {
    setCartItems((prevItems) =>
      prevItems.filter(
        (cartItem) =>
          cartItem.cartItemId !== cartItemId && cartItem.itemId !== cartItemId
      )
    );
  }

  function updateQuantity(cartItemId, newQuantity) {
    if (newQuantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((cartItem) =>
        cartItem.cartItemId === cartItemId || cartItem.itemId === cartItemId
          ? { ...cartItem, quantity: newQuantity }
          : cartItem
      )
    );
  }

  function clearCart() {
    setCartItems([]);
  }


  return { cartItems, addToCart, removeFromCart, updateQuantity, clearCart };
}
