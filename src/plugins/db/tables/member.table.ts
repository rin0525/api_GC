import type { Insertable, Selectable, Updateable } from 'kysely'
import type { _TimestampTable } from './_timestamp.table.js'

export const autoload = false

export interface MemberTable extends _TimestampTable {
  /**
   * 학번
   */
  id: number

  /**
   * 삭제여부
   */
  deletedAt: Date | null

  /**
   * 이름
   */
  name: string

  /**
   * 이메일
   */
  email: string

  /**
   * 전화번호
   */
  phone: string

  /**
   * 비밀번호
   */
  password: string

  /**
   * 학과 ID
   */
  departmentId: number
}

export type Member = Selectable<MemberTable>
export type InsertMember = Insertable<MemberTable>
export type UpdateMember = Updateable<MemberTable>
