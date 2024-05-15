import type { Generated } from 'kysely'

export const autoload = false

export interface _TimestampTable {
  createdAt: Generated<Date>

  updatedAt: Generated<Date>
}
