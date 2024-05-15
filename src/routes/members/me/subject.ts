import { type FastifyPluginAsyncTypebox, Type, TypeBoxValidatorCompiler } from '@fastify/type-provider-typebox'
import { jsonBuildObject } from 'kysely/helpers/mysql'

export default (async (app) => {
  app.get(
    '/subjects',
    {
      schema: {
        tags: ['사용자'],
        security: [
          {
            jwt: [],
          },
        ],
        summary: '현재 로그인된 사용자가 수강 과목을 불러옵니다',
        response: {
          200: Type.Array(
            Type.Object({
              id: Type.Number(),
              year: Type.Number(),
              semester: Type.String(),
              credit: Type.Number(),
              grade: Type.String(),
              subject: Type.Object({
                id: Type.String(),
                kind: Type.String(),
                name: Type.String(),
              }),
            }),
          ),
          401: Type.Object({}, { description: '로그인되어 있지 않은 경우' }),
        },
      },
      onRequest: app.auth([app.isAuthenticated]),
    },
    async (request, reply) => {
      // 사용자 정보를 데이터베이스에서 가져옵니다
      const member = await app.db
        .selectFrom('memberSubject as ms')
        .where('ms.memberId', '=', request.member.id)
        .innerJoin('subject as s', 's.id', 'ms.subjectId')
        .selectAll('ms')
        .select((eb) =>
          jsonBuildObject({
            id: eb.ref('s.id'),
            kind: eb.ref('s.kind'),
            name: eb.ref('s.name'),
          }).as('subject'),
        )
        .executeTakeFirst()

      // 일치하는 사용자 정보가 없는 경우에 401 응답을 내려줍니다
      if (!member) {
        return reply.unauthorized()
      }

      return member
    },
  )
}) satisfies FastifyPluginAsyncTypebox
