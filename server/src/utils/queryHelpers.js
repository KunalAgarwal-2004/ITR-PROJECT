/**
 * Helpers for safely turning untrusted query-string values into MongoDB filters.
 */

// Escape regex metacharacters so user search text is matched literally
// (prevents invalid-regex 500s and ReDoS patterns).
export const escapeRegExp = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Express's qs parser can turn `?a[$ne]=x` into objects or `?a=1&a=2` into arrays.
// Only accept plain strings; anything else is treated as absent.
export const queryString = (value, fallback = '') => (typeof value === 'string' ? value : fallback);

export const MAX_PAGE_SIZE = 50;

export const parsePagination = (page, limit, defaultLimit) => {
  const pageNum = Math.max(1, parseInt(queryString(String(page ?? '')), 10) || 1);
  const limitNum = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(queryString(String(limit ?? '')), 10) || defaultLimit));
  return { pageNum, limitNum, skip: (pageNum - 1) * limitNum };
};
