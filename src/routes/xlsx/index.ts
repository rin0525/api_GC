import type { MultipartFile } from '@fastify/multipart'
import { type FastifyPluginAsyncTypebox, Kind, Type, TypeRegistry } from '@fastify/type-provider-typebox'
import mime from 'mime'
import * as XLSX from 'xlsx'
import { SheetProcessor } from './processor.js'

/**
 * 허용된 파일 확장자
 */
const ALLOWED_EXTENSIONS = ['xls', 'xlsx']

const CREDIT_COLUMNS = {
  C: '인성교양',
  D: '기초교양',
  H: '일반교양',
  J: '이공계 전공 기초',
  M: '전공선택',
  O: '전공필수',
  Q: '복수 전공',
  U: '부 전공',
  X: '교직 과정',
  Z: '일반 (자유)',
  AC: '합계',
} as const

type ValueOf<T> = T[keyof T]

export default (async (app) => {
  app.post(
    '/',
    {
      schema: {
        security: [
          {
            jwt: [],
          },
        ],
        tags: ['엑셀 처리'],
        summary: '엑셀 파일을 업로드합니다',
        consumes: ['multipart/form-data'],
        produces: ['application/json'],
        body: Type.Object({
          xlsx: Type.String({ type: 'string', format: 'binary' }),
        }),
        response: {
          400: Type.Object({}, { description: '파일이 존재하지 않는 경우' }),
          415: Type.Object({}, { description: '허용되지 않은 파일 확장자' }),
        },
      },
      onRequest: app.auth([app.isAuthenticated]),
      attachValidation: true,
    },
    async (request, reply) => {
      // 요청에 파일이 존재하는지 확인합니다
      const file = await request.file()
      if (!file) {
        return reply.badRequest()
      }

      // MIME 타입으로 파일 확장자를 추론합니다
      const ext = mime.getExtension(file.mimetype)

      // 허용되지 않은 파일 확장자의 경우 415 응답을 내려줍니다
      if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
        return reply.unsupportedMediaType()
      }

      // 파일을 처리하기 위해 파일을 Buffer 형태로 변환합니다
      const buffer = await file.toBuffer()

      // XLSX 라이브러리를 통해 파일을 읽습니다
      const workbook = XLSX.read(buffer)

      // 첫번째 시트 이름을 가져옵니다
      const firstSheetName = workbook.SheetNames.at(0) as string

      // 첫번째 시트를 가져옵니다
      const worksheet = workbook.Sheets[firstSheetName]

      const processor = new SheetProcessor(worksheet)

      // 학점 정보를 가져옵니다
      const credits = processor.getCredits()

      // 이수교과목을 가져옵니다
      const subjects = processor.getSubjects()

      await app.db.transaction().execute(async (trx) => {
        // 엑셀을 통해 추가된 이수교과목들은 삭제합니다
        await trx
          .deleteFrom('memberSubject as ms')
          .where('ms.memberId', '=', request.member.id)
          .where('ms.isFromXlsx', '<>', true)
          .execute()

        // 학점을 추가합니다
        await trx
          .insertInto('memberCredit')
          .values(
            credits.map((c) => ({
              ...c,
              memberId: request.member.id,
            })),
          )
          .execute()

        // 교과목을 생성합니다
        await trx
          .insertInto('subject')
          .ignore()
          .values(
            subjects.map((s) => ({
              id: s.subjectId,
              name: s.subjectName,
            })),
          )
          .execute()

        // 이수교과목을 생성합니다
        await trx
          .insertInto('memberSubject')
          .values(
            subjects.map(({ subjectName, ...s }) => ({
              ...s,
              memberId: request.member.id,
            })),
          )
          .execute()
      })

      return reply.code(201).send({ success: true })
    },
  )
}) satisfies FastifyPluginAsyncTypebox
