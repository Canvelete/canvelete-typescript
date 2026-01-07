/**
 * Render resource for creating and managing render jobs
 */

import type { CanveleteClient } from '../client';
import type { PaginatedResponse } from '../types';
import { ValidationError } from '../errors';

// Helper to check if we're in a Node.js environment
const isNode = typeof process !== 'undefined' && process.versions?.node;

// Dynamic import for fs (only available in Node.js)
const writeFile = async (path: string, data: Buffer): Promise<void> => {
    if (!isNode) {
        throw new Error('File writing is only available in Node.js environments');
    }
    const { writeFileSync } = await import('fs');
    writeFileSync(path, data);
};

export interface RenderOptions {
    designId?: string;
    templateId?: string;
    dynamicData?: Record<string, any>;
    dynamicElements?: Record<string, any>;
    format?: 'png' | 'jpg' | 'jpeg' | 'pdf' | 'svg';
    width?: number;
    height?: number;
    quality?: number;
    outputFile?: string;
}

export interface RenderRecord {
    id: string;
    designId: string;
    format: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    outputUrl?: string;
    fileSize: number;
    createdAt: string;
    completedAt?: string;
    error?: string;
}

export interface AsyncRenderResponse {
    jobId: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    estimatedTime?: number;
}

export interface BatchRenderOptions {
    renders: RenderOptions[];
    webhook?: string;
}

export interface BatchRenderResponse {
    batchId: string;
    jobs: AsyncRenderResponse[];
    totalJobs: number;
}

export interface ListRenderOptions {
    page?: number;
    limit?: number;
}

export class RenderResource {
    private client: CanveleteClient;

    constructor(client: CanveleteClient) {
        this.client = client;
    }

    /**
     * Create a synchronous render (waits for completion)
     * Uses the backend API directly at /api/v1/render
     */
    async create(options: RenderOptions): Promise<ArrayBuffer> {
        if (!options.designId && !options.templateId) {
            throw new ValidationError('Either designId or templateId is required');
        }

        const data: Record<string, any> = {
            format: options.format || 'png',
            quality: options.quality || 90,
        };

        if (options.designId) data.designId = options.designId;
        if (options.templateId) data.templateId = options.templateId;
        // Support both dynamicData and dynamicElements for flexibility
        if (options.dynamicData) data.dynamicData = options.dynamicData;
        if (options.dynamicElements) data.dynamicElements = options.dynamicElements;
        if (options.width) data.width = options.width;
        if (options.height) data.height = options.height;

        const imageData = await this.client.request<ArrayBuffer>('POST', '/api/v1/render', {
            json: data,
            binary: true,
        });

        if (options.outputFile) {
            await writeFile(options.outputFile, Buffer.from(imageData));
        }

        return imageData;
    }

    /**
     * Create an asynchronous render job (returns immediately)
     */
    async createAsync(options: RenderOptions): Promise<AsyncRenderResponse> {
        if (!options.designId && !options.templateId) {
            throw new ValidationError('Either designId or templateId is required');
        }

        const data: Record<string, any> = {
            format: options.format || 'png',
            quality: options.quality || 90,
            async: true,
        };

        if (options.designId) data.designId = options.designId;
        if (options.templateId) data.templateId = options.templateId;
        if (options.dynamicData) data.dynamicData = options.dynamicData;
        if (options.width) data.width = options.width;
        if (options.height) data.height = options.height;

        return await this.client.request<AsyncRenderResponse>('POST', '/api/v1/render/async', {
            json: data,
        });
    }

    /**
     * Get the status of a render job
     */
    async getStatus(jobId: string): Promise<RenderRecord> {
        return await this.client.request<RenderRecord>('GET', `/api/v1/render/status/${jobId}`);
    }

    /**
     * Wait for a render job to complete
     */
    async waitForCompletion(
        jobId: string,
        options: { timeout?: number; pollInterval?: number } = {}
    ): Promise<RenderRecord> {
        const timeout = options.timeout || 300000; // 5 minutes default
        const pollInterval = options.pollInterval || 2000; // 2 seconds default
        const startTime = Date.now();

        while (Date.now() - startTime < timeout) {
            const status = await this.getStatus(jobId);

            if (status.status === 'completed') {
                return status;
            }

            if (status.status === 'failed') {
                throw new Error(`Render job failed: ${status.error || 'Unknown error'}`);
            }

            await new Promise(resolve => setTimeout(resolve, pollInterval));
        }

        throw new Error(`Render job timed out after ${timeout}ms`);
    }

    /**
     * Get render history
     */
    async getHistory(options: ListRenderOptions = {}): Promise<PaginatedResponse<RenderRecord>> {
        const params: Record<string, string> = {
            page: String(options.page || 1),
            limit: String(options.limit || 20),
        };

        return await this.client.request<PaginatedResponse<RenderRecord>>('GET', '/api/v1/render/history', { params });
    }

    /**
     * Create a batch of render jobs
     */
    async batchCreate(options: BatchRenderOptions): Promise<BatchRenderResponse> {
        if (!options.renders || options.renders.length === 0) {
            throw new ValidationError('At least one render is required');
        }

        const payload: Record<string, any> = {
            renders: options.renders.map(r => ({
                designId: r.designId,
                templateId: r.templateId,
                dynamicData: r.dynamicData,
                format: r.format || 'png',
                quality: r.quality || 90,
                width: r.width,
                height: r.height,
            })),
        };

        if (options.webhook) {
            payload.webhook = options.webhook;
        }

        return await this.client.request<BatchRenderResponse>('POST', '/api/v1/render/batch', {
            json: payload,
        });
    }

    /**
     * Wait for all jobs in a batch to complete
     */
    async waitForBatch(
        batchId: string,
        options: { timeout?: number; pollInterval?: number } = {}
    ): Promise<RenderRecord[]> {
        const timeout = options.timeout || 600000; // 10 minutes default
        const pollInterval = options.pollInterval || 5000; // 5 seconds default
        const startTime = Date.now();

        while (Date.now() - startTime < timeout) {
            const response = await this.client.request<{ jobs: RenderRecord[]; completed: boolean }>(
                'GET',
                `/api/v1/render/batch/${batchId}/status`
            );

            if (response.completed) {
                return response.jobs;
            }

            await new Promise(resolve => setTimeout(resolve, pollInterval));
        }

        throw new Error(`Batch render timed out after ${timeout}ms`);
    }

    /**
     * List render history
     */
    async list(options: ListRenderOptions = {}): Promise<PaginatedResponse<RenderRecord>> {
        const params: Record<string, string> = {
            page: String(options.page || 1),
            limit: String(options.limit || 20),
        };

        return await this.client.request<PaginatedResponse<RenderRecord>>('GET', '/api/v1/render/history', { params });
    }

    /**
     * Iterate through all render records with automatic pagination
     */
    async *iterateAll(options: ListRenderOptions = {}): AsyncGenerator<RenderRecord> {
        let page = 1;
        const limit = options.limit || 50;

        while (true) {
            const response = await this.list({ page, limit });
            const renders = response.data || [];

            if (renders.length === 0) break;

            for (const render of renders) {
                yield render;
            }

            if (page >= (response.pagination?.totalPages || 1)) break;
            page++;
        }
    }
}
