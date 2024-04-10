import { TRPCError } from '@trpc/server';
import { Context } from '../../../../context';
import { UserResponse, AssociateUserWithBusinessDto } from '../dtos';

/**
 * Associates one or more businesses with a user. Ensures all specified businesses exist before association.
 *
 * @param {AssociateUserWithBusinessDto} input - Contains the user ID and a list of business IDs for association.
 * @param {Context} ctx - The request context, providing transactional database access.
 * @returns {Promise<UserResponse>} The user's details after successful association with businesses.
 * @throws {TRPCError} with code 'NOT_FOUND' if the user or any of the specified businesses are not found.
 */
export const associateUserWithBusiness = async (
  input: AssociateUserWithBusinessDto,
  ctx: Context
): Promise<UserResponse> => {
  const { userId, businessIds } = input;

  return ctx.db.$transaction(async (transaction) => {
    const userToAssociate = await transaction.user.findUnique({
      where: {
        id: userId,
        deletedAt: null,
      },
    });

    if (!userToAssociate) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
    }

    const businesses = await transaction.business.findMany({
      where: {
        id: { in: businessIds },
      },
    });

    if (businesses.length !== businessIds.length) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'One or more businesses not found',
      });
    }

    await transaction.user.update({
      where: { id: userId },
      data: {
        businesses: {
          connect: businessIds.map((id) => ({ id })),
        },
      },
    });

    const updatedUser = await transaction.user.findUnique({
      where: { id: userId },
      include: { businesses: true },
    });

    if (!updatedUser) {
      throw new Error('Unexpected error: Updated user could not be retrieved.');
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
};
