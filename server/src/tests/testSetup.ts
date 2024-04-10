import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import { Logger } from 'winston';
import { SessionUser } from '../utils/auth';

/**
 * Test setup for unit testing with vitest.
 * Configures a mock Prisma client and resets it before each test to ensure test isolation.
 * Provides a mock context for tests, including the mock database client, mock request, mock response, and a mock logger.
 */
export const testdb = mockDeep<PrismaClient>();

beforeEach(() => {
  mockReset(testdb);
});

export type TestContext = {
  db: typeof testdb;
  req: Request;
  res: Response;
  logger: Logger;
  user?: SessionUser;
};

export const mockCtx: TestContext = {
  db: testdb,
  req: {} as Request,
  res: {} as Response,
  logger: {} as Logger,
};
