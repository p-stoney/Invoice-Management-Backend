import { TRPCError } from '@trpc/server';
import { Role } from '@prisma/client';
import { testdb, mockCtx } from '@server/tests/testSetup';
import { UpdateUserBusinessAssociationsDto } from '../../dtos';
import { updateUserBusinessAssociations } from '../updateUserBusinessAssociations';

describe('updateUserBusinessAssociations procedure', () => {
  beforeEach(() => {
    mockCtx.user = { id: 1, email: 'user@example.com', role: 'SUPERADMIN' };
    testdb.$transaction.mockImplementation(async (transactionalQueries) => transactionalQueries(testdb));
  });

  it('successfully updates user business associations', async () => {
    const updateUserBusinessAssociationsInput: UpdateUserBusinessAssociationsDto = {
      userId: 2,
      businessesToAdd: [3],
      businessesToRemove: [1],
    };

    const mockUserWithBusinessesBefore = {
      id: updateUserBusinessAssociationsInput.userId,
      email: 'user2@example.com',
      password: 'password123',
      role: Role.USER,
      businesses: [
        { id: 1, name: 'Business One' },
        { id: 2, name: 'Business Two' }
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    const mockUserWithBusinessesAfter = {
      ...mockUserWithBusinessesBefore,
      businesses: [
        { id: 2, name: 'Business Two' },
        { id: 3, name: 'Business Three' }
      ],
    };

    testdb.user.findUnique.mockResolvedValueOnce(mockUserWithBusinessesBefore);
    testdb.business.count.mockResolvedValueOnce(1);
    testdb.user.update.mockResolvedValueOnce(mockUserWithBusinessesAfter);
    testdb.user.update.mockResolvedValueOnce(mockUserWithBusinessesAfter);
    testdb.user.findUnique.mockResolvedValueOnce(mockUserWithBusinessesAfter);

    const result = await updateUserBusinessAssociations(updateUserBusinessAssociationsInput, mockCtx);

    expect(result).toMatchObject({
      id: updateUserBusinessAssociationsInput.userId,
      email: mockUserWithBusinessesBefore.email,
      role: Role.USER,
    });
    expect(testdb.user.update).toHaveBeenCalledTimes(2);
  });

  it('throws NOT_FOUND error when the user does not exist', async () => {
    const input: UpdateUserBusinessAssociationsDto = {
      userId: 99,
      businessesToAdd: [3],
      businessesToRemove: [1],
    };

    testdb.user.findUnique.mockResolvedValueOnce(null);

    await expect(updateUserBusinessAssociations(input, mockCtx))
      .rejects
      .toMatchObject({
        code: 'NOT_FOUND',
        message: 'User not found',
      });
  });

  it('throws NOT_FOUND error when one or more businesses to add do not exist', async () => {
    const input: UpdateUserBusinessAssociationsDto = {
      userId: 2,
      businessesToAdd: [99],
      businessesToRemove: [],
    };

    const mockUserWithBusinesses = {
      id: input.userId,
      email: 'user2@example.com',
      password: 'password123',
      role: Role.USER,
      businesses: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    testdb.user.findUnique.mockResolvedValueOnce(mockUserWithBusinesses);
    testdb.business.count.mockResolvedValueOnce(0);

    await expect(updateUserBusinessAssociations(input, mockCtx))
      .rejects
      .toMatchObject({
        code: 'NOT_FOUND',
        message: 'One or more businesses to add not found',
      });
  });

  it('throws NOT_FOUND error when one or more businesses to remove are not associated with the user', async () => {
  const input: UpdateUserBusinessAssociationsDto = {
    userId: 2,
    businessesToAdd: [],
    businessesToRemove: [99],
  };

  const mockUserWithBusinesses = {
    id: input.userId,
    email: 'user2@example.com',
    password: 'password123',
    role: Role.USER,
    businesses: [
      { id: 1, name: 'Business One' },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  testdb.user.findUnique.mockResolvedValueOnce(mockUserWithBusinesses);

  await expect(updateUserBusinessAssociations(input, mockCtx))
    .rejects
    .toMatchObject({
      code: 'NOT_FOUND',
      message: 'One or more businesses to remove not found in user\'s current associations',
    });
  });

  it('handles unexpected errors correctly', async () => {
    const updateUserInput = {
      userId: 2,
      businessesToAdd: [3],
      businessesToRemove: [1],
    };

    testdb.user.findUnique.mockRejectedValue(new Error('Unexpected error'));

    await expect(updateUserBusinessAssociations(updateUserInput, mockCtx))
      .rejects
      .toThrowError(new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Unexpected error' }));
  });
});