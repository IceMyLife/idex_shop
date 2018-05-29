import config from '../config'
import connect from './connect'
export { query, transaction } from './services'

/**
 * Initializing connection pool
 */
export const pool = connect(config.db)
