import { Role } from '@prisma/client';
import { testdb, mockCtx } from '@server/tests/testSetup';
import { promoteUser } from '../promoteUser';

describe('promoteUser procedure', () => {
  beforeEach(() => {
    testdb.$transaction.mockImplementation(async (transactionalQueries) =>
      transactionalQueries(testdb)
    );
    mockCtx.user = { id: 1, email: 'user@example.com', role: 'SUPERADMIN' };
  });

  it('successfully promotes a user', async () => {
    const promoteUserInput = { userId: 2, deletedAt: null };
    const mockUserBeforePromotion = {
      id: promoteUserInput.userId,
      email: 'user2@example.com',
      password: 'password123',
      role: Role.USER,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    testdb.user.findUnique.mockResolvedValue(mockUserBeforePromotion);
    testdb.user.update.mockResolvedValue({
      ...mockUserBeforePromotion,
      role: Role.ADMIN,
    });

    await promoteUser(promoteUserInput, mockCtx);

    const updatedUser = await testdb.user.findUnique({
      where: { id: promoteUserInput.userId },
    });

    expect(updatedUser).toEqual(
      expect.objectContaining({
        id: mockUserBeforePromotion.id,
        email: mockUserBeforePromotion.email,
        role: updatedUser!.role,
      })
    );
  });

  it('throws NOT_FOUND error when a user does not exist', async () => {
    const promoteUserInput = { userId: 999, deletedAt: null };

    testdb.user.findUnique.mockResolvedValue(null);

    await expect(promoteUser(promoteUserInput, mockCtx)).rejects.toMatchObject({
      code: 'NOT_FOUND',
      message: 'User not found.',
    });
  });

  it('throws FORBIDDEN error when a user tries to promote a user with a higher role', async () => {
    const promoteUserInput = { userId: 2, deletedAt: null };
    const mockUserBeforePromotion = {
      id: promoteUserInput.userId,
      email: 'example@example.com',
      password: 'password123',
      role: Role.SUPERADMIN,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    testdb.user.findUnique.mockResolvedValue(mockUserBeforePromotion);

    await expect(promoteUser(promoteUserInput, mockCtx)).rejects.toMatchObject({
      code: 'BAD_REQUEST',
      message: 'User already has admin privileges.',
    });
  });
});
