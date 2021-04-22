# Usage

## Using Sentry

To enable sentry in a web deployment, add the following env variables :

```bash
SENTRY_ENABLED=True
SENTRY_DSN=... # Value retrieved from sentry.io
SENTRY_ENVIRONMENT=staging # Or whatever env you're targetting
```

The `SENTRY_DSN` value must be retrieved from sentry.io (cf [here](https://docs.sentry.io/product/sentry-basics/dsn-explainer/#where-to-find-your-dsn)).
