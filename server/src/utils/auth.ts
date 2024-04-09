import { verify } from 'jsonwebtoken';
import { TRPCError } from "@trpc/server";
import { authConfig } from '@server/config/authConfig';

export interface SessionUser {
  id: number;
  email: string;
  role: 'USER' | 'ADMIN' | 'SUPERADMIN';
}

export async function decodeAndVerifyJwtToken(token: string): Promise<SessionUser> {
  try {
    const decoded = verify(token, authConfig.jwtSecret);
    return decoded as SessionUser;
  } catch (err) {
    console.error("JWT Verification error:", err);
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid token' });
  }
}