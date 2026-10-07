import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateSync } from 'node:zlib';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputRoot = path.join(projectRoot, 'assets');
const coral = [240, 108, 82];
const cream = [255, 253, 248];
const supersampling = 3;

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const name = Buffer.from(type);
  const payload = Buffer.concat([name, data]);
  const chunk = Buffer.alloc(payload.length + 8);
  chunk.writeUInt32BE(data.length, 0);
  payload.copy(chunk, 4);
  chunk.writeUInt32BE(crc32(payload), payload.length + 4);
  return chunk;
}

function cubic(start, control1, control2, end, steps = 18) {
  const points = [];
  for (let step = 1; step <= steps; step += 1) {
    const t = step / steps;
    const inverse = 1 - t;
    points.push([
      inverse ** 3 * start[0] + 3 * inverse ** 2 * t * control1[0] + 3 * inverse * t ** 2 * control2[0] + t ** 3 * end[0],
      inverse ** 3 * start[1] + 3 * inverse ** 2 * t * control1[1] + 3 * inverse * t ** 2 * control2[1] + t ** 3 * end[1]
    ]);
  }
  return points;
}

function padOutline() {
  const points = [[32, 45]];
  const curves = [
    [[32, 45], [24.6, 45], [18.5, 41.5], [18.5, 35.5]],
    [[18.5, 35.5], [18.5, 31.3], [21.9, 28.2], [25.9, 28.2]],
    [[25.9, 28.2], [28.3, 28.2], [30.2, 29.3], [32, 31]],
    [[32, 31], [33.8, 29.3], [35.7, 28.2], [38.1, 28.2]],
    [[38.1, 28.2], [42.1, 28.2], [45.5, 31.3], [45.5, 35.5]],
    [[45.5, 35.5], [45.5, 41.5], [39.4, 45], [32, 45]]
  ];
  for (const curve of curves) points.push(...cubic(...curve));
  return points;
}

function encodePng(width, height, rgba) {
  const rows = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y += 1) {
    const rowOffset = y * (width * 4 + 1);
    rows[rowOffset] = 0;
    rgba.copy(rows, rowOffset + 1, y * width * 4, (y + 1) * width * 4);
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 6;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk('IHDR', header),
    pngChunk('IDAT', deflateSync(rows, { level: 9 })),
    pngChunk('IEND', Buffer.alloc(0))
  ]);
}

function renderIcon(size, markScale) {
  const side = size * supersampling;
  const factor = side / 64;
  const pixels = Buffer.alloc(side * side * 4);
  for (let index = 0; index < side * side; index += 1) {
    const offset = index * 4;
    pixels[offset] = coral[0];
    pixels[offset + 1] = coral[1];
    pixels[offset + 2] = coral[2];
    pixels[offset + 3] = 255;
  }

  function transform([x, y]) {
    return [32 + (x - 32) * markScale, 32 + (y - 32) * markScale];
  }

  function fillCircle(x, y, radius) {
    const [centerX, centerY] = transform([x, y]);
    const scaledRadius = radius * markScale;
    const minX = Math.max(0, Math.floor((centerX - scaledRadius) * factor));
    const maxX = Math.min(side - 1, Math.ceil((centerX + scaledRadius) * factor));
    const minY = Math.max(0, Math.floor((centerY - scaledRadius) * factor));
    const maxY = Math.min(side - 1, Math.ceil((centerY + scaledRadius) * factor));
    for (let py = minY; py <= maxY; py += 1) {
      for (let px = minX; px <= maxX; px += 1) {
        const dx = (px + 0.5) / factor - centerX;
        const dy = (py + 0.5) / factor - centerY;
        if (dx * dx + dy * dy > scaledRadius * scaledRadius) continue;
        const offset = (py * side + px) * 4;
        pixels[offset] = cream[0];
        pixels[offset + 1] = cream[1];
        pixels[offset + 2] = cream[2];
      }
    }
  }

  const outline = padOutline().map(transform);
  const minX = Math.max(0, Math.floor(Math.min(...outline.map(([x]) => x)) * factor));
  const maxX = Math.min(side - 1, Math.ceil(Math.max(...outline.map(([x]) => x)) * factor));
  const minY = Math.max(0, Math.floor(Math.min(...outline.map(([, y]) => y)) * factor));
  const maxY = Math.min(side - 1, Math.ceil(Math.max(...outline.map(([, y]) => y)) * factor));
  for (let py = minY; py <= maxY; py += 1) {
    const y = (py + 0.5) / factor;
    const intersections = [];
    for (let i = 0, j = outline.length - 1; i < outline.length; j = i, i += 1) {
      const [xi, yi] = outline[i];
      const [xj, yj] = outline[j];
      if ((yi > y) !== (yj > y)) intersections.push(xi + ((y - yi) * (xj - xi)) / (yj - yi));
    }
    intersections.sort((a, b) => a - b);
    for (let i = 0; i + 1 < intersections.length; i += 2) {
      const startX = Math.max(minX, Math.ceil(intersections[i] * factor - 0.5));
      const endX = Math.min(maxX, Math.floor(intersections[i + 1] * factor - 0.5));
      for (let px = startX; px <= endX; px += 1) {
        const offset = (py * side + px) * 4;
        pixels[offset] = cream[0];
        pixels[offset + 1] = cream[1];
        pixels[offset + 2] = cream[2];
      }
    }
  }

  for (const [x, y] of [[20, 22], [31, 17], [42, 22]]) fillCircle(x, y, 5);

  const output = Buffer.alloc(size * size * 4);
  const sampleCount = supersampling * supersampling;
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const target = (y * size + x) * 4;
      for (let channel = 0; channel < 3; channel += 1) {
        let total = 0;
        for (let sy = 0; sy < supersampling; sy += 1) {
          for (let sx = 0; sx < supersampling; sx += 1) {
            const source = (((y * supersampling + sy) * side) + x * supersampling + sx) * 4;
            total += pixels[source + channel];
          }
        }
        output[target + channel] = Math.round(total / sampleCount);
      }
      output[target + 3] = 255;
    }
  }
  return encodePng(size, size, output);
}

const icons = [
  ['wagsignals-192.png', 192, 1],
  ['wagsignals-512.png', 512, 1],
  ['wagsignals-maskable-512.png', 512, 0.78]
];
await fs.mkdir(outputRoot, { recursive: true });
for (const [filename, size, markScale] of icons) {
  const filePath = path.join(outputRoot, filename);
  await fs.writeFile(filePath, renderIcon(size, markScale));
  console.log(`Generated ${path.relative(projectRoot, filePath)} (${size}×${size}).`);
}
