/**
 * Tests for UsageResource
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CanveleteClient } from '../src/client';

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('UsageResource', () => {
    let client: CanveleteClient;

    beforeEach(() => {
        vi.clearAllMocks();
        client = new CanveleteClient({ apiKey: 'test-api-key' });
    });

    describe('getStats', () => {
        it('should get current usage statistics', async () => {
            const mockResponse = {
                data: {
                    creditsUsed: 150,
                    creditLimit: 1000,
                    creditsRemaining: 850,
                    apiCalls: 500,
                    apiCallLimit: 10000,
                    renders: 75,
                    storageUsed: 1024000,
                },
            };

            mockFetch.mockResolvedValueOnce({
                status: 200,
                json: () => Promise.resolve(mockResponse),
            });

            const result = await client.usage.getStats();

            expect(result.data.creditsUsed).toBe(150);
            expect(result.data.creditsRemaining).toBe(850);
        });
    });

    describe('getHistory', () => {
        it('should get usage history', async () => {
            const mockResponse = {
                data: [
                    { type: 'render', creditsUsed: 5, timestamp: '2024-01-15T10:00:00Z' },
                    { type: 'export', creditsUsed: 2, timestamp: '2024-01-15T09:00:00Z' },
                ],
                pagination: { page: 1, limit: 20, total: 2, totalPages: 1 },
            };

            mockFetch.mockResolvedValueOnce({
                status: 200,
                json: () => Promise.resolve(mockResponse),
            });

            const result = await client.usage.getHistory();

            expect(result.data).toHaveLength(2);
        });

        it('should filter history by date range', async () => {
            const mockResponse = {
                data: [],
                pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
            };

            mockFetch.mockResolvedValueOnce({
                status: 200,
                json: () => Promise.resolve(mockResponse),
            });

            const startDate = new Date('2024-01-01');
            const endDate = new Date('2024-01-31');

            await client.usage.getHistory({ startDate, endDate });

            const url = mockFetch.mock.calls[0][0] as string;
            expect(url).toContain('startDate=');
            expect(url).toContain('endDate=');
        });
    });

    describe('getApiStats', () => {
        it('should get API usage statistics by endpoint', async () => {
            const mockResponse = {
                data: {
                    endpoints: {
                        '/api/designs': 100,
                        '/api/render': 50,
                        '/api/templates': 25,
                    },
                    totalCalls: 175,
                    period: 'month',
                },
            };

            mockFetch.mockResolvedValueOnce({
                status: 200,
                json: () => Promise.resolve(mockResponse),
            });

            const result = await client.usage.getApiStats();

            expect(result.data.totalCalls).toBe(175);
            expect(result.data.endpoints['/api/designs']).toBe(100);
        });
    });

    describe('getActivities', () => {
        it('should get recent activities', async () => {
            const mockResponse = {
                data: [
                    { action: 'design_created', timestamp: '2024-01-15T10:00:00Z' },
                    { action: 'design_exported', timestamp: '2024-01-15T09:30:00Z' },
                ],
                pagination: { page: 1, limit: 20, total: 2, totalPages: 1 },
            };

            mockFetch.mockResolvedValueOnce({
                status: 200,
                json: () => Promise.resolve(mockResponse),
            });

            const result = await client.usage.getActivities();

            expect(result.data).toHaveLength(2);
        });
    });

    describe('getAnalytics', () => {
        it('should get usage analytics for default period', async () => {
            const mockResponse = {
                data: {
                    totalRenders: 500,
                    averagePerDay: 16.7,
                    peakDay: '2024-01-10',
                    trend: 'increasing',
                },
            };

            mockFetch.mockResolvedValueOnce({
                status: 200,
                json: () => Promise.resolve(mockResponse),
            });

            const result = await client.usage.getAnalytics();

            expect(result.data.totalRenders).toBe(500);
            expect(result.data.trend).toBe('increasing');
        });

        it('should get analytics for specific period', async () => {
            const mockResponse = {
                data: {
                    totalRenders: 100,
                    averagePerDay: 14.3,
                    peakDay: '2024-01-05',
                    trend: 'stable',
                },
            };

            mockFetch.mockResolvedValueOnce({
                status: 200,
                json: () => Promise.resolve(mockResponse),
            });

            await client.usage.getAnalytics('week');

            const url = mockFetch.mock.calls[0][0] as string;
            expect(url).toContain('period=week');
        });
    });
});
