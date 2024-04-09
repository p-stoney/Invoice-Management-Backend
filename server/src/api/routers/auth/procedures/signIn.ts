import { sign } from 'jsonwebtoken';
import { compare } from 'bcrypt';
import { TRPCError } from '@trpc/server';
import { authConfig } from '../../../../config/authConfig';
import { Context } from '../../../../context';
import { SignUpResult, SignInDto } from '../dtos';

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