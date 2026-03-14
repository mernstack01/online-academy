import mongoose, { Schema, Document, Model } from 'mongoose';
import { IEnrollment } from '@/types';

export interface IEnrollmentDocument extends Omit<IEnrollment, '_id' | 'createdAt' | 'updatedAt'>, Document { }

const enrollmentSchema = new Schema<IEnrollmentDocument>(
    {
        studentId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        courseId: {
            type: Schema.Types.ObjectId,
            ref: 'Course',
            required: true,
        },
        status: {
            type: String,
            enum: ['active', 'completed'],
            default: 'active',
        },
    },
    {
        timestamps: true,
    }
);

// Ensure a student can only enroll in a course once
enrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

const Enrollment: Model<IEnrollmentDocument> = mongoose.models.Enrollment || mongoose.model<IEnrollmentDocument>('Enrollment', enrollmentSchema);

export default Enrollment;
