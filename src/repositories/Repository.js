/** @typedef {import('@prisma/client').Prisma.BatchPayload} BatchPayload */

/**
 * @template T
 * @typedef {{
 *   [K in keyof T]?:
 *     T[K] | { in: T[K] extends Array<infer U> ? U[] : T[K][] }
 * }} FilterArgs
 */

/** @typedef {String} IDType */

/**
 * @template TEntity
 * @template TEntityData
 * @template TFilter
 */
export class Repository {

  constructor(model) {
    this.model = model;
  }

  /**
   * @async
   * @method
   * @param {TFilter} filter
   * @returns {Promise<boolean>}
   */
  async exists(filter) {
    return (await this.model.count({ where: filter })) > 0;
  }


  /**
   * @async
   * @method
   * @param {TFilter} fitler
   * @returns {Promise<TEntity[]>}
   */
  async find(fitler) {
    return await this.model.findMany({
      where: fitler,
    });
  };

  /**
   * @async
   * @method
   * @param {TEntityData[]} data
   * @returns {Promise<BatchPayload>}
   */
  async create(data) {
    return await this.model.createMany({
      data: data
    });
  };

  /**
   * @async
   * @method
   * @param {TFilter} filter
   * @param {TEntityData} data
   * @returns {Promise<BatchPayload>}
   */
  async update(filter, data) {
    return await this.model.updateMany({
      where: filter,
      data,
    });
  };

  /**
   * @async
   * @method
   * @param {TFilter} filter
   * @returns {Promise<BatchPayload>}
   */
  async delete(filter) {
    return await this.model.deleteMany({
      where: filter,
    });
  };
}
