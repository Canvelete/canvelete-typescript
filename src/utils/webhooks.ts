/**
 * Webhook signature verification utilities
 */

import { createHmac, timingSafeEqual } from 'crypto';

export interface WebhookEvent {
    id: string;
    type: string;
    timestamp: string;
    data: Record<string, any>;
}

export interface WebhookVerifyOptions {
    payload: string | Buffer;
    signature: string;
    secret: string;
    tolerance?: number; // Timestamp tolerance in seconds
}

/**
 * Verify a webhook signature
 */
export function verifyWebhookSignature(options: WebhookVerifyOptions): boolean {
    const { payload, signature, secret, tolerance = 300 } = options;

    // Parse the signature header (format: t=timestamp,v1=signature)
    const parts = signature.split(',');
    const signatureParts: Record<string, string> = {};

    for (const part of parts) {
        const [key, value] = part.split('=');
        if (key && value) {
            signatureParts[key] = value;
        }
    }

    const timestamp = signatureParts['t'];
    const v1Signature = signatureParts['v1'];

    if (!timestamp || !v1Signature) {
        return false;
    }

    // Check timestamp tolerance
    const timestampNum = parseInt(timestamp, 10);
    const now = Math.floor(Date.now() / 1000);

    if (Math.abs(now - timestampNum) > tolerance) {
        return false;
    }

    // Compute expected signature
    const payloadStr = typeof payload === 'string' ? payload : payload.toString('utf8');
    const signedPayload = `${timestamp}.${payloadStr}`;
    const expectedSignature = createHmac('sha256', secret)
        .update(signedPayload)
        .digest('hex');

    // Timing-safe comparison
    try {
        return timingSafeEqual(
            Buffer.from(v1Signature),
            Buffer.from(expectedSignature)
        );
    } catch {
        return false;
    }
}

/**
 * Parse a webhook payload
 */
export function parseWebhookPayload(payload: string | Buffer): WebhookEvent {
    const payloadStr = typeof payload === 'string' ? payload : payload.toString('utf8');
    return JSON.parse(payloadStr) as WebhookEvent;
}

/**
 * Construct a webhook event from verified payload
 */
export function constructWebhookEvent(
    payload: string | Buffer,
    signature: string,
    secret: string
): WebhookEvent {
    if (!verifyWebhookSignature({ payload, signature, secret })) {
        throw new Error('Invalid webhook signature');
    }

    return parseWebhookPayload(payload);
}

/**
 * Generate a webhook signature (for testing)
 */
export function generateWebhookSignature(payload: string, secret: string): string {
    const timestamp = Math.floor(Date.now() / 1000);
    const signedPayload = `${timestamp}.${payload}`;
    const signature = createHmac('sha256', secret)
        .update(signedPayload)
        .digest('hex');

    return `t=${timestamp},v1=${signature}`;
}
