export default function formatDecimals(value: string) {
  const slice = value.includes('.') ? value.split('.')[0] : value;
  let decimalLength = 6;
  return parseFloat(value).toFixed(decimalLength > slice.length ? decimalLength - slice.length : 0);
}