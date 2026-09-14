const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

async function run() {
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
  console.log('Connected to MongoDB');

  const products = await mongoose.connection.collection('ProductDetails').find({}).toArray();
  console.log(`Found ${products.length} products in DB.`);

  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  for (const p of products) {
    let changed = false;
    let newImageUrl = p.imageUrl;
    let newImages = Array.isArray(p.images) ? [...p.images] : [];

    if (typeof p.imageUrl === 'string' && p.imageUrl.startsWith('data:image')) {
      const match = p.imageUrl.match(/^data:image\/(\w+);base64,(.+)$/);
      const ext = (match && match[1] === 'png') ? 'png' : 'jpg';
      const base64Data = match ? match[2] : p.imageUrl.replace(/^data:image\/\w+;base64,/, '');
      const filename = `prod-${(p.name || 'item').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}.${ext}`;
      const filePath = path.join(uploadDir, filename);
      fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
      newImageUrl = `/uploads/${filename}`;
      newImages = [newImageUrl];
      changed = true;
      console.log(`Extracted base64 image for ${p.name} -> ${newImageUrl}`);
    }

    // Check images array for base64
    newImages = newImages.map((img, i) => {
      if (typeof img === 'string' && img.startsWith('data:image')) {
        const match = img.match(/^data:image\/(\w+);base64,(.+)$/);
        const ext = (match && match[1] === 'png') ? 'png' : 'jpg';
        const base64Data = match ? match[2] : img.replace(/^data:image\/\w+;base64,/, '');
        const filename = `prod-${(p.name || 'item').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${i}-${Date.now()}.${ext}`;
        const filePath = path.join(uploadDir, filename);
        fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
        changed = true;
        return `/uploads/${filename}`;
      }
      return img;
    });

    if (changed) {
      await mongoose.connection.collection('ProductDetails').updateOne(
        { _id: p._id },
        {
          $set: {
            imageUrl: newImageUrl,
            images: newImages.length > 0 ? newImages : [newImageUrl]
          }
        }
      );
      console.log(`Updated product in DB: ${p.name}`);
    }
  }

  // Fetch updated list to export to INITIAL_PRODUCTS
  const updatedProducts = await mongoose.connection.collection('ProductDetails').find({}).toArray();
  const cleanExport = updatedProducts.map(p => ({
    _id: p._id.toString(),
    id: p._id.toString(),
    productCode: p.productCode || `VNT-${Math.floor(100000 + Math.random() * 900000)}`,
    name: p.name,
    category: p.category || 'Spices',
    badge: p.badge || '',
    rating: p.rating || 4.9,
    reviewsCount: p.reviewsCount || 120,
    price: p.price || 0,
    originalPrice: p.originalPrice || Math.round((p.price || 100) * 1.25),
    discountPercent: p.discountPercent || 20,
    imageUrl: p.imageUrl || (p.images && p.images[0]) || '/assets/hero/turmeric.png',
    images: (p.images && p.images.length > 0) ? p.images : [p.imageUrl || '/assets/hero/turmeric.png'],
    origin: p.origin || 'Tamil Nadu Farms',
    process: p.process || 'Traditional stone-ground / cold-pressed',
    description: p.description || '',
    variants: p.variants && p.variants.length > 0 ? p.variants.map(v => ({
      _id: v._id ? v._id.toString() : undefined,
      label: v.label,
      price: v.price,
      contents: v.contents || ''
    })) : [
      { label: 'Standard Pack', price: p.price || 0, contents: 'Standard Pack' }
    ],
    inStock: (p.currentStock === undefined || p.currentStock > 0),
    currentStock: p.currentStock !== undefined ? p.currentStock : 50,
    initialStock: p.initialStock !== undefined ? p.initialStock : 50,
    createdAt: p.createdAt ? p.createdAt.toISOString() : new Date().toISOString()
  }));

  console.log(`\nGenerated ${cleanExport.length} synced products for unified catalog.`);
  fs.writeFileSync(
    path.join(process.cwd(), 'src', 'data', 'products.json'),
    JSON.stringify(cleanExport, null, 2)
  );
  console.log('Saved to src/data/products.json');

  process.exit(0);
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
