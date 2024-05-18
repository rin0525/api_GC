import type { Generated, Insertable, Selectable, Updateable } from 'kysely'
import type { _TimestampTable } from './_timestamp.table.js'
import type { CreditKind } from './credit-kind.enum.js'

export const autoload = false

export interface MemberCreditTable extends _TimestampTable {
  id: Generated<number>

  /**
   * MemberCreditGroup ID
   */
  memberId: number

  /**
   * 학점 종류
   */
  kind: CreditKind

  /**
   * 현재 학점
   */
  acquired: number

  /**
   * 요구 학점
   */
  required: number | null
}

export type MemberCredit = Selectable<MemberCreditTable>
export type InsertMemberCredit = Insertable<MemberCreditTable>
export type UpdateMemberCredit = Updateable<MemberCreditTable>
