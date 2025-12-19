/**
 * Templates resource for managing design templates
 */

import type { CanveleteClient } from '../client';
import type { Template, PaginatedResponse, Design } from '../types';

export interface ListTemplatesOptions {
    page?: number;
    limit?: number;
    myOnly?: boolean;
    search?: string;
    category?: string;
}

export interface ApplyTemplateOptions {
    designId: string;
    templateId: string;
    dynamicData?: Record<string, any>;
}

export interface CreateTemplateOptions {
    designId: string;
    name: string;
    description?: string;
    category?: string;
}

export class TemplatesResource {
    private client: CanveleteClient;

    constructor(client: CanveleteClient) {
        this.client = client;
    }

    /**
     * List available templates
     */
    async list(options: ListTemplatesOptions = {}): Promise<PaginatedResponse<Template>> {
        const params: Record<string, string> = {
            page: String(options.page || 1),
            limit: String(options.limit || 20),
        };

        if (options.myOnly) params.myOnly = 'true';
        if (options.search) params.search = options.search;
        if (options.category) params.category = options.category;

        return await this.client.request<PaginatedResponse<Template>>('GET', '/api/automation/templates', { params });
    }

    /**
     * Iterate through all templates with automatic pagination
     */
    async *iterateAll(options: ListTemplatesOptions = {}): AsyncGenerator<Template> {
        let page = 1;
        const limit = options.limit || 50;

        while (true) {
            const response = await this.list({ ...options, page, limit });
            const templates = response.data || [];

            if (templates.length === 0) break;

            for (const template of templates) {
                yield template;
            }

            if (page >= (response.pagination?.totalPages || 1)) break;
            page++;
        }
    }

    /**
     * Get a specific template by ID
     */
    async get(id: string): Promise<{ data: Template }> {
        return await this.client.request<{ data: Template }>('GET', `/api/automation/designs/${id}`);
    }

    /**
     * Apply a template to a design
     */
    async apply(options: ApplyTemplateOptions): Promise<{ data: Design }> {
        const payload: Record<string, any> = {
            templateId: options.templateId,
        };

        if (options.dynamicData) {
            payload.dynamicData = options.dynamicData;
        }

        return await this.client.request<{ data: Design }>(
            'POST',
            `/api/automation/designs/${options.designId}/apply-template`,
            { json: payload }
        );
    }

    /**
     * Create a template from an existing design
     */
    async create(options: CreateTemplateOptions): Promise<{ data: Template }> {
        const payload: Record<string, any> = {
            name: options.name,
        };

        if (options.description) {
            payload.description = options.description;
        }
        if (options.category) {
            payload.category = options.category;
        }

        return await this.client.request<{ data: Template }>(
            'POST',
            `/api/automation/designs/${options.designId}/save-as-template`,
            { json: payload }
        );
    }
}
