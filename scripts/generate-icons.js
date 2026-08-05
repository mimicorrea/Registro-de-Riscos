const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });

const table = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  return c;
});

const crc32 = (buf) => {
  let crc = -1;
  for (const b of buf) {
    crc = (crc >>> 8) ^ table[(crc ^ b) & 0xff];
  }
  return (crc ^ -1) >>> 0;
};

const chunk = (type, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([type, data])), 0);
  return Buffer.concat([len, type, data, crc]);
};

const writePng = (size, filePath) => {
  const width = size;
  const height = size;
  const png = Buffer.from('\x89PNG\r\n\x1a\n', 'binary');
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const data = Buffer.concat(Array.from({ length: height }, () => {
    const row = Buffer.alloc(width * 4 + 1);
    row[0] = 0;
    for (let i = 1; i < row.length; i += 4) {
      row[i] = 79;
      row[i + 1] = 70;
      row[i + 2] = 229;
      row[i + 3] = 255;
    }
    return row;
  }));
  fs.writeFileSync(filePath, Buffer.concat([png, chunk(Buffer.from('IHDR'), ihdr), chunk(Buffer.from('IDAT'), zlib.deflateSync(data)), chunk(Buffer.from('IEND'), Buffer.alloc(0))]));
};

writePng(192, path.join(iconsDir, 'icon-192.png'));
writePng(512, path.join(iconsDir, 'icon-512.png'));
console.log('PWA icons created');
