'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useUIModal } from '@/components/Providers';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowRight, ShieldCheck, Leaf, Droplets, Award, Star,
  ChevronDown, X, ChevronLeft, ChevronRight, Plus, Minus,
  ShoppingCart, Send, Search, Package, Clock, MessageSquare, Quote,
  Truck, CheckCircle2, Sparkles, Heart, RefreshCw, Flame, Sun, Wheat
} from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import './HomePage.css';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Direct Hero Product Image Assets
const imgTurmeric = '/assets/hero/turmeric.png';
const imgChilli = '/assets/hero/chilli.png';
const imgCoriander = '/assets/hero/coriander.png';
const imgGaramMasala = '/assets/hero/garam_masala.png';
const imgSambar = '/assets/hero/sambar.png';
const imgOilCoconut = '/assets/hero/oil_coconut.png';
const imgOilGroundnut = '/assets/hero/oil_groundnut.png';
const imgOilGingelly = '/assets/hero/oil_gingelly.png';
const imgOilSunflower = '/assets/hero/oil_sunflower.png';

const API = '/api';


const CATEGORIES = [
  { 
    id: 'spices',
    name: 'Single-Origin Spices',      
    tamilName: 'கைமுறை மசாலா பொடிகள்',
    iconType: 'sparkles',
    badge: 'Sun-Dried & Stone-Ground',
    desc: 'High curcumin Salem turmeric, vivid Guntur red chillies, and fragrant Erode coriander stone-ground at low RPMs.',
    items: '6 Pure Powders Available',
    filterParam: 'Spice Powders',
    image: imgTurmeric,
    secondaryImg: imgChilli,
    origin: 'Salem & Guntur Direct Farms',
    highlights: ['Salem Turmeric', 'Guntur Red Chilli', 'Erode Coriander', 'Black Pepper'],
    isFeatured: true,
    accentColor: '#166534'
  },
  { 
    id: 'oils',
    name: 'Cold-Pressed Oils',  
    tamilName: 'மரச்செக்கு எண்ணெய்கள்',
    iconType: 'droplets',
    badge: 'Traditional Chekku < 40°C',
    desc: 'Extracted in native Vaagai wood mortars without heat or artificial solvents. Retains live natural antioxidants & rich ancestral aroma.',
    items: '4 Virgin Oils Available',
    filterParam: 'Cold-Pressed Oils',
    image: imgOilGingelly,
    secondaryImg: imgOilCoconut,
    origin: 'Native Tamil Nadu Chekku',
    highlights: ['Gingelly (Sesame)', 'Groundnut', 'Pure Coconut', 'Sunflower'],
    isFeatured: true,
    accentColor: '#166534'
  },
  { 
    id: 'masalas',
    name: 'Heritage Masala Blends',      
    tamilName: 'பாரம்பரிய கூட்டு மசாலா',
    iconType: 'flame',
    badge: '12 Hand-Roasted Spices',
    desc: 'Slow-roasted in small batches following ancestral family recipes. Fragrant heart for wholesome rasam, sambar & curries.',
    items: '5 Authentic Blends Available',
    filterParam: 'Masala Blends',
    image: imgSambar,
    secondaryImg: imgGaramMasala,
    origin: 'Chettinad & Kongu Heritage',
    highlights: ['Traditional Sambar', 'Royal Garam Masala', 'Kongu Rasam Powder'],
    isFeatured: false,
    accentColor: '#166534'
  },
  { 
    id: 'rice',
    name: 'Ancient Heirloom Grains',     
    tamilName: 'பாரம்பரிய அரிசி ரகங்கள்',
    iconType: 'wheat',
    badge: '100% Native Tamil Grains',
    desc: 'Nutrient-dense indigenous paddy cultivated with zero synthetic fertilizers. High natural fiber, minerals & low glycemic index.',
    items: '4 Native Grains Available',
    filterParam: 'All',
    image: null,
    origin: 'Thanjavur & Cauvery Delta',
    highlights: ['Karuppu Kavuni', 'Mappillai Samba', 'Poongar Rice', 'Native Millets'],
    isFeatured: false,
    accentColor: '#166534'
  },
  { 
    id: 'sweeteners',
    name: 'Pure Natural Sweeteners', 
    tamilName: 'இயற்கை நாட்டு சர்க்கரை & தேன்',
    iconType: 'sun',
    badge: '100% Unrefined & Chemical-Free',
    desc: 'Naturally clarified country sugar, native palm jaggery, and raw forest honey. Zero bone char, bleaching agents or preservatives.',
    items: '3 Sweet Staples Available',
    filterParam: 'All',
    image: null,
    origin: 'Tirunelveli Palm Groves',
    highlights: ['Palm Jaggery (Karupatti)', 'Country Sugar', 'Raw Forest Honey'],
    isFeatured: false,
    accentColor: '#166534'
  },
  { 
    id: 'herbal',
    name: 'Daily Herbal Wellness',    
    tamilName: 'ஆரோக்கிய மூலிகை பொடிகள்',
    iconType: 'leaf',
    badge: 'Ancestral Herbal Vitality',
    desc: 'Handpicked wild-crafted botanicals sun-dried to preserve medicinal phyto-nutrients for daily vitality and gut wellness.',
    items: '4 Herbal Formulations Available',
    filterParam: 'All',
    image: null,
    origin: 'Western Ghats Foothills',
    highlights: ['Avarampoo Infusion', 'Nilavembu Vitality', 'Tulsi Leaves', 'Moringa Powder'],
    isFeatured: false,
    accentColor: '#166534'
  },
];

const REVIEWS = [
  {
    name: 'Maya R.',
    role: 'Home Cook & Nutrition Advocate',
    rating: 5,
    city: 'Chennai',
    text: "The sesame oil is pure magic — the aroma alone tells you it's authentic Chekku pressed. Nothing like store-bought refined oils. My entire family can taste the difference!"
  },
  {
    name: 'Harshath K.',
    role: 'Professional Chef',
    rating: 5,
    city: 'Coimbatore',
    text: "As a chef, purity of raw ingredients is everything. Venthulir's cold-pressed groundnut and coconut oils have an exceptional smoke point and rich, clean flavour."
  },
  {
    name: 'Aswini M.',
    role: 'Certified Nutritionist',
    rating: 5,
    city: 'Bengaluru',
    text: "Finally spice powders and masalas without fillers, preservatives, or artificial dyes. The aroma and health benefits are outstanding for daily holistic meals."
  },
  {
    name: 'Shivanya P.',
    role: 'Organic Lifestyle Blogger',
    rating: 5,
    city: 'Madurai',
    text: "I've reviewed dozens of organic brands across South India, but Venthulir stands apart in transparency, packaging, and genuine farm-fresh taste."
  },
  {
    name: 'Rosan D.',
    role: 'Fitness & Wellness Coach',
    rating: 5,
    city: 'Trichy',
    text: "Unrefined cold-pressed oils are essential for gut health and wholesome nutrition. Venthulir is now my daily kitchen staple and what I recommend to all my clients."
  }
];

