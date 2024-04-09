import 'dotenv/config';
import { z } from 'zod';

const serverConfigSchema = z.object({
  environment: z.enum(['development', 'production', 'test']).default('development'),
  port: z.preprocess((arg) => typeof arg === 'string' ? parseInt(arg, 10) : arg, z.number().default(3000)),
  prisma: z.object({
    log: z.array(z.enum(['query', 'info', 'warn', 'error'])).default(['error']),
  }),
});

const configParsed = serverConfigSchema.parse({
  environment: process.env.NODE_ENV,
  port: process.env.PORT,
  prisma: {
    log: process.env.PRISMA_LOG?.split(',') || ['error'],
  },
});

export const serverConfig = {
  ...configParsed,
  isDevelopment: configParsed.environment === 'development',
  isProduction: configParsed.environment === 'production',
};