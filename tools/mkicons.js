const zlib = require("zlib");
const fs = require("fs");
const path = require("path");

/* ---------- minimal PNG encoder ---------- */
const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();
function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const td = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td), 0);
  return Buffer.concat([len, td, crc]);
}
function writePng(file, w, h, rgba) {
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0;
    rgba.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0))
  ]);
  fs.writeFileSync(file, png);
}

/* ---------- drawing ---------- */
function mix(a, b, t) {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t)
  ];
}
function render(size) {
  const SS = 4;                       // supersample
  const W = size * SS;
  const buf = new Float32Array(W * W * 4);

  const bg = [15, 23, 42];            // #0f172a
  const gTop = [52, 211, 153];        // #34d399
  const gBot = [5, 150, 105];         // #059669
  const radius = W * 0.24;

  const inRound = (x, y) => {
    const r = radius;
    if (x < r && y < r) return (x - r) ** 2 + (y - r) ** 2 <= r * r;
    if (x > W - r && y < r) return (x - (W - r)) ** 2 + (y - r) ** 2 <= r * r;
    if (x < r && y > W - r) return (x - r) ** 2 + (y - (W - r)) ** 2 <= r * r;
    if (x > W - r && y > W - r) return (x - (W - r)) ** 2 + (y - (W - r)) ** 2 <= r * r;
    return true;
  };

  const put = (x, y, col, a) => {
    const i = (y * W + x) * 4;
    buf[i] = buf[i] * (1 - a) + col[0] * a;
    buf[i + 1] = buf[i + 1] * (1 - a) + col[1] * a;
    buf[i + 2] = buf[i + 2] * (1 - a) + col[2] * a;
    buf[i + 3] = Math.min(1, buf[i + 3] + a);
  };

  // background
  for (let y = 0; y < W; y++) {
    for (let x = 0; x < W; x++) {
      if (inRound(x + 0.5, y + 0.5)) put(x, y, bg, 1);
    }
  }

  // decorative glow
  const cx = W * 0.78, cy = W * 0.2, gr = W * 0.45;
  for (let y = 0; y < W; y++) {
    for (let x = 0; x < W; x++) {
      const d = Math.hypot(x - cx, y - cy);
      if (d < gr && inRound(x + 0.5, y + 0.5)) {
        const a = Math.pow(1 - d / gr, 2) * 0.16;
        put(x, y, [16, 185, 129], a);
      }
    }
  }

  // bars
  const bars = [0.30, 0.46, 0.62, 0.82];
  const bw = W * 0.098;
  const gap = W * 0.052;
  const totalW = 4 * bw + 3 * gap;
  const startX = (W - totalW) / 2;
  const baseY = W * 0.755;
  const maxH = W * 0.47;

  bars.forEach((hFrac, i) => {
    const x0 = startX + i * (bw + gap);
    const h = maxH * (hFrac / 0.82);
    const y0 = baseY - h;
    const r = bw * 0.32;
    for (let y = Math.floor(y0); y < Math.ceil(baseY); y++) {
      for (let x = Math.floor(x0); x < Math.ceil(x0 + bw); x++) {
        if (x < 0 || y < 0 || x >= W || y >= W) continue;
        // rounded top corners
        let inside = true;
        const topDist = y - y0;
        if (topDist < r) {
          if (x - x0 < r) inside = Math.hypot(x - x0 - r, topDist - r) <= r;
          else if (x0 + bw - x < r) inside = Math.hypot(x - (x0 + bw - r), topDist - r) <= r;
        }
        if (!inside) continue;
        const t = clamp01((y - y0) / h);
        const col = mix(gTop, gBot, t);
        put(x, y, col, 1);
      }
    }
  });

  // baseline
  const ly = Math.round(baseY + W * 0.012);
  for (let y = ly; y < ly + Math.max(2, Math.round(W * 0.018)); y++) {
    for (let x = Math.floor(startX); x < Math.ceil(startX + totalW); x++) {
      if (x < 0 || y < 0 || x >= W || y >= W) continue;
      put(x, y, [226, 232, 240], 0.55);
    }
  }

  // downsample
  const out = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let dy = 0; dy < SS; dy++) {
        for (let dx = 0; dx < SS; dx++) {
          const i = ((y * SS + dy) * W + (x * SS + dx)) * 4;
          r += buf[i]; g += buf[i + 1]; b += buf[i + 2]; a += buf[i + 3];
        }
      }
      const n = SS * SS;
      const o = (y * size + x) * 4;
      out[o] = Math.round(r / n);
      out[o + 1] = Math.round(g / n);
      out[o + 2] = Math.round(b / n);
      out[o + 3] = Math.round((a / n) * 255);
    }
  }
  return out;
}
function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

const dir = path.join(__dirname, "..");
writePng(path.join(dir, "icon-512.png"), 512, 512, render(512));
writePng(path.join(dir, "icon-192.png"), 192, 192, render(192));
console.log("icons written");
