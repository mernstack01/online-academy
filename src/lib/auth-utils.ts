import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_development_only';

export const verifyToken = (token: string) => {
    try {
        return jwt.verify(token, JWT_SECRET) as {
            id: string;
            email: string;
            role: string;
        };
    } catch (error) {
        return null;
    }
};
