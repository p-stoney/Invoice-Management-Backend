import { testdb, mockCtx } from '@server/tests/testSetup';
import { updateDistributorDetails } from '../updateDistributorDetails';

describe('updateDistributorDetails procedure', () => {
  beforeEach(() => {
    testdb.$transaction.mockImplementation(async (transactionalQueries) =>
      transactionalQueries(testdb)
    );
    mockCtx.user = { id: 1, email: 'user@example.com', role: 'SUPERADMIN' };
  });

  it('successfully updates a distributor details', async () => {
    const updateDistributorDetailsInput = {
      distributorId: 1,
      paymentTerms: 45,
    };
    const mockDistributor = {
      id: updateDistributorDetailsInput.distributorId,
      name: 'Distributor A',
      paymentTerms: updateDistributorDetailsInput.paymentTerms,
      businesses: [],
      products: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    testdb.distributor.findUnique.mockResolvedValue(mockDistributor);
    testdb.distributor.update.mockResolvedValue({
      ...mockDistributor,
      paymentTerms: updateDistributorDetailsInput.paymentTerms,
    });

    const result = await updateDistributorDetails(
      updateDistributorDetailsInput,
      mockCtx
    );

    expect(result).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        name: expect.any(String),
        paymentTerms: updateDistributorDetailsInput.paymentTerms,
        businesses: expect.any(Array),
        products: expect.any(Array),
      })
    );
    expect(testdb.distributor.update).toHaveBeenCalledWith({
      where: { id: updateDistributorDetailsInput.distributorId },
      data: { paymentTerms: updateDistributorDetailsInput.paymentTerms },
      include: { businesses: true, products: true },
    });
  });

  it('throws NOT_FOUND error when a distributor does not exist', async () => {
    const updateDistributorDetailsInput = {
      distributorId: 999,
      paymentTerms: 45,
    };

    testdb.distributor.findUnique.mockResolvedValue(null);

    await expect(
      updateDistributorDetails(updateDistributorDetailsInput, mockCtx)
    ).rejects.toMatchObject({
      code: 'NOT_FOUND',
      message: 'Distributor not found.',
    });
  });
});
