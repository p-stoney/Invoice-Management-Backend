import { hash } from 'bcrypt';
import { Role } from '@prisma/client';
import { Context } from '../../../../context';
import { UserResponse, SignUpDto } from '../dtos';

export const signUp = async (
  input: SignUpDto,
  ctx: Context
): Promise<UserResponse> => {
  const bcryptHash = await hash(input.password, 10);

  const user = await ctx.db.user.create({
    data: {
      email: input.email,
      password: bcryptHash,
      role: Role.USER,
    },
  });

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    deletedAt: user.deletedAt,
  };
};