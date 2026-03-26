import { PaginationOptions, PaginatedResultMeta, SortOptions } from '../types/query.js';

/**
 * Handle pagination logic
 */
export function handlePagination(params: { total: number; paginationOptions: PaginationOptions }): {
  paginationResult: PaginatedResultMeta;
  paginationQuery: { skip: number; take: number };
} {
  params.paginationOptions.limit = Math.max(params.paginationOptions.limit || 10, 1);

  const totalPages = Math.ceil(params.total / params.paginationOptions.limit);

  params.paginationOptions.page = Math.min(
    Math.max(params.paginationOptions.page || 1, 1),
    totalPages
  );

  const skip = (params.paginationOptions.page - 1) * params.paginationOptions.limit;

  let count = params.paginationOptions.limit;
  if (params.paginationOptions.page === totalPages) {
    count = params.total % params.paginationOptions.limit;
  }

  return {
    paginationQuery: {
      skip,
      take: params.paginationOptions.limit,
    },
    paginationResult: {
      page: params.paginationOptions.page,
      limit: params.paginationOptions.limit,
      count,
      total: params.total,
      totalPages,
      hasNext: params.paginationOptions.page * params.paginationOptions.limit < params.total,
      hasPrev: params.paginationOptions.page > 1,
    },
  };
}

/**
 * Handle ordering logic
 */
export function handleSort<T>(sortOptions: SortOptions<T>): { [x: string]: 'asc' | 'desc' }[] {
  if (!sortOptions || !sortOptions.sortBy) return [];

  const order = sortOptions.sortOrder || 'asc';
  return [{ [sortOptions.sortBy]: order }];
}
//
// /**
//  * Handle ordering logic
//  * @param {Object} params - Filteration parameters
//  * @param {Object} params.filter - Filter options (where, orderBy, pagination)
//  * @param {number | undefined} params.page - Pagination page number
//  * @param {number | undefined} params.limit - Pagination page limit
//  * @param {string | undefined} params.sortBy - The key to sort by
//  * @param {("asc" | "desc") | undefined} params.sortOrder - Sorting direction
//  * @param {string} params.modelName - The model to be filtered
//  * @returns {Promise<{ finalFilter: Record<string, any>, paginationResult: import("../repositories/database/Repository").PaginatedResult | null }>}
//  */
// export async function handleManyQuery<Filter>(params: { filter: Filter, page: number, limit: number, modelName: Prisma.ModelName }) {
//
//   const finalFilter = params.filter;
//   const result = { finalFilter, paginationResult: null };
//
//   if (typeof params.page == "number" || typeof params.limit == "number") {
//     const pagination = { page: params.page, limit: params.limit };
//
//     const total = await prisma[params.modelName].count({
//       where: params.filter.where,
//     });
//     const res = handlePagination({
//       total,
//       paginationOptions: pagination,
//     });
//     const paginationQuery = res.paginationQuery;
//     result.paginationResult = res.paginationResult;
//
//     finalFilter.skip = paginationQuery.skip;
//     finalFilter.take = paginationQuery.take;
//   }
//
//
//   return result;
// }