const FAQS = [
  {
    q: 'How are Venthulir cold-pressed oils extracted?',
    a: 'We use traditional Chekku (wooden pestle and mortar) operated at very slow RPMs. This mechanical pressing maintains temperatures below 40°C, ensuring that all natural nutrients, antioxidants, aroma, and delicate vitamins remain intact.'
  },
  {
    q: 'Are all products 100% free of preservatives and additives?',
    a: 'Absolutely. Every batch of oil, spice, and grain is zero-chemical, zero-additive, and unadulterated. What you receive is 100% natural, certified, and farm-sourced produce.'
  },
  {
    q: 'What is the shelf life and ideal storage condition?',
    a: 'Because our oils are unrefined with zero chemical preservatives, we recommend storing them in a cool, dry place away from direct sunlight. Unopened bottles last 6 to 9 months, and opened bottles are best enjoyed within 3 months.'
  },
  {
    q: 'Do you offer free shipping and express delivery?',
    a: 'Yes! We offer complimentary standard shipping across India on all orders above ₹499. Orders are processed within 24 hours, with typical delivery taking 3–5 business days.'
  },
  {
    q: 'Can I place bulk orders for events or wholesale?',
    a: 'Yes, we gladly fulfill bulk and wholesale orders with customized packaging options. You can connect with our team via the contact form or WhatsApp us at +91 87784 76414.'
  }
];

const HERO_POWDERS = [
  {
    id: 'turmeric-powder',
    title: 'Salem Pure Turmeric Powder',
    subtitle: 'High Curcumin (5.2%) • Sun-Dried & Stone-Ground',
    badge: '100% Certified Organic',
    image: imgTurmeric,
    tag: 'Authentic Ground Turmeric Roots',
    price: 'From ₹140',
    rating: '4.9 ★ (420+)',
    bgGradient: '#f4f8f5',
    spiceColor: '#166534',
    auraGlow: 'rgba(22, 101, 52, 0.15)',
  },
  {
    id: 'chilli-powder',
    title: 'Guntur Red Chilli Powder',
    subtitle: 'Sun-Dried Chillies • Vibrant Natural Red Color',
    badge: 'Stone-Ground Purity',
    image: imgChilli,
    tag: 'Rich Heat & Zero Added Colors',
    price: 'From ₹150',
    rating: '4.9 ★ (380+)',
    bgGradient: '#f4f8f5',
    spiceColor: '#991b1b',
    auraGlow: 'rgba(153, 27, 27, 0.15)',
  },
  {
    id: 'coriander-powder',
    title: 'Native Coriander Powder',
    subtitle: 'Slowly Roasted Tamil Nadu Heirloom Seeds',
    badge: 'Single-Origin Farm Harvest',
    image: imgCoriander,
    tag: 'Essential Daily Kitchen Aroma',
    price: 'From ₹130',
    rating: '4.8 ★ (310+)',
    bgGradient: '#f4f8f5',
    spiceColor: '#059669',
    auraGlow: 'rgba(5, 150, 105, 0.15)',
  },
  {
    id: 'garam-masala',
    title: 'Heritage Garam Masala',
    subtitle: '12 Whole Spices Roasted & Hand-Blended',
    badge: 'Traditional Recipe',
    image: imgGaramMasala,
    tag: 'Cardamom, Cinnamon, Cloves & Star Anise',
    price: 'From ₹180',
    rating: '5.0 ★ (290+)',
    bgGradient: '#f4f8f5',
    spiceColor: '#0f766e',
    auraGlow: 'rgba(15, 118, 110, 0.15)',
  },
  {
    id: 'sambar-powder',
    title: 'Traditional Sambar Powder',
    subtitle: 'Authentic South Indian Generational Recipe',
    badge: 'Generational Recipe',
    image: imgSambar,
    tag: 'Rich Aroma & Perfect Homestyle Flavor',
    price: 'From ₹160',
    rating: '4.9 ★ (510+)',
    bgGradient: '#f4f8f5',
    spiceColor: '#047857',
    auraGlow: 'rgba(4, 120, 87, 0.15)',
  }
];

const HERO_OILS = [
  {
    id: 'coconut-oil',
    title: 'Wood Cold-Pressed Coconut Oil',
    subtitle: '100% Pure Chekku • Unrefined & Virgin Extracted',
    badge: 'Wood Cold-Pressed',
    image: imgOilCoconut,
    tag: 'Fresh Sun-Dried Copra Extraction',
    price: 'From ₹280',
    rating: '4.9 ★ (640+)',
    bgGradient: '#f4f8f5',
    spiceColor: '#15803d',
    auraGlow: 'rgba(21, 128, 61, 0.15)',
  },
  {
    id: 'groundnut-oil',
    title: 'Wood Cold-Pressed Groundnut Oil',
    subtitle: 'Selected Native Peanuts • Nutty Aroma & Rich Smoke Point',
    badge: '100% Pure & Natural',
    image: imgOilGroundnut,
    tag: 'Slow Chekku Pressed Under 40°C',
    price: 'From ₹260',
    rating: '4.9 ★ (820+)',
    bgGradient: '#f4f8f5',
    spiceColor: '#0f766e',
    auraGlow: 'rgba(15, 118, 110, 0.15)',
  },
  {
    id: 'gingelly-oil',
    title: 'Wood Cold-Pressed Gingelly Oil',
    subtitle: 'First-Grade Black Sesame Seeds & Palm Jaggery Blend',
    badge: 'Traditional Chekku',
    image: imgOilGingelly,
    tag: 'Generations of Authentic Flavour',
    price: 'From ₹340',
    rating: '5.0 ★ (570+)',
    bgGradient: '#f4f8f5',
    spiceColor: '#166534',
    auraGlow: 'rgba(22, 101, 52, 0.15)',
  },
  {
    id: 'sunflower-oil',
    title: 'Wood Cold-Pressed Sunflower Oil',
    subtitle: '100% Pure & Natural • Rich in Vitamin E & Healthy Fats',
    badge: 'Cold-Pressed Purity',
    image: imgOilSunflower,
    tag: 'Fresh Seed Cold Extraction',
    price: 'From ₹240',
    rating: '4.8 ★ (390+)',
    bgGradient: '#f4f8f5',
    spiceColor: '#0d9488',
    auraGlow: 'rgba(13, 148, 136, 0.15)',
  }
];

