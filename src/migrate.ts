import { app } from './app.js'

const argv = process.argv

let func = () => app.migrator.migrateToLatest()
if (argv.includes('--down')) {
  func = () => app.migrator.migrateDown()
}

const { error, results } = await func()

for (const result of results ?? []) {
  if (result.status === 'Success') {
    app.log.info(`[${result.migrationName}] was executed successfully`)
  } else if (result.status === 'Error') {
    app.log.error(`[${result.migrationName}] failed to execute migration`)
  }
}

if (error) {
  app.log.error(error, 'failed to migrate')
}

await app.close()
