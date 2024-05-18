import { type FastifyPluginAsyncTypebox, Type } from '@fastify/type-provider-typebox'
import argon2 from 'argon2'
import { jsonBuildObject } from 'kysely/helpers/mysql'
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
            member: Type.Object({
              id: Type.Number(),
              name: Type.String(),
              department: Type.Object({
                id: Type.Number(),
                name: Type.String(),
              }),
            }),
            token: Type.String(),
          }),
          409: Type.Object(
            {
              message: Type.String(),
            },
            { description: '이미 존재하는 학번 또는 이메일인 경우' },
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
        // 추가된 사용자 정보를 불러옵니다
        const insertedResult = await app.db
          .selectFrom('member')
          .where('member.id', '=', request.body.id)
          .innerJoin('department', 'member.departmentId', 'department.id')
          .selectAll('member')
          .select((eb) =>
            jsonBuildObject({
              id: eb.ref('department.id'),
              name: eb.ref('department.name'),
            }).as('department'),
          )
          .executeTakeFirstOrThrow()

        // 인증용 토큰을 발행합니다
        const token = await app.authenticate(insertedResult)
        return reply.code(201).send({
          member: insertedResult,
          token,
        })
      }

      // 오류가 발생한 경우에 따른 분기처리
      return match(err as QueryError)
        .with({ errno: 1062 }, () => reply.conflict('이미 사용중인 학번이거나 이메일입니다'))
        .otherwise(() =>
          // 알 수 없는 오류의 경우 바로 함수를 종료합니다
          reply.internalServerError(),
        )
    },
  )
}) satisfies FastifyPluginAsyncTypebox
