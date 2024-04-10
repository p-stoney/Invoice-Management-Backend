import { TRPCError } from '@trpc/server';
import { Context } from '../../../../context';
import { UserResponse, UpdateUserBusinessAssociationsDto } from '../dtos';

/**
 * Updates business associations for a user. Adds and/or removes businesses based on the input.
 *
 * @param {UpdateUserBusinessAssociationsDto} input - Contains the user ID and lists of businesses to add and remove.
 * @param {Context} ctx - The request context, encapsulating transactional database access.
 * @returns {Promise<UserResponse>} The updated user's details after modifying business associations.
 * @throws {TRPCError} with code 'NOT_FOUND' if the user or specified businesses do not exist.
 */
export const updateUserBusinessAssociations = async (
  input: UpdateUserBusinessAssociationsDto,
  ctx: Context
): Promise<UserResponse> => {
  const { userId, businessesToAdd, businessesToRemove } = input;

  return ctx.db.$transaction(async (transaction) => {
    const userWithBusinesses = await transaction.user.findUnique({
      where: {
        id: userId,
        deletedAt: null,
      },
      include: { businesses: true },
    });

    if (!userWithBusinesses) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
    }

    if (businessesToAdd && businessesToAdd.length > 0) {
      const addBusinessesExist = await transaction.business.count({
        where: {
          id: { in: businessesToAdd },
        },
      });

      if (addBusinessesExist !== businessesToAdd.length) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'One or more businesses to add not found',
        });
      }

      await transaction.user.update({
        where: { id: userId },
        data: {
          businesses: {
            connect: businessesToAdd.map((id) => ({ id })),
          },
        },
      });
    }

    const currentUserBusinessesIds = userWithBusinesses.businesses.map(
      (business) => business.id
    );

    const invalidBusinessToRemove =
      businessesToRemove &&
      businessesToRemove.some(
        (businessId) => !currentUserBusinessesIds.includes(businessId)
      );

    if (invalidBusinessToRemove) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message:
          "One or more businesses to remove not found in user's current associations",
      });
    }

    if (businessesToRemove && businessesToRemove.length > 0) {
      await transaction.user.update({
        where: { id: userId },
        data: {
          businesses: {
            disconnect: businessesToRemove.map((id) => ({ id })),
          },
        },
      });
    }

    const updatedUser = await transaction.user.findUnique({
      where: { id: userId },
      include: { businesses: true },
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
};
