import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('venthulir_cart')) || []; }
    catch { return []; }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('venthulir_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.warn('Failed to save cart to localStorage:', e);
    }
  }, [cartItems]);

  const addToCart = (product, variant, quantity = 1) => {
    const key = `${product._id}-${variant?.label || 'default'}`;
    setCartItems(prev => {
      const existing = prev.find(i => i.key === key);
      if (existing) return prev.map(i => i.key === key ? { ...i, quantity: i.quantity + quantity } : i);
      return [...prev, {
        key,
        productId: product._id,
        name: product.name,
        image: product.images?.[0] || product.imageUrl,
        variant: variant || null,
        price: variant?.price || product.price,
        quantity,
        category: product.category
      }];
    });
    setIsCartOpen(true);
  };

  const updateQty = (key, qty) => {
    if (qty < 1) return removeFromCart(key);
    setCartItems(prev => prev.map(i => i.key === key ? { ...i, quantity: qty } : i));
  };

  const removeFromCart = (key) => setCartItems(prev => prev.filter(i => i.key !== key));

  const clearCart = () => setCartItems([]);

  const cartCount   = cartItems.reduce((s, i) => s + i.quantity, 0);
  const cartTotal   = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, updateQty, removeFromCart, clearCart, cartCount, cartTotal, isCartOpen, setIsCartOpen }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
