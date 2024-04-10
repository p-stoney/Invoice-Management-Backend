import { TRPCError } from '@trpc/server';
import { Context } from '../../../../context';
import { InvoiceStatusResponse, UpdateInvoiceStatusDto } from '../dtos';

/**
 * Marks an existing invoice as unpaid, ensuring the invoice exists and has not already been marked as unpaid.
 *
 * @param {UpdateInvoiceStatusDto} input - Contains the ID of the invoice to update and the new status.
 * @param {Context} ctx - The request context, providing access to transactional database operations.
 * @returns {Promise<InvoiceStatusResponse>} A message confirming the invoice has been marked as unpaid successfully.
 * @throws {TRPCError} with code 'NOT_FOUND' if the invoice cannot be found or has been deleted.
 * @throws {TRPCError} with code 'BAD_REQUEST' if the invoice is already marked as unpaid.
 * @throws {TRPCError} with code 'INTERNAL_SERVER_ERROR' for any other errors during the update.
 */
export const markInvoiceAsUnpaid = async (
  input: UpdateInvoiceStatusDto,
  ctx: Context
): Promise<InvoiceStatusResponse> => {
  await ctx.db.$transaction(async (transaction) => {
    const invoice = await transaction.invoice.findUnique({
      where: { id: input.invoiceId, deletedAt: null },
    });

    if (!invoice) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Invoice not found.' });
    }

    if (invoice.status === 'UNPAID') {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Invoice is already marked as unpaid.',
      });
    }

    await transaction.invoice.update({
      where: { id: input.invoiceId },
      data: { status: 'UNPAID' },
    });
  });

  return {
    message: `Invoice ${input.invoiceId} has been marked as unpaid successfully.`,
    invoiceId: input.invoiceId,
    status: 'UNPAID',
  };
};
