import mongoose, { Schema, Document, Model } from 'mongoose';
import { ISubmission } from '../types';

export interface ISubmissionDocument extends Omit<ISubmission, '_id' | 'createdAt' | 'updatedAt'>, Document { }

const submissionSchema = new Schema<ISubmissionDocument>(
    {
        assignmentId: {
            type: Schema.Types.ObjectId,
            ref: 'Assignment',
            required: true,
        },
        studentId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        fileUrl: {
            type: String,
            required: [true, 'Submission file URL is required'],
        },
        comment: {
            type: String,
        },
        status: {
            type: String,
            enum: ['pending', 'graded'],
            default: 'pending',
        },
        grade: {
            type: Number,
        },
        teacherComment: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

const Submission: Model<ISubmissionDocument> = mongoose.models.Submission || mongoose.model<ISubmissionDocument>('Submission', submissionSchema);

export default Submission;
