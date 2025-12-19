import type { CanveleteClient } from '../client';
import type { Design, PaginatedResponse } from '../types';

export interface ListDesignsOptions {
    page?: number;
    limit?: number;
    isTemplate?: boolean;
    status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}

export interface CreateDesignData {
    name: string;
    description?: string;
    canvasData: Record<string, any>;
    width?: number;
    height?: number;
    isTemplate?: boolean;
    visibility?: 'PRIVATE' | 'PUBLIC' | 'TEAM';
}

export interface UpdateDesignData {
    name?: string;
    description?: string;
    canvasData?: Record<string, any>;
    width?: number;
    height?: number;
    status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    visibility?: 'PRIVATE' | 'PUBLIC' | 'TEAM';
}

export class DesignsResource {
    private client: CanveleteClient;

    constructor(client: CanveleteClient) {
        this.client = client;
    }

    async list(options: ListDesignsOptions = {}): Promise<PaginatedResponse<Design>> {
        const params: Record<string, string> = {
            page: String(options.page || 1),
            limit: String(options.limit || 20),
        };

        if (options.isTemplate !== undefined) {
            params.isTemplate = options.isTemplate ? 'true' : 'false';
        }
        if (options.status) {
            params.status = options.status;
        }

        return await this.client.request<PaginatedResponse<Design>>('GET', '/api/automation/designs', { params });
    }

    async *iterateAll(options: ListDesignsOptions = {}): AsyncGenerator<Design> {
        let page = 1;
        const limit = options.limit || 50;

        while (true) {
            const response = await this.list({ ...options, page, limit });
            const designs = response.data || [];

            if (designs.length === 0) break;

            for (const design of designs) {
                yield design;
            }

            if (page >= (response.pagination?.totalPages || 1)) break;
            page++;
        }
    }

    async create(data: CreateDesignData): Promise<{ data: Design }> {
        return await this.client.request<{ data: Design }>('POST', '/api/automation/designs', { json: data });
    }

    async get(id: string): Promise<{ data: Design }> {
        return await this.client.request<{ data: Design }>('GET', `/api/automation/designs/${id}`);
    }

    async update(id: string, data: UpdateDesignData): Promise<{ data: Design }> {
        return await this.client.request<{ data: Design }>('PATCH', `/api/automation/designs/${id}`, { json: data });
    }

    async delete(id: string): Promise<void> {
        await this.client.request('DELETE', `/api/automation/designs/${id}`);
    }
}
