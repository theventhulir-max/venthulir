import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import { requireAdmin, verifyToken } from '@/lib/auth';
import { INITIAL_PRODUCTS } from '@/data/products';
import { cache, invalidateProductCache } from '@/lib/cache';

const PUBLIC_PROJECTION = 'name slug productCode price originalPrice discountPercent category badge imageUrl images currentStock variants rating reviewsCount createdAt';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const badge = searchParams.get('badge');
    const sort = searchParams.get('sort') || 'newest';
    const isAdminQuery = searchParams.get('admin') === 'true';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || (isAdminQuery ? '100' : '12'), 10)));

    // Check if user is authenticated admin or requested admin mode
    let userIsAdmin = false;
    const authUser = verifyToken(request);
    if (authUser && authUser.isAdmin) {
      userIsAdmin = true;
    }

    const isPublicQuery = !userIsAdmin && !isAdminQuery;
    const cacheKey = `products:list:cat:${category || 'all'}:b:${badge || 'none'}:s:${search || 'none'}:sort:${sort}:p:${page}:l:${limit}`;

    // 1. Check in-memory cache for fast sub-50ms public responses
    if (isPublicQuery) {
      const cached = cache.get(cacheKey);
      if (cached) {
        return NextResponse.json(cached, {
          headers: {
            'X-Cache': 'HIT',
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
          }
        });
      }
    }

    let dbConnected = true;
    try {
      await connectDB();
    } catch {
      dbConnected = false;
    }

    if (dbConnected) {
      let query = {};

      if (category && category !== 'All' && category !== 'all') {
        query.category = { $regex: new RegExp(`^${category.trim()}$`, 'i') };
      }

      if (search && search.trim()) {
        const cleanSearch = search.trim();
        query.$or = [
          { name: { $regex: cleanSearch, $options: 'i' } },
          { productCode: { $regex: cleanSearch, $options: 'i' } },
          { description: { $regex: cleanSearch, $options: 'i' } }
        ];
      }

      if (badge === 'New Arrival') {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        query.$or = [
          { badge: 'New Arrival' },
          { createdAt: { $gte: thirtyDaysAgo } }
        ];
      } else if (badge) {
        query.badge = badge;
      }

      // Sort config
      let sortObj = { createdAt: -1 };
      if (sort === 'price-asc') sortObj = { price: 1 };
      else if (sort === 'price-desc') sortObj = { price: -1 };
      else if (sort === 'name') sortObj = { name: 1 };

      let q = Product.find(query);
      if (isPublicQuery) {
        q = q.select(PUBLIC_PROJECTION);
      }

      const [products, count] = await Promise.all([
        q.sort(sortObj).skip((page - 1) * limit).limit(limit).lean(),
        Product.countDocuments(query)
      ]);

      // Map image fallbacks based on category/name ONLY if image is missing
      const formattedProducts = products.map(p => {
        let rawImg = p.imageUrl || (p.images && p.images[0]);
        let img = rawImg;
        if (!img || (typeof img === 'string' && img.trim() === '')) {
          const name = (p.name || '').toLowerCase();
          const cat = (p.category || '').toLowerCase();
          if (name.includes('turmeric') || name.includes('manjal') || name.includes('yellow')) img = '/assets/hero/turmeric.png';
          else if (name.includes('chilli') || name.includes('chili') || name.includes('red')) img = '/assets/hero/chilli.png';
          else if (name.includes('coriander') || name.includes('mallie')) img = '/assets/hero/coriander.png';
          else if (name.includes('sambar') || name.includes('masala')) img = '/assets/hero/sambar.png';
          else if (name.includes('coconut')) img = '/assets/hero/oil_coconut.png';
          else if (name.includes('groundnut')) img = '/assets/hero/oil_groundnut.png';
          else if (name.includes('gingelly') || name.includes('sesame')) img = '/assets/hero/oil_gingelly.png';
          else if (name.includes('oil') || cat.includes('oil')) img = '/assets/hero/oil_sunflower.png';
          else img = '/assets/hero/turmeric.png';
        }
        return {
          ...p,
          _id: p._id.toString(),
          id: p._id.toString(),
          imageUrl: img,
          image: img,
          images: [img]
        };
      });

      const responsePayload = {
        products: formattedProducts,
        totalPages: Math.ceil(count / limit) || 1,
        currentPage: page,
        totalItems: count,
        hasNextPage: page < Math.ceil(count / limit),
        hasPreviousPage: page > 1,
      };

      if (isPublicQuery && (formattedProducts.length > 0 || count > 0)) {
        cache.set(cacheKey, responsePayload, 60); // 60s TTL
      }

      return NextResponse.json(responsePayload, {
        headers: {
          'X-Cache': 'MISS',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      });
    }

    // High-performance instant fallback to initial catalog
    let filtered = [...INITIAL_PRODUCTS];
    if (category && category !== 'All' && category !== 'all') {
      filtered = filtered.filter(p => p.category?.toLowerCase() === category.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(p => p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q));
    }
    if (badge) {
      filtered = filtered.filter(p => p.badge?.toLowerCase() === badge.toLowerCase());
    }

    const totalItems = filtered.length;
    const paginated = filtered.slice((page - 1) * limit, page * limit);

    const fallbackPayload = {
      products: paginated,
      totalPages: Math.ceil(totalItems / limit) || 1,
      currentPage: page,
      totalItems,
      hasNextPage: page < Math.ceil(totalItems / limit),
      hasPreviousPage: page > 1,
    };

    return NextResponse.json(fallbackPayload, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' }
    });
  } catch (err) {
    console.error('API Products Error:', err);
    return NextResponse.json({
      products: INITIAL_PRODUCTS,
      totalPages: 1,
      currentPage: 1,
      totalItems: INITIAL_PRODUCTS.length
    });
  }
}

export async function POST(request) {
  try {
    const auth = requireAdmin(request);
    if (auth.error) {
      return NextResponse.json({ msg: auth.error }, { status: auth.status });
    }

    await connectDB();
    const body = await request.json();

    if (body.initialStock && !body.currentStock && body.currentStock !== 0) {
      body.currentStock = body.initialStock;
    }

    const newProduct = new Product(body);
    await newProduct.save();

    // Purge catalog caches immediately upon creation
    invalidateProductCache();

    return NextResponse.json(newProduct, { status: 201 });
  } catch (err) {
    console.error('API Create Product Error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