const INITIAL_CATALOG_PRODUCTS = [
  {
    _id: 'prod-turmeric',
    name: 'Salem Pure Turmeric Powder',
    category: 'Spice Powders',
    badge: '100% Pure',
    price: 140,
    imageUrl: imgTurmeric,
    images: [imgTurmeric],
    description: 'High curcumin content authentic Salem turmeric roots, sun-dried and stone ground to retain natural color, aroma, and medicinal healing properties.',
    variants: [
      { label: '100g', price: 140 },
      { label: '250g', price: 320 },
      { label: '500g', price: 590 }
    ],
    inStock: true
  },
  {
    _id: 'prod-chilli',
    name: 'Guntur Red Chilli Powder',
    category: 'Spice Powders',
    badge: 'Stone Ground',
    price: 150,
    imageUrl: imgChilli,
    images: [imgChilli],
    description: 'Sun-dried premium red chillies stone-ground at low temperatures. Delivers deep natural red color, balanced piquant heat, and zero artificial dyes.',
    variants: [
      { label: '100g', price: 150 },
      { label: '250g', price: 340 },
      { label: '500g', price: 620 }
    ],
    inStock: true
  },
  {
    _id: 'prod-coriander',
    name: 'Native Coriander Powder',
    category: 'Spice Powders',
    badge: 'Single Origin',
    price: 130,
    imageUrl: imgCoriander,
    images: [imgCoriander],
    description: 'Slow roasted Tamil Nadu heirloom coriander seeds ground to fragrant perfection. An essential heart of daily South Indian curries and gravies.',
    variants: [
      { label: '100g', price: 130 },
      { label: '250g', price: 290 },
      { label: '500g', price: 540 }
    ],
    inStock: true
  },
  {
    _id: 'prod-garam-masala',
    name: 'Heritage Garam Masala',
    category: 'Masala Blends',
    badge: 'Traditional Recipe',
    price: 180,
    imageUrl: imgGaramMasala,
    images: [imgGaramMasala],
    description: 'A master blend of 12 hand-roasted whole spices: green cardamom, royal cinnamon, cloves, star anise, and mace. Unrivaled fragrant depth.',
    variants: [
      { label: '100g', price: 180 },
      { label: '200g', price: 340 }
    ],
    inStock: true
  },
  {
    _id: 'prod-sambar-powder',
    name: 'Traditional Sambar Powder',
    category: 'Masala Blends',
    badge: 'Bestseller',
    price: 160,
    imageUrl: imgSambar,
    images: [imgSambar],
    description: 'Handcrafted with an authentic generational recipe of roasted dals, whole red chillies, coriander, fenugreek, and aromatic spices.',
    variants: [
      { label: '100g', price: 160 },
      { label: '250g', price: 360 },
      { label: '500g', price: 680 }
    ],
    inStock: true
  },
  {
    _id: 'prod-coconut-oil',
    name: 'Wood Cold-Pressed Coconut Oil',
    category: 'Cold-Pressed Oils',
    badge: 'Chekku Pressed',
    price: 280,
    imageUrl: imgOilCoconut,
    images: [imgOilCoconut],
    description: 'Extracted from sun-dried sulfur-free copra using traditional Vaagai wood pestles below 40°C. Raw, unrefined, virgin quality.',
    variants: [
      { label: '500ml', price: 280 },
      { label: '1 Litre', price: 520 }
    ],
    inStock: true
  },
  {
    _id: 'prod-groundnut-oil',
    name: 'Wood Cold-Pressed Groundnut Oil',
    category: 'Cold-Pressed Oils',
    badge: 'Rich Aroma',
    price: 260,
    imageUrl: imgOilGroundnut,
    images: [imgOilGroundnut],
    description: 'Pressed from selected native peanuts. High smoke point, rich nutty aroma, and heart-healthy monounsaturated fats.',
    variants: [
      { label: '500ml', price: 260 },
      { label: '1 Litre', price: 490 },
      { label: '5 Litres', price: 2350 }
    ],
    inStock: true
  },
  {
    _id: 'prod-gingelly-oil',
    name: 'Wood Cold-Pressed Gingelly (Sesame) Oil',
    category: 'Cold-Pressed Oils',
    badge: 'Palm Jaggery Blend',
    price: 340,
    imageUrl: imgOilGingelly,
    images: [imgOilGingelly],
    description: 'First-grade black sesame seeds slow-pressed with authentic Palm Jaggery (Karupatti). Rich in calcium and live antioxidants.',
    variants: [
      { label: '500ml', price: 340 },
      { label: '1 Litre', price: 650 }
    ],
    inStock: true
  },
  {
    _id: 'prod-sunflower-oil',
    name: 'Wood Cold-Pressed Sunflower Oil',
    category: 'Cold-Pressed Oils',
    badge: '100% Unrefined',
    price: 240,
    imageUrl: imgOilSunflower,
    images: [imgOilSunflower],
    description: 'Cold-extracted from high-grade sunflower seeds. Light golden hue, neutral pleasant flavour, and packed with natural Vitamin E.',
    variants: [
      { label: '500ml', price: 240 },
      { label: '1 Litre', price: 460 }
    ],
    inStock: true
  }
];

