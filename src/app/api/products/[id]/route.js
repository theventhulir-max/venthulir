import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import { requireAdmin } from '@/lib/auth';
import { invalidateProductCache } from '@/lib/cache';

const STOCK_FIELDS_EXCLUDE = '-initialStock -updatedAt';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const query = /^[0-9a-fA-F]{24}$/.test(id) ? { _id: id } : { slug: id };

    const product = await Product.findOne(query).select(STOCK_FIELDS_EXCLUDE).lean();
    if (!product) {
      return NextResponse.json({ msg: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' }
    });
  } catch (err) {
    console.error('API Get Product Detail Error:', err);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const auth = requireAdmin(request);
    if (auth.error) {
      return NextResponse.json({ msg: auth.error }, { status: auth.status });
    }

    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const product = await Product.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!product) {
      return NextResponse.json({ msg: 'Product not found' }, { status: 404 });
    }

    // Purge cached catalog
    invalidateProductCache();

    return NextResponse.json(product);
  } catch (err) {
    console.error('API Update Product Error:', err);
    return NextResponse.json({ error: err.message || 'Server Error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = requireAdmin(request);
    if (auth.error) {
      return NextResponse.json({ msg: auth.error }, { status: auth.status });
    }

    await connectDB();
    const { id } = await params;
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return NextResponse.json({ msg: 'Product not found' }, { status: 404 });
    }

    // Purge cached catalog
    invalidateProductCache();

    return NextResponse.json({ msg: 'Product deleted successfully' });
  } catch (err) {
    console.error('API Delete Product Error:', err);
    return NextResponse.json({ error: err.message || 'Server Error' }, { status: 500 });
  }
}
