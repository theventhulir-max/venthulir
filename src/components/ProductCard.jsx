'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useUIModal } from '@/components/Providers';
import { ShoppingBag, Eye, Star, Check, Heart, ArrowRight } from 'lucide-react';
import './ProductCard.css';

export default function ProductCard({ product, onQuickView, onBuyNow }) {
  const router = useRouter();
  const { addToCart, setIsCartOpen } = useCart();
  const uiModal = useUIModal?.() || null;
  const [selectedVariant, setSelectedVariant] = useState(product?.variants?.[0] || null);
  const [added, setAdded] = useState(false);
  const [liked, setLiked] = useState(false);

  if (!product) return null;

  const price = selectedVariant?.price ?? product.price ?? 0;
  const originalPrice = product.originalPrice || Math.round(price * 1.25);
  const savings = Math.max(0, originalPrice - price);
  const discountPercent = product.discountPercent || (originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 20);
  const getFallbackImg = (p) => {
    const name = (p?.name || '').toLowerCase();
    const cat = (p?.category || '').toLowerCase();
    if (name.includes('turmeric') || name.includes('manjal') || name.includes('yellow') || name.includes('turm')) return '/assets/hero/turmeric.png';
    if (name.includes('chilli') || name.includes('chili') || name.includes('red')) return '/assets/hero/chilli.png';
    if (name.includes('coriander') || name.includes('mallie')) return '/assets/hero/coriander.png';
    if (name.includes('sambar') || name.includes('masala') || name.includes('garam')) return '/assets/hero/sambar.png';
    if (name.includes('coconut')) return '/assets/hero/oil_coconut.png';
    if (name.includes('groundnut')) return '/assets/hero/oil_groundnut.png';
    if (name.includes('gingelly') || name.includes('sesame')) return '/assets/hero/oil_gingelly.png';
    if (name.includes('oil') || cat.includes('oil')) return '/assets/hero/oil_sunflower.png';
    return '/assets/hero/turmeric.png';
  };

  const imageUrl = product.images?.[0] || product.imageUrl || getFallbackImg(product);
  const hasVariants = product.variants?.length > 0;

  const handleAdd = (e) => {
    e.stopPropagation();
    addToCart(product, selectedVariant);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  const handleBuyNow = (e) => {
    e.stopPropagation();
    addToCart(product, selectedVariant);
    setIsCartOpen(false);
    if (onBuyNow) {
      onBuyNow(product, selectedVariant);
    } else {
      router.push('/checkout');
    }
  };

  const toggleWishlist = (e) => {
    e.stopPropagation();
    setLiked(!liked);
  };

  return (
    <div className="product-card" onClick={() => onQuickView && onQuickView(product)}>
      
      {/* ── Top Visual Stage / Image Container ── */}
      <div className="product-card-media">
        
        {/* Top Floating Badges */}
        <div className="product-media-tags">
          <span className="organic-tag">
            {product.badge || '100% Organic'}
          </span>
          {discountPercent > 0 && (
            <span className="discount-tag">{discountPercent}% OFF</span>
          )}
        </div>

        {/* Wishlist Floating Button */}
        <button 
          className={`wishlist-toggle-btn ${liked ? 'is-liked' : ''}`}
          onClick={toggleWishlist}
          title="Save to Wishlist"
          type="button"
          aria-label="Wishlist"
        >
          <Heart size={15} fill={liked ? '#ef4444' : 'none'} color={liked ? '#ef4444' : '#274834'} />
        </button>

        {/* Large Product Pouch Image */}
        <div className="product-img-box">
          <img 
            src={imageUrl} 
            alt={product.name} 
            className="product-img" 
            loading="lazy" 
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = getFallbackImg(product);
            }}
          />
        </div>

        {/* Quick View Button on Hover */}
        {onQuickView && (
          <button 
            className="quick-view-action" 
            onClick={(e) => { e.stopPropagation(); onQuickView(product); }}
            aria-label="Quick View"
            type="button"
          >
            <Eye size={13} />
            <span>Quick View</span>
          </button>
        )}
      </div>

      {/* ── Product Card Body ── */}
      <div className="product-card-info">
        
        {/* Category & Rating Row */}
        <div className="product-info-meta">
          <span className="product-category-text">
            {product.category || 'Farm Harvest'}
          </span>

          <div className="product-rating-box">
            <Star size={12} fill="#eab308" color="#eab308" />
            <span className="rating-num">4.9</span>
            <span className="rating-total">(24)</span>
          </div>
        </div>

        {/* Product Title */}
        <h3 className="product-title-heading" title={product.name}>
          {product.name}
        </h3>

        {/* Variant Weight Selector */}
        {hasVariants && (
          <div className="product-variant-group">
            {product.variants.map((v) => {
              const isSelected = selectedVariant?.label === v.label;
              return (
                <button
                  key={v.label}
                  className={`variant-option-btn ${isSelected ? 'active' : ''}`}
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setSelectedVariant(v); 
                  }}
                  type="button"
                >
                  {v.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Price & Savings Display */}
        <div className="product-pricing-box">
          <div className="price-tag-group">
            <span className="current-price">₹{price}</span>
            <span className="strike-price">₹{originalPrice}</span>
          </div>
          <span className="savings-badge">Save ₹{savings}</span>
        </div>

        {/* Clean Real-Time Action Buttons (NO TACKY LIGHTNING BOLT) */}
        <div className="product-button-cluster">
          <button 
            className={`btn-add-cart ${added ? 'added-state' : ''}`} 
            onClick={handleAdd}
            type="button"
            title="Add to Cart"
          >
            {added ? (
              <>
                <Check size={14} />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingBag size={14} />
                <span>Add</span>
              </>
            )}
          </button>

          <button 
            className="btn-buy-instant" 
            onClick={handleBuyNow}
            type="button"
          >
            <span>Buy Now</span>
            <ArrowRight size={13} className="btn-arrow" />
          </button>
        </div>

      </div>
    </div>
  );
}
