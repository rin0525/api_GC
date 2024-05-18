import { type Kysely, sql } from 'kysely'
import type { Database } from '../database.js'

export const autoload = false

const departments = [
  '기독교학과',
  '한국언어문화학과',
  '영어영문학과',
  '중국학과',
  '법경찰행정학과',
  ' 사회복지학부 ',
  '청소년문화·상담학과',
  '유아교육과',
  '항공서비스학과',
  '산업심리학과',
  '미디어커뮤니케이션학과',
  '글로벌통상학과',
  ' 경영학부 ',
  '디지털금융경영학과',
  '식품공학과',
  '제약공학과',
  '화장품과학과',
  '생명공학과',
  '식품영양학과',
  '간호학과',
  '물리치료학과',
  '임상병리학과',
  '동물보건복지학과',
  '전기공학과',
  '시스템제어공학과',
  '기계공학과',
  '미래자동차학과',
  '화학공학과',
  '안전공학과',
  '소방방재학과',
  '건축학과',
  ' 건축토목공학부 ',
  '환경공학과',
  ' 정보통신공학부',
  '자동차 ICT공학과',
  '신소재공학과',
  '전자재료공학과',
  ' 빅데이터AI학부 ',
  ' 컴퓨터공학부',
  '게임소프트웨어학과',
  '지능로봇학과',
  '전자공학과',
  '반도체공학과',
  '사회체육학과',
  '골프산업학과',
  '시각디자인학과',
  '산업디자인학과',
  '디지털프로덕트디자인학과',
  '실내디자인학과',
  ' 문화영상학부 ',
  '애니메이션학과',
  ' 공연예술학부',
  '사회복지상담학과',
  '산업안전공학과',
  '스마트경영학과',
  '실용미디어학과',
]

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable('department')
    .ifNotExists()
    .addColumn('id', 'integer', (col) => col.notNull().autoIncrement().primaryKey())
    .addColumn('createdAt', 'datetime', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updatedAt', 'datetime', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('name', 'varchar(200)', (col) => col.notNull())
    .execute()

  await db
    .insertInto('department')
    .values(departments.map((name) => ({ name: name.trim() })))
    .execute()

  await db.schema
    .createTable('member')
    .ifNotExists()
    .addColumn('id', 'integer', (col) => col.notNull().primaryKey())
    .addColumn('createdAt', 'datetime', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updatedAt', 'datetime', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('deletedAt', 'datetime')
    .addColumn('name', 'varchar(20)', (col) => col.notNull())
    .addColumn('email', 'varchar(200)', (col) => col.notNull())
    .addColumn('password', 'text', (col) => col.notNull())
    .addColumn('departmentId', 'integer', (col) => col.notNull())
    .addForeignKeyConstraint('member_department_id_fk', ['departmentId'], 'department', ['id'])
    .execute()

  await db.schema
    .createTable('subject')
    .ifNotExists()
    .addColumn('id', 'varchar(10)', (col) => col.notNull().primaryKey())
    .addColumn('createdAt', 'datetime', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updatedAt', 'datetime', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('name', 'varchar(200)', (col) => col.notNull())
    .execute()

  await db.schema
    .createTable('memberSubject')
    .ifNotExists()
    .addColumn('id', 'integer', (col) => col.notNull().autoIncrement().primaryKey())
    .addColumn('createdAt', 'datetime', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updatedAt', 'datetime', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('memberId', 'integer', (col) => col.notNull())
    .addForeignKeyConstraint('memberSubjectMemberIdFk', ['memberId'], 'member', ['id'])
    .addColumn('subjectId', 'varchar(10)', (col) => col.notNull())
    .addForeignKeyConstraint('memberSubjectSubjectIdFk', ['subjectId'], 'subject', ['id'])
    .addColumn('kind', 'varchar(100)', (col) => col.notNull())
    .addColumn('year', 'integer', (col) => col.notNull())
    .addColumn('semester', 'integer', (col) => col.notNull())
    .addColumn('credit', 'integer', (col) => col.notNull())
    .addColumn('grade', 'varchar(10)', (col) => col.notNull())
    .addColumn('isFromXlsx', 'boolean', (col) => col.notNull().defaultTo(sql`true`))
    .execute()

  await db.schema
    .createTable('memberCredit')
    .ifNotExists()
    .addColumn('id', 'integer', (col) => col.notNull().autoIncrement().primaryKey())
    .addColumn('createdAt', 'datetime', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updatedAt', 'datetime', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('memberId', 'integer', (col) => col.notNull())
    .addForeignKeyConstraint('memberCreditMemberIdFk', ['memberId'], 'member', ['id'])
    .addColumn('kind', 'varchar(100)', (col) => col.notNull())
    .addColumn('acquired', 'integer', (col) => col.notNull())
    .addColumn('required', 'integer')
    .execute()
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropTable('memberCredit').ifExists().execute()
  await db.schema.dropTable('memberSubject').ifExists().execute()
  await db.schema.dropTable('subject').ifExists().execute()
  await db.schema.dropTable('member').ifExists().execute()
  await db.schema.dropTable('department').ifExists().execute()
}
