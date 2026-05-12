import { CartContext, type CartItem } from "@/contexts/CartContext";
import { useEffect, useState } from "react";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (newItem: Omit<CartItem, 'quantity'>, quantity: number = 1) => {
    setItems(prev => {
      // Find existing item by both productId and combinationId
      const existing = prev.find(item => 
        item.productId === newItem.productId && 
        item.combinationId === newItem.combinationId
      );
      
      if (existing) {
        return prev.map(item =>
          item.productId === newItem.productId && 
          item.combinationId === newItem.combinationId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...newItem, quantity }];
    });
  };

  const removeFromCart = (productId: number, combinationId?: number) => {
    setItems(prev => prev.filter(item => 
      !(item.productId === productId && item.combinationId === combinationId)
    ));
  };

  const updateQuantity = (productId: number, combinationId: number | undefined, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, combinationId);
      return;
    }
    setItems(prev =>
      prev.map(item =>
        item.productId === productId && item.combinationId === combinationId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        isOpen,
        setIsOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}