/**
 * Dates arrive as real Date instances when called in-process (e.g. the seed
 * script) but as ISO strings once they've crossed the HTTP/JSON boundary
 * (Express req.body has no Date type). Wrapping in `new Date(...)` normalizes
 * either input before serializing back out.
 */
export function toISOStringOrNull(value: Date | string | null | undefined): string | null {
  if (!value) return null
  return new Date(value).toISOString()
}
