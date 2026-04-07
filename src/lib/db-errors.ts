export class DatabaseConnectionError extends Error {
    override cause?: unknown;

    constructor(message: string, cause?: unknown) {
        super(message);
        this.name = 'DatabaseConnectionError';
        this.cause = cause;
    }
}

const DATABASE_ERROR_PATTERNS = [
    'Could not connect to any servers in your MongoDB Atlas cluster',
    'Server selection timed out',
    'ECONNREFUSED',
    'ENOTFOUND',
    'ETIMEOUT',
    'querySrv',
];

export function isDatabaseConnectionError(error: unknown): error is DatabaseConnectionError {
    if (error instanceof DatabaseConnectionError) {
        return true;
    }

    if (!(error instanceof Error)) {
        return false;
    }

    return error.name === 'MongooseServerSelectionError'
        || DATABASE_ERROR_PATTERNS.some(pattern => error.message.includes(pattern));
}

export function toDatabaseConnectionError(error: unknown) {
    if (error instanceof DatabaseConnectionError) {
        return error;
    }

    if (!isDatabaseConnectionError(error)) {
        return error instanceof Error ? error : new Error('Database unavailable');
    }

    const message = process.env.NODE_ENV === 'development'
        ? 'Database unavailable. Whitelist your IP in MongoDB Atlas or set MONGODB_URI to a local MongoDB instance.'
        : 'Database unavailable';

    return new DatabaseConnectionError(message, error);
}
