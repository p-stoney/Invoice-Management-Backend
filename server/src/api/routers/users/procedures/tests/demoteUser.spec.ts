import { Role } from '@prisma/client';
import { testdb, mockCtx } from '@server/tests/testSetup';
import { demoteUser } from '../demoteUser';

describe('demoteUser procedure', () => {
  beforeEach(() => {
    testdb.$transaction.mockImplementation(async (transactionalQueries) =>
      transactionalQueries(testdb)
    );
    mockCtx.user = { id: 1, email: 'user@example.com', role: 'SUPERADMIN' };
  });

  it('successfully demotes a user', async () => {
    const demoteUserInput = { userId: 2, deletedAt: null };
    const mockUserBeforeDemotion = {
      id: demoteUserInput.userId,
      email: 'user2@example.com',
      password: 'password123',
      role: Role.ADMIN,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    testdb.user.findUnique.mockResolvedValue(mockUserBeforeDemotion);
    testdb.user.update.mockResolvedValue({
      ...mockUserBeforeDemotion,
      role: Role.USER,
    });

    await demoteUser(demoteUserInput, mockCtx);

    const updatedUser = await testdb.user.findUnique({
      where: { id: demoteUserInput.userId },
    });

    expect(updatedUser).toEqual(
      expect.objectContaining({
        id: mockUserBeforeDemotion.id,
        email: mockUserBeforeDemotion.email,
        role: updatedUser!.role,
      })
    );
  });

  it('throws NOT_FOUND error when a user does not exist', async () => {
    const demoteUserInput = { userId: 999, deletedAt: null };

    testdb.user.findUnique.mockResolvedValue(null);

    await expect(demoteUser(demoteUserInput, mockCtx)).rejects.toMatchObject({
      code: 'NOT_FOUND',
      message: 'User not found.',
    });
  });

  it('throws FORBIDDEN error when a user tries to demote a user with a higher role', async () => {
    const demoteUserInput = { userId: 2, deletedAt: null };
    const mockUserBeforeDemotion = {
      id: demoteUserInput.userId,
      email: 'example@example.com',
      password: 'password123',
      role: Role.SUPERADMIN,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    testdb.user.findUnique.mockResolvedValue(mockUserBeforeDemotion);

    await expect(demoteUser(demoteUserInput, mockCtx)).rejects.toMatchObject({
      code: 'FORBIDDEN',
      message: 'SuperAdmin users cannot be demoted.',
    });
  });
});
