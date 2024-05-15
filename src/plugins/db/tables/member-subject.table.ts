import type { Generated, Insertable, Selectable, Updateable } from 'kysely'
import type { _TimestampTable } from './_timestamp.table.js'

export const autoload = false

export interface MemberSubjectTable extends _TimestampTable {
  id: Generated<number>

  /**
   * 사용자 ID
   */
  memberId: number

  /**
   * 교과목코드
   */
  subjectId: string

  /**
   * 년도
   */
  year: number

  /**
   * 학기
   */
  semester: string

  /**
   * 학점
   */
  credit: string

  /**
   * 성적
   */
  grade: string
}

export type MemberSubject = Selectable<MemberSubjectTable>
export type InsertMemberSubject = Insertable<MemberSubjectTable>
export type UpdateMemberSubject = Updateable<MemberSubjectTable>
