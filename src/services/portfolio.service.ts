import dbConnect from '@/lib/db';
import Portfolio from '@/models/Portfolio';
import { IPortfolio } from '@/types';

/**
 * Portfolio Services
 */

export const addToPortfolio = async (portfolioData: Partial<IPortfolio>) => {
    await dbConnect();
    return await Portfolio.create(portfolioData);
};

export const getStudentPortfolio = async (studentId: string) => {
    await dbConnect();
    return await Portfolio.find({ studentId })
        .populate({
            path: 'submissionId',
            populate: {
                path: 'assignmentId',
                select: 'title description'
            }
        })
        .sort('-createdAt');
};

export const removeFromPortfolio = async (id: string, studentId: string) => {
    await dbConnect();
    return await Portfolio.findOneAndDelete({ _id: id, studentId });
};

export const getPortfolioById = async (id: string) => {
    await dbConnect();
    return await Portfolio.findById(id).populate('submissionId');
};
