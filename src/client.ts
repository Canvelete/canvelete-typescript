/**
 * Main Canvelete API Client
 */

import { DesignsResource } from './resources/designs';
import { TemplatesResource } from './resources/templates';
import { RenderResource } from './resources/render';
import { APIKeysResource } from './resources/apiKeys';
import { CanvasResource } from './resources/canvas';
import { AssetsResource } from './resources/assets';
import { UsageResource } from './resources/usage';
import { BillingResource } from './resources/billing';
import {
    CanveleteError,
    AuthenticationError,
    ValidationError,
    NotFoundError,
    RateLimitError,
    ServerError,
    InsufficientScopeError,
} from './errors';
import type { ClientOptions } from './types';

export interface RequestOptions {
    params?: Record<string, string>;
    json?: Record<string, any>;
    binary?: boolean;
}

export class CanveleteClient {
    private apiKey: string;
    private baseUrl: string;
    private timeout: number;

    // Core resources
    public designs: DesignsResource;
    public templates: TemplatesResource;
    public render: RenderResource;
    public apiKeys: APIKeysResource;
    
    // New resources
    public canvas: CanvasResource;
    public assets: AssetsResource;
    public usage: UsageResource;
    public billing: BillingResource;

    /**
     * Initialize the Canvelete client
     */
    constructor(options: ClientOptions = {}) {
        this.apiKey = options.apiKey || '';
        this.baseUrl = (options.baseUrl || 'https://www.canvelete.com').replace(/\/$/, '');
        this.timeout = options.timeout || 30000;

        // Initialize resource handlers
        this.designs = new DesignsResource(this);
        this.templates = new TemplatesResource(this);
        this.render = new RenderResource(this);
        this.apiKeys = new APIKeysResource(this);
        
        // Initialize new resources
        this.canvas = new CanvasResource(this);
        this.assets = new AssetsResource(this);
        this.usage = new UsageResource(this);
        this.billing = new BillingResource(this);
    }

    /**
     * Get authentication headers
     */
    private getAuthHeaders(): Record<string, string> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'User-Agent': 'canvelete-ts/2.0.0',
        };

        if (this.apiKey) {
            headers['Authorization'] = `Bearer ${this.apiKey}`;
        } else {
            throw new AuthenticationError('No API key provided');
        }

        return headers;
    }

    /**
     * Make an authenticated API request
     */
    async request<T>(method: string, endpoint: string, options: RequestOptions = {}): Promise<T> {
        let url = `${this.baseUrl}${endpoint}`;
        const headers = this.getAuthHeaders();

        // Add query parameters
        if (options.params) {
            const searchParams = new URLSearchParams(options.params);
            url = `${url}?${searchParams}`;
        }

        // Build request options
        const requestOptions: RequestInit = {
            method,
            headers,
        };

        // Add JSON body
        if (options.json) {
            requestOptions.body = JSON.stringify(options.json);
        }

        // Add timeout via AbortController
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        requestOptions.signal = controller.signal;

        try {
            const response = await fetch(url, requestOptions);
            clearTimeout(timeoutId);

            await this.handleResponseErrors(response);

            // Return binary data for render endpoints
            if (options.binary) {
                return await response.arrayBuffer() as T;
            }

            // Parse JSON response
            return await response.json() as T;

        } catch (error) {
            clearTimeout(timeoutId);

            if (error instanceof Error && error.name === 'AbortError') {
                throw new CanveleteError(`Request timeout after ${this.timeout}ms`);
            }

            if (error instanceof CanveleteError) {
                throw error;
            }

            throw new CanveleteError(`Request failed: ${(error as Error).message}`);
        }
    }

    /**
     * Handle HTTP error responses
     */
    private async handleResponseErrors(response: Response): Promise<void> {
        if (response.status < 400) {
            return;
        }

        let message = `HTTP ${response.status}`;
        try {
            const errorData = await response.json() as { error?: string; message?: string };
            message = errorData.error || errorData.message || message;
        } catch {
            // Ignore JSON parse errors
        }

        // Map status codes to exceptions
        switch (response.status) {
            case 401:
                throw new AuthenticationError(message, 401, response);
            case 403:
                if (message.toLowerCase().includes('scope')) {
                    throw new InsufficientScopeError(message, 403, response);
                }
                throw new AuthenticationError(message, 403, response);
            case 404:
                throw new NotFoundError(message, 404, response);
            case 422:
                throw new ValidationError(message, 422, response);
            case 429:
                const retryAfter = response.headers.get('Retry-After');
                throw new RateLimitError(
                    message,
                    retryAfter ? parseInt(retryAfter) : null,
                    429,
                    response
                );
            default:
                if (response.status >= 500) {
                    throw new ServerError(message, response.status, response);
                }
                throw new CanveleteError(message, response.status, response);
        }
    }
}
