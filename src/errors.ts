/**
 * Custom error classes for Canvelete SDK
 */

export class CanveleteError extends Error {
    statusCode: number | null;
    response: Response | null;

    constructor(message: string, statusCode: number | null = null, response: Response | null = null) {
        super(message);
        this.name = 'CanveleteError';
        this.statusCode = statusCode;
        this.response = response;
    }
}

export class AuthenticationError extends CanveleteError {
    constructor(message: string, statusCode: number | null = null, response: Response | null = null) {
        super(message, statusCode, response);
        this.name = 'AuthenticationError';
    }
}

export class ValidationError extends CanveleteError {
    constructor(message: string, statusCode: number | null = null, response: Response | null = null) {
        super(message, statusCode, response);
        this.name = 'ValidationError';
    }
}

export class NotFoundError extends CanveleteError {
    constructor(message: string, statusCode: number | null = null, response: Response | null = null) {
        super(message, statusCode, response);
        this.name = 'NotFoundError';
    }
}

export class RateLimitError extends CanveleteError {
    retryAfter: number | null;

    constructor(message: string, retryAfter: number | null = null, statusCode: number | null = null, response: Response | null = null) {
        super(message, statusCode, response);
        this.name = 'RateLimitError';
        this.retryAfter = retryAfter;
    }
}

export class ServerError extends CanveleteError {
    constructor(message: string, statusCode: number | null = null, response: Response | null = null) {
        super(message, statusCode, response);
        this.name = 'ServerError';
    }
}

export class InsufficientScopeError extends CanveleteError {
    constructor(message: string, statusCode: number | null = null, response: Response | null = null) {
        super(message, statusCode, response);
        this.name = 'InsufficientScopeError';
    }
}
