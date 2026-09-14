import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { requireAdmin } from '@/lib/auth';
import sharp from 'sharp';

export async function POST(request) {
  try {
    const auth = requireAdmin(request);
    if (auth.error) {
      return NextResponse.json({ msg: auth.error }, { status: auth.status });
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    const mimeType = file.type || '';
    if (!mimeType.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are permitted' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const inputBuffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadsDir, { recursive: true });

    // Optimize and compress image using sharp
    let compressedBuffer;
    let ext = '.webp';

    if (mimeType === 'image/png' || mimeType === 'image/svg+xml') {
      // Preserve crisp PNG transparency with high compression
      ext = '.png';
      compressedBuffer = await sharp(inputBuffer)
        .resize({ width: 800, height: 800, fit: 'inside', withoutEnlargement: true })
        .png({ quality: 82, compressionLevel: 9 })
        .toBuffer();
    } else {
      // Convert standard photos (JPEG, WebP, AVIF, HEIC) to lightweight WebP
      ext = '.webp';
      compressedBuffer = await sharp(inputBuffer)
        .resize({ width: 800, height: 800, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer();
    }

    const filename = `prod-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}${ext}`;
    const filePath = path.join(uploadsDir, filename);

    await fs.writeFile(filePath, compressedBuffer);

    const relativeUrl = `/uploads/${filename}`;
    return NextResponse.json({ 
      url: relativeUrl, 
      success: true, 
      sizeKb: Math.round(compressedBuffer.length / 1024) 
    }, { status: 201 });
  } catch (err) {
    console.error('Image Upload & Optimization Error:', err);
    return NextResponse.json({ error: 'Failed to process and optimize image' }, { status: 500 });
  }
}
