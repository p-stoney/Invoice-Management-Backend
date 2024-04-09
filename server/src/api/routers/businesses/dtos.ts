import { z } from 'zod';

export const BusinessResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  distributors: z.array(z.unknown()).optional(),
  invoices: z.array(z.unknown()).optional(),
});

export const DeleteBusinessResponseSchema = z.object({
  message: z.string(),
  businessId: z.number(),
});

export type BusinessResponse = z.TypeOf<typeof BusinessResponseSchema>;
export type DeleteBusinessResponse = z.TypeOf<typeof DeleteBusinessResponseSchema>;

export const CreateBusinessInput = z.object({
  name: z.string(),
});

export const UpdateBusinessDistributorsInput = z.object({
  businessId: z.number(),
  distributorIds: z.array(z.number()),
});

export const DeleteBusinessInput = z.object({
  businessId: z.number(),
});

export type CreateBusinessDto = z.TypeOf<typeof CreateBusinessInput>;
export type UpdateBusinessDistributorsDto = z.TypeOf<typeof UpdateBusinessDistributorsInput>;
export type DeleteBusinessDto = z.TypeOf<typeof DeleteBusinessInput>;