import { randomBytes } from 'crypto';
import { Context } from '../context';

export async function generateSetupToken(ctx: Context, email: string): Promise<string> {
  const token = randomBytes(48).toString('hex');
  await ctx.db.setupToken.create({
    data: { token, email, used: false },
  });

  return token;
}