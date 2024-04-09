import { z } from 'zod';
import { User } from '@prisma/client';

export type UserResponse = Omit<User, 'password'>;
export type SignUpResult = UserResponse & { accessToken: string };

export const RedeemSetupTokenInput = z.object({
  token: z.string(),
  email: z.string().email(),
  password: z.string().min(8),
});

export const UserCredentialsInput = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters long' }),
});

export type RedeemSetupTokenDto = z.TypeOf<typeof RedeemSetupTokenInput>;
export type SignInDto = z.TypeOf<typeof UserCredentialsInput>;
export type SignUpDto = z.TypeOf<typeof UserCredentialsInput>;