import Koa from 'koa'
import cors from '@koa/cors'
import KoaRouter from '@koa/router'
import { koaSwagger } from 'koa2-swagger-ui'
import bodyParser from 'koa-bodyparser'
import { RegisterRoutes } from './src/routes/routes' // <- fixed import path
import swagger from './src/routes/swagger.json' // <- fixed path
import { type Server, type IncomingMessage, type ServerResponse } from 'http'
import { type AppBookDatabaseState, getBookDatabase } from './src/database_access'
import { type AppWarehouseDatabaseState, getDefaultWarehouseDatabase } from './src/warehouse/warehouse_database'

export default async function (
  port?: number,
  randomizeDbs?: boolean
): Promise<{
  server: Server<typeof IncomingMessage, typeof ServerResponse>
  state: AppBookDatabaseState & AppWarehouseDatabaseState
}> {
  const bookDb = getBookDatabase(randomizeDbs === true ? undefined : 'mcmasterful-books')
  const warehouseDb = await getDefaultWarehouseDatabase(randomizeDbs === true ? undefined : 'mcmasterful-warehouse')

  const state: AppBookDatabaseState & AppWarehouseDatabaseState = {
    books: bookDb,
    warehouse: warehouseDb
  }

  const app = new Koa<AppBookDatabaseState & AppWarehouseDatabaseState>()

  app.use(async (ctx, next): Promise<void> => {
    ctx.state = state
    await next()
  })

  app.use(cors())
  app.use(bodyParser())

  const koaRouter = new KoaRouter()
  RegisterRoutes(koaRouter)

  app.use(koaRouter.routes())
  app.use(
    koaSwagger({
      routePrefix: '/docs',
      specPrefix: '/docs/spec',
      exposeSpec: true,
      swaggerOptions: {
        spec: swagger
      }
    })
  )

  return {
    server: app.listen(port, () => {
      console.log('listening')
    }),
    state
  }
}
