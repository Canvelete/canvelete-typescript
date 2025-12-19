import type { CanveleteClient } from '../client';
import type { APIKey, PaginatedResponse } from '../types';

export interface ListAPIKeysOptions {
    page?: number;
    limit?: number;
}

export interface CreateAPIKeyData {
    name: string;
    scopes?: string[];
    expiresAt?: string;
}

export interface CreateAPIKeyResponse {
    data: APIKey & { key: string }; // key is only shown on creation
}

export class APIKeysResource {
    private client: CanveleteClient;

    constructor(client: CanveleteClient) {
        this.client = client;
    }

    async list(options: ListAPIKeysOptions = {}): Promise<PaginatedResponse<APIKey>> {
        const params: Record<string, string> = {
            page: String(options.page || 1),
            limit: String(options.limit || 20),
        };

        return await this.client.request<PaginatedResponse<APIKey>>('GET', '/api/automation/api-keys', { params });
    }

    async create(data: CreateAPIKeyData): Promise<CreateAPIKeyResponse> {
        return await this.client.request<CreateAPIKeyResponse>('POST', '/api/automation/api-keys', { json: data });
    }
}
