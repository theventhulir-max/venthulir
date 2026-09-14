const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function compressAllUploads() {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    console.log('Uploads dir not found');
    return;
  }

  const files = fs.readdirSync(uploadsDir);
  console.log(`Found ${files.length} files in uploads:`, files);

  for (const file of files) {
    const fullPath = path.join(uploadsDir, file);
    const stat = fs.statSync(fullPath);
    console.log(`Processing ${file} (Original Size: ${(stat.size / 1024 / 1024).toFixed(2)} MB)...`);

    const tempPath = path.join(uploadsDir, `temp-${file}`);
    try {
      await sharp(fullPath)
        .resize({ width: 800, height: 800, fit: 'inside', withoutEnlargement: true })
        .png({ quality: 80, compressionLevel: 9 })
        .toFile(tempPath);

      const newStat = fs.statSync(tempPath);
      console.log(`--> Compressed size: ${(newStat.size / 1024).toFixed(1)} KB (Saved ${(100 - (newStat.size / stat.size) * 100).toFixed(1)}%)`);

      fs.unlinkSync(fullPath);
      fs.renameSync(tempPath, fullPath);
    } catch (e) {
      console.error(`Error compressing ${file}:`, e);
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    }
  }

  console.log('All uploads compressed successfully!');
}

compressAllUploads();
