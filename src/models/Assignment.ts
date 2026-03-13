import mongoose, { Schema, Document, Model } from 'mongoose';
import { IAssignment } from '../types';

export interface IAssignmentDocument extends Omit<IAssignment, '_id' | 'createdAt' | 'updatedAt'>, Document { }

const assignmentSchema = new Schema<IAssignmentDocument>(
    {
        courseId: {
            type: Schema.Types.ObjectId,
            ref: 'Course',
            required: true,
        },
        title: {
            type: String,
            required: [true, 'Assignment title is required'],
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'Assignment description is required'],
        },
        dueDate: {
            type: Date,
            required: [true, 'Assignment due date is required'],
        },
    },
    {
        timestamps: true,
    }
);

const Assignment: Model<IAssignmentDocument> = mongoose.models.Assignment || mongoose.model<IAssignmentDocument>('Assignment', assignmentSchema);

export default Assignment;
