import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      enabled: process.env.NODE_ENV === "production",
      
      // Performance monitoring
      integrations: [
        Sentry.httpIntegration(),
        Sentry.nodeProfilingIntegration(),
      ],
      
      // Sampling rates
      tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
      profilesSampleRate: 1.0,
      
      // Release tracking
      release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
      
      // Filter events
      beforeSend(event) {
        // Don't send events in development
        if (process.env.NODE_ENV === "development") {
          return null;
        }
        return event;
      },
    });
  }
}
