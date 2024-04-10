import { TRPCError } from '@trpc/server';
import { Role } from '@prisma/client';
import { Context } from '../../../../context';
import { UserResponse, DemoteUserDto } from '../dtos';

/**
 * Demotes a user from admin to a regular user role. SuperAdmin users cannot be demoted.
 * Ensures the user exists and is not a SuperAdmin before demotion.
 *
 * @param {DemoteUserDto} input - Contains the user ID to be demoted.
 * @param {Context} ctx - The request context, providing transactional database access.
 * @returns {Promise<UserResponse>} The demoted user's details, including their new role.
 * @throws {TRPCError} with code 'NOT_FOUND' if the user is not found.
 * @throws {TRPCError} with code 'FORBIDDEN' if the user is a SuperAdmin, who cannot be demoted.
 */
export const demoteUser = async (
  input: DemoteUserDto,
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
    if (user.role === Role.SUPERADMIN) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'SuperAdmin users cannot be demoted.',
      });
    }

    await transaction.user.update({
      where: { id: input.userId },
      data: { role: Role.USER },
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
