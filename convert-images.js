import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const dir = path.join(process.cwd(), 'src/assets/works');

async function convert() {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg')) {
      const input = path.join(dir, file);
      const output = path.join(dir, file.replace(/\.[^.]+$/, '.webp'));
      await sharp(input)
        .webp({ quality: 80, effort: 6 })
        .toFile(output);
      console.log(`Converted ${file} to WebP`);
      
      // Delete the original file
      fs.unlinkSync(input);
    }
  }
}

convert().catch(console.error);
