import { TRPCError } from '@trpc/server';
import { Context } from '../../../../context';
import { UserResponse, AssociateUserWithBusinessDto } from '../dtos';

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
      throw new TRPCError({ code: 'NOT_FOUND', message: 'One or more businesses not found' });
    }

    await transaction.user.update({
      where: { id: userId },
      data: {
        businesses: {
          connect: businessIds.map(id => ({ id })),
        },
      },
    });

    const updatedUser = await transaction.user.findUnique({
      where: { id: userId },
      include: { businesses: true },
    });

    if (!updatedUser) {
      throw new Error("Unexpected error: Updated user could not be retrieved.");
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