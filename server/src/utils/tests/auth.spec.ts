import * as vi from 'vitest';
import { verify } from 'jsonwebtoken';
import { TRPCError } from "@trpc/server";
import { decodeAndVerifyJwtToken } from '../auth';
import { authConfig } from '../../config/authConfig';

vitest.mock('jsonwebtoken', () => ({
  verify: vitest.fn(),
}));

describe('decodeAndVerifyJwtToken', () => {
  it('should decode a valid token correctly', async () => {
    const mockToken = 'valid.token.value';
    const mockDecoded = { id: 1, email: 'test@example.com', role: 'SUPERADMIN' };
    (verify as vi.Mock).mockImplementation(() => mockDecoded);

    const decoded = await decodeAndVerifyJwtToken(mockToken);

    expect(decoded).toEqual(mockDecoded);
    expect(verify).toHaveBeenCalledWith(mockToken, authConfig.jwtSecret);
  });

  it('should throw UNAUTHORIZED TRPCError for invalid token', async () => {
    const mockToken = 'invalid.token.value';
    (verify as vi.Mock).mockImplementation(() => {
      throw new Error('Invalid token');
    });

    await expect(decodeAndVerifyJwtToken(mockToken))
      .rejects
      .toThrow(TRPCError);
    await expect(decodeAndVerifyJwtToken(mockToken))
      .rejects
      .toHaveProperty('code', 'UNAUTHORIZED');
  });
});