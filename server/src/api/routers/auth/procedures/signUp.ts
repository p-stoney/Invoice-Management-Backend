import { hash } from 'bcrypt';
import { Role } from '@prisma/client';
import { Context } from '../../../../context';
import { UserResponse, SignUpDto } from '../dtos';

/**
 * Registers a new user with the provided email and password, assigning them a default role of USER.
 * Password is hashed for secure storage.
 *
 * @param {SignUpDto} input - User sign-up credentials including email and password.
 * @param {Context} ctx - The application context, providing database access.
 * @returns {Promise<UserResponse>} The newly created user's information excluding the password.
 */
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
