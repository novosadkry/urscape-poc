export function getMinMax(array: number[]): [number, number] {
  let len = array.length;
  let max = -Infinity;
  let min = +Infinity;

  while (len--) {
    max = array[len] > max ? array[len] : max;
    min = array[len] < min ? array[len] : min;
  }

  return [min, max];
}
