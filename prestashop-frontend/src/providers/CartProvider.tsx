// src/providers/CartProvider.tsx
import { CartContext, type CartItem } from "@/contexts/CartContext";
import { useFrontofficeAuth } from "@/hooks/useFrontofficeAuth";
import { useLanguage } from "@/utils/lang";
import {
  cartToCartItems,
  deleteCart,
  getCustomerCarts,
  getOrderedCartIds,
  saveCart,
  updateCart,
} from "@/pages/frontoffice/home/services/cartService";
import { useEffect, useState, useCallback, useRef } from "react";
import { fetchFromPrestashopApi } from "@/utils/url";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const localCartKey = "localCartItems";
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartId, setCartId] = useState<number | null>(() => {
    const saved = localStorage.getItem("cartId");
    return saved ? Number(saved) : null;
  });
  const [isLoadingCart, setIsLoadingCart] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { authData } = useFrontofficeAuth();
  const { language } = useLanguage();

  const isSyncing = useRef(false);
  const previousItemsRef = useRef<string>("");
  const previousAuthRef = useRef<{ id?: number; is_guest?: number }>({});
  const hasLoadedCartRef = useRef(false);

  // Load cart from database
  const loadCartFromDatabase = useCallback(async () => {
    if (
      !authData?.isAuthenticated ||
      !authData?.user ||
      authData?.user?.is_guest === 1
    ) {
      return;
    }

    try {
      setIsLoadingCart(true);
      hasLoadedCartRef.current = false;

      let targetCartId = cartId;

      // If no cartId stored, try to find the latest non-ordered cart
      if (targetCartId === null) {
        const customerCarts = await getCustomerCarts(authData.user.id);
        if (customerCarts.length === 0) {
          setItems([]);
          return;
        }

        const orderedCartIds = await getOrderedCartIds();
        const recentCart = customerCarts
          .filter((cart) => !orderedCartIds.has(cart.id))
          .sort(
            (a, b) =>
              new Date(b.date_add).getTime() - new Date(a.date_add).getTime(),
          )[0];

        if (!recentCart) {
          setItems([]);
          return;
        }

        targetCartId = recentCart.id;
        localStorage.setItem("cartId", targetCartId.toString());
        setCartId(targetCartId);
      }

      // Load items from the cart
      const cartResponse = await fetchFromPrestashopApi<{
        cart: {
          associations?: {
            cart_rows?: {
              cart_row?: Array<{
                id_product: { "#text": number };
                id_product_attribute: { "#text": number };
                quantity: number;
              }>;
            };
          };
        };
      }>(`/carts/${targetCartId}?display=full`, { method: "GET" });

      const cart = cartResponse.cart;
      if (!cart) {
        setCartId(null);
        localStorage.removeItem("cartId");
        setItems([]);
        return;
      }

      const cartItems = await cartToCartItems({
        id: targetCartId,
        date_add: "",
        associations: cart.associations,
      });

      previousItemsRef.current = JSON.stringify(cartItems);
      setItems(cartItems);
    } catch (error) {
      console.error("Error loading cart from database:", error);
      setCartId(null);
      localStorage.removeItem("cartId");
      setItems([]);
    } finally {
      setIsLoadingCart(false);
      hasLoadedCartRef.current = true;
    }
  }, [authData, cartId]);

  // Load cart when user changes (login/logout)
  useEffect(() => {
    (async () => {
      const currentAuth = {
        id: authData?.user?.id,
        is_guest: authData?.user?.is_guest,
      };

      // Only run if auth actually changed
      if (
        currentAuth.id !== previousAuthRef.current.id ||
        currentAuth.is_guest !== previousAuthRef.current.is_guest
      ) {
        previousAuthRef.current = currentAuth;

        if (
          !authData?.isAuthenticated ||
          !authData?.user ||
          authData?.user?.is_guest === 1
        ) {
          // Guest or logged out - use local storage only
          const savedItems = localStorage.getItem(localCartKey);
          const parsedItems = savedItems ? (JSON.parse(savedItems) as CartItem[]) : [];
          setItems(parsedItems);
          setCartId(null);
          localStorage.removeItem("cartId");
          previousItemsRef.current = JSON.stringify(parsedItems);
          hasLoadedCartRef.current = false;
        } else {
          // Logged in - load their cart
          loadCartFromDatabase();
        }
      }
    })();
  }, [authData?.isAuthenticated, authData?.user, loadCartFromDatabase]);

  // Persist cart to local storage for guests or unauthenticated users
  useEffect(() => {
    if (authData?.isAuthenticated && authData?.user?.is_guest !== 1) return;
    localStorage.setItem(localCartKey, JSON.stringify(items));
  }, [authData?.isAuthenticated, authData?.user?.is_guest, items]);

  // Sync cart to database (only when items change from user action)
  useEffect(() => {
    if (
      !authData?.isAuthenticated ||
      !authData?.user ||
      authData?.user?.is_guest === 1 ||
      isLoadingCart ||
      isSyncing.current ||
      !hasLoadedCartRef.current
    ) {
      return;
    }

    const itemsJson = JSON.stringify(items);
    if (itemsJson === previousItemsRef.current) return;

    // Don't sync if we just loaded from database
    if (previousItemsRef.current === "" && items.length > 0) {
      previousItemsRef.current = itemsJson;
      return;
    }

    previousItemsRef.current = itemsJson;

    const currencyId = language?.currency_id || 1;
    const languageId = language?.language_id || 1;

    const syncCart = async () => {
      isSyncing.current = true;

      try {
        if (items.length === 0) {
          if (cartId) {
            await deleteCart(cartId);
            setCartId(null);
            localStorage.removeItem("cartId");
          }
          return;
        }

        if (cartId === null) {
          const newCartId = await saveCart(
            items,
            authData.user!.id,
            currencyId,
            languageId,
            { showToast: false },
          );
          setCartId(newCartId);
          localStorage.setItem("cartId", newCartId.toString());
        } else {
          await updateCart(
            cartId,
            items,
            authData.user!.id,
            currencyId,
            languageId,
          );
        }
      } catch (error) {
        console.error("Error syncing cart:", error);
      } finally {
        isSyncing.current = false;
      }
    };

    syncCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  const addToCart = (newItem: Omit<CartItem, "quantity">, quantity: number = 1) => {
    setItems((prev) => {
      const existing = prev.find(
        (item) =>
          item.productId === newItem.productId &&
          item.combinationId === newItem.combinationId,
      );

      if (existing) {
        return prev.map((item) =>
          item.productId === newItem.productId &&
            item.combinationId === newItem.combinationId
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }
      return [...prev, { ...newItem, quantity }];
    });
  };

  const removeFromCart = (productId: number, combinationId?: number) => {
    setItems((prev) =>
      prev.filter(
        (item) =>
          !(item.productId === productId && item.combinationId === combinationId),
      ),
    );
  };

  const updateQuantity = (
    productId: number,
    combinationId: number | undefined,
    quantity: number,
  ) => {
    if (quantity <= 0) {
      removeFromCart(productId, combinationId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.productId === productId && item.combinationId === combinationId
          ? { ...item, quantity }
          : item,
      ),
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

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
        isLoadingCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}