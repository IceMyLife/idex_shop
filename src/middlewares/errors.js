class ServerError extends Error {
  constructor (body) {
    super(body.message)
    this.name = 'ServerError'
    this.body = body
    this.statusCode = 500
    this.stack = ''
  }
}

// 400 Bad Request
class BadRequest extends ServerError {
  constructor (body) {
    super(body)
    this.name = 'Bad Request'
    this.statusCode = 400
  }
}

// 401 Unauthorized
class Unauthorized extends ServerError {
  constructor (body) {
    super(body)
    this.name = 'Unauthorized'
    this.statusCode = 401
  }
}

// 404 Not Found
class NotFound extends ServerError {
  constructor (body) {
    super(body)
    this.name = 'Not Found'
    this.statusCode = 404
  }
}

// 500 Internal Server Error
class InternalServerError extends ServerError {
  constructor (body) {
    super(body)
    this.name = 'Internal Server Error'
    this.statusCode = 500
  }
}

module.exports.BadRequest = BadRequest
module.exports.Unauthorized = Unauthorized
// module.exports.Forbidden = Forbidden
module.exports.NotFound = NotFound
// module.exports.Conflict = Conflict
// module.exports.UnprocessableEntity = UnprocessableEntity
module.exports.InternalServerError = InternalServerError

/**
 * Handle status 404
 * @param status
 * @param body
 * @returns {boolean}
 */
const shouldThrow404 = (status, body) =>
  !status || (status === 404 && body == null)

/**
 * Middleware for handle error
 * @returns {Function}
 */
export default () =>
  async (ctx, next) => {
    try {
      await next()
      console.log(ctx.status)
      shouldThrow404(ctx.status, ctx.body) && ctx.throw(404)
    } catch (e) {
      ctx.status = e.status || e.statusCode || 500
      ctx.body = {
        code: ctx.status,
        message: e.message
      }
    }
  }
