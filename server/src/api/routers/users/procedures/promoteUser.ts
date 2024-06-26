import { TRPCError } from '@trpc/server';
import { Role } from '@prisma/client';
import { Context } from '../../../../context';
import { UserResponse, PromoteUserDto } from '../dtos';

/**
 * Promotes a user to an admin role. Ensures the user exists and is not already an admin or superadmin before promotion.
 *
 * @param {PromoteUserDto} input - Contains the user ID to be promoted.
 * @param {Context} ctx - The request context, providing transactional database access.
 * @returns {Promise<UserResponse>} The promoted user's details, including their new role.
 * @throws {TRPCError} with code 'NOT_FOUND' if the user is not found.
 * @throws {TRPCError} with code 'BAD_REQUEST' if the user already has admin privileges.
 */
export const promoteUser = async (
  input: PromoteUserDto,
  ctx: Context
): Promise<UserResponse> =>
  ctx.db.$transaction(async (transaction) => {
    const user = await transaction.user.findUnique({
      where: {
        id: input.userId,
        deletedAt: null,
      },
    });

    if (!user) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found.' });
    }
    if (user.role === Role.ADMIN || user.role === Role.SUPERADMIN) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'User already has admin privileges.',
      });
    }

    await transaction.user.update({
      where: { id: input.userId },
      data: { role: Role.ADMIN },
    });

    const updatedUser = await transaction.user.findUnique({
      where: { id: input.userId },
    });

    if (!updatedUser) {
      throw new Error('Unexpected error: User not updated');
    }

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
      deletedAt: updatedUser.deletedAt,
    };
  });
