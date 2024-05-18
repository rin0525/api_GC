import { type FastifyPluginAsyncTypebox, Type } from '@fastify/type-provider-typebox'
import { sql } from 'kysely'
import { CreditKind } from '../../../plugins/db/index.js'

export default (async (app) => {
  app.get(
    '/credits',
    {
      schema: {
        tags: ['사용자'],
        security: [
          {
            jwt: [],
          },
        ],
        summary: '현재 로그인된 사용자의 학점을 불러옵니다',
        response: {
          200: Type.Object({
            credits: Type.Array(
              Type.Object({
                id: Type.Number(),
                kind: Type.String({ enum: Object.values(CreditKind) }),
                acquired: Type.Number(),
                required: Type.Union([Type.Number(), Type.Null()]),
              }),
              { description: '학점 정보' },
            ),
            hasLiberalArts1: Type.Boolean(),
            hasLiberalArts2: Type.Boolean(),
            hasLiberalArts3: Type.Boolean(),
            hasLiberalArts4: Type.Boolean(),
          }),
          401: Type.Object({}, { description: '로그인되어 있지 않은 경우' }),
        },
      },
      onRequest: app.auth([app.isAuthenticated]),
    },
    async (request, reply) => {
      // 학점 정보를 데이터베이스에서 불러옵니다
      // member_credit 테이블 중 사용자 데이터만을 불러오고 등록된 사용자 데이터 중에 가장 최신 데이터만 가져옵니다
      const credits = await app.db
        .with('mc', (db) =>
          db
            .selectFrom('memberCredit as mc')
            .selectAll('mc')
            .select((eb) =>
              sql<number>`ROW_NUMBER() OVER (PARTITION BY ${eb.ref('kind')} ORDER BY ${eb.ref('createdAt')} DESC)`.as(
                'r',
              ),
            )
            .where('mc.memberId', '=', request.member.id),
        )
        .selectFrom('mc')
        .selectAll()
        .where('mc.r', '=', 1)
        .execute()

      // (1),(2),(3),(4) 가 포함된 교양이 존재하는지 확인합니다
      const liberalArtQuery = app.db
        .selectFrom('memberSubject as ms')
        .select('ms.id')
        .innerJoin('subject as s', 's.id', 'ms.subjectId')
        .where('ms.memberId', '=', request.member.id)
      const liberalArts = await app.db
        .selectNoFrom((eb) => [
          eb.exists(liberalArtQuery.where('s.name', 'like', '%(1)%')).as('hasLiberalArts1'),
          eb.exists(liberalArtQuery.where('s.name', 'like', '%(2)%')).as('hasLiberalArts2'),
          eb.exists(liberalArtQuery.where('s.name', 'like', '%(3)%')).as('hasLiberalArts3'),
          eb.exists(liberalArtQuery.where('s.name', 'like', '%(4)%')).as('hasLiberalArts4'),
        ])
        .executeTakeFirstOrThrow()

      return { credits, ...liberalArts }
    },
  )
}) satisfies FastifyPluginAsyncTypebox
