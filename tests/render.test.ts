/**
 * Tests for RenderResource
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CanveleteClient } from '../src/client';
import { ValidationError } from '../src/errors';

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('RenderResource', () => {
    let client: CanveleteClient;

    beforeEach(() => {
        vi.clearAllMocks();
        client = new CanveleteClient({ apiKey: 'test-api-key' });
    });

    describe('create', () => {
        it('should render a design synchronously', async () => {
            const mockImageData = new ArrayBuffer(1024);

            mockFetch.mockResolvedValueOnce({
                status: 200,
                arrayBuffer: () => Promise.resolve(mockImageData),
            });

            const result = await client.render.create({
                designId: 'design-123',
                format: 'png',
            });

            expect(result.byteLength).toBe(1024);
        });

        it('should render a template with dynamic data', async () => {
            const mockImageData = new ArrayBuffer(2048);

            mockFetch.mockResolvedValueOnce({
                status: 200,
                arrayBuffer: () => Promise.resolve(mockImageData),
            });

            await client.render.create({
                templateId: 'template-123',
                dynamicData: { name: 'John Doe', title: 'CEO' },
                format: 'png',
            });

            const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body);
            expect(requestBody.templateId).toBe('template-123');
            expect(requestBody.dynamicData.name).toBe('John Doe');
        });

        it('should throw error when neither designId nor templateId provided', async () => {
            await expect(
                client.render.create({ format: 'png' })
            ).rejects.toThrow(ValidationError);
        });

        it('should render with custom dimensions', async () => {
            const mockImageData = new ArrayBuffer(512);

            mockFetch.mockResolvedValueOnce({
                status: 200,
                arrayBuffer: () => Promise.resolve(mockImageData),
            });

            await client.render.create({
                designId: 'design-123',
                width: 800,
                height: 600,
                quality: 95,
            });

            const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body);
            expect(requestBody.width).toBe(800);
            expect(requestBody.height).toBe(600);
            expect(requestBody.quality).toBe(95);
        });
    });

    describe('createAsync', () => {
        it('should create an async render job', async () => {
            const mockResponse = {
                jobId: 'job-123',
                status: 'pending',
                estimatedTime: 30,
            };

            mockFetch.mockResolvedValueOnce({
                status: 200,
                json: () => Promise.resolve(mockResponse),
            });

            const result = await client.render.createAsync({
                designId: 'design-123',
                format: 'pdf',
            });

            expect(result.jobId).toBe('job-123');
            expect(result.status).toBe('pending');
        });
    });

    describe('getStatus', () => {
        it('should get render job status', async () => {
            const mockResponse = {
                id: 'job-123',
                designId: 'design-123',
                format: 'png',
                status: 'processing',
                createdAt: '2024-01-15T10:00:00Z',
            };

            mockFetch.mockResolvedValueOnce({
                status: 200,
                json: () => Promise.resolve(mockResponse),
            });

            const result = await client.render.getStatus('job-123');

            expect(result.status).toBe('processing');
        });
    });

    describe('waitForCompletion', () => {
        it('should wait for render job to complete', async () => {
            // First call: processing
            mockFetch.mockResolvedValueOnce({
                status: 200,
                json: () => Promise.resolve({
                    id: 'job-123',
                    status: 'processing',
                }),
            });

            // Second call: completed
            mockFetch.mockResolvedValueOnce({
                status: 200,
                json: () => Promise.resolve({
                    id: 'job-123',
                    status: 'completed',
                    outputUrl: 'https://example.com/output.png',
                }),
            });

            const result = await client.render.waitForCompletion('job-123', {
                pollInterval: 10,
            });

            expect(result.status).toBe('completed');
            expect(result.outputUrl).toBe('https://example.com/output.png');
        });

        it('should throw error on failed render', async () => {
            mockFetch.mockResolvedValueOnce({
                status: 200,
                json: () => Promise.resolve({
                    id: 'job-123',
                    status: 'failed',
                    error: 'Render failed due to invalid element',
                }),
            });

            await expect(
                client.render.waitForCompletion('job-123', { pollInterval: 10 })
            ).rejects.toThrow('Render job failed');
        });
    });

    describe('getHistory', () => {
        it('should get render history', async () => {
            const mockResponse = {
                data: [
                    { id: 'render-1', designId: 'design-1', status: 'completed' },
                    { id: 'render-2', designId: 'design-2', status: 'completed' },
                ],
                pagination: { page: 1, limit: 20, total: 2, totalPages: 1 },
            };

            mockFetch.mockResolvedValueOnce({
                status: 200,
                json: () => Promise.resolve(mockResponse),
            });

            const result = await client.render.getHistory();

            expect(result.data).toHaveLength(2);
        });
    });

    describe('batchCreate', () => {
        it('should create batch render jobs', async () => {
            const mockResponse = {
                batchId: 'batch-123',
                jobs: [
                    { jobId: 'job-1', status: 'pending' },
                    { jobId: 'job-2', status: 'pending' },
                ],
                totalJobs: 2,
            };

            mockFetch.mockResolvedValueOnce({
                status: 200,
                json: () => Promise.resolve(mockResponse),
            });

            const result = await client.render.batchCreate({
                renders: [
                    { designId: 'design-1', format: 'png' },
                    { designId: 'design-2', format: 'jpg' },
                ],
            });

            expect(result.batchId).toBe('batch-123');
            expect(result.totalJobs).toBe(2);
        });

        it('should throw error for empty batch', async () => {
            await expect(
                client.render.batchCreate({ renders: [] })
            ).rejects.toThrow(ValidationError);
        });
    });

    describe('waitForBatch', () => {
        it('should wait for batch to complete', async () => {
            // First call: not completed
            mockFetch.mockResolvedValueOnce({
                status: 200,
                json: () => Promise.resolve({
                    jobs: [
                        { id: 'job-1', status: 'processing' },
                        { id: 'job-2', status: 'completed' },
                    ],
                    completed: false,
                }),
            });

            // Second call: completed
            mockFetch.mockResolvedValueOnce({
                status: 200,
                json: () => Promise.resolve({
                    jobs: [
                        { id: 'job-1', status: 'completed' },
                        { id: 'job-2', status: 'completed' },
                    ],
                    completed: true,
                }),
            });

            const result = await client.render.waitForBatch('batch-123', {
                pollInterval: 10,
            });

            expect(result).toHaveLength(2);
            expect(result.every(j => j.status === 'completed')).toBe(true);
        });
    });

    describe('list', () => {
        it('should list render history (legacy)', async () => {
            const mockResponse = {
                data: [{ id: 'render-1', status: 'completed' }],
                pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
            };

            mockFetch.mockResolvedValueOnce({
                status: 200,
                json: () => Promise.resolve(mockResponse),
            });

            const result = await client.render.list();

            expect(result.data).toHaveLength(1);
        });
    });
});
