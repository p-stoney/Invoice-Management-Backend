import { z } from 'zod';
import { InvoiceStatus } from '@prisma/client';

export const InvoiceResponseSchema = z.object({
  id: z.number(),
  businessId: z.number(),
  distributorId: z.number(),
  status: z.nativeEnum(InvoiceStatus),
  dueBy: z.date(),
  items: z.array(z.object({
    productId: z.number(),
    quantity: z.number(),
    price: z.string(),
  })),
});

export const InvoiceStatusResponseSchema = z.object({
  message: z.string(),
  invoiceId: z.number(),
  status: z.nativeEnum(InvoiceStatus),
});

export const DeleteInvoiceResponseSchema = z.object({
  message: z.string(),
  invoiceId: z.number(),
});

export type InvoiceResponse = z.TypeOf<typeof InvoiceResponseSchema>;
export type InvoiceStatusResponse = z.TypeOf<typeof InvoiceStatusResponseSchema>;
export type DeleteInvoiceResponse = z.TypeOf<typeof DeleteInvoiceResponseSchema>;

export const InvoiceItemInput = z.object({
  productId: z.number().min(1, "Product ID must be greater than 0"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
});

export const CreateInvoiceInput = z.object({
  businessId: z.number().min(1, "Business ID must be greater than 0"),
  distributorId: z.number().min(1, "Distributor ID must be greater than 0"),
  items: z.array(InvoiceItemInput).nonempty("Invoice must contain at least one item"),
});

export const UpdateInvoiceStatusInput = z.object({
  invoiceId: z.number(),
  status: z.nativeEnum(InvoiceStatus),
});

export const DeleteInvoiceInput = z.object({
  invoiceId: z.number(),
});

export type CreateInvoiceDto = z.TypeOf<typeof CreateInvoiceInput>;
export type UpdateInvoiceStatusDto = z.TypeOf<typeof UpdateInvoiceStatusInput>;
export type DeleteInvoiceDto = z.TypeOf<typeof DeleteInvoiceInput>;