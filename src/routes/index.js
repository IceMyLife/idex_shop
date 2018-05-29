import Router from 'koa-router'
import ctrl from '../controllers'

// Init router
let _ = new Router()

_.prefix('/api/v1') // Note: set prefix from config. TODO: add api versioning

// _.post('/', ctrl.postIndex)
//
// _.get('/', ctrl.getIndex)
//
// _.put('/', ctrl.putIndex)
//
// _.delete('/', ctrl.deleteIndex)

_.get('/diamonds', ctrl.getDiamonds)

_.get('/diamonds/:id', ctrl.getDiamondById)

export default () => _.routes()
