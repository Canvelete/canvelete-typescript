/**
 * Usage tracking resource for monitoring API usage and credits
 */

import type { CanveleteClient } from '../client';
import type { PaginatedResponse } from '../types';

export interface UsageStats {
    creditsUsed: number;
    creditLimit: number;
    creditsRemaining: number;
    apiCalls: number;
    apiCallLimit: number;
    renders: number;
    storageUsed: number;
}

export interface UsageEvent {
    type: string;
    creditsUsed: number;
    timestamp: string;
    details?: Record<string, any>;
}

export interface ApiStats {
    endpoints: Record<string, number>;
    totalCalls: number;
    period: string;
}

export interface Activity {
    action: string;
    timestamp: string;
    details?: Record<string, any>;
}

export interface Analytics {
    totalRenders: number;
    averagePerDay: number;
    peakDay: string;
    trend: 'increasing' | 'decreasing' | 'stable';
    breakdown?: Record<string, number>;
}

export interface UsageHistoryOptions {
    page?: number;
    limit?: number;
    startDate?: Date;
    endDate?: Date;
}

export class UsageResource {
    private client: CanveleteClient;

    constructor(client: CanveleteClient) {
        this.client = client;
    }

    /**
     * Get current usage statistics
     */
    async getStats(): Promise<{ data: UsageStats }> {
        return await this.client.request<{ data: UsageStats }>(
            'GET',
            '/api/v1/usage/stats'
        );
    }

    /**
     * Get usage history
     */
    async getHistory(options: UsageHistoryOptions = {}): Promise<PaginatedResponse<UsageEvent>> {
        const params: Record<string, string> = {
            page: String(options.page || 1),
            limit: String(options.limit || 20),
        };

        if (options.startDate) {
            params.startDate = options.startDate.toISOString();
        }
        if (options.endDate) {
            params.endDate = options.endDate.toISOString();
        }

        return await this.client.request<PaginatedResponse<UsageEvent>>(
            'GET',
            '/api/v1/usage/history',
            { params }
        );
    }

    /**
     * Get API usage statistics by endpoint
     */
    async getApiStats(): Promise<{ data: ApiStats }> {
        return await this.client.request<{ data: ApiStats }>(
            'GET',
            '/api/v1/usage/api-stats'
        );
    }

    /**
     * Get recent activities
     */
    async getActivities(options: { page?: number; limit?: number } = {}): Promise<PaginatedResponse<Activity>> {
        const params: Record<string, string> = {
            page: String(options.page || 1),
            limit: String(options.limit || 20),
        };

        return await this.client.request<PaginatedResponse<Activity>>(
            'GET',
            '/api/usage/activities',
            { params }
        );
    }

    /**
     * Get usage analytics
     */
    async getAnalytics(period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<{ data: Analytics }> {
        return await this.client.request<{ data: Analytics }>(
            'GET',
            '/api/usage/analytics',
            { params: { period } }
        );
    }
}
