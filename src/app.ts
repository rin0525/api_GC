import path from 'node:path'
import { type TypeBoxTypeProvider, TypeBoxValidatorCompiler } from '@fastify/type-provider-typebox'
import fastify from 'fastify'
import { ConfigSchema } from './config.js'

const app = fastify({
  logger: true,
  ignoreTrailingSlash: true,
})
  .withTypeProvider<TypeBoxTypeProvider>()
  .setValidatorCompiler(TypeBoxValidatorCompiler)

await app.register(import('@fastify/env'), {
  confKey: 'config',
  dotenv: {
    debug: true,
  },
  schema: ConfigSchema,
})

await app.register(import('@fastify/sensible'))

app.decorate('isLocal', app.config.ENVIRONMENT === 'local')
app.decorate('isDev', app.config.ENVIRONMENT.startsWith('dev'))
app.decorate('isProd', app.config.ENVIRONMENT.startsWith('prod'))

await app.register(import('@fastify/auth'))

await app.register(import('@fastify/swagger'), {
  openapi: {
    info: {
      title: '호서대학교',
      description: '',
      version: '1.0.0',
    },
    components: {
      securitySchemes: {
        jwt: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'jwt',
        },
      },
    },
  },
})

await app.register(import('@fastify/swagger-ui'), {
  routePrefix: '/-/docs',
})

// TODO: 배포시 프론트엔드 도메인 여쭤보고 해당 도메인 CORS 추가
await app.register(import('@fastify/cors'), {
  origin: [/localhost/],
  credentials: true,
})

await app.register(import('@fastify/autoload'), {
  dir: path.join(import.meta.dirname, 'plugins'),
  routeParams: true,
  indexPattern: /^$/,
  encapsulate: false,
})

await app.register(import('@fastify/autoload'), {
  dir: path.join(import.meta.dirname, 'routes'),
  routeParams: true,
  indexPattern: /^$/,
})

export { app }
