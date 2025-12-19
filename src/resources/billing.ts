/**
 * Billing resource for managing subscriptions, credits, and invoices
 */

import type { CanveleteClient } from '../client';
import type { PaginatedResponse } from '../types';

export interface BillingInfo {
    plan: string;
    status: 'active' | 'cancelled' | 'past_due' | 'trialing';
    creditBalance: number;
    creditLimit: number;
    nextBillingDate: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
}

export interface Invoice {
    id: string;
    date: string;
    amount: number;
    currency: string;
    status: 'paid' | 'pending' | 'failed';
    description: string;
    pdfUrl?: string;
}

export interface BillingSummary {
    totalSpent: number;
    currentMonth: number;
    previousMonth: number;
    averageMonthly: number;
    currency: string;
}

export interface Seats {
    used: number;
    total: number;
    available: number;
}

export interface CreditPurchase {
    id: string;
    amount: number;
    credits: number;
    newBalance: number;
    status: string;
}

export class BillingResource {
    private client: CanveleteClient;

    constructor(client: CanveleteClient) {
        this.client = client;
    }

    /**
     * Get billing information and subscription details
     */
    async getInfo(): Promise<{ data: BillingInfo }> {
        return await this.client.request<{ data: BillingInfo }>(
            'GET',
            '/api/v1/billing/info'
        );
    }

    /**
     * Get invoice history
     */
    async getInvoices(options: { page?: number; limit?: number } = {}): Promise<PaginatedResponse<Invoice>> {
        const params: Record<string, string> = {
            page: String(options.page || 1),
            limit: String(options.limit || 20),
        };

        return await this.client.request<PaginatedResponse<Invoice>>(
            'GET',
            '/api/v1/billing/invoices',
            { params }
        );
    }

    /**
     * Get billing summary
     */
    async getSummary(): Promise<{ data: BillingSummary }> {
        return await this.client.request<{ data: BillingSummary }>(
            'GET',
            '/api/v1/billing/summary'
        );
    }

    /**
     * Purchase additional credits
     */
    async purchaseCredits(amount: number, paymentMethodId?: string): Promise<{ data: CreditPurchase }> {
        const payload: Record<string, any> = { creditAmount: amount };
        
        if (paymentMethodId) {
            payload.paymentMethodId = paymentMethodId;
        }

        return await this.client.request<{ data: CreditPurchase }>(
            'POST',
            '/api/v1/billing/credits/purchase',
            { json: payload }
        );
    }

    /**
     * Get team seats information
     */
    async getSeats(): Promise<{ data: Seats }> {
        return await this.client.request<{ data: Seats }>(
            'GET',
            '/api/v1/billing/seats'
        );
    }

    /**
     * Add team seats
     */
    async addSeats(count: number): Promise<{ data: Seats }> {
        return await this.client.request<{ data: Seats }>(
            'POST',
            '/api/v1/billing/seats/add',
            { json: { count } }
        );
    }

    /**
     * Remove team seats
     */
    async removeSeats(count: number): Promise<{ data: Seats }> {
        return await this.client.request<{ data: Seats }>(
            'DELETE',
            '/api/v1/billing/seats/remove',
            { json: { count } }
        );
    }

    /**
     * Get billing portal URL
     */
    async getPortalUrl(): Promise<{ url: string }> {
        return await this.client.request<{ url: string }>(
            'GET',
            '/api/billing/portal'
        );
    }
}
