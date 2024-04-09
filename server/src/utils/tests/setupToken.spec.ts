import { testdb, mockCtx } from '@server/tests/testSetup';
import { generateSetupToken } from '../setupToken';

describe('generateSetupToken', () => {
  it('should generate a setup token and store it with the provided email', async () => {
    const mockEmail = 'test@example.com';

    testdb.setupToken.create.mockResolvedValue({
      id: 1,
      token: expect.any(String),
      email: mockEmail,
      used: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const token = await generateSetupToken(mockCtx, mockEmail);

    expect(token).toMatch(/^[0-9a-f]+$/);
    expect(token.length).toBe(96);
    expect(testdb.setupToken.create).toHaveBeenCalledWith({
      data: { token: expect.any(String), email: mockEmail, used: false },
    });
  });
});
