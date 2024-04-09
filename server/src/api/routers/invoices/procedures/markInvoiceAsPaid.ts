import { TRPCError } from '@trpc/server';
import { Context } from '../../../../context';
import { InvoiceStatusResponse, UpdateInvoiceStatusDto } from '../dtos';

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
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invoice is already marked as paid.' });
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