export function encodeFloatToDouble(value: number) {
  const result = new Float32Array(2);
  result[0] = value;

  const delta = value - result[0];
  result[1] = delta;

  return result;
}
