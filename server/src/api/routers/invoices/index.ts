import { superAdminProcedure, adminProcedure, createTRPCRouter } from '../../../trpc';
import { CreateInvoiceInput, UpdateInvoiceStatusInput, DeleteInvoiceInput } from './dtos';
import { createInvoice, markInvoiceAsPaid, markInvoiceAsUnpaid, deleteInvoice } from './procedures';

export const invoiceRouter = createTRPCRouter({
  createInvoice: superAdminProcedure
    .input(CreateInvoiceInput)
    .mutation(async ({ input, ctx }) => createInvoice(input, ctx)),

  markInvoiceAsPaid: adminProcedure
    .input(UpdateInvoiceStatusInput)
    .mutation(async ({ input, ctx }) => markInvoiceAsPaid(input, ctx)),

  markInvoiceAsUnpaid: adminProcedure
    .input(UpdateInvoiceStatusInput)
    .mutation(async ({ input, ctx }) => markInvoiceAsUnpaid(input, ctx)),

  deleteInvoice: superAdminProcedure
    .input(DeleteInvoiceInput)
    .mutation(async ({ input, ctx }) => deleteInvoice(input, ctx)),
});