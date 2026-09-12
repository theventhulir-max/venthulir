'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

const getFallbackImage = (name = '', category = '') => {
  const lowerName = (name || '').toLowerCase();
  const lowerCat = (category || '').toLowerCase();

  if (lowerName.includes('turmeric') || lowerName.includes('manjal') || lowerName.includes('yellow') || lowerName.includes('turm')) return '/assets/hero/turmeric.png';
  if (lowerName.includes('chilli') || lowerName.includes('chili') || lowerName.includes('red') || lowerName.includes('milagai')) return '/assets/hero/chilli.png';
  if (lowerName.includes('coriander') || lowerName.includes('mallie') || lowerName.includes('dhaniya') || lowerName.includes('kothamalli')) return '/assets/hero/coriander.png';
  if (lowerName.includes('sambar') || lowerName.includes('masala') || lowerName.includes('garam') || lowerName.includes('rasam')) return '/assets/hero/sambar.png';
  if (lowerName.includes('coconut') || lowerName.includes('thengai')) return '/assets/hero/oil_coconut.png';
  if (lowerName.includes('groundnut') || lowerName.includes('kadalai')) return '/assets/hero/oil_groundnut.png';
  if (lowerName.includes('gingelly') || lowerName.includes('sesame') || lowerName.includes('nallennai') || lowerName.includes('til')) return '/assets/hero/oil_gingelly.png';
  if (lowerName.includes('oil') || lowerCat.includes('oil')) return '/assets/hero/oil_sunflower.png';
  return '/assets/hero/turmeric.png';
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('venthulir_cart');
      if (saved) {
        setCartItems(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load cart from storage', e);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem('venthulir_cart', JSON.stringify(cartItems));
      } catch (e) {
        console.warn('Failed to save cart to localStorage, attempting fallback save:', e);
        try {
          const sanitizedItems = cartItems.map(item => ({
            ...item,
            image: (typeof item.image === 'string' && item.image.startsWith('data:image'))
              ? getFallbackImage(item.name, item.category)
              : item.image
          }));
          localStorage.setItem('venthulir_cart', JSON.stringify(sanitizedItems));
        } catch {}
      }
    }
  }, [cartItems, mounted]);

  const addToCart = (product, variant, quantity = 1) => {
    const pId = product._id || product.id;
    const key = `${pId}-${variant?.label || 'default'}`;
    const rawImg = product.images?.[0] || product.imageUrl || product.image;
    const safeImg = rawImg || getFallbackImage(product.name, product.category);

    setCartItems(prev => {
      const existing = prev.find(i => i.key === key);
      if (existing) {
        return prev.map(i => i.key === key ? { ...i, quantity: i.quantity + quantity } : i);
      }
      return [...prev, {
        key,
        productId: pId,
        product: pId,
        name: product.name,
        image: safeImg,
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

  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, updateQty, removeFromCart, clearCart, cartCount, cartTotal, isCartOpen, setIsCartOpen }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
export default CartContext;
