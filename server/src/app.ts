import express from 'express';
import helmet from "helmet";
import cors from 'cors';
import morgan from 'morgan';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { logger } from './utils';
import { createContext } from './context';
import { appRouter } from './api';

/**
 * Creates and configures an Express application with tRPC routing.
 * Sets up middleware for JSON parsing, logging, CORS, and security headers.
 */
export default function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  app.use(morgan('combined', { stream: { write: (message) => logger.info(message) } }));

  app.get('/health', (_, res) => res.sendStatus(200));
  app.use('/v1/trpc', createExpressMiddleware({ router: appRouter, createContext }));

  return app;
}

// TODO: Implement uniqueness checks (business, email, etc.)
// TODO: Implement cascading deletions as needed
// TODO: Populate distributors/invoices for front-end forms