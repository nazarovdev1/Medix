'use strict';

/**
 * Build pagination meta from query params.
 * @param {object} query  - req.query
 * @param {number} total  - total count of records
 */
function paginate(query, total) {
  const page  = Math.max(1, parseInt(query.page, 10)  || 1);
  const limit = Math.min(100, parseInt(query.limit, 10) || 20);
  const offset = (page - 1) * limit;

  return {
    page,
    limit,
    offset,
    total,
    totalPages: Math.ceil(total / limit),
    hasNext: page < Math.ceil(total / limit),
    hasPrev: page > 1,
  };
}

/**
 * Build ORDER BY clause safely (whitelist columns).
 */
function buildOrderBy(query, allowed, defaultCol = 'created_at') {
  const col = allowed.includes(query.sortBy) ? query.sortBy : defaultCol;
  const dir = query.sortDir === 'asc' ? 'ASC' : 'DESC';
  return `ORDER BY ${col} ${dir}`;
}

module.exports = { paginate, buildOrderBy };
