import { type FastifyPluginAsyncTypebox, Type } from '@fastify/type-provider-typebox'
import argon2 from 'argon2'
import type { QueryError } from 'mysql2'
import { match } from 'ts-pattern'

export default (async (app) => {
  app.post(
    '/',
    {
      schema: {
        tags: ['사용자'],
        summary: '회원가입을 진행합니다',
        body: Type.Object({
          id: Type.Number(),
          email: Type.String({ examples: ['abc@abc.com'] }),
          name: Type.String({ examples: ['김이름'] }),
          password: Type.String(),
          departmentId: Type.Number(),
        }),
        response: {
          201: Type.Object({
            id: Type.Number(),
            name: Type.String(),
            department: Type.String(),
          }),
          409: Type.Object(
            {
              message: Type.String(),
            },
            { description: '이미 존재하는 사용자인 경우' },
          ),
        },
      },
    },
    async (request, reply) => {
      // 사용자 정보를 데이터베이스에 저장하려고 합니다
      const [err] = await app.to(
        app.db
          .insertInto('member')
          .values({
            id: request.body.id,
            email: request.body.email,
            name: request.body.name,
            departmentId: request.body.departmentId,
            // 비밀번호를 암호화합니다
            password: await argon2.hash(request.body.password),
          })
          .executeTakeFirst(),
      )

      // 오류가 발생하지 않은 경우
      if (!err) {
        const insertedResult = await app.db
          .selectFrom('member')
          .where('member.id', '=', request.body.id)
          .innerJoin('department', 'member.departmentId', 'department.id')
          .selectAll('member')
          .select((eb) => eb.ref('department.name').as('department'))
          .executeTakeFirstOrThrow()

        // TODO: 토큰을 포함한 응답값을 내려줘야함
        return reply.code(201).send(insertedResult)
      }

      // 오류가 발생한 경우에 따른 분기처리
      return match(err as QueryError)
        .with({ errno: 1062 }, () => reply.conflict('이미 존재하는 회원입니다`'))
        .otherwise(() =>
          // 알 수 없는 오류의 경우 바로 함수를 종료합니다
          reply.internalServerError(),
        )
    },
  )
}) satisfies FastifyPluginAsyncTypebox
