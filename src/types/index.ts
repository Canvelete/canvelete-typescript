/**
 * Type definitions for Canvelete API
 */

// ============================================================================
// Canvas Element Types
// ============================================================================

export interface ElementBase {
    id?: string;
    type: string;
    x: number;
    y: number;
    width?: number;
    height?: number;
    rotation?: number;
    opacity?: number;
    visible?: boolean;
    locked?: boolean;
    name?: string;
    groupId?: string;
}

export interface RectangleElement extends ElementBase {
    type: 'rectangle';
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    borderRadius?: number;
    borderRadiusTopLeft?: number;
    borderRadiusTopRight?: number;
    borderRadiusBottomLeft?: number;
    borderRadiusBottomRight?: number;
    boxShadow?: string;
}

export interface CircleElement extends ElementBase {
    type: 'circle';
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
}

export interface TextElement extends ElementBase {
    type: 'text';
    text: string;
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string;
    fontStyle?: 'normal' | 'italic' | 'oblique';
    fill?: string;
    color?: string;
    textAlign?: 'left' | 'center' | 'right' | 'justify';
    textDecoration?: 'none' | 'underline' | 'line-through' | 'overline';
    textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
    lineHeight?: number;
    letterSpacing?: number;
    textStrokeColor?: string;
    textStrokeWidth?: number;
    textShadowColor?: string;
    textShadowX?: number;
    textShadowY?: number;
    textShadowBlur?: number;
    isDynamic?: boolean;
}

export interface ImageElement extends ElementBase {
    type: 'image';
    src: string;
    objectFit?: 'fill' | 'contain' | 'cover' | 'none' | 'scale-down';
    objectPosition?: string;
    brightness?: number;
    contrast?: number;
    saturate?: number;
    hueRotate?: number;
    blur?: number;
}

export interface LineElement extends ElementBase {
    type: 'line';
    linePoints?: Array<{ x: number; y: number }>;
    stroke?: string;
    strokeWidth?: number;
    lineCap?: 'butt' | 'round' | 'square';
    lineDash?: string;
}

export interface PolygonElement extends ElementBase {
    type: 'polygon';
    polygonPoints?: Array<{ x: number; y: number }>;
    polygonSides?: number;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    svgPath?: string;
    svgViewBox?: string;
}

export interface StarElement extends ElementBase {
    type: 'star';
    starPoints?: number;
    starInnerRadius?: number;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
}

export interface SvgElement extends ElementBase {
    type: 'svg';
    src?: string;
    svgPath?: string;
    svgViewBox?: string;
    fill?: string;
    stroke?: string;
}

export interface QrElement extends ElementBase {
    type: 'qr';
    qrValue: string;
    qrColor?: string;
    qrBgColor?: string;
    qrErrorLevel?: 'L' | 'M' | 'Q' | 'H';
    qrMargin?: number;
}

export interface BarcodeElement extends ElementBase {
    type: 'barcode';
    barcodeValue: string;
    barcodeFormat?: 'CODE128' | 'CODE39' | 'EAN13' | 'EAN8' | 'UPC' | 'UPCE' | 'ITF14' | 'MSI' | 'pharmacode' | 'codabar';
    barcodeLineColor?: string;
    barcodeBackground?: string;
    barcodeShowText?: boolean;
    barcodeFontSize?: number;
    barcodeTextAlign?: 'left' | 'center' | 'right';
    barcodeTextMargin?: number;
}

export interface TableElement extends ElementBase {
    type: 'table';
    tableRows?: number;
    tableColumns?: number;
    tableCellData?: Array<Record<string, any>>;
    tableHeaderData?: Array<Record<string, any>>;
    tableHasHeader?: boolean;
    tableHasVerticalHeader?: boolean;
    tableBorderWidth?: number;
    tableBorderColor?: string;
    tableCellPadding?: number;
    tableHeaderBackground?: string;
    tableHeaderTextColor?: string;
    tableAlternateRowColor?: string;
    tableCellTextColor?: string;
    tableCellFontSize?: number;
    tableCellAlignment?: 'left' | 'center' | 'right';
    tableHeaderAlignment?: 'left' | 'center' | 'right';
    tableColumnWidths?: number[];
    tableRowHeights?: number[];
}

export type CanvasElement =
    | RectangleElement
    | CircleElement
    | TextElement
    | ImageElement
    | LineElement
    | PolygonElement
    | StarElement
    | SvgElement
    | QrElement
    | BarcodeElement
    | TableElement
    | ElementBase;

// ============================================================================
// Design Types
// ============================================================================

export interface CanvasData {
    elements: CanvasElement[];
    background?: string;
    [key: string]: any;
}

export interface Design {
    id: string;
    name: string;
    description?: string;
    canvasData: CanvasData;
    width: number;
    height: number;
    status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    visibility: 'PRIVATE' | 'PUBLIC' | 'TEAM';
    isTemplate: boolean;
    thumbnailUrl?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Template extends Design {
    isTemplate: true;
    dynamicFields?: string[];
    category?: string;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface APIKey {
    id: string;
    name: string;
    keyPrefix: string;
    status: 'ACTIVE' | 'REVOKED';
    scopes: string[];
    createdAt: string;
    lastUsedAt?: string;
    expiresAt?: string;
}

// ============================================================================
// Client Options
// ============================================================================

export interface ClientOptions {
    apiKey?: string;
    baseUrl?: string;
    timeout?: number;
}
