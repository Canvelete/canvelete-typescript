/**
 * Tests for utility functions
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    validateElement,
    validateCanvasDimensions,
    validateRenderOptions,
    validateColor,
} from '../src/utils/validation';
import { withRetry, retryOnRateLimit } from '../src/utils/retry';
import {
    verifyWebhookSignature,
    generateWebhookSignature,
    constructWebhookEvent,
} from '../src/utils/webhooks';
import { ValidationError, RateLimitError, ServerError } from '../src/errors';

describe('Validation Utils', () => {
    describe('validateElement', () => {
        it('should validate a valid rectangle element', () => {
            expect(() => validateElement({
                type: 'rectangle', x: 0, y: 0, width: 100, height: 100,
            })).not.toThrow();
        });

        it('should throw for missing type', () => {
            expect(() => validateElement({ x: 0, y: 0 })).toThrow(ValidationError);
        });
    });
});


describe('validateElement additional tests', () => {
    it('should throw for invalid element type', () => {
        expect(() => validateElement({
            type: 'invalid', x: 0, y: 0,
        })).toThrow(ValidationError);
    });

    it('should throw for missing x position', () => {
        expect(() => validateElement({
            type: 'rectangle', y: 0,
        })).toThrow(ValidationError);
    });

    it('should throw for text element without text', () => {
        expect(() => validateElement({
            type: 'text', x: 0, y: 0,
        })).toThrow(ValidationError);
    });

    it('should throw for image element without src', () => {
        expect(() => validateElement({
            type: 'image', x: 0, y: 0,
        })).toThrow(ValidationError);
    });

    it('should throw for invalid opacity', () => {
        expect(() => validateElement({
            type: 'rectangle', x: 0, y: 0, opacity: 1.5,
        })).toThrow(ValidationError);
    });
});

describe('validateCanvasDimensions', () => {
    it('should validate valid dimensions', () => {
        expect(() => validateCanvasDimensions(1920, 1080)).not.toThrow();
    });

    it('should throw for zero width', () => {
        expect(() => validateCanvasDimensions(0, 1080)).toThrow(ValidationError);
    });

    it('should throw for negative height', () => {
        expect(() => validateCanvasDimensions(1920, -100)).toThrow(ValidationError);
    });

    it('should throw for dimensions exceeding limit', () => {
        expect(() => validateCanvasDimensions(15000, 1080)).toThrow(ValidationError);
    });
});

describe('validateRenderOptions', () => {
    it('should validate valid render options', () => {
        expect(() => validateRenderOptions({
            designId: 'design-123', format: 'png',
        })).not.toThrow();
    });

    it('should throw when neither designId nor templateId provided', () => {
        expect(() => validateRenderOptions({ format: 'png' })).toThrow(ValidationError);
    });

    it('should throw for invalid format', () => {
        expect(() => validateRenderOptions({
            designId: 'design-123', format: 'gif',
        })).toThrow(ValidationError);
    });

    it('should throw for invalid quality', () => {
        expect(() => validateRenderOptions({
            designId: 'design-123', quality: 150,
        })).toThrow(ValidationError);
    });
});

describe('validateColor', () => {
    it('should validate hex colors', () => {
        expect(validateColor('#ff0000')).toBe(true);
        expect(validateColor('#f00')).toBe(true);
        expect(validateColor('#ff000080')).toBe(true);
    });

    it('should validate rgb colors', () => {
        expect(validateColor('rgb(255, 0, 0)')).toBe(true);
        expect(validateColor('rgba(255, 0, 0, 0.5)')).toBe(true);
    });

    it('should validate named colors', () => {
        expect(validateColor('red')).toBe(true);
        expect(validateColor('transparent')).toBe(true);
    });

    it('should reject invalid colors', () => {
        expect(validateColor('notacolor')).toBe(false);
    });
});

describe('Retry Utils', () => {
    describe('withRetry', () => {
        it('should return result on success', async () => {
            const fn = vi.fn().mockResolvedValue('success');
            const result = await withRetry(fn);
            expect(result).toBe('success');
            expect(fn).toHaveBeenCalledTimes(1);
        });

        it('should retry on rate limit error', async () => {
            const fn = vi.fn()
                .mockRejectedValueOnce(new RateLimitError('Rate limited', null))
                .mockResolvedValueOnce('success');

            const result = await withRetry(fn, {
                maxAttempts: 3,
                initialDelay: 10,
            });

            expect(result).toBe('success');
            expect(fn).toHaveBeenCalledTimes(2);
        });

        it('should throw after max attempts', async () => {
            const fn = vi.fn().mockRejectedValue(new ServerError('Server error'));

            await expect(withRetry(fn, {
                maxAttempts: 2,
                initialDelay: 10,
            })).rejects.toThrow(ServerError);

            expect(fn).toHaveBeenCalledTimes(2);
        });
    });
});

describe('Webhook Utils', () => {
    const secret = 'test-webhook-secret';

    describe('generateWebhookSignature', () => {
        it('should generate a valid signature', () => {
            const payload = JSON.stringify({ event: 'test' });
            const signature = generateWebhookSignature(payload, secret);
            expect(signature).toMatch(/^t=\d+,v1=[a-f0-9]+$/);
        });
    });

    describe('verifyWebhookSignature', () => {
        it('should verify a valid signature', () => {
            const payload = JSON.stringify({ event: 'test' });
            const signature = generateWebhookSignature(payload, secret);
            const isValid = verifyWebhookSignature({
                payload, signature, secret,
            });
            expect(isValid).toBe(true);
        });

        it('should reject invalid signature', () => {
            const payload = JSON.stringify({ event: 'test' });
            const isValid = verifyWebhookSignature({
                payload,
                signature: 't=123,v1=invalid',
                secret,
            });
            expect(isValid).toBe(false);
        });
    });

    describe('constructWebhookEvent', () => {
        it('should construct event from valid payload', () => {
            const payload = JSON.stringify({
                id: 'evt-123',
                type: 'render.completed',
                timestamp: '2024-01-15T10:00:00Z',
                data: { designId: 'design-123' },
            });
            const signature = generateWebhookSignature(payload, secret);
            const event = constructWebhookEvent(payload, signature, secret);
            expect(event.type).toBe('render.completed');
        });

        it('should throw for invalid signature', () => {
            const payload = JSON.stringify({ event: 'test' });
            expect(() => constructWebhookEvent(
                payload, 't=123,v1=invalid', secret
            )).toThrow('Invalid webhook signature');
        });
    });
});