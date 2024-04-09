import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import { Logger } from 'winston';
import { SessionUser } from '../utils/auth';

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