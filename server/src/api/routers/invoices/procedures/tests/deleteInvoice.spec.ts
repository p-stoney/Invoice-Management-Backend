import { InvoiceStatus } from '@prisma/client';
import { testdb, mockCtx } from '@server/tests/testSetup';
import { deleteInvoice } from '../deleteInvoice';

describe('deleteInvoice procedure', () => {
  beforeEach(() => {
    testdb.$transaction.mockImplementation(async (transactionalQueries) =>
      transactionalQueries(testdb)
    );
    mockCtx.user = { id: 1, email: 'user@example.com', role: 'SUPERADMIN' };
  });

  it('successfully soft-deletes an invoice', async () => {
    const deleteInvoiceInput = {
      invoiceId: 1,
    };

    const mockInvoice = {
      id: deleteInvoiceInput.invoiceId,
      businessId: 1,
      distributorId: 1,
      status: 'UNPAID' as InvoiceStatus,
      dueBy: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    testdb.invoice.findUnique.mockResolvedValue(mockInvoice);
    testdb.invoice.update.mockResolvedValue({
      ...mockInvoice,
      deletedAt: new Date(),
    });

    const result = await deleteInvoice(deleteInvoiceInput, mockCtx);

    expect(result).toEqual({
      message: `Invoice ${deleteInvoiceInput.invoiceId} has been soft-deleted successfully.`,
      invoiceId: deleteInvoiceInput.invoiceId,
    });

    expect(testdb.invoice.update).toHaveBeenCalledWith({
      where: { id: deleteInvoiceInput.invoiceId },
      data: { deletedAt: expect.any(Date) },
    });
  });

  it('throws NOT_FOUND error when an invoice does not exist', async () => {
    const deleteInvoiceInput = {
      invoiceId: 999,
    };

    testdb.invoice.findUnique.mockResolvedValue(null);

    await expect(
      deleteInvoice(deleteInvoiceInput, mockCtx)
    ).rejects.toMatchObject({
      code: 'NOT_FOUND',
      message: 'Invoice not found.',
    });
  });
});
