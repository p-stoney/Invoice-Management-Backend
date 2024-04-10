import * as vi from 'vitest';
import { compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { authConfig } from '@server/config/authConfig';
import { testdb, mockCtx } from '@server/tests/testSetup';
import { TRPCError } from '@trpc/server';
import { signIn } from '../signIn';

vitest.mock('bcrypt', () => ({
  compare: vitest.fn(),
}));

vitest.mock('jsonwebtoken', () => ({
  sign: vitest.fn(),
}));

describe('signIn procedure', () => {
  it('should sign in a user with correct credentials and return a token', async () => {
    const signInInput = {
      email: 'user@example.com',
      password: 'correctPassword',
    };
    const mockUser = {
      id: 1,
      email: signInInput.email,
      password: 'hashedPassword',
      role: Role.USER,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };
    const mockToken = 'mocked.jwt.token';

    testdb.user.findUnique.mockResolvedValue(mockUser);
    (compare as vi.Mock).mockResolvedValue(true);
    (sign as vi.Mock).mockReturnValue(mockToken);

    const result = await signIn(signInInput, mockCtx);

    expect(compare).toHaveBeenCalledWith(
      signInInput.password,
      mockUser.password
    );
    expect(sign).toHaveBeenCalledWith(
      { id: mockUser.id, role: mockUser.role },
      authConfig.jwtSecret,
      { expiresIn: authConfig.jwtExpiresIn }
    );
    expect(result).toEqual(
      expect.objectContaining({
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        accessToken: mockToken,
      })
    );
  });

  it('should throw UNAUTHORIZED error for incorrect password', async () => {
    const signInInput = {
      email: 'user@example.com',
      password: 'wrongPassword',
    };
    const mockUser = {
      id: 1,
      email: signInInput.email,
      password: 'hashedPassword',
      role: Role.USER,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    testdb.user.findUnique.mockResolvedValue(mockUser);
    (compare as vi.Mock).mockResolvedValue(false);

    await expect(signIn(signInInput, mockCtx)).rejects.toThrow(TRPCError);
    await expect(signIn(signInInput, mockCtx)).rejects.toHaveProperty(
      'code',
      'UNAUTHORIZED'
    );
  });
});
