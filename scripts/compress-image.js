/* eslint-disable @typescript-eslint/no-require-imports */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, '../public/images/hero-bg.JPG');
const destPath = path.join(__dirname, '../public/images/hero-bg.webp');

console.log('Starting high-compression image resize and conversion...');

if (!fs.existsSync(srcPath)) {
  console.error(`Error: Source file does not exist at ${srcPath}`);
  process.exit(1);
}

const originalSize = fs.statSync(srcPath).size;
console.log(`Original image size: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);

sharp(srcPath)
  .resize(1920) // Resize width to 1920px (maintains aspect ratio)
  .webp({ quality: 65 }) // Faint background image needs less quality
  .toFile(destPath)
  .then((info) => {
    const compressedSize = fs.statSync(destPath).size;
    console.log(`Successfully compressed to WebP!`);
    console.log(`Compressed image size: ${(compressedSize / 1024).toFixed(2)} KB`);
    console.log(`Size reduction: ${((1 - compressedSize / originalSize) * 100).toFixed(2)}%`);
  })
  .catch((err) => {
    console.error('Compression failed:', err);
  });
