import 'dotenv/config';
import { z } from 'zod';

const jwtConfigSchema = z.object({
  jwtSecret: z.string(),
  jwtExpiresIn: z.string().default('1d'),
});

const configParsed = jwtConfigSchema.parse({
  jwtSecret: process.env.SECRET_KEY,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN,
});

export const authConfig = {
  jwtSecret: configParsed.jwtSecret,
  jwtExpiresIn: configParsed.jwtExpiresIn,
};
