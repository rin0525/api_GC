import type { Generated, Insertable, Selectable, Updateable } from 'kysely'
import type { _TimestampTable } from './_timestamp.table.js'

export const autoload = false

export interface DepartmentTable extends _TimestampTable {
  id: Generated<number>

  /**
   * 학과 이름
   */
  name: string
}

export type Department = Selectable<DepartmentTable>
export type InsertDepartment = Insertable<DepartmentTable>
export type UpdateDepartment = Updateable<DepartmentTable>
