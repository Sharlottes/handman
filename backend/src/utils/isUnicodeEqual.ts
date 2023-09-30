export function isUnicodeEqual(a: UnicodeId, b: UnicodeId) {
  return a.every((unicode, i) => unicode == b[i]);
}
