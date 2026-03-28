import * as Sentry from '@sentry/nextjs';
import { sentryCommonConfig } from './sentry.shared';

Sentry.init(sentryCommonConfig);
