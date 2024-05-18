import { type FastifyPluginAsyncTypebox, Type } from '@fastify/type-provider-typebox'

export default (async (app) => {
  app.get('/', {
    schema: {
      tags: ['학과'],
      summary: '등록된 학과를 불러옵니다',
      response: {
        200: Type.Array(
          Type.Object({
            id: Type.Number(),
            name: Type.String(),
          }),
        ),
      },
    },
    handler: async (request, reply) => {
      return await app.db.selectFrom('department').selectAll().execute()
    },
  })
}) satisfies FastifyPluginAsyncTypebox
