function parse(value: string): [bigint, number] {
  if (!/^\d+(?:\.\d+)?$/.test(value)) throw new Error(`Invalid decimal amount: ${value}`);
  const [whole, fraction = ""] = value.split(".");
  return [BigInt(`${whole}${fraction}`), fraction.length];
}
function normalized(left: string, right: string): [bigint, bigint, number] {
  const [leftRaw, leftScale] = parse(left); const [rightRaw, rightScale] = parse(right); const scale = Math.max(leftScale, rightScale);
  return [leftRaw * BigInt(10) ** BigInt(scale - leftScale), rightRaw * BigInt(10) ** BigInt(scale - rightScale), scale];
}
function format(raw: bigint, scale: number): string {
  const digits = raw.toString().padStart(scale + 1, "0");
  return scale === 0 ? digits : `${digits.slice(0, -scale)}.${digits.slice(-scale)}`.replace(/\.0+$/, "").replace(/(\.\d*?)0+$/, "$1");
}
export function compareDecimal(left: string, right: string): number { const [a, b] = normalized(left, right); return a === b ? 0 : a > b ? 1 : -1; }
export function addDecimal(left: string, right: string): string { const [a, b, scale] = normalized(left, right); return format(a + b, scale); }
export function subtractDecimal(left: string, right: string): string { const [a, b, scale] = normalized(left, right); return format(a - b, scale); }
