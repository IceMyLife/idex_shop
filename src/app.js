import Koa from 'koa'
import helmet from 'koa-helmet'
import cors from 'kcors'
import body from 'koa-json-body'
import router from './routes'
import errors from './middlewares/errors'
import config from './config'

const PORT = process.env.PORT || config.app.port

// Init application
let app = new Koa()

// Middleware
app.use(helmet())
app.use(cors({ // Note: use config
  origin: '*',
  allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH',
  keepHeadersOnError: true
}))
app.use(body({ limit: '10kb', fallback: true })) // Note: use config

// Custom middlewares
app.use(errors())
// app.use(database())
app.use(router())

app.listen(PORT, config.app.host, null, () => { // Note: use config
  console.log('Server started!')
})
