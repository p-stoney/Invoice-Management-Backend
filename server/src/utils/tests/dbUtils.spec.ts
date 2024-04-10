import { testdb, TestContext } from '@server/tests/testSetup';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import { Logger } from 'winston';
import { fetchProductPrices } from '../dbUtils';

describe('fetchProductPrices', () => {
  it('should return a map of product IDs to their prices', async () => {
    const productIds = [1, 2];
    const mockProducts = [
      {
        id: 1,
        distributorId: 1,
        name: 'Product 1',
        price: new Prisma.Decimal(10),
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
      {
        id: 2,
        distributorId: 2,
        name: 'Product 2',
        price: new Prisma.Decimal(20),
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
    ];

    testdb.product.findMany.mockResolvedValue(mockProducts);

    const mockCtx: TestContext = {
      db: testdb,
      req: {} as Request,
      res: {} as Response,
      logger: {} as Logger,
    };

    const result = await fetchProductPrices(productIds, mockCtx);

    expect(result).toBeInstanceOf(Map);
    expect(result.get(1)).toEqual('10');
    expect(result.get(2)).toEqual('20');
    expect(testdb.product.findMany).toHaveBeenCalledWith({
      where: {
        id: { in: productIds },
      },
    });
  });
});
