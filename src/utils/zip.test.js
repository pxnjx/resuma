import { describe, it, expect } from 'vitest';
import { crc32, createZip } from './zip.js';

const utf8 = (s) => new TextEncoder().encode(s);

// Minimal ZIP reader — walks the central directory and local
// headers so tests verify the produced archive structurally.
function parseZip(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const u16 = (off) => view.getUint16(off, true);
  const u32 = (off) => view.getUint32(off, true);

  // Locate the end-of-central-directory record from the tail.
  let eocd = -1;
  for (let i = bytes.length - 22; i >= 0; i -= 1) {
    if (u32(i) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new Error('EOCD not found');

  const count = u16(eocd + 10);
  let p = u32(eocd + 16);
  const files = {};
  const metas = [];
  for (let i = 0; i < count; i += 1) {
    if (u32(p) !== 0x02014b50) throw new Error('Bad central directory signature');
    const crc = u32(p + 16);
    const size = u32(p + 24);
    const nameLen = u16(p + 28);
    const extraLen = u16(p + 30);
    const commentLen = u16(p + 32);
    const localOffset = u32(p + 42);
    const name = new TextDecoder().decode(bytes.subarray(p + 46, p + 46 + nameLen));
    metas.push({ name, crc, size, localOffset });

    if (u32(localOffset) !== 0x04034b50) throw new Error(`Bad local header for ${name}`);
    const localNameLen = u16(localOffset + 26);
    const localExtraLen = u16(localOffset + 28);
    const dataStart = localOffset + 30 + localNameLen + localExtraLen;
    files[name] = bytes.subarray(dataStart, dataStart + size);

    p += 46 + nameLen + extraLen + commentLen;
  }
  return { count, files, metas };
}

describe('crc32', () => {
  it('matches known CRC-32 test vectors', () => {
    expect(crc32(utf8('hello world'))).toBe(0x0d4a1185);
    expect(crc32(utf8('The quick brown fox jumps over the lazy dog'))).toBe(0x414fa339);
  });

  it('returns 0 for the empty input', () => {
    expect(crc32(new Uint8Array(0))).toBe(0);
  });
});

describe('createZip', () => {
  it('round-trips entries with names, sizes and CRCs intact', () => {
    const entries = [
      { name: 'a.txt', data: 'hello world' },
      { name: 'dir/b.bin', data: new Uint8Array([1, 2, 3, 4, 255]) },
    ];
    const zip = createZip(entries);
    const parsed = parseZip(zip);

    expect(parsed.count).toBe(2);
    expect(new TextDecoder().decode(parsed.files['a.txt'])).toBe('hello world');
    expect(Array.from(parsed.files['dir/b.bin'])).toEqual([1, 2, 3, 4, 255]);
    parsed.metas.forEach((m) => {
      expect(crc32(parsed.files[m.name])).toBe(m.crc);
      expect(m.size).toBe(parsed.files[m.name].length);
    });
  });

  it('starts with the local file header magic "PK\\x03\\x04"', () => {
    const zip = createZip([{ name: 'x.xml', data: '<x/>' }]);
    expect(zip[0]).toBe(0x50); // P
    expect(zip[1]).toBe(0x4b); // K
    expect(zip[2]).toBe(0x03);
    expect(zip[3]).toBe(0x04);
  });

  it('handles empty entries and unicode content', () => {
    const zip = createZip([
      { name: 'empty.txt', data: '' },
      { name: 'uni.txt', data: 'résumé — テスト ✓' },
    ]);
    const parsed = parseZip(zip);
    expect(parsed.count).toBe(2);
    expect(parsed.files['empty.txt'].length).toBe(0);
    expect(new TextDecoder().decode(parsed.files['uni.txt'])).toBe('résumé — テスト ✓');
  });

  it('uses the store method (no compression) for every entry', () => {
    const zip = createZip([{ name: 'a.txt', data: 'data' }]);
    const view = new DataView(zip.buffer);
    // Compression method lives at offset 8 of the local header.
    expect(view.getUint16(8, true)).toBe(0);
  });
});
