import prisma from '../libs/database.js';

/**
 * Handle pagination logic
 * @param {Object} params - Pagination parameters
 * @param {number} params.total - Total number of records
 * @param {import("../repositories/database/Repository.js").PaginationOptions} params.pagination - Pagination options (page, limit)
 * @returns {{ paginationResult: import("../repositories/database/Repository.js").PaginatedResult, paginationQuery: {skip: number, take: number}}}
 */
export function handlePagination({ total, pagination }) {
  pagination.limit = Math.max(pagination.limit || 10, 1);

  const totalPages = Math.ceil(total / pagination.limit);

  pagination.page = Math.min(Math.max(pagination.page || 1, 1), totalPages);

  const skip = (pagination.page - 1) * pagination.limit;

  let count = pagination.limit;
  if (pagination.page === totalPages) {
    count = total % pagination.limit;
  }

  return {
    paginationQuery: {
      skip,
      take: pagination.limit,
    },
    paginationResult: {
      page: pagination.page,
      limit: pagination.limit,
      count,
      total,
      totalPages,
      hasNext: pagination.page * pagination.limit < total,
      hasPrev: pagination.page > 1,
    },
  };
}

/**
 * Handle ordering logic
 * @param {import("../repositories/database/Repository.js").OrderingOptions} orderOptions - Ordering options (field, direction)
 * @returns {{ [x: string]: 'asc' | 'desc'}[]}
 */
export function handleOrder(orderOptions) {
  if (!orderOptions || !orderOptions.sortBy) return [];

  const order = orderOptions.sortOrder || "asc";
  return [ { [orderOptions.sortBy]: order } ]
}

/**
 * Handle ordering logic
 * @param {Object} params - Filteration parameters
 * @param {Object} params.filter - Filter options (where, orderBy, pagination)
 * @param {number | undefined} params.page - Pagination page number
 * @param {number | undefined} params.limit - Pagination page limit
 * @param {string | undefined} params.sortBy - The key to sort by
 * @param {("asc" | "desc") | undefined} params.sortOrder - Sorting direction
 * @param {string} params.modelName - The model to be filtered
 * @returns {Promise<{ finalFilter: Record<string, any>, paginationResult: import("../repositories/database/Repository.js").PaginatedResult | null }>}
 */
export async function handleManyQuery({ filter = {}, page, limit, sortBy, sortOrder, modelName }) {

  const finalFilter = filter;
  const result = { finalFilter, paginationResult: null };

  if (typeof page == "number" || typeof limit == "number") {
    const pagination = { page, limit };

    const total = await prisma[modelName].count({
      where: filter.where,
    });
    const res = handlePagination({
      total,
      pagination,
    });
    const paginationQuery = res.paginationQuery;
    result.paginationResult = res.paginationResult;

    finalFilter.skip = paginationQuery.skip;
    finalFilter.take = paginationQuery.take;
  }

  finalFilter.orderBy = handleOrder({ sortBy, sortOrder });

  return result;
}
