import jwt from 'jsonwebtoken';
import User, { IUserDocument } from '@/models/User';
import dbConnect from '@/lib/db';
import { UserRole } from '@/types';

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
    const normalizedEmail = String(email || '').toLowerCase();
    const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();

    if (adminEmail && normalizedEmail === adminEmail) {
        throw new Error('Email is reserved');
    }

    if (role && role !== UserRole.STUDENT) {
        throw new Error('Only students can register');
    }

    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
        throw new Error('User already exists');
    }

    const user = await User.create({
        name,
        email: normalizedEmail,
        password,
        role: UserRole.STUDENT,
        provider: 'credentials',
    });

    const token = signToken(user);

    return {
        user: {
            id: user._id,
            _id: user._id,
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
    const normalizedEmail = String(email || '').toLowerCase();
    const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminName = process.env.ADMIN_NAME || 'Admin';

    if (adminEmail && adminPassword && normalizedEmail === adminEmail && password === adminPassword) {
        let admin = await User.findOne({ email: adminEmail }).select('+password');
        if (!admin) {
            admin = await User.create({
                name: adminName,
                email: adminEmail,
                password: adminPassword,
                role: UserRole.ADMIN,
            });
        } else {
            admin.role = UserRole.ADMIN;
            admin.password = adminPassword;
            await admin.save();
        }

        const token = signToken(admin);

        return {
            user: {
                id: admin._id,
                _id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
            },
            token,
        };
    }

    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
        throw new Error('Invalid credentials');
    }
    if (user.provider && user.provider !== 'credentials') {
        throw new Error('Please sign in with Google');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        throw new Error('Invalid credentials');
    }

    const token = signToken(user);

    return {
        user: {
            id: user._id,
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
        token,
    };
};
