import sharp from 'sharp';
import { writeFile, mkdir } from 'node:fs/promises';
await mkdir('build-resources', { recursive: true });
const source = 'build-resources/wordnest-source.png';
await sharp(source).resize(512, 512).png().toFile('build-resources/icon.png');
await sharp(source).resize(256, 256).png().toFile('public/wordnest-icon.png');
const sizes = [16, 24, 32, 48, 64, 128, 256];
const frames = await Promise.all(
  sizes.map((size) => sharp(source).resize(size, size).png().toBuffer()),
);
const header = Buffer.alloc(6 + sizes.length * 16);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
frames.forEach((frame, index) => {
  const entry = 6 + index * 16;
  header[entry] = sizes[index] % 256;
  header[entry + 1] = sizes[index] % 256;
  header.writeUInt16LE(1, entry + 4);
  header.writeUInt16LE(32, entry + 6);
  header.writeUInt32LE(frame.length, entry + 8);
  header.writeUInt32LE(offset, entry + 12);
  offset += frame.length;
});
await writeFile('build-resources/icon.ico', Buffer.concat([header, ...frames]));
console.log('Generated PNG and multi-resolution Windows ICO.');
