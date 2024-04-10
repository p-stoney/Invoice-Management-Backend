import { Prisma } from '@prisma/client';
import { testdb, mockCtx } from '@server/tests/testSetup';
import { updateProductDetails } from '../updateProductDetails';

describe('updateProductDetails procedure', () => {
  beforeEach(() => {
    testdb.$transaction.mockImplementation(async (transactionalQueries) =>
      transactionalQueries(testdb)
    );
    mockCtx.user = { id: 1, email: 'user@example.com', role: 'SUPERADMIN' };
  });

  it('successfully updates a product', async () => {
    const updateProductDetailsInput = {
      productId: 1,
      price: '150.00',
    };

    const mockProduct = {
      id: updateProductDetailsInput.productId,
      distributorId: 1,
      name: 'Test Product',
      price: new Prisma.Decimal('100.00'),
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    testdb.product.findUnique.mockResolvedValue(mockProduct);

    testdb.product.update.mockResolvedValue({
      ...mockProduct,
      price: new Prisma.Decimal(updateProductDetailsInput.price),
    });

    const result = await updateProductDetails(
      updateProductDetailsInput,
      mockCtx
    );

    expect(result).toEqual(
      expect.objectContaining({
        id: mockProduct.id,
        distributorId: mockProduct.distributorId,
        name: mockProduct.name,
        price: result.price,
      })
    );

    expect(testdb.product.update).toHaveBeenCalledWith({
      where: { id: updateProductDetailsInput.productId },
      data: { price: new Prisma.Decimal(updateProductDetailsInput.price) },
    });
  });

  it('throws NOT_FOUND error when a product does not exist', async () => {
    const updateProductDetailsInput = {
      productId: 999,
      price: '150.00',
    };

    testdb.product.findUnique.mockResolvedValue(null);

    await expect(
      updateProductDetails(updateProductDetailsInput, mockCtx)
    ).rejects.toMatchObject({
      code: 'NOT_FOUND',
      message: 'Product not found.',
    });
  });
});
