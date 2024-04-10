import { randomBytes } from 'crypto';
import { Context } from '../context';

/**
 * Generates a setup token for a user and stores it in the database.
 * The token is used for account setup processes, such as email verification or password reset.
 *
 * @param {Context} ctx - The context including the Prisma client for database access.
 * @param {string} email - The email address of the user for whom the setup token is generated.
 * @returns {Promise<string>} - The generated setup token as a hexadecimal string.
 */
export async function generateSetupToken(
  ctx: Context,
  email: string
): Promise<string> {
  const token = randomBytes(48).toString('hex');
  await ctx.db.setupToken.create({
    data: { token, email, used: false },
  });

  return token;
}
