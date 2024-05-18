import { type FastifyPluginAsyncTypebox, Type } from '@fastify/type-provider-typebox'
import { sql } from 'kysely'
import { jsonBuildObject } from 'kysely/helpers/mysql'
import { P, match } from 'ts-pattern'
import { CreditKind } from '../../plugins/db/index.js'

const resolveCreditKind = (kind: string) =>
  match(kind)
    .with(P.union('인성교양', '기본교양'), () => CreditKind.TENACITY_LIBERAL_ARTS)
    .with(P.union('일반자유', '자유선택'), () => CreditKind.GENERAL)
    .with(P.union('기초교양', '대학기초'), () => CreditKind.REQUIRED_LIBERAL_ARTS)
    .with(P.union('일반교양', '균형교양'), () => CreditKind.GENERAL_LIBERAL_ARTS)
    .with('전공기초', () => CreditKind.BASIC_MAJOR)
    .with('전공필수', () => CreditKind.OPTIONAL_MAJOR)
    .with(P.union('전공과목', '전공선택'), () => CreditKind.OPTIONAL_MAJOR)

export default (async (app) => {
  app.post('/', {
    onRequest: app.auth([app.isAuthenticated]),
    schema: {
      security: [
        {
          jwt: [],
        },
      ],
      tags: ['이수교과목'],
      summary: '이수교과목을 수동으로 등록합니다',
      body: Type.Object({
        kind: Type.String(),
        year: Type.Number(),
        semester: Type.Number(),
        credit: Type.Number(),
        grade: Type.String(),
        subject: Type.Object({
          id: Type.String(),
          name: Type.String(),
        }),
      }),
      response: {
        201: Type.Object({
          id: Type.Number(),
          kind: Type.String(),
          year: Type.Number(),
          semester: Type.Number(),
          credit: Type.Number(),
          grade: Type.String(),
          subject: Type.Object({
            id: Type.String(),
            name: Type.String(),
          }),
        }),
        401: Type.Object({}, { description: '로그인이 되어 있지 않은 경우' }),
      },
    },
    handler: async (request, reply) => {
      const insertResult = await app.db.transaction().execute(async (trx) => {
        await trx
          .insertInto('subject')
          .ignore()
          .values({
            id: request.body.subject.id,
            name: request.body.subject.name,
          })
          .execute()

        const insertResult = await trx
          .insertInto('memberSubject')
          .values({
            memberId: request.member.id,
            kind: request.body.kind,
            year: request.body.year,
            semester: request.body.semester,
            credit: request.body.credit,
            grade: request.body.grade,
            subjectId: request.body.subject.id,
            isFromXlsx: false,
          })
          .executeTakeFirst()

        const creditKind = resolveCreditKind(request.body.kind).otherwise(() => null)
        if (creditKind) {
          await trx
            .insertInto('memberCredit')
            .columns(['kind', 'memberId', 'acquired', 'required'])
            .expression(
              app.db
                .selectFrom('memberCredit')
                .select((eb) => [
                  'kind',
                  'memberId',
                  sql`${eb.ref('acquired')} + ${eb.val(request.body.credit)}`.as('acquired'),
                  'required',
                ])
                .where('kind', '=', creditKind)
                .where('memberId', '=', request.member.id)
                .orderBy('createdAt desc')
                .limit(1),
            )
            .execute()
        }
        return insertResult
      })

      const subject = await app.db
        .selectFrom('memberSubject as ms')
        .where('ms.id', '=', insertResult.insertId as unknown as number)
        .innerJoin('subject as s', 's.id', 'ms.subjectId')
        .selectAll('ms')
        .select((eb) =>
          jsonBuildObject({
            id: eb.ref('s.id'),
            name: eb.ref('s.name'),
          }).as('subject'),
        )
        .executeTakeFirstOrThrow()

      return reply.code(201).send(subject)
    },
  })
}) satisfies FastifyPluginAsyncTypebox
