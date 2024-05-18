import type { Generated, Insertable, Selectable, Updateable } from 'kysely'
import type { _TimestampTable } from './_timestamp.table.js'

export const autoload = false

export interface MemberSubjectTable extends _TimestampTable {
  id: Generated<number>

  /**
   * 이수 구분
   */
  kind: string

  /**
   * 사용자 ID
   */
  memberId: number

  /**
   * 사용자가 직접 올린 경우
   */
  isFromXlsx: Generated<boolean>

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
  semester: number

  /**
   * 학점
   */
  credit: number

  /**
   * 성적
   */
  grade: string
}

export type MemberSubject = Selectable<MemberSubjectTable>
export type InsertMemberSubject = Insertable<MemberSubjectTable>
export type UpdateMemberSubject = Updateable<MemberSubjectTable>
