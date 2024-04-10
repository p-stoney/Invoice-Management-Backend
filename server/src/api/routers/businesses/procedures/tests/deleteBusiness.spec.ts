import { testdb, mockCtx } from '@server/tests/testSetup';
import { deleteBusiness } from '../deleteBusiness';

describe('deleteBusiness procedure', () => {
  beforeEach(() => {
    mockCtx.user = { id: 1, email: 'user@example.com', role: 'SUPERADMIN' };
    testdb.$transaction.mockImplementation(async (transactionalQueries) =>
      transactionalQueries(testdb)
    );
  });

  it('successfully soft-deletes a business', async () => {
    const deleteBusinessInput = {
      businessId: 1,
    };
    const mockBusiness = {
      id: deleteBusinessInput.businessId,
      name: 'Test Business',
      deletedAt: null,
      userId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    testdb.business.findUnique.mockResolvedValue(mockBusiness);
    testdb.business.update.mockResolvedValue({
      ...mockBusiness,
      deletedAt: new Date(),
    });

    const result = await deleteBusiness(deleteBusinessInput, mockCtx);

    expect(result).toEqual({
      message: `Business ${deleteBusinessInput.businessId} has been soft-deleted successfully.`,
      businessId: deleteBusinessInput.businessId,
    });
    expect(testdb.business.update).toHaveBeenCalledWith({
      where: { id: deleteBusinessInput.businessId },
      data: { deletedAt: expect.any(Date) },
    });
  });

  it('throws NOT_FOUND error when a business does not exist', async () => {
    const deleteBusinessInput = {
      businessId: 999,
    };

    testdb.business.findUnique.mockResolvedValue(null);

    await expect(
      deleteBusiness(deleteBusinessInput, mockCtx)
    ).rejects.toMatchObject({
      code: 'NOT_FOUND',
      message: 'Business not found.',
    });
  });
});
