import { Prisma } from '@prisma/client';
import { testdb, mockCtx } from '@server/tests/testSetup';
import { createProduct } from '../createProduct';

describe('createProduct procedure', () => {
  beforeEach(() => {
    testdb.$transaction.mockImplementation(async (transactionalQueries) =>
      transactionalQueries(testdb)
    );
    mockCtx.user = { id: 1, email: 'user@example.com', role: 'SUPERADMIN' };
  });

  it('successfully creates a new product', async () => {
    const createProductInput = {
      distributorId: 1,
      name: 'New Product',
      price: '100.00',
    };

    const mockDistributor = {
      id: createProductInput.distributorId,
      name: 'Mock Distributor',
      paymentTerms: 30,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    const mockProduct = {
      id: 1,
      ...createProductInput,
      price: new Prisma.Decimal(createProductInput.price),
    };

    testdb.distributor.findUnique.mockResolvedValue(mockDistributor);
    testdb.product.create.mockResolvedValue({
      ...mockProduct,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });

    const result = await createProduct(createProductInput, mockCtx);

    expect(result).toMatchObject({
      id: expect.any(Number),
      distributorId: createProductInput.distributorId,
      name: createProductInput.name,
      price: mockProduct.price.toString(),
    });
  });

  it('throws NOT_FOUND error when a distributor does not exist', async () => {
    const createProductInput = {
      distributorId: 999,
      name: 'New Product',
      price: '100.00',
    };

    testdb.distributor.findUnique.mockResolvedValue(null);

    await expect(
      createProduct(createProductInput, mockCtx)
    ).rejects.toMatchObject({
      code: 'NOT_FOUND',
      message: 'Distributor not found.',
    });
  });
});
