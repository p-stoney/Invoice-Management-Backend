import { sign } from 'jsonwebtoken';
import { compare } from 'bcrypt';
import { TRPCError } from '@trpc/server';
import { authConfig } from '../../../../config/authConfig';
import { Context } from '../../../../context';
import { SignUpResult, SignInDto } from '../dtos';

/**
 * Authenticates a user by their email and password. If successful, generates a JWT token for session management.
 *
 * @param {SignInDto} input - User sign-in credentials including email and password.
 * @param {Context} ctx - The application context, including database access and JWT configuration.
 * @returns {Promise<SignUpResult>} The authenticated user's information and access token.
 * @throws {TRPCError} If the email does not exist, the password is incorrect, or any other authorization error occurs.
 */
export const signIn = async (
  input: SignInDto,
  ctx: Context
): Promise<SignUpResult> => {
  const user = await ctx.db.user.findUnique({
    where: {
      email: input.email,
      deletedAt: null,
    },
  });

  const error = new TRPCError({
    message: 'Incorrect email or password',
    code: 'UNAUTHORIZED',
  });

  if (!user) {
    throw error;
  }

  const result = await compare(input.password, user.password);

  if (!result) {
    throw error;
  }

  const token = sign(
    {
      id: user.id,
      role: user.role,
    },
    authConfig.jwtSecret,
    { expiresIn: authConfig.jwtExpiresIn }
  );

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    deletedAt: user.deletedAt,
    accessToken: token,
  };
};
