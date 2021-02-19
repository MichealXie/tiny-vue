export const isString = (val: unknown): val is string => typeof val === 'string'
export function isIntegerKey(key: any) {
  return isString(key) &&
  key !== 'NaN' &&
  key[0] !== '-' &&
  '' + parseInt(key, 10) === key
}