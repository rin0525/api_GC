import { type FastifyPluginAsyncTypebox, Type } from '@fastify/type-provider-typebox'
import * as argon2 from 'argon2'

export default (async (app) => {
  app.post(
    '/lost-password',
    {
      schema: {
        tags: ['인증'],
        summary: '비밀번호 찾기',
        body: Type.Object({
          id: Type.Number(),
          email: Type.String(),
          password: Type.String(),
        }),
        response: {
          204: {
            description: '성공적으로 변경한 경우',
            type: 'null',
          },
          404: Type.Object(
            {
              message: Type.String(),
            },
            { description: '사용자가 존재하지 않는 경우' },
          ),
        },
      },
    },
    async (request, reply) => {
      // 해당하는 ID의 사용자를 불러옵니다
      const member = await app.db
        .selectFrom('member')
        .where('id', '=', request.body.id)
        .where('email', '=', request.body.email)
        .selectAll()
        .executeTakeFirst()
      if (!member) {
        return reply.notFound('존재하지 않는 사용자입니다')
      }

      await app.db
        .updateTable('member')
        .where('id', '=', request.body.id)
        .where('email', '=', request.body.email)
        .set({ password: await argon2.hash(request.body.password) })
        .execute()
      return reply.code(204)
    },
  )
}) satisfies FastifyPluginAsyncTypebox
