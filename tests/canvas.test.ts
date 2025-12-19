/**
 * Tests for CanvasResource
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CanveleteClient } from '../src/client';

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('CanvasResource', () => {
    let client: CanveleteClient;

    beforeEach(() => {
        vi.clearAllMocks();
        client = new CanveleteClient({ apiKey: 'test-api-key' });
    });

    describe('addElement', () => {
        it('should add a rectangle element', async () => {
            const mockResponse = {
                data: {
                    id: 'element-1',
                    type: 'rectangle',
                    x: 100,
                    y: 100,
                    width: 200,
                    height: 150,
                },
            };

            mockFetch.mockResolvedValueOnce({
                status: 200,
                json: () => Promise.resolve(mockResponse),
            });

            const result = await client.canvas.addElement('design-123', {
                type: 'rectangle',
                x: 100,
                y: 100,
                width: 200,
                height: 150,
            });

            expect(mockFetch).toHaveBeenCalledTimes(1);
            expect(result.data.type).toBe('rectangle');
        });

        it('should add a text element', async () => {
            const mockResponse = {
                data: {
                    id: 'element-2',
                    type: 'text',
                    x: 50,
                    y: 50,
                    text: 'Hello World',
                },
            };

            mockFetch.mockResolvedValueOnce({
                status: 200,
                json: () => Promise.resolve(mockResponse),
            });

            const result = await client.canvas.addElement('design-123', {
                type: 'text',
                x: 50,
                y: 50,
                text: 'Hello World',
                fontSize: 24,
                fontFamily: 'Arial',
            });

            expect(result.data.type).toBe('text');
        });

        it('should add an image element', async () => {
            const mockResponse = {
                data: {
                    id: 'element-3',
                    type: 'image',
                    x: 0,
                    y: 0,
                    src: 'https://example.com/image.png',
                },
            };

            mockFetch.mockResolvedValueOnce({
                status: 200,
                json: () => Promise.resolve(mockResponse),
            });

            const result = await client.canvas.addElement('design-123', {
                type: 'image',
                x: 0,
                y: 0,
                width: 400,
                height: 300,
                src: 'https://example.com/image.png',
            });

            expect(result.data.type).toBe('image');
        });
    });

    describe('updateElement', () => {
        it('should update element position', async () => {
            const mockResponse = {
                data: {
                    id: 'element-1',
                    type: 'rectangle',
                    x: 200,
                    y: 200,
                },
            };

            mockFetch.mockResolvedValueOnce({
                status: 200,
                json: () => Promise.resolve(mockResponse),
            });

            const result = await client.canvas.updateElement('design-123', 'element-1', {
                x: 200,
                y: 200,
            });

            expect(result.data.x).toBe(200);
            expect(result.data.y).toBe(200);
        });

        it('should update element style', async () => {
            const mockResponse = {
                data: {
                    id: 'element-1',
                    fill: '#ff0000',
                    opacity: 0.8,
                },
            };

            mockFetch.mockResolvedValueOnce({
                status: 200,
                json: () => Promise.resolve(mockResponse),
            });

            const result = await client.canvas.updateElement('design-123', 'element-1', {
                fill: '#ff0000',
                opacity: 0.8,
            });

            expect(result.data.fill).toBe('#ff0000');
        });
    });

    describe('deleteElement', () => {
        it('should delete an element', async () => {
            mockFetch.mockResolvedValueOnce({
                status: 200,
                json: () => Promise.resolve({ success: true }),
            });

            const result = await client.canvas.deleteElement('design-123', 'element-1');

            expect(result.success).toBe(true);
        });
    });

    describe('getElements', () => {
        it('should get all elements from a design', async () => {
            const mockResponse = {
                data: {
                    elements: [
                        { id: 'el-1', type: 'rectangle', x: 0, y: 0 },
                        { id: 'el-2', type: 'text', x: 100, y: 100 },
                    ],
                },
            };

            mockFetch.mockResolvedValueOnce({
                status: 200,
                json: () => Promise.resolve(mockResponse),
            });

            const result = await client.canvas.getElements('design-123');

            expect(result.data.elements).toHaveLength(2);
        });
    });

    describe('resize', () => {
        it('should resize the canvas', async () => {
            const mockResponse = {
                data: { width: 1920, height: 1080 },
            };

            mockFetch.mockResolvedValueOnce({
                status: 200,
                json: () => Promise.resolve(mockResponse),
            });

            const result = await client.canvas.resize('design-123', 1920, 1080);

            expect(result.data.width).toBe(1920);
            expect(result.data.height).toBe(1080);
        });
    });

    describe('clear', () => {
        it('should clear all elements from canvas', async () => {
            mockFetch.mockResolvedValueOnce({
                status: 200,
                json: () => Promise.resolve({ success: true }),
            });

            const result = await client.canvas.clear('design-123');

            expect(result.success).toBe(true);
        });
    });

    describe('updateBackground', () => {
        it('should update canvas background color', async () => {
            const mockResponse = {
                data: { background: '#ffffff' },
            };

            mockFetch.mockResolvedValueOnce({
                status: 200,
                json: () => Promise.resolve(mockResponse),
            });

            const result = await client.canvas.updateBackground('design-123', '#ffffff');

            expect(result.data.background).toBe('#ffffff');
        });

        it('should update canvas background with gradient', async () => {
            const mockResponse = {
                data: { background: 'linear-gradient(45deg, #ff0000, #0000ff)' },
            };

            mockFetch.mockResolvedValueOnce({
                status: 200,
                json: () => Promise.resolve(mockResponse),
            });

            const result = await client.canvas.updateBackground(
                'design-123',
                'linear-gradient(45deg, #ff0000, #0000ff)'
            );

            expect(result.data.background).toContain('linear-gradient');
        });
    });
});
