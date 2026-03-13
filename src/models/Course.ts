import mongoose, { Schema, Document, Model } from 'mongoose';
import { ICourse, IModule, ILesson, IResource } from '../types';

export interface ICourseDocument extends Omit<ICourse, '_id' | 'createdAt' | 'updatedAt' | 'modules'>, Document {
    modules: (Omit<IModule, '_id' | 'createdAt' | 'updatedAt' | 'lessons'> & {
        _id: mongoose.Types.ObjectId;
        lessons: (Omit<ILesson, '_id' | 'createdAt' | 'updatedAt' | 'resources'> & {
            _id: mongoose.Types.ObjectId;
            resources: IResource[];
        })[];
    })[];
}

const resourceSchema = new Schema<IResource>({
    name: { type: String, required: true },
    url: { type: String, required: true },
});

const lessonSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Lesson title is required'],
        trim: true,
    },
    description: {
        type: String,
    },
    content: {
        type: String,
    },
    videoUrl: {
        type: String,
        trim: true,
    },
    resources: [resourceSchema],
    order: {
        type: Number,
        required: true,
        default: 0,
    },
}, { timestamps: true });

const moduleSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Module title is required'],
        trim: true,
    },
    lessons: [lessonSchema],
    order: {
        type: Number,
        required: true,
        default: 0,
    },
}, { timestamps: true });

const courseSchema = new Schema<ICourseDocument>(
    {
        title: {
            type: String,
            required: [true, 'Course title is required'],
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'Course description is required'],
        },
        thumbnail: {
            type: String,
        },
        price: {
            type: Number,
            required: [true, 'Course price is required'],
            default: 0,
        },
        instructor: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        modules: [moduleSchema],
        isPublished: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

const Course: Model<ICourseDocument> = mongoose.models.Course || mongoose.model<ICourseDocument>('Course', courseSchema);

export default Course;
