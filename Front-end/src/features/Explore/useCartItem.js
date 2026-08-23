import { useState } from "react";

export function useCartItem() {
  const [cartItems, setCartItems] = useState([]);

  function addToCart(item) {
  
    setCartItems((prevItems) => {
      const existingItem = prevItems.find(
        (cartItem) => cartItem.itemId === item.itemId,
      );

      if (existingItem) {
        return prevItems.map((cartItem) =>
          cartItem.itemId === item.itemId
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem,
        );
      } else {
        return [...prevItems, { ...item, quantity: 1 }];
      }
    });
  }

  function removeFromCart(itemId) {
    setCartItems((prevItems) =>
      prevItems.filter((cartItem) => cartItem.itemId !== itemId),
    );
  }

  function updateQuantity(itemId, newQuantity) {
    setCartItems((prevItems) =>
      prevItems.map((cartItem) =>
        cartItem.itemId === itemId
          ? { ...cartItem, quantity: newQuantity }
          : cartItem,
      ),
    );
  }
  function clearCart() {
    setCartItems([]);
  }


  return { cartItems, addToCart, removeFromCart, updateQuantity, clearCart };
}
