import mongoose, { Schema, Document, Model } from 'mongoose';
import { IPortfolio } from '../types';

export interface IPortfolioDocument extends Omit<IPortfolio, '_id' | 'createdAt' | 'updatedAt'>, Document { }

const portfolioSchema = new Schema<IPortfolioDocument>(
    {
        studentId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        submissionId: {
            type: Schema.Types.ObjectId,
            ref: 'Submission',
            required: true,
        },
        title: {
            type: String,
            required: [true, 'Portfolio item title is required'],
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'Portfolio item description is required'],
        },
    },
    {
        timestamps: true,
    }
);

// Ensure a student can't add the same submission twice to their portfolio
portfolioSchema.index({ studentId: 1, submissionId: 1 }, { unique: true });

const Portfolio: Model<IPortfolioDocument> = mongoose.models.Portfolio || mongoose.model<IPortfolioDocument>('Portfolio', portfolioSchema);

export default Portfolio;
