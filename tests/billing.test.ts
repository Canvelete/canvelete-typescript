/**
 * Tests for BillingResource
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CanveleteClient } from '../src/client';

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('BillingResource', () => {
    let client: CanveleteClient;

    beforeEach(() => {
        vi.clearAllMocks();
        client = new CanveleteClient({ apiKey: 'test-api-key' });
    });

    describe('getInfo', () => {
        it('should get billing information', async () => {
            const mockResponse = {
                data: {
                    plan: 'pro',
                    status: 'active',
                    creditBalance: 500,
                    creditLimit: 1000,
                    nextBillingDate: '2024-02-01',
                    currentPeriodStart: '2024-01-01',
                    currentPeriodEnd: '2024-01-31',
                    cancelAtPeriodEnd: false,
                },
            };

            mockFetch.mockResolvedValueOnce({
                status: 200,
                json: () => Promise.resolve(mockResponse),
            });

            const result = await client.billing.getInfo();

            expect(result.data.plan).toBe('pro');
            expect(result.data.status).toBe('active');
            expect(result.data.creditBalance).toBe(500);
        });
    });

    describe('getInvoices', () => {
        it('should get invoice history', async () => {
            const mockResponse = {
                data: [
                    {
                        id: 'inv-1',
                        date: '2024-01-01',
                        amount: 29.99,
                        currency: 'USD',
                        status: 'paid',
                    },
                    {
                        id: 'inv-2',
                        date: '2023-12-01',
                        amount: 29.99,
                        currency: 'USD',
                        status: 'paid',
                    },
                ],
                pagination: { page: 1, limit: 20, total: 2, totalPages: 1 },
            };

            mockFetch.mockResolvedValueOnce({
                status: 200,
                json: () => Promise.resolve(mockResponse),
            });

            const result = await client.billing.getInvoices();

            expect(result.data).toHaveLength(2);
            expect(result.data[0].status).toBe('paid');
        });

        it('should paginate invoices', async () => {
            const mockResponse = {
                data: [],
                pagination: { page: 2, limit: 10, total: 15, totalPages: 2 },
            };

            mockFetch.mockResolvedValueOnce({
                status: 200,
                json: () => Promise.resolve(mockResponse),
            });

            await client.billing.getInvoices({ page: 2, limit: 10 });

            const url = mockFetch.mock.calls[0][0] as string;
            expect(url).toContain('page=2');
            expect(url).toContain('limit=10');
        });
    });

    describe('getSummary', () => {
        it('should get billing summary', async () => {
            const mockResponse = {
                data: {
                    totalSpent: 359.88,
                    currentMonth: 29.99,
                    previousMonth: 29.99,
                    averageMonthly: 29.99,
                    currency: 'USD',
                },
            };

            mockFetch.mockResolvedValueOnce({
                status: 200,
                json: () => Promise.resolve(mockResponse),
            });

            const result = await client.billing.getSummary();

            expect(result.data.totalSpent).toBe(359.88);
            expect(result.data.currency).toBe('USD');
        });
    });

    describe('purchaseCredits', () => {
        it('should purchase additional credits', async () => {
            const mockResponse = {
                data: {
                    id: 'purchase-1',
                    amount: 9.99,
                    credits: 100,
                    newBalance: 600,
                    status: 'completed',
                },
            };

            mockFetch.mockResolvedValueOnce({
                status: 200,
                json: () => Promise.resolve(mockResponse),
            });

            const result = await client.billing.purchaseCredits(100);

            expect(result.data.credits).toBe(100);
            expect(result.data.newBalance).toBe(600);
        });

        it('should purchase credits with payment method', async () => {
            const mockResponse = {
                data: {
                    id: 'purchase-2',
                    amount: 19.99,
                    credits: 250,
                    newBalance: 750,
                    status: 'completed',
                },
            };

            mockFetch.mockResolvedValueOnce({
                status: 200,
                json: () => Promise.resolve(mockResponse),
            });

            await client.billing.purchaseCredits(250, 'pm_card_visa');

            const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body);
            expect(requestBody.paymentMethodId).toBe('pm_card_visa');
        });
    });

    describe('getSeats', () => {
        it('should get team seats information', async () => {
            const mockResponse = {
                data: {
                    used: 3,
                    total: 5,
                    available: 2,
                },
            };

            mockFetch.mockResolvedValueOnce({
                status: 200,
                json: () => Promise.resolve(mockResponse),
            });

            const result = await client.billing.getSeats();

            expect(result.data.used).toBe(3);
            expect(result.data.available).toBe(2);
        });
    });

    describe('addSeats', () => {
        it('should add team seats', async () => {
            const mockResponse = {
                data: {
                    used: 3,
                    total: 7,
                    available: 4,
                },
            };

            mockFetch.mockResolvedValueOnce({
                status: 200,
                json: () => Promise.resolve(mockResponse),
            });

            const result = await client.billing.addSeats(2);

            expect(result.data.total).toBe(7);
        });
    });

    describe('removeSeats', () => {
        it('should remove team seats', async () => {
            const mockResponse = {
                data: {
                    used: 3,
                    total: 4,
                    available: 1,
                },
            };

            mockFetch.mockResolvedValueOnce({
                status: 200,
                json: () => Promise.resolve(mockResponse),
            });

            const result = await client.billing.removeSeats(1);

            expect(result.data.total).toBe(4);
        });
    });

    describe('getPortalUrl', () => {
        it('should get billing portal URL', async () => {
            const mockResponse = {
                url: 'https://billing.stripe.com/session/xxx',
            };

            mockFetch.mockResolvedValueOnce({
                status: 200,
                json: () => Promise.resolve(mockResponse),
            });

            const result = await client.billing.getPortalUrl();

            expect(result.url).toContain('stripe.com');
        });
    });
});
