import { TRPCError } from '@trpc/server';
import { Role } from '@prisma/client';
import { Context } from '../../../../context';
import { UserResponse, DemoteUserDto } from '../dtos';

export const demoteUser = async (
  input: DemoteUserDto,
  ctx: Context
): Promise<UserResponse> => ctx.db.$transaction(async (transaction) => {
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
      throw new TRPCError({ code: 'FORBIDDEN', message: 'SuperAdmin users cannot be demoted.' });
    }

    await transaction.user.update({
      where: { id: input.userId },
      data: { role: Role.USER },
    });

    const updatedUser = await transaction.user.findUnique({
      where: { id: input.userId },
    });

    if (!updatedUser) {
      throw new Error("Unexpected error: User not updated");
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
