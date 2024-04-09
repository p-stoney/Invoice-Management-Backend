import * as vi from 'vitest';
import { hash } from 'bcrypt';
import { Role } from '@prisma/client';
import { testdb, mockCtx } from '@server/tests/testSetup';
import { TRPCError } from '@trpc/server';
import { redeemSetupToken } from '../redeemSetupToken';

vitest.mock('bcrypt', () => ({
  hash: vitest.fn(),
}));

describe('redeemSetupToken procedure', () => {
  beforeEach(() => {
    vitest.clearAllMocks();
    testdb.$transaction.mockImplementation(async (transactionalQueries) => transactionalQueries(testdb));
  });

  it('successfully redeems a setup token and creates a new user', async () => {
    const redeemInput = {
      token: 'validToken',
      email: 'user@example.com',
      password: 'newPassword',
    };

    const mockTokenRecord = {
      token: redeemInput.token,
      email: redeemInput.email,
      used: false,
      id: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const hashedPassword = 'hashedNewPassword';

    const mockUser = {
      id: 1,
      email: redeemInput.email,
      password: hashedPassword,
      role: Role.SUPERADMIN,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    testdb.setupToken.findUnique.mockResolvedValue(mockTokenRecord);
    (hash as vi.Mock).mockResolvedValue(hashedPassword);
    testdb.user.create.mockResolvedValue(mockUser);
    testdb.setupToken.update.mockResolvedValue({ ...mockTokenRecord, used: true });

    const result = await redeemSetupToken(redeemInput, mockCtx);

    expect(testdb.setupToken.findUnique).toHaveBeenCalledWith({ where: { token: redeemInput.token } });

    expect(testdb.user.create).toHaveBeenCalledWith({
      data: {
        email: redeemInput.email,
        password: hashedPassword,
        role: Role.SUPERADMIN,
      },
    });

    expect(testdb.setupToken.update).toHaveBeenCalledWith({
      where: { token: redeemInput.token },
      data: { used: true },
    });

    expect(result).toEqual(expect.objectContaining({
      email: redeemInput.email,
      role: Role.SUPERADMIN,
    }));
  });

  it('throws NOT_FOUND error for invalid token', async () => {
    const redeemInput = {
      token: 'invalidToken',
      email: 'user@example.com',
      password: 'newPassword',
    };

    testdb.setupToken.findUnique.mockResolvedValue(null);

    await expect(redeemSetupToken(redeemInput, mockCtx))
      .rejects.toThrowError(new TRPCError({ code: 'NOT_FOUND', message: 'Setup token not found.' }));
  });

  it('throws BAD_REQUEST error for already used token', async () => {
    const redeemInput = {
      token: 'usedToken',
      email: 'user@example.com',
      password: 'newPassword',
    };
    const usedTokenRecord = {
      token: redeemInput.token,
      email: redeemInput.email,
      used: true,
      id: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    testdb.setupToken.findUnique.mockResolvedValue(usedTokenRecord);

    await expect(redeemSetupToken(redeemInput, mockCtx)).rejects.toThrow(TRPCError);
    await expect(redeemSetupToken(redeemInput, mockCtx)).rejects.toHaveProperty('code', 'BAD_REQUEST');
  });

  it('throws BAD_REQUEST error for email not matching token', async () => {
    const redeemInput = {
      token: 'validToken',
      email: 'differentUser@example.com',
      password: 'newPassword',
    };
    const mockTokenRecord = {
      token: redeemInput.token,
      email: 'originalUser@example.com',
      used: false,
      id: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    testdb.setupToken.findUnique.mockResolvedValue(mockTokenRecord);

    await expect(redeemSetupToken(redeemInput, mockCtx)).rejects.toThrow(TRPCError);
    await expect(redeemSetupToken(redeemInput, mockCtx)).rejects.toHaveProperty('code', 'BAD_REQUEST');
  });
});