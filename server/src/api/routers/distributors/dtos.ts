import { z } from 'zod';

export const DistributorResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  paymentTerms: z.number(),
  businesses: z.array(z.object({ id: z.number(), })).optional(),
  products: z.array(z.object({ id: z.number(), })).optional(),
  invoices: z.array(z.object({ id: z.number(), })).optional(),
});

export const DeleteDistributorResponseSchema = z.object({
  message: z.string(),
  distributorId: z.number(),
});

export type DistributorResponse = z.TypeOf<typeof DistributorResponseSchema>;
export type DeleteDistributorResponse = z.TypeOf<typeof DeleteDistributorResponseSchema>;

export const CreateDistributorInput = z.object({
  name: z.string(),
  paymentTerms: z.number().min(0),
});

export const UpdateDistributorDetailsInput = z.object({
  distributorId: z.number(),
  paymentTerms: z.number().min(0),
});

export const DeleteDistributorInput = z.object({
  distributorId: z.number(),
});

export type CreateDistributorDto = z.TypeOf<typeof CreateDistributorInput>;
export type UpdateDistributorDetailsDto = z.TypeOf<typeof UpdateDistributorDetailsInput>;
export type DeleteDistributorDto = z.TypeOf<typeof DeleteDistributorInput>;