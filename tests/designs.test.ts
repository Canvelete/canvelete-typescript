/**
 * Tests for DesignsResource
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CanveleteClient } from '../src/client';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('DesignsResource', () => {
    let client: CanveleteClient;

    beforeEach(() => {
        vi.clearAllMocks();
        client = new CanveleteClient({ apiKey: 'test-api-key' });
    });

    describe('list', () => {
        it('should list designs with default pagination', async () => {
            const mockResponse = {
                data: [
                    { id: 'design-1', name: 'Test Design 1' },
                    { id: 'design-2', name: 'Test Design 2' },
                ],
                pagination: { page: 1, limit: 20, total: 2, totalPages: 1 },
            };

            mockFetch.mockResolvedValueOnce({
                status: 200,
                json: () => Promise.resolve(mockResponse),
            });

            const result = await client.designs.list();

            expect(mockFetch).toHaveBeenCalledTimes(1);
            expect(result.data).toHaveLength(2);
            expect(result.pagination.page).toBe(1);
        });

        it('should list designs with custom pagination', async () => {
            const mockResponse = {
                data: [{ id: 'design-1', name: 'Test Design 1' }],
                pagination: { page: 2, limit: 10, total: 15, totalPages: 2 },
            };

            mockFetch.mockResolvedValueOnce({
                status: 200,
                json: () => Promise.resolve(mockResponse),
            });

            const result = await client.designs.list({ page: 2, limit: 10 });

            expect(mockFetch).toHaveBeenCalledTimes(1);
            const url = mockFetch.mock.calls[0][0] as string;
            expect(url).toContain('page=2');
            expect(url).toContain('limit=10');
        });

        it('should filter by template status', async () => {
            const mockResponse = {
                data: [],
                pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
            };

            mockFetch.mockResolvedValueOnce({
                status: 200,
                json: () => Promise.resolve(mockResponse),
            });

            await client.designs.list({ isTemplate: true });

            const url = mockFetch.mock.calls[0][0] as string;
            expect(url).toContain('isTemplate=true');
        });
    });

    describe('create', () => {
        it('should create a new design', async () => {
            const mockResponse = {
                success: true,
                data: {
                    id: 'new-design-id',
                    name: 'New Design',
                    width: 1920,
                    height: 1080,
                },
            };

            mockFetch.mockResolvedValueOnce({
                status: 200,
                json: () => Promise.resolve(mockResponse),
            });

            const result = await client.designs.create({
                name: 'New Design',
                width: 1920,
                height: 1080,
            });

            expect(mockFetch).toHaveBeenCalledTimes(1);
            expect(result.data.name).toBe('New Design');
        });

        it('should create a design with canvas data', async () => {
            const mockResponse = {
                success: true,
                data: { id: 'design-id', name: 'Design with Elements' },
            };

            mockFetch.mockResolvedValueOnce({
                status: 200,
                json: () => Promise.resolve(mockResponse),
            });

            await client.designs.create({
                name: 'Design with Elements',
                width: 800,
                height: 600,
                canvasData: {
                    elements: [
                        { type: 'rectangle', x: 0, y: 0, width: 100, height: 100 },
                    ],
                },
            });

            const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body);
            expect(requestBody.canvasData.elements).toHaveLength(1);
        });
    });

    describe('get', () => {
        it('should get a design by ID', async () => {
            const mockResponse = {
                data: {
                    id: 'design-123',
                    name: 'Test Design',
                    width: 1920,
                    height: 1080,
                },
            };

            mockFetch.mockResolvedValueOnce({
                status: 200,
                json: () => Promise.resolve(mockResponse),
            });

            const result = await client.designs.get('design-123');

            expect(mockFetch).toHaveBeenCalledTimes(1);
            expect(result.data.id).toBe('design-123');
        });
    });

    describe('update', () => {
        it('should update a design', async () => {
            const mockResponse = {
                data: {
                    id: 'design-123',
                    name: 'Updated Design',
                },
            };

            mockFetch.mockResolvedValueOnce({
                status: 200,
                json: () => Promise.resolve(mockResponse),
            });

            const result = await client.designs.update('design-123', {
                name: 'Updated Design',
            });

            expect(result.data.name).toBe('Updated Design');
        });
    });

    describe('delete', () => {
        it('should delete a design', async () => {
            mockFetch.mockResolvedValueOnce({
                status: 200,
                json: () => Promise.resolve({}),
            });

            await client.designs.delete('design-123');

            expect(mockFetch).toHaveBeenCalledTimes(1);
            const url = mockFetch.mock.calls[0][0] as string;
            expect(url).toContain('/api/automation/designs/design-123');
        });
    });
});
