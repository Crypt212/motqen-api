
/**
 * Handle pagination logic
 * @param {Object} params - Pagination parameters
 * @param {number} params.total - Total number of records
 * @param {import("../repositories/database/Repository").PaginationOptions} params.pagination - Pagination options (page, limit)
 * @returns {{ paginationResult: import("../repositories/database/Repository").PaginatedResult, paginationQuery: {skip: number, take: number}}}
 */
function handlePagination({ total, pagination }) {
  pagination.page = Math.max(pagination.page || 1, 1);
  pagination.limit = Math.max(pagination.limit || 20, 1);
  const skip = (pagination.page - 1) * pagination.limit;

  return {
    paginationQuery: {
      skip,
      take: pagination.limit,
    },
    paginationResult: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages: Math.ceil(total / pagination.limit),
      hasNext: pagination.page * pagination.limit < total,
      hasPrev: pagination.page > 1,
    },
  };
}

/**
 * Handle ordering logic
 * @param {import("../repositories/database/Repository").OrderingOptions[]} orderBy - Ordering options (field, direction)
 * @returns {{ [x: string]: 'asc' | 'desc'}[]}
 */
function handleOrder(orderBy) {
  if (!orderBy) return [];
  return orderBy
    .map(({ field, direction }) => {
      const order = direction;
      return { [field]: order };
    })
    .filter(Boolean);
}

/**
 * Handle ordering logic
 * @param {Object} params - Filteration parameters
 * @param {Object} params.filter - Filter options (where, orderBy, pagination)
 * @param {import("../repositories/database/Repository.js").PaginationOptions} params.pagination - Pagination options (page, limit)
 * @param {import("../repositories/database/Repository.js").OrderingOptions[]} params.orderBy - Ordering options (field, direction)
 * @param {Object} params.model - The model to be filtered
 * @returns {Promise<{ finalFilter: Record<string, any>, paginationResult: import("../repositories/database/Repository").PaginatedResult | null }>}
 */
export async function handleQuery ({ filter, pagination, orderBy, model }) {

  const finalFilter = filter ?? {};
  const result = { finalFilter, paginationResult: null };

  if (pagination) {
    const total = await model.count({
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

  finalFilter.orderBy = handleOrder(orderBy);

  return result;
}
