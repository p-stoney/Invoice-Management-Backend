import { z } from 'zod';
import { User } from '@prisma/client';

/**
 * Defines data transfer objects (DTOs) and validation schemas for user-related operations.
 * These DTOs are used for promoting and demoting users, associating users with businesses, and updating user associations,
 * ensuring that input data adheres to expected formats and constraints.
 *
 * @module UserDTOs
 */
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
export type AssociateUserWithBusinessDto = z.TypeOf<
  typeof UserAssociationInput
>;
export type RemoveUserBusinessAssociationsDto = z.TypeOf<
  typeof UserAssociationInput
>;
export type UpdateUserBusinessAssociationsDto = z.TypeOf<
  typeof UpdateUserAssociationsInput
>;
