import type { CanveleteClient } from '../client';

export interface CanvasElement {
    type: string;
    x: number;
    y: number;
    width?: number;
    height?: number;
    [key: string]: any;
}

export class CanvasResource {
    private client: CanveleteClient;

    constructor(client: CanveleteClient) {
        this.client = client;
    }

    async addElement(designId: string, element: CanvasElement): Promise<{ data: CanvasElement }> {
        return await this.client.request<{ data: CanvasElement }>(
            'POST',
            `/api/designs/${designId}/elements`,
            { json: { element } }
        );
    }

    async updateElement(
        designId: string,
        elementId: string,
        updates: Partial<CanvasElement>
    ): Promise<{ data: CanvasElement }> {
        return await this.client.request<{ data: CanvasElement }>(
            'PATCH',
            `/api/designs/${designId}/elements/${elementId}`,
            { json: updates }
        );
    }

    async deleteElement(designId: string, elementId: string): Promise<{ success: boolean }> {
        return await this.client.request<{ success: boolean }>(
            'DELETE',
            `/api/designs/${designId}/elements/${elementId}`
        );
    }

    async getElements(designId: string): Promise<{ data: { elements: CanvasElement[] } }> {
        return await this.client.request<{ data: { elements: CanvasElement[] } }>(
            'GET',
            `/api/designs/${designId}/canvas`
        );
    }

    async resize(designId: string, width: number, height: number): Promise<{ data: any }> {
        return await this.client.request<{ data: any }>(
            'PATCH',
            `/api/designs/${designId}/canvas/resize`,
            { json: { width, height } }
        );
    }

    async clear(designId: string): Promise<{ success: boolean }> {
        return await this.client.request<{ success: boolean }>(
            'DELETE',
            `/api/designs/${designId}/canvas/elements`
        );
    }

    async updateBackground(designId: string, background: string): Promise<{ data: any }> {
        return await this.client.request<{ data: any }>(
            'PATCH',
            `/api/designs/${designId}/canvas/background`,
            { json: { background } }
        );
    }
}