const StarRating = ({ count = 5 }) => (
  <div className="star-rating-row" aria-label={`${count} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((i) => (
      <Star
        key={i}
        size={14}
        className={i <= count ? 'star-filled' : 'star-empty'}
        fill={i <= count ? '#c9a84c' : 'none'}
        stroke="#c9a84c"
        strokeWidth={1.5}
      />
    ))}
  </div>
);

export default function HomePage({ onCheckout }) {
  const { addToCart, setIsCartOpen } = useCart();
  const router = useRouter();
  const uiModal = useUIModal();
  const handleCheckout = onCheckout || uiModal?.openCheckout;

  const homeRootRef = useRef(null);
  const [products, setProducts] = useState(INITIAL_CATALOG_PRODUCTS);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Hero Showcase Category Tab & Slideshow State
  const [heroTab, setHeroTab] = useState('powders'); // 'powders' | 'oils'
  const activeHeroSlides = heroTab === 'powders' ? HERO_POWDERS : HERO_OILS;
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const [isHeroPaused, setIsHeroPaused] = useState(false);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragEndX = useRef(0);

  // Helper to ensure newest products are ALWAYS placed first
  const sortNewestFirst = (list) => {
    return [...list].sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      if (timeA && timeB && timeA !== timeB) return timeB - timeA;
      if (timeA && !timeB) return -1;
      if (!timeA && timeB) return 1;
      return (b._id || b.id || '').localeCompare(a._id || a.id || '');
    });
  };

  // Unique categories for filtering
  const categoryTabs = ['All', ...new Set(products.map((p) => p.category).filter(Boolean))];

  // Filter products by category and search
  const filteredProducts = products.filter((p) => {
    const matchCategory = activeCategory === 'All' || 
      (p.category && p.category.toLowerCase() === activeCategory.toLowerCase()) ||
      (activeCategory === 'Spices & Powders' && /spice|powder/i.test(p.category || '')) ||
      (activeCategory === 'Cold-Pressed Oils' && /oil/i.test(p.category || ''));
    const matchSearch = !searchQuery || p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description?.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCategory && matchSearch;
  });

  // Quick View Modal State & Zoom Lens
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [zoomState, setZoomState] = useState({ isZoomed: false, x: 50, y: 50 });

  const handleZoomMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setZoomState({ isZoomed: true, x, y });
  };

  const handleZoomMouseLeave = () => {
    setZoomState({ isZoomed: false, x: 50, y: 50 });
  };

  // Reviews Carousel
  const [currentReview, setCurrentReview] = useState(0);

  // FAQ Accordion
  const [openFaq, setOpenFaq] = useState(0);

  // Contact Form State
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [formStatus, setFormStatus] = useState('idle');
  
  // Products Horizontal Track Ref, Section Ref & Progress Fill Ref
  const productsSectionRef = useRef(null);
  const productsTrackRef = useRef(null);
  const progressFillRef = useRef(null);

  // Smooth Horizontal Track Progress Updater
  const handleTrackScroll = () => {
    if (productsTrackRef.current && progressFillRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = productsTrackRef.current;
      const maxScroll = scrollWidth - clientWidth;
      const progress = maxScroll > 0 ? (scrollLeft / maxScroll) * 100 : 0;
      progressFillRef.current.style.width = `${Math.max(12, Math.min(100, progress))}%`;
    }
  };

  // Smooth Navigation Arrow Controls
  const scrollProducts = (direction) => {
    if (productsTrackRef.current) {
      const scrollOffset = direction === 'next' ? 340 : -340;
      productsTrackRef.current.scrollBy({
        left: scrollOffset,
        behavior: 'smooth'
      });
    }
  };

  // Load products from API (Fresh live fetch + newest first sort)
  const fetchFreshProducts = useCallback(() => {
    setLoading(true);
    fetch(`${API}/products?limit=100&sort=newest&_t=${Date.now()}`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : (data?.products || []);
        if (list.length > 0) {
          setProducts(sortNewestFirst(list));
        }
      })
      .catch((err) => {
        console.error('API load failed, using catalog products:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchFreshProducts();
  }, [fetchFreshProducts]);

  // Clean, lightweight ambient animations without hiding content
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Refresh scroll triggers if any
    try {
      ScrollTrigger.refresh();
    } catch {}
  }, []);

  // Auto-advance hero slides every 4.5 seconds (pauses on hover/drag)
  useEffect(() => {
    if (isHeroPaused) return;
    const interval = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % activeHeroSlides.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isHeroPaused, activeHeroSlides.length]);

  // Reset slide index if category changes
  const handleCategorySwitch = (tab) => {
    setHeroTab(tab);
    setCurrentHeroSlide(0);
  };

  // Auto rotate reviews
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentReview((prev) => (prev + 1) % REVIEWS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Hero Touch & Drag Handlers for Mobile / Desktop Swipe
  const handleDragStart = (clientX) => {
    isDragging.current = true;
    dragStartX.current = clientX;
    dragEndX.current = clientX;
    setIsHeroPaused(true);
  };

  const handleDragMove = (clientX) => {
    if (!isDragging.current) return;
    dragEndX.current = clientX;
  };

  const handleDragEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    setIsHeroPaused(false);
    
    const distance = dragStartX.current - dragEndX.current;
    if (distance > 45) {
      setCurrentHeroSlide((prev) => (prev + 1) % activeHeroSlides.length);
    } else if (distance < -45) {
      setCurrentHeroSlide((prev) => (prev - 1 + activeHeroSlides.length) % activeHeroSlides.length);
    }
    dragStartX.current = 0;
    dragEndX.current = 0;
  };

  // Open Quick View
  const handleOpenQuickView = useCallback((product) => {
    setQuickViewProduct(product);
    setSelectedVariant(product.variants?.[0] || null);
    setQuantity(1);
    setActiveImgIndex(0);
    setZoomState({ isZoomed: false, x: 50, y: 50 });
    document.body.style.overflow = 'hidden';
  }, []);

  // Close Quick View
  const handleCloseQuickView = () => {
    setQuickViewProduct(null);
    setZoomState({ isZoomed: false, x: 50, y: 50 });
    document.body.style.overflow = '';
  };

  const qvImages = quickViewProduct
    ? (quickViewProduct.images?.length ? quickViewProduct.images : [quickViewProduct.imageUrl].filter(Boolean))
    : [];
  const qvPrice = selectedVariant?.price ?? quickViewProduct?.price ?? 0;

  // Contact Form Submission
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setFormStatus('submitting');
    try {
      const res = await fetch(`${API}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setFormStatus('success');
        setFormData({ name: '', email: '', phone: '', message: '' });
      } else {
        setFormStatus('error');
      }
    } catch {
      setFormStatus('error');
    }
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div ref={homeRootRef} className="home-page-root">
      
      {/* ─────────────────────────────────────────────────────────────
          1. HERO SECTION (Warm Ivory Luxury Organic D2C Layout)
      ───────────────────────────────────────────────────────────── */}
      <section id="home" className="home-hero">
        <div className="hero-bg-accent" />
        <div className="container hero-container">
          <div className="hero-content-grid">
            
            {/* Left Column: Brand Story, Headline & CTAs */}
            <div className="hero-text-col">
              <div className="hero-badge-capsule">
                <span className="badge-pulsing-dot" />
                <Sparkles size={13} className="badge-sparkle-icon" />
                <span>100% PURE • TRADITIONAL • FARM-SOURCED</span>
              </div>

              <h1 className="hero-main-heading">
                <span className="heading-line-1">Taste the Purity of Nature.</span>
                <span className="heading-accent">From Tamil Nadu Farms to Your Kitchen.</span>
              </h1>

              <p className="hero-description">
                Authentic stone-ground spices &amp; wood cold-pressed virgin oils, traditionally crafted from single-origin harvest to preserve natural aroma, rich flavour and timeless taste.
              </p>

              {/* Action Buttons */}
              <div className="hero-actions-row">
                <button 
                  type="button"
                  className="btn-hero-primary" 
                  onClick={() => router.push('/products')}
                >
                  <Leaf size={16} className="btn-leaf-icon" />
                  <span>Shop Pure Harvest</span>
                  <ArrowRight size={17} className="btn-arrow-icon" />
                </button>
                <button 
                  type="button"
                  className="btn-hero-secondary" 
                  onClick={() => scrollToSection('story')}
                >
                  <span>Discover Our Story</span>
                  <Sparkles size={14} className="btn-sparkle-subtle" />
                </button>
              </div>

              {/* 3 Luxury Micro-Trust Cards */}
              <div className="hero-trust-cards-row">
                <div className="trust-card-mini">
                  <div className="trust-card-icon bg-green">
                    <Leaf size={16} color="#15803d" />
                  </div>
                  <div className="trust-card-info">
                    <strong>Farm Sourced</strong>
                    <span>Direct Tamil Farms</span>
                  </div>
                </div>
                <div className="trust-card-mini">
                  <div className="trust-card-icon bg-amber">
                    <Droplets size={16} color="#b45309" />
                  </div>
                  <div className="trust-card-info">
                    <strong>Traditional Craft</strong>
                    <span>Stone-Ground &amp; Chekku</span>
                  </div>
                </div>
                <div className="trust-card-mini">
                  <div className="trust-card-icon bg-emerald">
                    <ShieldCheck size={16} color="#047857" />
                  </div>
                  <div className="trust-card-info">
                    <strong>100% Pure</strong>
                    <span>Zero Chemicals &amp; Tested</span>
                  </div>
                </div>
              </div>

              {/* Enhanced Social Proof Avatar Cluster */}
              <div className="hero-social-proof-bar">
                <div className="avatar-stack">
                  <span className="avatar-chip av-1">🌿</span>
                  <span className="avatar-chip av-2">🥥</span>
                  <span className="avatar-chip av-3">✨</span>
                  <span className="avatar-chip av-4">🌾</span>
                </div>
                <div className="social-proof-text">
                  <div className="proof-rating-line">
                    <span className="star-icons">★★★★★</span>
                    <strong>4.9 / 5.0 Rated</strong>
                  </div>
                  <span className="proof-sub">Trusted by <strong>5,000+ Happy Families</strong> across India</span>
                </div>
              </div>
            </div>

            {/* Right Column: Artisan Organic Stage Showcase with Powders / Oils Switcher */}
            <div className="hero-visual-col">
              <div 
                className="artisan-showcase-wrapper"
                onMouseEnter={() => setIsHeroPaused(true)}
                onMouseLeave={() => {
                  setIsHeroPaused(false);
                  handleDragEnd();
                }}
                onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
                onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
                onTouchEnd={handleDragEnd}
                onMouseDown={(e) => handleDragStart(e.clientX)}
                onMouseMove={(e) => handleDragMove(e.clientX)}
                onMouseUp={handleDragEnd}
              >
                {/* Dynamic Aura Glow matched to active product */}
                <div 
                  className="artisan-aura-glow"
                  style={{ background: activeHeroSlides[currentHeroSlide]?.auraGlow || 'rgba(36, 88, 55, 0.25)' }}
                />

                {/* Main Artisan Sculpted Arch Stage */}
                <div className="artisan-arch-stage">
                  
                  {/* Navigation Arrows */}
                  <button 
                    type="button"
                    className="artisan-nav-arrow left"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setCurrentHeroSlide((prev) => (prev - 1 + activeHeroSlides.length) % activeHeroSlides.length);
                    }}
                    aria-label="Previous product"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <button 
                    type="button"
                    className="artisan-nav-arrow right"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setCurrentHeroSlide((prev) => (prev + 1) % activeHeroSlides.length);
                    }}
                    aria-label="Next product"
                  >
                    <ChevronRight size={20} />
                  </button>

                  {/* Slides Track */}
                  <div 
                    className="artisan-slides-track" 
                    style={{ transform: `translateX(-${currentHeroSlide * 100}%)` }}
                  >
                    {activeHeroSlides.map((slide) => (
                      <div 
                        key={slide.id} 
                        className="artisan-slide-scene"
                        style={{ background: slide.bgGradient }}
                      >
                        {/* Concentric Halo Aura Ring */}
                        <div className="artisan-halo-ring" />
                        <div className="artisan-halo-ring inner" />
                        
                        {/* Upfront, Close-Up Hero Product Container */}
                        <div className="artisan-hero-focus">
                          <div className="artisan-wood-plinth" />
                          <img
                            src={slide.image}
                            alt={slide.title}
                            className="artisan-pouch-closeup"
                            draggable="false"
                            loading="eager"
                          />
                        </div>

                        {/* Floating Glassmorphic Product Info Capsule */}
                        <div className="artisan-glass-card">
                          <div className="artisan-card-header">
                            <span 
                              className="artisan-spice-pill"
                              style={{ 
                                borderColor: slide.spiceColor,
                                color: slide.spiceColor 
                              }}
                            >
                              <span className="pill-dot" style={{ background: slide.spiceColor }} />
                              {slide.badge}
                            </span>
                            <div className="artisan-card-meta">
                              <span className="artisan-rating-pill">
                                <Star size={11} fill="#eab308" color="#eab308" />
                                <span>{slide.rating.split(' ')[0]}</span>
                              </span>
                              <span className="artisan-price-tag">{slide.price}</span>
                            </div>
                          </div>
                          
                          <div className="artisan-card-body-row">
                            <div className="artisan-card-info-text">
                              <div className="artisan-spice-title">{slide.title}</div>
                              <div className="artisan-spice-sub">{slide.subtitle}</div>
                            </div>
                            <button 
                              type="button"
                              className="artisan-quick-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push('/products');
                              }}
                              title="Shop Now"
                            >
                              <ArrowRight size={15} />
                            </button>
                          </div>

                          {/* Minimal slide pagination indicator dots inside card */}
                          <div className="artisan-dots-minimal">
                            {activeHeroSlides.map((s, dotIdx) => (
                              <button
                                key={s.id}
                                type="button"
                                className={`artisan-mini-dot ${dotIdx === currentHeroSlide ? 'active' : ''}`}
                                style={dotIdx === currentHeroSlide ? { background: slide.spiceColor } : undefined}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCurrentHeroSlide(dotIdx);
                                }}
                                aria-label={`Slide ${dotIdx + 1}`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Category Switcher Tabs (Powders vs Oils) placed below the box */}
                <div className="artisan-category-switcher">
                  <button 
                    type="button"
                    className={`artisan-switch-btn ${heroTab === 'powders' ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCategorySwitch('powders');
                    }}
                  >
                    <Sparkles size={14} className="switch-icon" />
                    <span className="switcher-label-full">Spice Powders · 5 Products</span>
                    <span className="switcher-label-short">Spices (5)</span>
                  </button>
                  <button 
                    type="button"
                    className={`artisan-switch-btn ${heroTab === 'oils' ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCategorySwitch('oils');
                    }}
                  >
                    <Droplets size={14} className="switch-icon" />
                    <span className="switcher-label-full">Cold-Pressed Oils · 4 Products</span>
                    <span className="switcher-label-short">Oils (4)</span>
                  </button>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. VALUE PROPOSITIONS STRIP (Rich Forest Green with White Icons)
      ───────────────────────────────────────────────────────────── */}
      <section className="features-strip">
        <div className="container">
          <div className="features-grid">
            <div className="feature-cell">
              <div className="feature-icon-box">
                <Leaf size={22} />
              </div>
              <div className="feature-content">
                <h4 className="feature-title">100% Certified Organic</h4>
                <p className="feature-desc">Cultivated without synthetic pesticides or harmful chemicals.</p>
              </div>
            </div>

            <div className="feature-cell">
              <div className="feature-icon-box">
                <Droplets size={22} />
              </div>
              <div className="feature-content">
                <h4 className="feature-title">Traditional Chekku</h4>
                <p className="feature-desc">Wooden press extraction under 40°C to lock in nutrients.</p>
              </div>
            </div>

            <div className="feature-cell">
              <div className="feature-icon-box">
                <Truck size={22} />
              </div>
              <div className="feature-content">
                <h4 className="feature-title">Direct Farm Dispatch</h4>
                <p className="feature-desc">Swift pan-India delivery with eco-friendly packaging.</p>
              </div>
            </div>

            <div className="feature-cell">
              <div className="feature-icon-box">
                <ShieldCheck size={22} />
              </div>
              <div className="feature-content">
                <h4 className="feature-title">Lab Tested &amp; FSSAI</h4>
                <p className="feature-desc">Rigorous multi-point testing for complete batch purity.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. PRODUCTS CATALOG (GSAP Horizontal Scrolling Showcase)
      ───────────────────────────────────────────────────────────── */}
      <section id="products" ref={productsSectionRef} className="section-products">
        <div className="container">
          
          <div className="products-top-bar">
            <div>
              <span className="section-eyebrow">Our Farm Catalog</span>
              <h2 className="section-headline">Pure Organic Staples</h2>
              <p className="products-section-sub">
                Hand-pressed virgin oils &amp; stone-ground spices directly from Tamil Nadu farms
              </p>
            </div>

            <div className="products-top-actions">
              {/* Search Input */}
              <div className="product-search-box">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search oils, spices..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    className="search-clear-btn"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              {/* View All Products Button */}
              <button
                className="btn-view-all-header"
                onClick={() => router.push('/products')}
              >
                <span>View All ({products.length})</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="category-filter-pills">
            {categoryTabs.map((tab) => (
              <button
                key={tab}
                className={`filter-pill-btn ${activeCategory === tab ? 'active' : ''}`}
                onClick={() => setActiveCategory(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Responsive Product Grid */}
          {loading ? (
            <div className="products-catalog-grid">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="product-skeleton-card" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="products-empty-state">
              <Package size={52} strokeWidth={1.2} />
              <h3>No products found</h3>
              <p>Try searching for another keyword or selecting "All" categories.</p>
              <button
                className="btn-secondary-sm"
                onClick={() => {
                  setActiveCategory('All');
                  setSearchQuery('');
                }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="products-catalog-grid">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onQuickView={handleOpenQuickView}
                  onBuyNow={(prod, variant) => {
                    addToCart(prod, variant, 1);
                    setIsCartOpen(false);
                    router.push('/checkout');
                  }}
                />
              ))}
            </div>
          )}

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. CATEGORIES SECTION (Curated Visual Bento Showcase)
      ───────────────────────────────────────────────────────────── */}
      <section id="categories" className="section-categories-showcase">
        <div className="container">
          <div className="section-header text-center cat-showcase-header">
            <div className="cat-eyebrow-pill">
              <Sparkles size={14} className="cat-pill-sparkle" />
              <span>HANDCRAFTED HERITAGE COLLECTIONS</span>
            </div>
            <h2 className="section-headline">Shop By Category</h2>
            <p className="section-subtitle">
              From aromatic stone-ground spices and pure single-origin powders to traditional wood cold-pressed oils and native heirloom grains, 
              discover pure staples crafted for wholesome living.
            </p>
            <div className="cat-header-badges">
              <span className="cat-header-tag">✨ Stone-Ground Spices</span>
              <span className="cat-header-tag">🪵 Wood-Pressed &lt;40°C</span>
              <span className="cat-header-tag">🌱 100% Farm-Direct</span>
              <span className="cat-header-tag">🛡️ Zero Additives</span>
            </div>
          </div>

          <div className="categories-bento-showcase">
            {/* Top Row: Two Grande Feature Showcase Cards */}
            <div className="cat-bento-row-grande">
              {CATEGORIES.filter(c => c.isFeatured).map((cat) => (
                <div
                  key={cat.id || cat.name}
                  className={`cat-bento-card-grande cat-grande-${cat.id}`}
                  onClick={() => {
                    setActiveCategory(cat.filterParam || cat.name);
                  }}
                >
                  <div className="cat-grande-ambient-glow" style={{ background: cat.accentGlow }} />
                  
                  <div className="cat-grande-content">
                    <div className="cat-grande-badges-wrap">
                      <span className="cat-grande-badge">
                        {cat.iconType === 'droplets' ? <Droplets size={14} /> : <Sparkles size={14} />}
                        {cat.badge}
                      </span>
                      {cat.origin && <span className="cat-origin-badge">{cat.origin}</span>}
                    </div>

                    <div className="cat-grande-titles">
                      <span className="cat-tamil-title">{cat.tamilName}</span>
                      <h3 className="cat-grande-heading">{cat.name}</h3>
                    </div>

                    <p className="cat-grande-desc">{cat.desc}</p>

                    <div className="cat-ingredient-pills">
                      {cat.highlights?.map((hl, idx) => (
                        <span key={idx} className="cat-pill-item">
                          <CheckCircle2 size={12} />
                          {hl}
                        </span>
                      ))}
                    </div>

                    <div className="cat-grande-footer">
                      <span className="cat-grande-items-count">{cat.items}</span>
                      <button 
                        className="btn-cat-grande-cta"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveCategory(cat.filterParam || cat.name);
                          scrollToSection('products');
                        }}
                      >
                        <span>Explore Collection</span>
                        <ArrowRight size={15} />
                      </button>
                    </div>
                  </div>

                  <div className="cat-grande-visual">
                    <div className="cat-visual-canvas">
                      {cat.image && (
                        <img 
                          src={cat.image} 
                          alt={cat.name} 
                          className="cat-grande-primary-img" 
                          loading="lazy" 
                        />
                      )}
                      {cat.secondaryImg && (
                        <img 
                          src={cat.secondaryImg} 
                          alt="" 
                          className="cat-grande-secondary-img" 
                          loading="lazy" 
                        />
                      )}
                    </div>
                    <div className="cat-floating-micro-badge">
                      <ShieldCheck size={14} />
                      <span>{cat.id === 'oils' ? 'Vaagai Chekku Extracted' : 'Stone-Ground at 120 RPM'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Row: 4 Heritage Bento Cards */}
            <div className="cat-bento-row-heritage">
              {CATEGORIES.filter(c => !c.isFeatured).map((cat, idx) => (
                <div
                  key={cat.id || cat.name}
                  className={`cat-bento-card-compact cat-compact-${cat.id}`}
                  onClick={() => {
                    setActiveCategory(cat.filterParam || cat.name);
                    scrollToSection('products');
                  }}
                >
                  <div className="cat-compact-header">
                    <div className="cat-compact-icon-emblem">
                      {cat.iconType === 'flame' && <Flame size={20} />}
                      {cat.iconType === 'wheat' && <Wheat size={20} />}
                      {cat.iconType === 'sun' && <Sun size={20} />}
                      {cat.iconType === 'leaf' && <Leaf size={20} />}
                    </div>
                    <div className="cat-compact-meta-pill">
                      <span className="cat-compact-meta-dot" />
                      <span>{cat.badge}</span>
                    </div>
                  </div>

                  <div className="cat-compact-body">
                    <div className="cat-compact-title-wrap">
                      <span className="cat-compact-tamil-label">{cat.tamilName}</span>
                      <h4 className="cat-compact-heading">{cat.name}</h4>
                      <div className="cat-compact-divider" />
                    </div>
                    <p className="cat-compact-desc">{cat.desc}</p>
                    
                    <div className="cat-compact-highlights">
                      {cat.highlights?.slice(0, 3).map((hl, hIdx) => (
                        <span key={hIdx} className="cat-compact-pill">{hl}</span>
                      ))}
                    </div>
                  </div>

                  <div className="cat-compact-footer">
                    <span className="cat-compact-count">{cat.items}</span>
                    <button 
                      type="button"
                      className="cat-compact-action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveCategory(cat.filterParam || cat.name);
                        scrollToSection('products');
                      }}
                    >
                      <span>Shop Now</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. WHY CHOOSE VENTHULIR (Numbered Value Cards)
      ───────────────────────────────────────────────────────────── */}
      <section className="section-why-choose">
        <div className="container">
          <div className="section-header text-center">
            <span className="section-eyebrow">Our Core Principles</span>
            <h2 className="section-headline">Why Choose Venthulir?</h2>
            <p className="section-subtitle">
              Every drop of oil, grain of rice, and pinch of spice reflects our commitment to 
              uncompromised purity and ethical farming.
            </p>
          </div>

          <div className="why-choose-grid">
            <div className="why-card">
              <div className="why-card-top">
                <div className="why-icon-bubble">
                  <Leaf size={20} />
                </div>
                <span className="why-number">01</span>
              </div>
              <span className="why-card-tag">Ethical Agriculture</span>
              <h3 className="why-title">Direct Farm Sourcing</h3>
              <p className="why-desc">
                We work directly with 50+ certified organic farmers across Tamil Nadu, 
                eliminating middlemen and ensuring fair livelihoods.
              </p>
              <div className="why-card-highlight">
                <CheckCircle2 size={13} />
                <span>50+ Partner Native Farms</span>
              </div>
            </div>

            <div className="why-card">
              <div className="why-card-top">
                <div className="why-icon-bubble">
                  <Droplets size={20} />
                </div>
                <span className="why-number">02</span>
              </div>
              <span className="why-card-tag">Artisan Extraction</span>
              <h3 className="why-title">Traditional Chekku Press</h3>
              <p className="why-desc">
                Extracted using native Vaagai wood mortars under 40°C. 
                Natural enzymes, vitamins, and authentic aroma remain untouched.
              </p>
              <div className="why-card-highlight">
                <CheckCircle2 size={13} />
                <span>Zero Heat &bull; Native Vaagai Wood</span>
              </div>
            </div>

            <div className="why-card">
              <div className="why-card-top">
                <div className="why-icon-bubble">
                  <ShieldCheck size={20} />
                </div>
                <span className="why-number">03</span>
              </div>
              <span className="why-card-tag">Clean Label Purity</span>
              <h3 className="why-title">Zero Chemicals &amp; Additives</h3>
              <p className="why-desc">
                No chemical refining, bleaching, artificial fragrances, or paraffin. 
                100% single-origin natural goodness in every batch.
              </p>
              <div className="why-card-highlight">
                <CheckCircle2 size={13} />
                <span>Lab-Tested Zero Contaminants</span>
              </div>
            </div>

            <div className="why-card">
              <div className="why-card-top">
                <div className="why-icon-bubble">
                  <Package size={20} />
                </div>
                <span className="why-number">04</span>
              </div>
              <span className="why-card-tag">Peak Freshness</span>
              <h3 className="why-title">Fresh Small-Batch Packing</h3>
              <p className="why-desc">
                Bottled and packed fresh to order in food-grade, leak-proof containers 
                to preserve peak nutritional potency.
              </p>
              <div className="why-card-highlight">
                <CheckCircle2 size={13} />
                <span>Food-Grade UV-Safe Seal</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. FROM FARM TO HOME (4-Step Process)
      ───────────────────────────────────────────────────────────── */}
      <section className="section-process">
        <div className="container">
          <div className="section-header text-center">
            <span className="section-eyebrow">The Journey of Purity</span>
            <h2 className="section-headline">From Farm to Your Kitchen</h2>
            <p className="section-subtitle">
              A transparent, traditional journey from South Indian soil to your family dining table.
            </p>
          </div>

          <div className="process-timeline-grid">
            <div className="process-step-card">
              <div className="step-badge">Step 01</div>
              <div className="step-icon-wrap">
                <Sun size={24} />
              </div>
              <h4 className="step-title">Heirloom Cultivation</h4>
              <p className="step-desc">
                Non-GMO heirloom seeds nurtured organically in sun-drenched fertile soil.
              </p>
            </div>

            <div className="process-step-card">
              <div className="step-badge">Step 02</div>
              <div className="step-icon-wrap">
                <Droplets size={24} />
              </div>
              <h4 className="step-title">Slow Wood Pressing</h4>
              <p className="step-desc">
                Chekku wooden pestles crush oilseeds at low speeds without frictional heat.
              </p>
            </div>

            <div className="process-step-card">
              <div className="step-badge">Step 03</div>
              <div className="step-icon-wrap">
                <Award size={24} />
              </div>
              <h4 className="step-title">Lab-Tested Purity</h4>
              <p className="step-desc">
                Every batch is certified for zero chemical residues and authentic nutritional value.
              </p>
            </div>

            <div className="process-step-card">
              <div className="step-badge">Step 04</div>
              <div className="step-icon-wrap">
                <Truck size={24} />
              </div>
              <h4 className="step-title">Doorstep Dispatch</h4>
              <p className="step-desc">
                Carefully cushioned and swiftly delivered anywhere across India within 3–5 days.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          7. BRAND STORY & HERITAGE (Editorial 2-Column on Warm Ivory)
      ───────────────────────────────────────────────────────────── */}
      <section id="story" className="section-story">
        <div className="container">
          <div className="story-layout-grid">
            
            {/* Visual Column */}
            <div className="story-visual-side">
              <div className="story-photo-frame">
                <img
                  src="/story-traditional.jpg"
                  alt="Traditional Wood Press Chekku at Tamil Nadu Farm"
                  className="story-photo"
                />
              </div>

              {/* Floating Highlight Box */}
              <div className="story-stat-card">
                <div className="stat-unit">
                  <div className="stat-number">50+</div>
                  <div className="stat-desc">Partner Farms</div>
                </div>
                <div className="stat-sep" />
                <div className="stat-unit">
                  <div className="stat-number">100%</div>
                  <div className="stat-desc">Wood Pressed</div>
                </div>
                <div className="stat-sep" />
                <div className="stat-unit">
                  <div className="stat-number">0%</div>
                  <div className="stat-desc">Chemicals</div>
                </div>
              </div>
            </div>

            {/* Narrative Column */}
            <div className="story-text-side">
              <span className="section-eyebrow">Our Philosophy</span>
              <h2 className="section-headline">
                Rooted in Tradition. <br />
                Driven by Uncompromised Purity.
              </h2>

              <p className="story-body-p">
                At Venthulir, we believe modern food production has lost touch with what truly nourishes our bodies. 
                Mass-produced supermarket oils are treated with harsh chemicals, high heat, and bleaching agents that strip away life-giving vitamins.
              </p>

              <p className="story-body-p">
                We revived the ancient <strong>Chekku</strong> (wooden pestle press) tradition. By partnering directly 
                with organic farmers across Tamil Nadu, we ensure fair prices for growers and unadulterated goodness 
                for your kitchen table.
              </p>

              <div className="story-features-list">
                <div className="story-feature-row">
                  <div className="story-bullet-dot">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <strong>Direct Farmer Partnerships:</strong> We eliminate middlemen so local farming communities thrive.
                  </div>
                </div>

                <div className="story-feature-row">
                  <div className="story-bullet-dot">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <strong>Cold Mechanical Pressing:</strong> Extracted under 40°C to preserve unrefined antioxidants and rich natural aroma.
                  </div>
                </div>

                <div className="story-feature-row">
                  <div className="story-bullet-dot">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <strong>Small Batch Freshness:</strong> Bottled fresh in food-grade packaging right after settling and filtering.
                  </div>
                </div>
              </div>

              <div className="story-cta-wrap">
                <button
                  className="btn-hero-primary"
                  onClick={() => scrollToSection('products')}
                >
                  <span>Shop Pure Harvest</span>
                  <ArrowRight size={17} />
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          8. CUSTOMER REVIEWS & TESTIMONIALS (Carousel)
      ───────────────────────────────────────────────────────────── */}
      <section id="reviews" className="section-reviews">
        <div className="container">
          
          <div className="reviews-header-bar">
            <div>
              <span className="section-eyebrow">Verified Feedback</span>
              <h2 className="section-headline">Loved by 5,000+ Kitchens</h2>
            </div>

            <div className="carousel-nav-arrows">
              <button
                className="carousel-arrow-btn"
                onClick={() => setCurrentReview((prev) => (prev - 1 + REVIEWS.length) % REVIEWS.length)}
                aria-label="Previous review"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                className="carousel-arrow-btn"
                onClick={() => setCurrentReview((prev) => (prev + 1) % REVIEWS.length)}
                aria-label="Next review"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="reviews-cards-grid">
            {REVIEWS.map((rev, index) => {
              const offset = (index - currentReview + REVIEWS.length) % REVIEWS.length;
              const isPrimary = offset === 0;
              const isSecondary = offset === 1 || offset === REVIEWS.length - 1;

              return (
                <div
                  key={index}
                  className={`review-card ${isPrimary ? 'primary-card' : ''} ${isSecondary ? 'secondary-card' : ''}`}
                  onClick={() => setCurrentReview(index)}
                >
                  <div className="review-top-row">
                    <StarRating count={rev.rating} />
                    <Quote size={24} className="quote-watermark" />
                  </div>

                  <p className="review-comment">"{rev.text}"</p>

                  <div className="reviewer-profile">
                    <div className="reviewer-avatar">{rev.name[0]}</div>
                    <div className="reviewer-meta">
                      <div className="reviewer-name">{rev.name}</div>
                      <div className="reviewer-role">{rev.role} • {rev.city}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dots Indicator */}
          <div className="reviews-dot-nav">
            {REVIEWS.map((_, i) => (
              <button
                key={i}
                className={`dot-pill ${i === currentReview ? 'active' : ''}`}
                onClick={() => setCurrentReview(i)}
                aria-label={`Go to review ${i + 1}`}
              />
            ))}
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          9. FAQ & DIRECT INQUIRY
      ───────────────────────────────────────────────────────────── */}
      <section id="faq" className="section-faq-contact">
        <div className="container">
          <div className="faq-contact-grid">
            
            {/* Left: FAQ Accordion */}
            <div className="faq-column">
              <span className="section-eyebrow">Got Questions?</span>
              <h2 className="section-headline">Frequently Asked Questions</h2>
              
              <div className="accordion-list">
                {FAQS.map((faq, index) => {
                  const isOpen = openFaq === index;
                  return (
                    <div key={index} className={`accordion-item ${isOpen ? 'is-open' : ''}`}>
                      <button
                        className="accordion-trigger"
                        onClick={() => setOpenFaq(isOpen ? null : index)}
                        aria-expanded={isOpen}
                      >
                        <span className="accordion-question">{faq.q}</span>
                        <ChevronDown size={18} className="accordion-arrow" />
                      </button>
                      <div className="accordion-collapse">
                        <p className="accordion-answer">{faq.a}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Contact & Bulk Inquiry Form */}
            <div id="contact" className="contact-column">
              <span className="section-eyebrow">Get In Touch</span>
              <h2 className="section-headline">Inquiries &amp; Bulk Orders</h2>

              <div className="contact-card-box">
                {formStatus === 'success' ? (
                  <div className="contact-success-panel">
                    <div className="success-icon-wrap">
                      <CheckCircle2 size={36} />
                    </div>
                    <h3>Thank you for reaching out!</h3>
                    <p>Your message has been sent. Our team will get back to you within 24 hours.</p>
                    <button
                      className="btn-hero-primary"
                      onClick={() => setFormStatus('idle')}
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="inquiry-form">
                    <div className="form-fields-row">
                      <div className="form-field-unit">
                        <label>Your Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Ramesh Kumar"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                      <div className="form-field-unit">
                        <label>Email Address *</label>
                        <input
                          type="email"
                          required
                          placeholder="e.g. ramesh@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="form-field-unit">
                      <label>Phone Number (Optional)</label>
                      <input
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>

                    <div className="form-field-unit">
                      <label>Your Message / Requirement *</label>
                      <textarea
                        required
                        rows={4}
                        placeholder="Tell us what products or questions you have..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      />
                    </div>

                    {formStatus === 'error' && (
                      <p className="form-error-msg">
                        Unable to send right now. Please try again or reach us on WhatsApp.
                      </p>
                    )}

                    <button
                      type="submit"
                      className="btn-submit-form"
                      disabled={formStatus === 'submitting'}
                    >
                      {formStatus === 'submitting' ? (
                        <span>Sending Message...</span>
                      ) : (
                        <>
                          <span>Submit Inquiry</span>
                          <Send size={15} />
                        </>
                      )}
                    </button>
                  </form>
                )}

                <div className="contact-quick-support">
                  <div className="support-item">
                    <MessageSquare size={16} className="support-icon" />
                    <span>WhatsApp: <strong>+91 87784 76414</strong></span>
                  </div>
                  <div className="support-item">
                    <Clock size={16} className="support-icon" />
                    <span>Fast Response: Within 24h</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          10. FINAL CTA BANNER (Rich Forest Green with Gold Accent)
      ───────────────────────────────────────────────────────────── */}
      <section className="section-final-cta">
        <div className="container">
          <div className="final-cta-card">
            <div className="final-cta-content">
              <span className="final-cta-eyebrow">Pure • Traditional • Honest</span>
              <h2 className="final-cta-heading">
                Bring the Goodness of Tamil Nadu Farms Home.
              </h2>
              <p className="final-cta-sub">
                Pure ingredients. Honest farming. Traditional goodness for your entire family. 
                Experience the difference today with free delivery on orders above ₹499.
              </p>
              <div className="final-cta-actions">
                <button
                  className="btn-final-primary"
                  onClick={() => scrollToSection('products')}
                >
                  <span>Explore Our Products</span>
                  <ArrowRight size={18} />
                </button>
                <a
                  href="https://wa.me/918778476414"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-final-secondary"
                >
                  <span>Order on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          8. QUICK VIEW MODAL
      ───────────────────────────────────────────────────────────── */}
      {quickViewProduct && (
        <div className="quickview-overlay" onClick={handleCloseQuickView}>
          <div className="quickview-modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              className="quickview-close-btn"
              onClick={handleCloseQuickView}
              aria-label="Close dialog"
            >
              <X size={18} />
            </button>

            <div className="quickview-grid">
              
              {/* Product Gallery with Hover Zoom Magnifier */}
              <div className="quickview-gallery-side">
                <div 
                  className={`quickview-main-image-wrap ${zoomState.isZoomed ? 'is-zoomed' : ''}`}
                  onMouseMove={handleZoomMouseMove}
                  onMouseLeave={handleZoomMouseLeave}
                >
                  {qvImages[activeImgIndex] ? (
                    <img 
                      src={qvImages[activeImgIndex]} 
                      alt={quickViewProduct.name}
                      style={{
                        transformOrigin: `${zoomState.x}% ${zoomState.y}%`,
                        transform: zoomState.isZoomed ? 'scale(2.35)' : 'scale(1)',
                        transition: zoomState.isZoomed ? 'transform 0.08s ease-out' : 'transform 0.3s ease',
                      }} 
                    />
                  ) : (
                    <div className="quickview-placeholder">
                      {quickViewProduct.name[0]}
                    </div>
                  )}

                  <div className={`qv-zoom-badge ${zoomState.isZoomed ? 'hide' : ''}`}>
                    <Search size={12} />
                    <span>Hover to Zoom</span>
                  </div>
                </div>

                {qvImages.length > 1 && (
                  <div className="quickview-thumbs-row">
                    {qvImages.map((img, idx) => (
                      <button
                        key={idx}
                        className={`thumb-btn ${idx === activeImgIndex ? 'is-selected' : ''}`}
                        onClick={() => setActiveImgIndex(idx)}
                      >
                        <img src={img} alt="" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Details & Actions */}
              <div className="quickview-details-side">
                {quickViewProduct.badge && (
                  <span className="qv-badge-pill">{quickViewProduct.badge}</span>
                )}
                <div className="qv-category-label">{quickViewProduct.category}</div>
                <h2 className="qv-product-name">{quickViewProduct.name}</h2>

                <div className="qv-rating-strip">
                  <StarRating count={5} />
                  <span className="qv-rating-text">4.9 (500+ verified ratings)</span>
                </div>

                <div className="qv-price-tag">₹{qvPrice}</div>

                <p className="qv-description-text">{quickViewProduct.description}</p>

                {/* Variants Selector */}
                {quickViewProduct.variants?.length > 0 && (
                  <div className="qv-variant-group">
                    <label className="qv-field-label">Available Packaging / Sizes:</label>
                    <div className="qv-variants-row">
                      {quickViewProduct.variants.map((v) => (
                        <button
                          key={v.label}
                          className={`qv-variant-btn ${selectedVariant?.label === v.label ? 'active' : ''}`}
                          onClick={() => setSelectedVariant(v)}
                        >
                          <span className="var-label">{v.label}</span>
                          <span className="var-price">₹{v.price}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity Selector */}
                <div className="qv-quantity-group">
                  <label className="qv-field-label">Quantity:</label>
                  <div className="qv-quantity-stepper">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      aria-label="Decrease quantity"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="stepper-value">{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => q + 1)}
                      aria-label="Increase quantity"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                <div className="qv-subtotal-row">
                  <span>Total Amount:</span>
                  <strong>₹{qvPrice * quantity}</strong>
                </div>

                <div className="qv-action-buttons-row">
                  <button
                    className="btn-qv-add-cart"
                    onClick={() => {
                      addToCart(quickViewProduct, selectedVariant, quantity);
                      handleCloseQuickView();
                    }}
                    type="button"
                  >
                    <ShoppingCart size={17} />
                    <span>Add To Cart</span>
                  </button>

                  <button
                    className="btn-qv-buy-now"
                    onClick={() => {
                      addToCart(quickViewProduct, selectedVariant, quantity);
                      handleCloseQuickView();
                      setIsCartOpen(false);
                      const price = qvPrice * quantity;
                      const shippingFee = price >= 499 ? 0 : 49;
                      if (handleCheckout) {
                        handleCheckout({
                          grandTotal: price + shippingFee,
                          discount: 0,
                          appliedCoupon: null,
                          shippingFee
                        });
                      } else {
                        const checkoutBtn = document.querySelector('.checkout-cta') || document.querySelector('.btn-checkout');
                        if (checkoutBtn) checkoutBtn.click();
                      }
                    }}
                    type="button"
                  >
                    <span>Buy Now</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
