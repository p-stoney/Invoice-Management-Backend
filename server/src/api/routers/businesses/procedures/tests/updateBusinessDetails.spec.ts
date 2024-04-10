import { testdb, mockCtx } from '@server/tests/testSetup';
import { updateBusinessDetails } from '../updateBusinessDetails';

describe('updateBusinessDetails procedure', () => {
  beforeEach(() => {
    mockCtx.user = { id: 1, email: 'user@example.com', role: 'SUPERADMIN' };
    testdb.$transaction.mockImplementation(async (transactionalQueries) =>
      transactionalQueries(testdb)
    );
  });

  it('successfully updates a business with new distributors', async () => {
    const updateInput = {
      businessId: 1,
      distributorIds: [2, 3],
    };
    const mockBusiness = {
      id: updateInput.businessId,
      userId: 1,
      name: 'Test Business',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      distributors: [
        { distributor: { id: 2, name: 'Distributor One' } },
        { distributor: { id: 3, name: 'Distributor Two' } },
      ],
    };

    testdb.business.findUnique.mockResolvedValue(mockBusiness);
    testdb.businessDistributor.create.mockResolvedValue({
      businessId: 1,
      distributorId: 2,
    });
    testdb.business.findUnique.mockResolvedValueOnce(mockBusiness);

    const result = await updateBusinessDetails(updateInput, mockCtx);

    expect(result).toEqual(
      expect.objectContaining({
        id: mockBusiness.id,
        name: mockBusiness.name,
        distributors: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(Number),
            name: expect.any(String),
          }),
        ]),
      })
    );
  });

  it('throws NOT_FOUND error when the business does not exist', async () => {
    const updateBusinessDetailsInput = {
      businessId: 99, // Assuming this ID does not exist in the database
      distributorIds: [1, 2],
    };

    testdb.business.findUnique.mockResolvedValue(null); // Simulate business not found

    await expect(
      updateBusinessDetails(updateBusinessDetailsInput, mockCtx)
    ).rejects.toMatchObject({
      code: 'NOT_FOUND',
      message: 'Business not found.',
    });
  });
});
