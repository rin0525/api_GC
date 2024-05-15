import { type FastifyPluginAsyncTypebox, Type } from '@fastify/type-provider-typebox'

export default (async (app) => {
  app.get(
    '/',
    {
      schema: {
        tags: ['사용자'],
        security: [
          {
            jwt: [],
          },
        ],
        summary: '현재 로그인된 사용자의 정보를 불러옵니다',
        response: {
          200: Type.Object({
            id: Type.Number(),
            name: Type.String(),
            phone: Type.String(),
            department: Type.String(),
          }),
          401: Type.Object({}, { description: '로그인되어 있지 않은 경우' }),
        },
      },
      onRequest: app.auth([app.isAuthenticated]),
    },
    async (request, reply) => {
      // 사용자 정보를 데이터베이스에서 가져옵니다
      const member = await app.db
        .selectFrom('member')
        .where('id', '=', request.member.id)
        .innerJoin('department', 'member.departmentId', 'department.id')
        .selectAll('member')
        .select((eb) => eb.ref('department.name').as('department'))
        .executeTakeFirst()

      // 일치하는 사용자 정보가 없는 경우에 401 응답을 내려줍니다
      if (!member) {
        return reply.unauthorized()
      }

      return member
    },
  )
}) satisfies FastifyPluginAsyncTypebox
