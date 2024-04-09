import * as vi from 'vitest';
import { Role } from '@prisma/client';
import { testdb, mockCtx } from '@server/tests/testSetup';
import { hash } from 'bcrypt';
import { signUp } from '../signUp';

vitest.mock('bcrypt', () => ({
  hash: vitest.fn(),
}));

describe('signUp procedure', () => {
  it('should successfully create a new user with hashed password', async () => {
    const plainPassword = 'password123';
    const hashedPassword = 'hashedPassword123';
    const signUpInput = {
      email: 'newuser@example.com',
      password: plainPassword,
    };
    const mockUser = {
      id: 1,
      email: signUpInput.email,
      password: hashedPassword,
      role: Role.USER,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    (hash as vi.Mock).mockResolvedValue(hashedPassword);

    testdb.user.create.mockResolvedValue(mockUser);

    const result = await signUp(signUpInput, mockCtx);

    expect(result).toMatchObject({
      email: signUpInput.email,
      role: Role.USER,
    });
    expect(hash).toHaveBeenCalledWith(plainPassword, 10);
    expect(testdb.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        email: signUpInput.email,
        password: hashedPassword,
      }),
    });
  });
});