import { app } from './app.js'

await app.listen({ host: '0.0.0.0', port: app.config.PORT })
