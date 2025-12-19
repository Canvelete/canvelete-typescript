/**
 * Element validation utilities
 */

import { ValidationError } from '../errors';

export interface ElementBase {
    type: string;
    x: number;
    y: number;
    width?: number;
    height?: number;
}

export interface RectangleElement extends ElementBase {
    type: 'rectangle';
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    borderRadius?: number;
    opacity?: number;
}

export interface CircleElement extends ElementBase {
    type: 'circle';
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    opacity?: number;
}

export interface TextElement extends ElementBase {
    type: 'text';
    text: string;
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string;
    fontStyle?: string;
    fill?: string;
    textAlign?: 'left' | 'center' | 'right' | 'justify';
    lineHeight?: number;
}

export interface ImageElement extends ElementBase {
    type: 'image';
    src: string;
    objectFit?: 'fill' | 'contain' | 'cover' | 'none' | 'scale-down';
    opacity?: number;
}

export interface LineElement extends ElementBase {
    type: 'line';
    linePoints?: Array<{ x: number; y: number }>;
    stroke?: string;
    strokeWidth?: number;
    lineCap?: 'butt' | 'round' | 'square';
}

export type CanvasElement =
    | RectangleElement
    | CircleElement
    | TextElement
    | ImageElement
    | LineElement
    | ElementBase;

const VALID_ELEMENT_TYPES = [
    'rectangle',
    'circle',
    'text',
    'image',
    'line',
    'polygon',
    'star',
    'svg',
    'bezier',
    'container',
    'table',
    'qr',
    'barcode',
];

/**
 * Validate an element's basic properties
 */
export function validateElement(element: Record<string, any>): void {
    const errors: string[] = [];

    // Required fields
    if (!element.type) {
        errors.push('Element type is required');
    } else if (!VALID_ELEMENT_TYPES.includes(element.type)) {
        errors.push(`Invalid element type: ${element.type}. Valid types: ${VALID_ELEMENT_TYPES.join(', ')}`);
    }

    if (typeof element.x !== 'number') {
        errors.push('Element x position must be a number');
    }

    if (typeof element.y !== 'number') {
        errors.push('Element y position must be a number');
    }

    // Type-specific validation
    if (element.type === 'text' && !element.text) {
        errors.push('Text element requires text content');
    }

    if (element.type === 'image' && !element.src) {
        errors.push('Image element requires src URL');
    }

    // Numeric range validation
    if (element.opacity !== undefined && (element.opacity < 0 || element.opacity > 1)) {
        errors.push('Opacity must be between 0 and 1');
    }

    if (element.fontSize !== undefined && element.fontSize <= 0) {
        errors.push('Font size must be positive');
    }

    if (element.strokeWidth !== undefined && element.strokeWidth < 0) {
        errors.push('Stroke width cannot be negative');
    }

    if (element.borderRadius !== undefined && element.borderRadius < 0) {
        errors.push('Border radius cannot be negative');
    }

    if (errors.length > 0) {
        throw new ValidationError(`Element validation failed: ${errors.join('; ')}`);
    }
}

/**
 * Validate canvas dimensions
 */
export function validateCanvasDimensions(width: number, height: number): void {
    const errors: string[] = [];

    if (typeof width !== 'number' || width <= 0) {
        errors.push('Width must be a positive number');
    }

    if (typeof height !== 'number' || height <= 0) {
        errors.push('Height must be a positive number');
    }

    if (width > 10000) {
        errors.push('Width cannot exceed 10000 pixels');
    }

    if (height > 10000) {
        errors.push('Height cannot exceed 10000 pixels');
    }

    if (errors.length > 0) {
        throw new ValidationError(`Canvas validation failed: ${errors.join('; ')}`);
    }
}

/**
 * Validate render options
 */
export function validateRenderOptions(options: Record<string, any>): void {
    const errors: string[] = [];

    if (!options.designId && !options.templateId) {
        errors.push('Either designId or templateId is required');
    }

    if (options.format && !['png', 'jpg', 'jpeg', 'pdf', 'svg'].includes(options.format)) {
        errors.push('Invalid format. Valid formats: png, jpg, jpeg, pdf, svg');
    }

    if (options.quality !== undefined && (options.quality < 1 || options.quality > 100)) {
        errors.push('Quality must be between 1 and 100');
    }

    if (errors.length > 0) {
        throw new ValidationError(`Render options validation failed: ${errors.join('; ')}`);
    }
}

/**
 * Validate color format
 */
export function validateColor(color: string): boolean {
    // Hex color
    if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(color)) {
        return true;
    }

    // RGB/RGBA
    if (/^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+(,\s*[\d.]+)?\s*\)$/.test(color)) {
        return true;
    }

    // HSL/HSLA
    if (/^hsla?\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%(,\s*[\d.]+)?\s*\)$/.test(color)) {
        return true;
    }

    // Named colors (basic check)
    const namedColors = [
        'transparent', 'black', 'white', 'red', 'green', 'blue',
        'yellow', 'orange', 'purple', 'pink', 'gray', 'grey',
    ];
    if (namedColors.includes(color.toLowerCase())) {
        return true;
    }

    return false;
}
