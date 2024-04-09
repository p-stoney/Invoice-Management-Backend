import { z } from 'zod';
import { User } from '@prisma/client';

export type UserResponse = Omit<User, 'password'>;

export const UserOperationInput = z.object({
  userId: z.number(),
});

export const UserAssociationInput = z.object({
  userId: z.number(),
  businessIds: z.array(z.number()),
});

export const UpdateUserAssociationsInput = z.object({
  userId: z.number(),
  businessesToAdd: z.array(z.number()).optional(),
  businessesToRemove: z.array(z.number()).optional(),
});

export type PromoteUserDto = z.TypeOf<typeof UserOperationInput>;
export type DemoteUserDto = z.TypeOf<typeof UserOperationInput>;
export type AssociateUserWithBusinessDto = z.TypeOf<typeof UserAssociationInput>;
export type RemoveUserBusinessAssociationsDto = z.TypeOf<typeof UserAssociationInput>;
export type UpdateUserBusinessAssociationsDto = z.TypeOf<typeof UpdateUserAssociationsInput>;