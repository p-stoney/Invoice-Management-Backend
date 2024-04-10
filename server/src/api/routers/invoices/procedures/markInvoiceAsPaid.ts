import { TRPCError } from '@trpc/server';
import { Context } from '../../../../context';
import { InvoiceStatusResponse, UpdateInvoiceStatusDto } from '../dtos';

/**
 * Marks an existing invoice as paid, ensuring the invoice exists and has not already been marked as paid.
 *
 * @param {UpdateInvoiceStatusDto} input - Contains the ID of the invoice to update and the new status.
 * @param {Context} ctx - The request context, providing access to transactional database operations.
 * @returns {Promise<InvoiceStatusResponse>} A message confirming the invoice has been marked as paid successfully.
 * @throws {TRPCError} with code 'NOT_FOUND' if the invoice cannot be found or has been deleted.
 * @throws {TRPCError} with code 'BAD_REQUEST' if the invoice is already marked as paid.
 * @throws {TRPCError} with code 'INTERNAL_SERVER_ERROR' for any other errors during the update.
 */
export const markInvoiceAsPaid = async (
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

    if (invoice.status === 'PAID') {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Invoice is already marked as paid.',
      });
    }

    await transaction.invoice.update({
      where: { id: input.invoiceId },
      data: { status: 'PAID' },
    });
  });

  return {
    message: `Invoice ${input.invoiceId} has been marked as paid successfully.`,
    invoiceId: input.invoiceId,
    status: 'PAID',
  };
};
