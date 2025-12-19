/**
 * Tests for AssetsResource
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CanveleteClient } from '../src/client';

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('AssetsResource', () => {
    let client: CanveleteClient;

    beforeEach(() => {
        vi.clearAllMocks();
        client = new CanveleteClient({ apiKey: 'test-api-key' });
    });

    describe('list', () => {
        it('should list user assets', async () => {
            const mockResponse = {
                data: [
                    { id: 'asset-1', name: 'Image 1', type: 'IMAGE' },
                    { id: 'asset-2', name: 'Image 2', type: 'IMAGE' },
                ],
                pagination: { page: 1, limit: 20, total: 2, totalPages: 1 },
            };

            mockFetch.mockResolvedValueOnce({
                status: 200,
                json: () => Promise.resolve(mockResponse),
            });

            const result = await client.assets.list();

            expect(result.data).toHaveLength(2);
        });

        it('should filter assets by type', async () => {
            const mockResponse = {
                data: [{ id: 'font-1', name: 'Custom Font', type: 'FONT' }],
                pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
            };

            mockFetch.mockResolvedValueOnce({
                status: 200,
                json: () => Promise.resolve(mockResponse),
            });

            await client.assets.list({ type: 'FONT' });

            const url = mockFetch.mock.calls[0][0] as string;
            expect(url).toContain('type=FONT');
        });
    });

    describe('get', () => {
        it('should get an asset by ID', async () => {
            const mockResponse = {
                data: {
                    id: 'asset-123',
                    name: 'My Image',
                    type: 'IMAGE',
                    url: 'https://example.com/image.png',
                },
            };

            mockFetch.mockResolvedValueOnce({
                status: 200,
                json: () => Promise.resolve(mockResponse),
            });

            const result = await client.assets.get('asset-123');

            expect(result.data.id).toBe('asset-123');
        });
    });

    describe('delete', () => {
        it('should delete an asset', async () => {
            mockFetch.mockResolvedValueOnce({
                status: 200,
                json: () => Promise.resolve({ success: true }),
            });

            const result = await client.assets.delete('asset-123');

            expect(result.success).toBe(true);
        });
    });

    describe('searchStockImages', () => {
        it('should search for stock images', async () => {
            const mockResponse = {
                data: [
                    {
                        id: 'stock-1',
                        tags: 'nature, landscape',
                        previewURL: 'https://pixabay.com/preview.jpg',
                        largeImageURL: 'https://pixabay.com/large.jpg',
                    },
                ],
            };

            mockFetch.mockResolvedValueOnce({
                status: 200,
                json: () => Promise.resolve(mockResponse),
            });

            const result = await client.assets.searchStockImages({ query: 'nature' });

            expect(result.data).toHaveLength(1);
            expect(result.data[0].tags).toContain('nature');
        });

        it('should search with pagination', async () => {
            const mockResponse = { data: [] };

            mockFetch.mockResolvedValueOnce({
                status: 200,
                json: () => Promise.resolve(mockResponse),
            });

            await client.assets.searchStockImages({
                query: 'business',
                page: 2,
                perPage: 50,
            });

            const url = mockFetch.mock.calls[0][0] as string;
            expect(url).toContain('page=2');
            expect(url).toContain('perPage=50');
        });
    });

    describe('searchIcons', () => {
        it('should search for icons', async () => {
            const mockResponse = {
                data: [
                    { id: 'icon-1', name: 'Home Icon', url: 'https://example.com/home.svg' },
                ],
            };

            mockFetch.mockResolvedValueOnce({
                status: 200,
                json: () => Promise.resolve(mockResponse),
            });

            const result = await client.assets.searchIcons({ query: 'home' });

            expect(result.data).toHaveLength(1);
        });
    });

    describe('searchClipart', () => {
        it('should search for clipart', async () => {
            const mockResponse = {
                data: [{ id: 'clip-1', name: 'Star Clipart' }],
            };

            mockFetch.mockResolvedValueOnce({
                status: 200,
                json: () => Promise.resolve(mockResponse),
            });

            const result = await client.assets.searchClipart({ query: 'star' });

            expect(result.data).toHaveLength(1);
        });

        it('should search clipart with tag filter', async () => {
            const mockResponse = { data: [] };

            mockFetch.mockResolvedValueOnce({
                status: 200,
                json: () => Promise.resolve(mockResponse),
            });

            await client.assets.searchClipart({ query: 'holiday', tag: 'christmas' });

            const url = mockFetch.mock.calls[0][0] as string;
            expect(url).toContain('tag=christmas');
        });
    });

    describe('searchIllustrations', () => {
        it('should search for illustrations', async () => {
            const mockResponse = {
                data: [{ id: 'illust-1', name: 'Business Illustration' }],
            };

            mockFetch.mockResolvedValueOnce({
                status: 200,
                json: () => Promise.resolve(mockResponse),
            });

            const result = await client.assets.searchIllustrations({ query: 'business' });

            expect(result.data).toHaveLength(1);
        });
    });

    describe('listFonts', () => {
        it('should list available fonts', async () => {
            const mockResponse = {
                data: [
                    { family: 'Roboto', variants: ['regular', 'bold'] },
                    { family: 'Open Sans', variants: ['regular', 'italic'] },
                ],
            };

            mockFetch.mockResolvedValueOnce({
                status: 200,
                json: () => Promise.resolve(mockResponse),
            });

            const result = await client.assets.listFonts();

            expect(result.data).toHaveLength(2);
        });

        it('should filter fonts by category', async () => {
            const mockResponse = { data: [] };

            mockFetch.mockResolvedValueOnce({
                status: 200,
                json: () => Promise.resolve(mockResponse),
            });

            await client.assets.listFonts('serif');

            const url = mockFetch.mock.calls[0][0] as string;
            expect(url).toContain('category=serif');
        });
    });
});
