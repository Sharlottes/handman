export function displaySupportedUnicode(codePoint: number) {
  // 유니코드 범주를 확인하여 "볼 수 있는" 문자만 표시
  if (
    (codePoint >= 0x0000 && codePoint <= 0xffff) || // BMP
    (codePoint >= 0x10000 && codePoint <= 0x1fffff) || // SMP
    (codePoint >= 0x200000 && codePoint <= 0x3ffffff) // SMP-B 및 SPP
  ) {
    return String.fromCodePoint(codePoint);
  } else {
    return `U+${codePoint.toString(16)}`;
  }
}
