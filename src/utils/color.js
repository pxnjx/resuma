// Blend a hex color toward white: ratio 0 = original, 1 = white.
// Used to derive a soft background tint for skill chips from the
// user-picked accent color.
export function tintHex(hex, ratio) {
  const m = /^#?([0-9a-fA-F]{6})$/.exec(hex || '');
  if (!m) return hex;
  const n = m[1];
  const ch = (i) => parseInt(n.slice(i, i + 2), 16);
  const mix = (c) => Math.round(c + (255 - c) * ratio);
  return `rgb(${mix(ch(0))}, ${mix(ch(2))}, ${mix(ch(4))})`;
}
