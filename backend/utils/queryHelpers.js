/**
 * Shared query helpers for search / filter / sort / pagination.
 * Used by all list endpoints.
 */

/**
 * Parse and clamp pagination params from query string.
 */
function parsePagination(query, defaultLimit = 20, maxLimit = 100) {
  const page  = Math.max(1, parseInt(query.page  || '1',  10));
  const limit = Math.min(maxLimit, Math.max(1, parseInt(query.limit || String(defaultLimit), 10)));
  const skip  = (page - 1) * limit;
  return { page, limit, skip };
}

/**
 * Build a sort object from sortBy / sortOrder query params.
 * Falls back to defaultSort when params are missing or invalid.
 *
 * @param {object} query          - req.query
 * @param {string[]} allowedFields - whitelist of sortable field names
 * @param {object} defaultSort    - e.g. { createdAt: -1 }
 */
function parseSort(query, allowedFields = [], defaultSort = { createdAt: -1 }) {
  const { sortBy, sortOrder } = query;
  if (!sortBy || !allowedFields.includes(sortBy)) return defaultSort;
  const order = sortOrder === 'asc' ? 1 : -1;
  return { [sortBy]: order };
}

/**
 * Build a standard pagination meta block to include in every list response.
 */
function paginationMeta(total, page, limit) {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasNextPage: page * limit < total,
    hasPrevPage: page > 1,
  };
}

module.exports = { parsePagination, parseSort, paginationMeta };
