import { TRPCError } from '@trpc/server';
import { Invoice, InvoiceStatus } from '@prisma/client';
import { testdb, mockCtx } from '@server/tests/testSetup';
import { markInvoiceAsUnpaid } from '../markInvoiceAsUnpaid';

describe('markInvoiceAsUnpaid procedure', () => {
  beforeEach(() => {
    testdb.$transaction.mockImplementation(async (transactionalQueries) => transactionalQueries(testdb));
    mockCtx.user = { id: 1, email: 'user@example.com', role: 'SUPERADMIN' };
  });

  it('successfully marks an invoice as unpaid', async () => {
    const updateInvoiceStatusInput = {
      invoiceId: 1,
      status: InvoiceStatus.PAID,
    };

    const mockInvoice: Invoice = {
      id: updateInvoiceStatusInput.invoiceId,
      businessId: 1,
      distributorId: 1,
      status: InvoiceStatus.PAID,
      dueBy: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    testdb.invoice.findUnique.mockResolvedValue(mockInvoice);
    testdb.invoice.update.mockResolvedValue({ ...mockInvoice, status: 'UNPAID' });

    const result = await markInvoiceAsUnpaid(updateInvoiceStatusInput, mockCtx);

    expect(result).toEqual({
      message: `Invoice ${updateInvoiceStatusInput.invoiceId} has been marked as unpaid successfully.`,
      invoiceId: updateInvoiceStatusInput.invoiceId,
      status: 'UNPAID',
    });
  });

  it('handles the invoice already marked as unpaid', async () => {
    const updateInvoiceStatusInput = {
      invoiceId: 2,
      status: InvoiceStatus.UNPAID,
    };

    const mockInvoiceAlreadyUnpaid: Invoice = {
      id: updateInvoiceStatusInput.invoiceId,
      businessId: 1,
      distributorId: 1,
      status: InvoiceStatus.UNPAID,
      dueBy: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    testdb.invoice.findUnique.mockResolvedValue(mockInvoiceAlreadyUnpaid);

    await expect(markInvoiceAsUnpaid(updateInvoiceStatusInput, mockCtx))
      .rejects
      .toThrowError(new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Invoice is already marked as unpaid.' }));  });

  it('throws NOT_FOUND error when an invoice does not exist', async () => {
    const updateInvoiceStatusInput = {
      invoiceId: 999,
      status: InvoiceStatus.PAID,
    };

    testdb.invoice.findUnique.mockResolvedValue(null);

    await expect(markInvoiceAsUnpaid(updateInvoiceStatusInput, mockCtx))
      .rejects
      .toMatchObject({ code: 'NOT_FOUND', message: 'Invoice not found.' });
  });
});