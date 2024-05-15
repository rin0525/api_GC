import { type Static, Type } from '@fastify/type-provider-typebox'

export const ConfigSchema = Type.Object({
  ENVIRONMENT: Type.Union([Type.Literal('local'), Type.Literal('development'), Type.Literal('production')], {
    default: 'local',
  }),
  PORT: Type.Number({ default: 19000 }),

  DATABASE_HOST: Type.String(),
  DATABASE_PORT: Type.Number(),
  DATABASE_USER: Type.String(),
  DATABASE_PASSWORD: Type.String(),
  DATABASE_NAME: Type.String(),

  JWT_SECRET: Type.String({ default: 'KyB8zRsNEtsYAWXFhBGrCxm6VbaLBBFMRBrTNCsAZwhgfQh6hg4YWfqnFpXczGE7' }),
})

declare module 'fastify' {
  interface FastifyInstance {
    config: Static<typeof ConfigSchema>
  }
}
