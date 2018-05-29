import { query, pool } from '../db'
import { BadRequest } from '../middlewares/errors'

/**
 * Find all diamonds by limit params
 * @param ctx
 * @param next
 * @returns {Promise<void>}
 */
export const getDiamonds = async (ctx, next) => {
  const q = ctx.request.query

  let sql = 'SELECT * FROM `catalog`'

  if (q.limit) {
    sql += ' LIMIT ' + parseInt(q.limit) || 0

    if (q.offset) {
      sql += ' OFFSET ' + parseInt(q.offset) || 0
    }
  }

  ctx.body = await query(sql, pool)
}

/**
 * Find diamond by id
 * @param ctx
 * @param next
 * @returns {Promise<void>}
 */
export const getDiamondById = async (ctx, next) => {
  const p = ctx.params
  const diamondId = Number(p.id) || 0

  if (!diamondId) {
    throw new BadRequest({ message: 'Invalid diamond id!' })
  }

  const result = await query('SELECT * FROM `catalog` WHERE `external_id` = ' + diamondId, pool)

  ctx.body = result.length
    ? result[0]
    : result
}
