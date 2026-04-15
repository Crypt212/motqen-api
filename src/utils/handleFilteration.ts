import { PaginationOptions, PaginatedResultMeta, SortOptions } from '../types/query.js';

/**
 * Handle pagination logic
 */
export function handlePagination(params: { total: number; paginationOptions: PaginationOptions }): {
  paginationResult: PaginatedResultMeta;
  paginationQuery: { skip: number; take: number };
} {
  const { total, paginationOptions } = params;
  const limit = Math.max(paginationOptions?.limit || 10, 1);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const page = Math.min(Math.max(paginationOptions?.page || 1, 1), totalPages);

  const skip = (page - 1) * limit;

  let count = limit;
  if (page === totalPages) {
    count = total % limit || limit;
  }

  return {
    paginationQuery: {
      skip,
      take: limit,
    },
    paginationResult: {
      page,
      limit,
      count,
      total,
      totalPages,
      hasNext: page * limit < total,
      hasPrev: page > 1,
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
