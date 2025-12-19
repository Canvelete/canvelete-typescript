/**
 * Assets resource for managing user assets and searching stock content
 */

import type { CanveleteClient } from '../client';
import type { PaginatedResponse } from '../types';

export interface Asset {
    id: string;
    name: string;
    type: 'IMAGE' | 'FONT' | 'VIDEO' | 'AUDIO';
    url: string;
    format?: string;
    size?: number;
    width?: number;
    height?: number;
    createdAt: string;
    updatedAt: string;
}

export interface StockImage {
    id: string;
    tags: string;
    previewURL: string;
    webformatURL: string;
    largeImageURL: string;
    imageWidth: number;
    imageHeight: number;
}

export interface Icon {
    id: string;
    name: string;
    url: string;
    tags?: string[];
}

export interface Font {
    family: string;
    variants: string[];
    category?: string;
}

export interface ListAssetsOptions {
    page?: number;
    limit?: number;
    type?: 'IMAGE' | 'FONT' | 'VIDEO' | 'AUDIO';
}

export interface SearchOptions {
    query: string;
    page?: number;
    perPage?: number;
}

export class AssetsResource {
    private client: CanveleteClient;

    constructor(client: CanveleteClient) {
        this.client = client;
    }

    /**
     * List user's uploaded assets
     */
    async list(options: ListAssetsOptions = {}): Promise<PaginatedResponse<Asset>> {
        const params: Record<string, string> = {
            page: String(options.page || 1),
            limit: String(options.limit || 20),
        };

        if (options.type) {
            params.type = options.type;
        }

        return await this.client.request<PaginatedResponse<Asset>>(
            'GET',
            '/api/assets/library',
            { params }
        );
    }

    /**
     * Get a specific asset by ID
     */
    async get(assetId: string): Promise<{ data: Asset }> {
        return await this.client.request<{ data: Asset }>(
            'GET',
            `/api/assets/${assetId}`
        );
    }

    /**
     * Delete an asset
     */
    async delete(assetId: string): Promise<{ success: boolean }> {
        return await this.client.request<{ success: boolean }>(
            'DELETE',
            `/api/assets/${assetId}`
        );
    }

    /**
     * Search for stock images from Pixabay
     */
    async searchStockImages(options: SearchOptions): Promise<{ data: StockImage[] }> {
        const params: Record<string, string> = {
            query: options.query,
            page: String(options.page || 1),
            perPage: String(options.perPage || 20),
        };

        return await this.client.request<{ data: StockImage[] }>(
            'GET',
            '/api/assets/stock-images',
            { params }
        );
    }

    /**
     * Search for icons
     */
    async searchIcons(options: SearchOptions): Promise<{ data: Icon[] }> {
        const params: Record<string, string> = {
            query: options.query,
            page: String(options.page || 1),
            perPage: String(options.perPage || 20),
        };

        return await this.client.request<{ data: Icon[] }>(
            'GET',
            '/api/assets/icons',
            { params }
        );
    }

    /**
     * Search for clipart
     */
    async searchClipart(options: SearchOptions & { tag?: string }): Promise<{ data: any[] }> {
        const params: Record<string, string> = {
            query: options.query,
            page: String(options.page || 1),
            perPage: String(options.perPage || 20),
        };

        if (options.tag) {
            params.tag = options.tag;
        }

        return await this.client.request<{ data: any[] }>(
            'GET',
            '/api/assets/clipart',
            { params }
        );
    }

    /**
     * Search for illustrations
     */
    async searchIllustrations(options: SearchOptions & { category?: string }): Promise<{ data: any[] }> {
        const params: Record<string, string> = {
            query: options.query,
            page: String(options.page || 1),
            perPage: String(options.perPage || 20),
        };

        if (options.category) {
            params.category = options.category;
        }

        return await this.client.request<{ data: any[] }>(
            'GET',
            '/api/assets/illustrations',
            { params }
        );
    }

    /**
     * List available fonts
     */
    async listFonts(category?: string): Promise<{ data: Font[] }> {
        const params: Record<string, string> = {};
        
        if (category) {
            params.category = category;
        }

        return await this.client.request<{ data: Font[] }>(
            'GET',
            '/api/assets/fonts',
            { params }
        );
    }
}
