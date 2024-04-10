import { Prisma } from '@prisma/client';
import { testdb, mockCtx } from '@server/tests/testSetup';
import { deleteProduct } from '../deleteProduct';

describe('deleteProduct procedure', () => {
  beforeEach(() => {
    testdb.$transaction.mockImplementation(async (transactionalQueries) =>
      transactionalQueries(testdb)
    );
    mockCtx.user = { id: 1, email: 'user@example.com', role: 'SUPERADMIN' };
  });

  it('successfully soft-deletes a product', async () => {
    const deleteProductInput = {
      productId: 1,
    };

    const mockProduct = {
      id: deleteProductInput.productId,
      distributorId: 1,
      name: 'Test Product',
      price: new Prisma.Decimal(0),
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    testdb.product.findUnique.mockResolvedValue(mockProduct);
    testdb.product.update.mockResolvedValue({
      ...mockProduct,
      deletedAt: new Date(),
    });

    const result = await deleteProduct(deleteProductInput, mockCtx);

    expect(result).toEqual({
      message: `Product ${deleteProductInput.productId} has been soft-deleted successfully.`,
      productId: deleteProductInput.productId,
    });
    expect(testdb.product.update).toHaveBeenCalledWith({
      where: { id: deleteProductInput.productId },
      data: { deletedAt: expect.any(Date) },
    });
  });

  it('throws NOT_FOUND error when a product does not exist', async () => {
    const deleteProductInput = {
      productId: 999,
    };

    testdb.product.findUnique.mockResolvedValue(null);

    await expect(
      deleteProduct(deleteProductInput, mockCtx)
    ).rejects.toMatchObject({
      code: 'NOT_FOUND',
      message: 'Product not found.',
    });
  });
});
