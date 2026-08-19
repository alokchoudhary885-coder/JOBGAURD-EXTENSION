const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function createPNG(width, height, drawFn) {
  // RGBA buffer
  const buffer = Buffer.alloc(width * height * 4);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const [r, g, b, a] = drawFn(x, y, width, height);
      buffer[idx] = r;
      buffer[idx + 1] = g;
      buffer[idx + 2] = b;
      buffer[idx + 3] = a;
    }
  }

  // PNG filter byte (0 = None) per scanline
  const scanlineLength = width * 4 + 1;
  const rawData = Buffer.alloc(height * scanlineLength);

  for (let y = 0; y < height; y++) {
    rawData[y * scanlineLength] = 0; // Filter: None
    buffer.copy(rawData, y * scanlineLength + 1, y * width * 4, (y + 1) * width * 4);
  }

  const compressedData = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // Bit depth: 8
  ihdr.writeUInt8(6, 9); // Color type: 6 (RGBA)
  ihdr.writeUInt8(0, 10); // Compression
  ihdr.writeUInt8(0, 11); // Filter
  ihdr.writeUInt8(0, 12); // Interlace

  const ihdrChunk = createChunk('IHDR', ihdr);
  const idatChunk = createChunk('IDAT', compressedData);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = data.length;
  const buffer = Buffer.alloc(8 + length + 4);
  buffer.writeUInt32BE(length, 0);
  buffer.write(type, 4, 4, 'ascii');
  data.copy(buffer, 8);

  const crc = crc32(buffer.subarray(4, 8 + length));
  buffer.writeUInt32BE(crc, 8 + length);
  return buffer;
}

// Standard CRC32 table
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) {
      c = 0xedb88320 ^ (c >>> 1);
    } else {
      c = c >>> 1;
    }
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0 ^ -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

// Draw Shield Badge icon (Deep Emerald/Navy gradient with Shield)
function drawShieldIcon(x, y, w, h) {
  const nx = x / w;
  const ny = y / h;

  // Center coordinates (-1 to +1)
  const cx = (x - w / 2) / (w / 2);
  const cy = (y - h / 2) / (h / 2);
  const dist = Math.sqrt(cx * cx + cy * cy);

  // Rounded square background
  const cornerRadius = 0.85;
  const isInsideBg = Math.abs(cx) < cornerRadius && Math.abs(cy) < cornerRadius;

  // Shield geometry:
  // Top: cy between -0.65 and 0.0, |cx| < 0.55
  // Bottom: cy between 0.0 and 0.65, narrowing down towards (0, 0.65)
  let inShield = false;
  if (cy >= -0.65 && cy <= 0.0) {
    if (Math.abs(cx) <= 0.52) inShield = true;
  } else if (cy > 0.0 && cy <= 0.68) {
    const maxWidth = 0.52 * (1 - Math.pow(cy / 0.68, 1.6));
    if (Math.abs(cx) <= maxWidth) inShield = true;
  }

  // Inner checkmark in shield
  let inCheck = false;
  // Short leg: from (-0.25, 0.0) to (0.0, 0.25)
  // Long leg: from (0.0, 0.25) to (0.28, -0.22)
  const thickness = 0.12;
  // Point to line distances
  if (inShield) {
    // Left segment
    const t1 = Math.max(0, Math.min(1, ((cx + 0.22) * 0.22 + (cy - 0.02) * 0.22) / 0.0968));
    const px1 = -0.22 + t1 * 0.22;
    const py1 = 0.02 + t1 * 0.22;
    const d1 = Math.hypot(cx - px1, cy - py1);

    // Right segment
    const t2 = Math.max(0, Math.min(1, ((cx - 0.0) * 0.26 + (cy - 0.24) * -0.46) / 0.2792));
    const px2 = 0.0 + t2 * 0.26;
    const py2 = 0.24 - t2 * 0.46;
    const d2 = Math.hypot(cx - px2, cy - py2);

    if (d1 < thickness || d2 < thickness) {
      inCheck = true;
    }
  }

  if (inCheck) {
    return [255, 255, 255, 255]; // White checkmark
  }

  if (inShield) {
    // Emerald Green shield (gradient #10B981 to #059669)
    const r = Math.round(16 + (5 - 16) * (ny * 0.8));
    const g = Math.round(185 + (150 - 185) * (ny * 0.8));
    const b = Math.round(129 + (105 - 129) * (ny * 0.8));
    return [r, g, b, 255];
  }

  if (dist <= 0.95) {
    // Dark sleek background (#0F172A / Slate-900)
    return [15, 23, 42, 255];
  }

  return [0, 0, 0, 0]; // Transparent outside
}

const iconsDir = path.join(__dirname, 'extension', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

[16, 48, 128].forEach((size) => {
  const pngBuffer = createPNG(size, size, drawShieldIcon);
  const filePath = path.join(iconsDir, `icon-${size}.png`);
  fs.writeFileSync(filePath, pngBuffer);
  console.log(`Generated ${filePath} (${size}x${size})`);
});
