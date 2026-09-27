import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createChunk(type, data) {
  const length = data.length;
  const buffer = Buffer.alloc(4 + 4 + length + 4);
  buffer.writeUInt32BE(length, 0);
  buffer.write(type, 4, 4, 'ascii');
  data.copy(buffer, 8);
  
  const crc = calculateCrc(buffer.subarray(4, 8 + length));
  buffer.writeUInt32BE(crc, 8 + length);
  return buffer;
}

function calculateCrc(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      if ((crc & 1) !== 0) {
        crc = (crc >>> 1) ^ 0xedb88320;
      } else {
        crc = crc >>> 1;
      }
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createPng(width, height) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // bit depth 8
  ihdr.writeUInt8(2, 9); // color type 2 (RGB)
  ihdr.writeUInt8(0, 10); // compression
  ihdr.writeUInt8(0, 11); // filter
  ihdr.writeUInt8(0, 12); // interlace
  
  const ihdrChunk = createChunk('IHDR', ihdr);
  
  const rowSize = 1 + width * 3;
  const rawData = Buffer.alloc(rowSize * height);
  
  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0;
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 3;
      const cx = width / 2;
      const cy = height / 2;
      const radius = width * 0.44;
      const dx = Math.abs(x - cx);
      const dy = Math.abs(y - cy);
      const normalized = Math.pow(dx / radius, 3.5) + Math.pow(dy / radius, 3.5);
      
      if (normalized <= 1.0) {
        // Inside squircle: Deep teal #1B4B43
        rawData[pxOffset] = 27;
        rawData[pxOffset + 1] = 75;
        rawData[pxOffset + 2] = 67;
      } else {
        // Background: warm off-white #F6F5F1
        rawData[pxOffset] = 246;
        rawData[pxOffset + 1] = 245;
        rawData[pxOffset + 2] = 241;
      }
    }
  }
  
  const compressed = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));
  
  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, 'icon-192.png'), createPng(192, 192));
fs.writeFileSync(path.join(publicDir, 'icon-512.png'), createPng(512, 512));
fs.writeFileSync(path.join(publicDir, 'icon-maskable.png'), createPng(512, 512));

console.log('SUCCESS: Icons generated in /public');
