import type { FastifyAuthFunction } from '@fastify/auth'
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import * as jose from 'jose'
import type { Member } from './db/index.js'

declare module 'fastify' {
  export interface FastifyInstance {
    authenticate: (member: Member) => Promise<string>
    isAuthenticated: FastifyAuthFunction
  }

  interface FastifyRequest {
    member: Member
  }
}

export default (async (app) => {
  const JWT_SECRET = new TextEncoder().encode(app.config.JWT_SECRET)

  app.decorate('authenticate', async (member: Member) => {
    // JWT 토큰을 생성합니다
    return await new jose.EncryptJWT({ ...member })
      .setProtectedHeader({ alg: 'dir', enc: 'A256CBC-HS512' })
      .setSubject(`${member.id}`)
      .setIssuedAt()
      .encrypt(JWT_SECRET)
  })

  app.decorate('isAuthenticated', async (request, reply) => {
    // 사용자 인증 여부를 파악합니다
    const authorization = request.headers.authorization
    const jwt = authorization?.split(' ')?.at(1)
    if (!jwt) {
      return reply.unauthorized().send()
    }

    const { payload } = await jose.jwtDecrypt<Member>(jwt, JWT_SECRET)

    request.member = payload
  })
}) satisfies FastifyPluginAsyncTypebox
