import { hash } from 'bcrypt';
import { TRPCError } from '@trpc/server';
import { Role } from '@prisma/client';
import { Context } from '../../../../context';
import { RedeemSetupTokenDto, UserResponse } from '../dtos';

/**
 * Redeems a setup token to register a new SuperAdmin user. Validates the token, ensuring it is not used and matches the provided email.
 * If validation passes, a new SuperAdmin user is created with hashed password and the token is marked as used.
 *
 * @param {RedeemSetupTokenDto} input - Includes token, email, and password from the client.
 * @param {Context} ctx - The application context, including database access.
 * @returns {Promise<UserResponse>} The created SuperAdmin user's information excluding the password.
 * @throws {TRPCError} If the setup token is not found, already used, or does not match the email.
 */
export async function redeemSetupToken(
  input: RedeemSetupTokenDto,
  ctx: Context
): Promise<UserResponse> {
  const { token, email, password } = input;

  return ctx.db.$transaction(async (transaction) => {
    const tokenRecord = await transaction.setupToken.findUnique({
      where: { token },
    });

    if (!tokenRecord)
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Setup token not found.',
      });
    if (tokenRecord.used)
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Setup token already used.',
      });
    if (tokenRecord.email !== email)
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Email does not match token.',
      });

    const bcryptHash = await hash(password, 10);
    const user = await transaction.user.create({
      data: {
        email,
        password: bcryptHash,
        role: Role.SUPERADMIN,
      },
    });

    await transaction.setupToken.update({
      where: { token },
      data: { used: true },
    });

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      deletedAt: user.deletedAt,
    };
  });
}
