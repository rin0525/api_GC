import type { FastifyPluginAsync, FastifyPluginOptions, RawServerBase, RawServerDefault } from 'fastify'

declare module 'fastify' {
  interface FastifyInstance {
    isLocal: boolean
    isDev: boolean
    isProd: boolean
  }
}
