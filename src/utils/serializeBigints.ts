/**
 * Recursively converts all BigInt values in an object to strings for JSON serialization.
 * Use this when sending responses that contain BigInt fields (e.g., financial amounts).
 */
export const serializeBigints = (obj: any): any =>
  JSON.parse(
    JSON.stringify(obj, (_key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    )
  );
