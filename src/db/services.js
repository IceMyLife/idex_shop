import { InternalServerError } from '../middlewares/errors'

/**
 * Query decorate
 * @param {String} sql - query
 * @param pool - instance
 * @returns {Promise<*>}
 */
export const query = async (sql, pool) => {
  try {
    return await pool.query(sql)
  } catch (e) {
    throw new InternalServerError(e)
  }
}

/**
 * Transaction
 * @param {Array} sqlList
 * @param pool - instance
 * @returns {Promise<void>}
 */
export const transaction = async (sqlList, pool) => {
  try {
    await pool.query('START TRANSACTION;')

    for (let i = 0; i < sqlList.length; i++) {
      await pool.query(sqlList[i])
    }

    await pool.query('COMMIT;')
  } catch (e) {
    await pool.query('ROLLBACK;')
    throw new InternalServerError(e)
  }
}
