import { type FastifyPluginAsyncTypebox, Type } from '@fastify/type-provider-typebox'
import argon2 from 'argon2'
import fastify from 'fastify'

export default (async (app) => {
  app.get(
    '/',
    {
      schema: {
        tags: ['사용자'],
        summary: '회원가입을 진행합니다',
        body: Type.Object({
          id: Type.Number(),
          email: Type.String(),
          name: Type.String(),
          phone: Type.String(),
          password: Type.String(),
          departmentId: Type.Number(),
        }),
        response: {
          201: Type.Object({
            id: Type.Number(),
            name: Type.String(),
            phone: Type.String(),
            department: Type.String(),
          }),
          409: Type.Object({}, { description: '이미 존재하는 사용자인 경우' }),
        },
      },
    },
    async (request, reply) => {
      // 사용자 정보를 데이터베이스에서 가져옵니다
      const [err, _] = await app.to(
        app.db
          .insertInto('member')
          .values({
            ...request.body,
            password: await argon2.hash(request.body.password),
          })
          .executeTakeFirst(),
      )

      return await app.db
        .selectFrom('member')
        .where('id', '=', request.body.id)
        .innerJoin('department', 'member.departmentId', 'department.id')
        .selectAll('member')
        .select((eb) => eb.ref('department.name').as('department'))
        .executeTakeFirstOrThrow()
    },
  )
}) satisfies FastifyPluginAsyncTypebox
