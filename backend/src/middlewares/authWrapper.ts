/**
 * File: authWrapper.ts
 * Wrapper để export middleware auth
 * Re-export authenticate middleware từ auth.ts
 */

import { authenticate } from './auth';

export { authenticate };
