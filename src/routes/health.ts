import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'

export default (async (app) => {
  app.get(
    '/health',
    {
      schema: {
        hide: true,
      },
    },
    (_, reply) => reply.status(204).send(),
  )
}) satisfies FastifyPluginAsyncTypebox
