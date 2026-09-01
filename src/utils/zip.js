// ─────────────────────────────────────────────────────────────
//  Minimal ZIP writer — dependency-free, store-only (no
//  compression). Produces a spec-compliant archive (local file
//  headers + central directory + end-of-central-directory with
//  CRC-32 checksums) — just enough to package Office Open XML
//  files such as .docx without any runtime dependency.
// ─────────────────────────────────────────────────────────────

const encoder = new TextEncoder();

// Standard CRC-32 (IEEE 802.3, polynomial 0xEDB88320) lookup table.
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

export function crc32(bytes) {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i += 1) {
    crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// MS-DOS timestamp (2-second resolution, years since 1980).
function dosTimeDate(date) {
  const year = Math.max(1980, date.getFullYear());
  const time =
    (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  const day = ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  return { time, day };
}

/**
 * Build an uncompressed ZIP archive from the given entries.
 * @param {Array<{name: string, data: string|Uint8Array}>} entries
 * @returns {Uint8Array} the complete archive as binary
 */
export function createZip(entries) {
  const chunks = [];
  const central = [];
  let offset = 0;
  const { time, day } = dosTimeDate(new Date());

  const push = (bytes) => {
    chunks.push(bytes);
    offset += bytes.length;
  };

  entries.forEach((entry) => {
    const nameBytes = encoder.encode(entry.name);
    const data = typeof entry.data === 'string' ? encoder.encode(entry.data) : entry.data;
    const crc = crc32(data);
    const headerOffset = offset; // local header starts at the current offset

    // Local file header (30 bytes) + file name + file data.
    const local = new Uint8Array(30 + nameBytes.length);
    const lv = new DataView(local.buffer);
    lv.setUint32(0, 0x04034b50, true); // local file header signature
    lv.setUint16(4, 20, true); // version needed to extract (2.0)
    lv.setUint16(6, 0x0800, true); // flags: UTF-8 names
    lv.setUint16(8, 0, true); // compression method: store
    lv.setUint16(10, time, true); // last mod time
    lv.setUint16(12, day, true); // last mod date
    lv.setUint32(14, crc, true); // CRC-32
    lv.setUint32(18, data.length, true); // compressed size
    lv.setUint32(22, data.length, true); // uncompressed size
    lv.setUint16(26, nameBytes.length, true); // file name length
    lv.setUint16(28, 0, true); // extra field length
    local.set(nameBytes, 30);
    push(local);
    push(data);

    central.push({ nameBytes, crc, size: data.length, headerOffset });
  });

  // Central directory records.
  const cdStart = offset;
  central.forEach((e) => {
    const cd = new Uint8Array(46 + e.nameBytes.length);
    const cv = new DataView(cd.buffer);
    cv.setUint32(0, 0x02014b50, true); // central directory header signature
    cv.setUint16(4, 20, true); // version made by
    cv.setUint16(6, 20, true); // version needed to extract
    cv.setUint16(8, 0x0800, true); // flags: UTF-8 names
    cv.setUint16(10, 0, true); // compression method: store
    cv.setUint16(12, time, true);
    cv.setUint16(14, day, true);
    cv.setUint32(16, e.crc, true);
    cv.setUint32(20, e.size, true); // compressed size
    cv.setUint32(24, e.size, true); // uncompressed size
    cv.setUint16(28, e.nameBytes.length, true);
    cv.setUint16(30, 0, true); // extra field length
    cv.setUint16(32, 0, true); // file comment length
    cv.setUint16(34, 0, true); // disk number start
    cv.setUint16(36, 0, true); // internal file attributes
    cv.setUint32(38, 0, true); // external file attributes
    cv.setUint32(42, e.headerOffset, true); // local header offset
    cd.set(e.nameBytes, 46);
    push(cd);
  });
  const cdSize = offset - cdStart;

  // End of central directory record (22 bytes).
  const eocd = new Uint8Array(22);
  const ev = new DataView(eocd.buffer);
  ev.setUint32(0, 0x06054b50, true); // EOCD signature
  ev.setUint16(4, 0, true); // number of this disk
  ev.setUint16(6, 0, true); // disk with start of central directory
  ev.setUint16(8, central.length, true); // entries on this disk
  ev.setUint16(10, central.length, true); // total entries
  ev.setUint32(12, cdSize, true); // central directory size
  ev.setUint32(16, cdStart, true); // central directory offset
  ev.setUint16(20, 0, true); // comment length
  push(eocd);

  const total = chunks.reduce((n, c) => n + c.length, 0);
  const out = new Uint8Array(total);
  let pos = 0;
  chunks.forEach((c) => {
    out.set(c, pos);
    pos += c.length;
  });
  return out;
}
