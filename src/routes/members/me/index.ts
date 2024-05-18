import { type FastifyPluginAsyncTypebox, Type } from '@fastify/type-provider-typebox'
import { jsonBuildObject } from 'kysely/helpers/mysql'
import type { QueryError } from 'mysql2'
import { match } from 'ts-pattern'

export default (async (app) => {
  app
    .get(
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
              department: Type.Object({
                id: Type.Number(),
                name: Type.String(),
              }),
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
          .where('member.id', '=', request.member.id)
          .innerJoin('department', 'member.departmentId', 'department.id')
          .selectAll('member')
          .select((eb) =>
            jsonBuildObject({
              id: eb.ref('department.id'),
              name: eb.ref('department.name'),
            }).as('department'),
          )
          .executeTakeFirst()

        // 일치하는 사용자 정보가 없는 경우에 401 응답을 내려줍니다
        if (!member) {
          return reply.unauthorized()
        }

        return member
      },
    )
    .put('/', {
      schema: {
        tags: ['사용자'],
        security: [
          {
            jwt: [],
          },
        ],
        body: Type.Object({
          id: Type.Number(),
          name: Type.String(),
          departmentId: Type.Number(),
        }),
        summary: '현재 로그인된 사용자의 정보를 수정합니다',
        response: {
          200: Type.Object({
            id: Type.Number(),
            name: Type.String(),
            department: Type.Object({
              id: Type.Number(),
              name: Type.String(),
            }),
          }),
          401: Type.Object({}, { description: '로그인되어 있지 않은 경우' }),
        },
      },
      onRequest: app.auth([app.isAuthenticated]),
      handler: async (request, reply) => {
        // 데이터베이스에 수정 쿼리 요청
        const [err, updateResult] = await app.to(
          app.db
            .updateTable('member')
            .where('member.id', '=', request.member.id)
            .set({
              id: request.body.id,
              name: request.body.name,
              departmentId: request.body.departmentId,
            })
            .executeTakeFirst(),
        )

        // 데이터베이스 수정과정에서 오류가 난 경우 학번이 중복되는 경우
        if (err) {
          return match(err as QueryError)
            .with({ errno: 1062 }, () => reply.conflict('이미 사용중인 학번입니다'))
            .otherwise((err) => {
              app.log.error(err)
              // 알 수 없는 오류의 경우 바로 함수를 종료합니다
              return reply.internalServerError()
            })
        }

        // 일치하는 사용자 정보가 없는 경우에 401 응답을 내려줍니다
        if (updateResult.numUpdatedRows <= 0) {
          return reply.unauthorized()
        }

        const member = await app.db
          .selectFrom('member')
          .where('member.id', '=', request.member.id)
          .innerJoin('department', 'member.departmentId', 'department.id')
          .selectAll('member')
          .select((eb) =>
            jsonBuildObject({
              id: eb.ref('department.id'),
              name: eb.ref('department.name'),
            }).as('department'),
          )
          .executeTakeFirstOrThrow()

        return member
      },
    })
}) satisfies FastifyPluginAsyncTypebox
