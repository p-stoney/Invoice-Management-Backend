import { TRPCError } from '@trpc/server';
import { Role } from '@prisma/client';
import { testdb, mockCtx } from '@server/tests/testSetup';
import { RemoveUserBusinessAssociationsDto } from '../../dtos';
import { removeUserBusinessAssociations } from '../removeUserBusinessAssociations';

describe('removeUserBusinessAssociations procedure', () => {
  beforeEach(() => {
    mockCtx.user = { id: 1, email: 'user@example.com', role: 'SUPERADMIN' };
    testdb.$transaction.mockImplementation(async (transactionalQueries) =>
      transactionalQueries(testdb)
    );
  });

  it('successfully removes business associations from a user', async () => {
    const removeUserInput: RemoveUserBusinessAssociationsDto = {
      userId: 2,
      businessIds: [1, 2],
    };

    const mockUserWithBusinesses = {
      id: removeUserInput.userId,
      email: 'user2@example.com',
      password: 'password123',
      role: Role.USER,
      businesses: [
        { id: 1, name: 'Business One' },
        { id: 2, name: 'Business Two' },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    testdb.user.findUnique.mockResolvedValue(mockUserWithBusinesses);

    const result = await removeUserBusinessAssociations(
      removeUserInput,
      mockCtx
    );

    expect(result).toMatchObject({
      id: removeUserInput.userId,
      email: mockUserWithBusinesses.email,
      role: Role.USER,
    });
    expect(testdb.user.update).toHaveBeenCalledWith({
      where: { id: removeUserInput.userId },
      data: {
        businesses: {
          disconnect: removeUserInput.businessIds.map((id) => ({ id })),
        },
      },
    });
  });

  it('throws NOT_FOUND error for non-existent user', async () => {
    const removeUserInput = { userId: 99, businessIds: [1, 2] };
    testdb.user.findUnique.mockResolvedValue(null);

    await expect(
      removeUserBusinessAssociations(removeUserInput, mockCtx)
    ).rejects.toMatchObject({ code: 'NOT_FOUND', message: 'User not found' });
  });

  it('handles unexpected errors correctly', async () => {
    const removeUserInput = { userId: 2, businessIds: [1, 2] };
    testdb.user.findUnique.mockRejectedValue(new Error('Unexpected error'));

    await expect(
      removeUserBusinessAssociations(removeUserInput, mockCtx)
    ).rejects.toThrowError(
      new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Unexpected error',
      })
    );
  });
});
