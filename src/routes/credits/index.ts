import { type FastifyPluginAsyncTypebox, Type } from '@fastify/type-provider-typebox'
import { CreditKind } from '../../plugins/db/index.js'

export default (async (app) => {
  app.post('/', {
    onRequest: app.auth([app.isAuthenticated]),
    schema: {
      security: [
        {
          jwt: [],
        },
      ],
      tags: ['학점'],
      summary: '학점을 수동으로 수하거나 등록합니다',
      body: Type.Object({
        kind: Type.String({ enum: Object.values(CreditKind) }),
        required: Type.Optional(Type.Number({ description: '필요학점' })),
        acquired: Type.Number({ description: '취득 학점' }),
      }),
      response: {
        201: Type.Object({
          id: Type.Number(),
          kind: Type.String({ enum: Object.values(CreditKind) }),
          acquired: Type.Number(),
          required: Type.Optional(Type.Union([Type.Number(), Type.Null()])),
        }),
        401: Type.Object({}, { description: '로그인이 되어 있지 않은 경우' }),
      },
    },
    handler: async (request, reply) => {
      const insertResult = await app.db
        .insertInto('memberCredit')
        .values({
          memberId: request.member.id,
          kind: request.body.kind as CreditKind,
          required: request.body.required,
          acquired: request.body.acquired,
        })
        .executeTakeFirst()

      const credit = await app.db
        .selectFrom('memberCredit')
        .selectAll()
        .where('id', '=', insertResult.insertId as unknown as number)
        .executeTakeFirstOrThrow()

      return reply.code(201).send(credit)
    },
  })
}) satisfies FastifyPluginAsyncTypebox
