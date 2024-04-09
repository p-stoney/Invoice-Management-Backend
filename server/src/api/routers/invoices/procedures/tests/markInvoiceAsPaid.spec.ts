import { TRPCError } from '@trpc/server';
import { Invoice, InvoiceStatus } from '@prisma/client';
import { testdb, mockCtx } from '@server/tests/testSetup';
import { markInvoiceAsPaid } from '../markInvoiceAsPaid';

describe('markInvoiceAsPaid procedure', () => {
  beforeEach(() => {
    testdb.$transaction.mockImplementation(async (transactionalQueries) => transactionalQueries(testdb));
    mockCtx.user = { id: 1, email: 'user@example.com', role: 'SUPERADMIN' };
  });

  it('successfully marks an invoice as paid', async () => {
    const updateInvoiceStatusInput = {
      invoiceId: 1,
      status: InvoiceStatus.UNPAID,
    };

    const mockInvoice: Invoice = {
        id: updateInvoiceStatusInput.invoiceId,
        businessId: 0,
        distributorId: 0,
        status: InvoiceStatus.UNPAID,
        dueBy: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
    };

    // Mock the findUnique method to return an unpaid invoice
    testdb.invoice.findUnique.mockResolvedValue(mockInvoice);

    // Mock the update method to simulate updating the invoice status
    testdb.invoice.update.mockResolvedValue({ ...mockInvoice, status: 'PAID' });

    const result = await markInvoiceAsPaid(updateInvoiceStatusInput, mockCtx);

    expect(result).toEqual({
      message: `Invoice ${updateInvoiceStatusInput.invoiceId} has been marked as paid successfully.`,
      invoiceId: updateInvoiceStatusInput.invoiceId,
      status: 'PAID',
    });
  });

  it('handles the invoice already marked as paid', async () => {
    const updateInvoiceStatusInput = {
      invoiceId: 2,
      status: InvoiceStatus.UNPAID,
    };

    const mockInvoiceAlreadyPaid: Invoice = {
        id: updateInvoiceStatusInput.invoiceId,
        businessId: 0,
        distributorId: 0,
        status: InvoiceStatus.PAID,
        dueBy: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
    };

    testdb.invoice.findUnique.mockResolvedValue(mockInvoiceAlreadyPaid);

    await expect(markInvoiceAsPaid(updateInvoiceStatusInput, mockCtx))
      .rejects
      .toThrowError(new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Invoice is already marked as paid.' }));
  });

  it('throws NOT_FOUND error when an invoice does not exist', async () => {
    const updateInvoiceStatusInput = {
      invoiceId: 999,
      status: InvoiceStatus.UNPAID,
    };

    testdb.invoice.findUnique.mockResolvedValue(null);

    await expect(markInvoiceAsPaid(updateInvoiceStatusInput, mockCtx))
      .rejects
      .toMatchObject({ code: 'NOT_FOUND', message: 'Invoice not found.' });
  });
});