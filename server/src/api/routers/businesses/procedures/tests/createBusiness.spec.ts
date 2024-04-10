import { Prisma } from '@prisma/client';
import { testdb, mockCtx } from '@server/tests/testSetup';
import { createBusiness } from '../createBusiness';

describe('createBusiness procedure', () => {
  beforeEach(() => {
    mockCtx.user = { id: 1, email: 'user@example.com', role: 'SUPERADMIN' };
  });

  it('successfully creates a new business', async () => {
    const createBusinessInput = {
      name: 'New Business',
    };

    const mockBusiness = {
      id: 1,
      name: createBusinessInput.name,
      userId: mockCtx.user!.id,
      distributors: [],
      invoices: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    testdb.business.create.mockResolvedValue(mockBusiness);

    const result = await createBusiness(createBusinessInput, mockCtx);

    expect(result).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        name: createBusinessInput.name,
        distributors: expect.any(Array),
        invoices: expect.any(Array),
      })
    );
    expect(testdb.business.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        name: createBusinessInput.name,
        userId: mockCtx.user!.id,
      }),
    });
  });

  it('throws CONFLICT error when a business with the same name exists', async () => {
    const createBusinessInput = {
      name: 'Existing Business',
    };

    testdb.business.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('P2002', {
        code: 'P2002',
        clientVersion: '1.0.0',
        meta: {},
        batchRequestIdx: 0,
      })
    );

    await expect(
      createBusiness(createBusinessInput, mockCtx)
    ).rejects.toHaveProperty('code', 'CONFLICT');

    await expect(
      createBusiness(createBusinessInput, mockCtx)
    ).rejects.toHaveProperty(
      'message',
      'A business with this name already exists.'
    );

    expect(testdb.business.create).toHaveBeenCalledWith({
      data: {
        name: createBusinessInput.name,
        userId: mockCtx.user!.id,
      },
    });
  });
});
