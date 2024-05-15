import fs from 'node:fs/promises'
import path from 'node:path'
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import { CamelCasePlugin, FileMigrationProvider, Kysely, Migrator, MysqlDialect, sql } from 'kysely'
import { createPool } from 'mysql2'
import type { Database } from './database.js'

declare module 'fastify' {
  export interface FastifyInstance {
    db: Kysely<Database>

    migrator: Migrator
  }
}

/**
 * 데이터베이스 Pool 및 Kysely 모듈을 세팅합니다
 */
export default (async (app) => {
  const pool = createPool({
    database: app.config.DATABASE_NAME,
    user: app.config.DATABASE_USER,
    password: app.config.DATABASE_PASSWORD,
    host: app.config.DATABASE_HOST,
    port: app.config.DATABASE_PORT,
  })

  const dialect = new MysqlDialect({
    pool,
  })

  const kysely = new Kysely<Database>({
    dialect,
    plugins: [new CamelCasePlugin()],
  })

  await kysely.executeQuery(sql`select 1`.compile(kysely))

  app.decorate('db', kysely)

  const migrator = new Migrator({
    db: kysely,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: path.join(import.meta.dirname, '__migrations'),
    }),
  })

  app.decorate('migrator', migrator)
}) satisfies FastifyPluginAsyncTypebox

export type * from './tables/index.js'
