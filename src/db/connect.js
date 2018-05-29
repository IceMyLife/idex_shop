import mysql from 'mysql'
import util from 'util'

/**
 * Connection function
 * @param config
 * @returns {*}
 */
export default (config) => {
  let pool = mysql.createPool(config)

  // Note: to promisify the pool.query
  pool.query = util.promisify(pool.query)

  return pool
}
