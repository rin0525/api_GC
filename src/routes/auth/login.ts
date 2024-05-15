import { type FastifyPluginAsyncTypebox, Type } from '@fastify/type-provider-typebox'
import * as argon2 from 'argon2'

export default (async (app) => {
  /**
   * 로그인시 발생하는 공통 오류
   */
  const loginError = app.httpErrors.createError(401, '아이디 혹은 비밀번호가 틀렸습니다')

  app.post(
    '/login',
    {
      schema: {
        tags: ['인증'],
        summary: '로그인',
        body: Type.Object({
          id: Type.Number(),
          password: Type.String(),
        }),
        response: {
          201: Type.Object({
            token: Type.String(),
          }),
          401: Type.Object(
            {
              message: Type.String(),
            },
            { description: '아이디 혹은 비밀번호가 틀린 경우' },
          ),
        },
      },
    },
    async (request, reply) => {
      // 해당하는 ID의 사용자를 불러옵니다
      const member = await app.db.selectFrom('member').where('id', '=', request.body.id).selectAll().executeTakeFirst()
      if (!member) {
        throw loginError
      }

      // 비밀번호가 일치하는지 확인합니다
      const isMatch = await argon2.verify(member.password, request.body.password)
      if (!isMatch) {
        throw loginError
      }

      return {
        // 추후 요청시 사용할 수 있는 JWT 토큰으로 변환합니다
        token: await app.authenticate(member),
      }
    },
  )
}) satisfies FastifyPluginAsyncTypebox
