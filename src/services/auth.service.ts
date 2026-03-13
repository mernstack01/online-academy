import jwt from 'jsonwebtoken';
import User, { IUserDocument } from '../models/User';
import dbConnect from '../lib/db';
import { UserRole } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_development_only';

export const signToken = (user: IUserDocument) => {
    return jwt.sign(
        {
            id: user._id,
            email: user.email,
            role: user.role
        },
        JWT_SECRET,
        { expiresIn: '1d' }
    );
};

export const registerUser = async (userData: any) => {
    await dbConnect();

    const { name, email, password, role } = userData;

    const userExists = await User.findOne({ email });
    if (userExists) {
        throw new Error('User already exists');
    }

    const user = await User.create({
        name,
        email,
        password,
        role: role || UserRole.STUDENT,
    });

    const token = signToken(user);

    return {
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
        token,
    };
};

export const loginUser = async (credentials: any) => {
    await dbConnect();

    const { email, password } = credentials;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
        throw new Error('Invalid credentials');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        throw new Error('Invalid credentials');
    }

    const token = signToken(user);

    return {
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
        token,
    };
};
