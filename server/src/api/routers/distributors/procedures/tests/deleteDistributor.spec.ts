import { testdb, mockCtx } from '@server/tests/testSetup';
import { deleteDistributor } from '../deleteDistributor';

describe('deleteDistributor procedure', () => {
  beforeEach(() => {
    testdb.$transaction.mockImplementation(async (transactionalQueries) =>
      transactionalQueries(testdb)
    );
    mockCtx.user = { id: 1, email: 'user@example.com', role: 'SUPERADMIN' };
  });

  it('successfully soft-deletes a distributor', async () => {
    const deleteDistributorInput = {
      distributorId: 1,
    };
    const mockDistributor = {
      id: deleteDistributorInput.distributorId,
      name: 'Test Distributor',
      paymentTerms: 30,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    testdb.distributor.findUnique.mockResolvedValue(mockDistributor);
    testdb.distributor.update.mockResolvedValue({
      ...mockDistributor,
      deletedAt: new Date(),
    });

    const result = await deleteDistributor(deleteDistributorInput, mockCtx);

    expect(result).toEqual({
      message: `Distributor ${deleteDistributorInput.distributorId} has been soft-deleted successfully.`,
      distributorId: deleteDistributorInput.distributorId,
    });
    expect(testdb.distributor.update).toHaveBeenCalledWith({
      where: { id: deleteDistributorInput.distributorId },
      data: { deletedAt: expect.any(Date) },
    });
  });

  it('throws NOT_FOUND error when a distributor does not exist', async () => {
    const deleteDistributorInput = {
      distributorId: 999,
    };

    testdb.distributor.findUnique.mockResolvedValue(null);

    await expect(
      deleteDistributor(deleteDistributorInput, mockCtx)
    ).rejects.toMatchObject({
      code: 'NOT_FOUND',
      message: 'Distributor not found.',
    });
  });
});
