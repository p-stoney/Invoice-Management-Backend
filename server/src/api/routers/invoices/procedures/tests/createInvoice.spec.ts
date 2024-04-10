import { Invoice } from '@prisma/client';
import { testdb, mockCtx } from '@server/tests/testSetup';
import { fetchProductPrices } from '@server/utils/dbUtils';
import { CreateInvoiceDto } from '../../dtos';
import { createInvoice } from '../createInvoice';

vitest.mock('@server/utils/dbUtils', () => ({
  fetchProductPrices: vitest.fn(),
}));

describe('createInvoice procedure', () => {
  let createInvoiceInput: CreateInvoiceDto;

  beforeEach(() => {
    vitest.resetAllMocks();
    testdb.$transaction.mockImplementation(async (transactionalQueries) =>
      transactionalQueries(testdb)
    );
    mockCtx.user = { id: 1, email: 'user@example.com', role: 'SUPERADMIN' };

    createInvoiceInput = {
      businessId: 1,
      distributorId: 1,
      items: [
        { productId: 1, quantity: 10 },
        { productId: 2, quantity: 5 },
      ],
    };

    testdb.distributor.findUnique.mockResolvedValue({
      id: 1,
      name: 'Distributor Name',
      paymentTerms: 30,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });

    testdb.invoice.create.mockResolvedValue({
      id: 1,
      businessId: createInvoiceInput.businessId,
      distributorId: createInvoiceInput.distributorId,
      status: 'UNPAID',
      dueBy: expect.any(Date),
      items: createInvoiceInput.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.productId === 1 ? '100.00' : '200.00',
      })),
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    } as Invoice & {
      items: { productId: number; quantity: number; price: string }[];
    });

    vitest.mocked(fetchProductPrices).mockResolvedValue(
      new Map([
        [1, '100.00'],
        [2, '200.00'],
      ])
    );
  });

  it('successfully creates a new invoice', async () => {
    const result = await createInvoice(createInvoiceInput, mockCtx);

    expect(testdb.invoice.create).toHaveBeenCalled();
    expect(result).toMatchObject({
      id: expect.any(Number),
      businessId: createInvoiceInput.businessId,
      distributorId: createInvoiceInput.distributorId,
      items: expect.arrayContaining([
        expect.objectContaining({
          productId: 1,
          quantity: 10,
          price: '100.00',
        }),
        expect.objectContaining({ productId: 2, quantity: 5, price: '200.00' }),
      ]),
    });
  });

  it('throws NOT_FOUND error when distributor does not exist', async () => {
    testdb.distributor.findUnique.mockResolvedValue(null);

    await expect(
      createInvoice(createInvoiceInput, mockCtx)
    ).rejects.toMatchObject({
      code: 'NOT_FOUND',
      message: `Distributor with ID ${createInvoiceInput.distributorId} not found.`,
    });
  });
});
