import { TRPCError } from '@trpc/server';
import { Prisma } from '@prisma/client';
import { testdb, mockCtx } from '@server/tests/testSetup';
import { createDistributor } from '../createDistributor';

describe('createDistributor procedure', () => {
  it('successfully creates a new distributor', async () => {
    const createDistributorInput = {
      name: 'Distributor A',
      paymentTerms: 30,
    };
    const mockDistributor = {
      id: 1,
      ...createDistributorInput,
      businesses: [],
      products: [],
      invoices: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    testdb.distributor.create.mockResolvedValue(mockDistributor);

    const result = await createDistributor(createDistributorInput, mockCtx);

    expect(result).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        name: createDistributorInput.name,
        paymentTerms: createDistributorInput.paymentTerms,
        businesses: expect.any(Array),
        products: expect.any(Array),
        invoices: expect.any(Array),
      })
    );
    expect(testdb.distributor.create).toHaveBeenCalledWith({
      data: createDistributorInput,
    });
  });

  it('throws CONFLICT error when a distributor with the same name exists', async () => {
    const createDistributorInput = {
      name: 'Existing Distributor',
      paymentTerms: 30,
    };

    testdb.distributor.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('P2002', {
        code: 'P2002',
        clientVersion: '1.0.0',
        meta: {},
        batchRequestIdx: 0,
      })
    );

    await expect(
      createDistributor(createDistributorInput, mockCtx)
    ).rejects.toMatchObject({
      code: 'CONFLICT',
      message: 'A distributor with this name already exists.',
    });
  });

  it('handles unexpected errors correctly', async () => {
    const createDistributorInput = {
      name: 'Distributor B',
      paymentTerms: 30,
    };

    testdb.distributor.create.mockRejectedValue(new Error('Unexpected error'));

    await expect(
      createDistributor(createDistributorInput, mockCtx)
    ).rejects.toThrowError(
      new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create the distributor.',
      })
    );
  });
});
