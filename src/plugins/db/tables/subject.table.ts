import type { Insertable, Selectable, Updateable } from 'kysely'
import type { _TimestampTable } from './_timestamp.table.js'

export const autoload = false

export interface SubjectTable extends _TimestampTable {
  /**
   * 교과목코드
   */
  id: string

  /**
   * 이수 구분
   */
  kind: string

  /**
   * 학과 이름
   */
  name: string
}

export type Subject = Selectable<SubjectTable>
export type InsertSubject = Insertable<SubjectTable>
export type UpdateSubject = Updateable<SubjectTable>
