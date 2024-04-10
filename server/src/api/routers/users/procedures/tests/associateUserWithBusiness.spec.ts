import { TRPCError } from '@trpc/server';
import { Role } from '@prisma/client';
import { testdb, mockCtx } from '@server/tests/testSetup';
import { AssociateUserWithBusinessDto } from '../../dtos';
import { associateUserWithBusiness } from '../associateUserWithBusiness';

describe('associateUserWithBusiness procedure', () => {
  beforeEach(() => {
    testdb.$transaction.mockImplementation(async (transactionalQueries) =>
      transactionalQueries(testdb)
    );
    mockCtx.user = { id: 1, email: 'user@example.com', role: 'SUPERADMIN' };
  });

  it('successfully associates a user with businesses', async () => {
    const associateUserInput: AssociateUserWithBusinessDto = {
      userId: 2,
      businessIds: [1, 2],
    };
    const mockUserBeforeAssociation = {
      id: associateUserInput.userId,
      email: 'user2@example.com',
      password: 'password123',
      role: Role.USER,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    testdb.user.findUnique.mockResolvedValue(mockUserBeforeAssociation);

    testdb.business.findMany.mockResolvedValueOnce(
      associateUserInput.businessIds.map((id) => ({
        id,
        userId: 2,
        name: '',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      }))
    );

    const result = await associateUserWithBusiness(associateUserInput, mockCtx);

    expect(result).toMatchObject({
      id: associateUserInput.userId,
      email: mockUserBeforeAssociation.email,
      role: Role.USER,
    });

    expect(testdb.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: associateUserInput.userId },
        data: expect.objectContaining({
          businesses: {
            connect: associateUserInput.businessIds.map((id) => ({ id })),
          },
        }),
      })
    );
  });

  it('throws NOT_FOUND error for non-existent user', async () => {
    const associateUserInput = { userId: 99, businessIds: [1, 2] };

    // Simulate user not found
    testdb.user.findUnique.mockResolvedValueOnce(null);

    await expect(
      associateUserWithBusiness(associateUserInput, mockCtx)
    ).rejects.toMatchObject({ code: 'NOT_FOUND', message: 'User not found' });
  });

  it('throws NOT_FOUND error for one or more non-existent businesses', async () => {
    const associateUserInput = { userId: 2, businessIds: [1, 99] };

    // Simulate the user exists
    testdb.user.findUnique.mockResolvedValueOnce({
      id: associateUserInput.userId,
      email: 'user2@example.com',
      password: 'password123',
      role: Role.USER,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });

    testdb.business.findMany.mockResolvedValueOnce([
      {
        id: 1,
        userId: 2,
        name: 'Business Name',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
    ]);

    await expect(
      associateUserWithBusiness(associateUserInput, mockCtx)
    ).rejects.toThrowError(
      new TRPCError({
        code: 'NOT_FOUND',
        message: 'One or more businesses not found',
      })
    );
  });

  it('handles unexpected errors correctly', async () => {
    const associateUserInput = { userId: 2, businessIds: [1, 2] };

    // Simulate an unexpected error during user findUnique
    testdb.user.findUnique.mockRejectedValue(new Error('Unexpected error'));

    await expect(
      associateUserWithBusiness(associateUserInput, mockCtx)
    ).rejects.toThrowError(
      new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Unexpected error',
      })
    );

    // Optionally verify that the function attempted to find the user, indicating it failed at or before this step
    expect(testdb.user.findUnique).toHaveBeenCalledWith({
      where: { id: associateUserInput.userId, deletedAt: null },
    });
  });
});
