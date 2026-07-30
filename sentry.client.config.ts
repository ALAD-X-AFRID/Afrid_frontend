/**
 * Sentry client configuration scaffold.
 * To enable: npm install @sentry/nextjs and set NEXT_PUBLIC_SENTRY_DSN in .env
 * Then uncomment the code below and add sentry.edge.config.ts / sentry.server.config.ts
 */

/*
import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: 0.1,
    profilesSampleRate: 0.1,
    environment: process.env.NODE_ENV,
  });
}
*/

export {};
