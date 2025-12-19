/**
 * Retry logic with exponential backoff
 */

import { RateLimitError, ServerError, CanveleteError } from '../errors';

export interface RetryConfig {
    maxAttempts: number;
    backoffFactor: number;
    initialDelay: number;
    maxDelay: number;
    retryOn: Array<new (...args: any[]) => Error>;
}

const defaultConfig: RetryConfig = {
    maxAttempts: 3,
    backoffFactor: 2.0,
    initialDelay: 1000,
    maxDelay: 60000,
    retryOn: [RateLimitError, ServerError],
};

/**
 * Sleep for a specified duration
 */
function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Execute a function with retry logic and exponential backoff
 */
export async function withRetry<T>(
    fn: () => Promise<T>,
    config: Partial<RetryConfig> = {}
): Promise<T> {
    const cfg = { ...defaultConfig, ...config };
    let attempt = 0;
    let delay = cfg.initialDelay;

    while (attempt < cfg.maxAttempts) {
        try {
            return await fn();
        } catch (error) {
            attempt++;

            // Check if we should retry this error
            const shouldRetry = cfg.retryOn.some(
                ErrorClass => error instanceof ErrorClass
            );

            if (!shouldRetry || attempt >= cfg.maxAttempts) {
                throw error;
            }

            // Check for rate limit with retry-after header
            if (error instanceof RateLimitError && error.retryAfter) {
                delay = error.retryAfter * 1000;
                console.warn(
                    `Rate limited. Retrying after ${delay}ms (attempt ${attempt}/${cfg.maxAttempts})`
                );
            } else {
                console.warn(
                    `Attempt ${attempt}/${cfg.maxAttempts} failed: ${(error as Error).message}. ` +
                    `Retrying in ${delay}ms...`
                );
            }

            await sleep(delay);

            // Exponential backoff
            delay = Math.min(delay * cfg.backoffFactor, cfg.maxDelay);
        }
    }

    // This should never be reached, but TypeScript needs it
    throw new CanveleteError('Max retry attempts reached');
}

/**
 * Create a retry wrapper for rate limit errors
 */
export function retryOnRateLimit<T>(fn: () => Promise<T>): Promise<T> {
    return withRetry(fn, {
        maxAttempts: 5,
        backoffFactor: 2,
        retryOn: [RateLimitError, ServerError],
    });
}

/**
 * Decorator-style retry wrapper
 */
export function createRetryWrapper(config: Partial<RetryConfig> = {}) {
    return function <T>(fn: () => Promise<T>): Promise<T> {
        return withRetry(fn, config);
    };
}
