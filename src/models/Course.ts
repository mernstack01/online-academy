import mongoose, { Schema, Document, Model } from 'mongoose';
import { ICourse, IModule, ILesson, IResource, ITest, ITestQuestion } from '@/types';

export interface ICourseDocument extends Omit<ICourse, '_id' | 'createdAt' | 'updatedAt' | 'modules'>, Document {
    modules: (Omit<IModule, '_id' | 'createdAt' | 'updatedAt' | 'lessons'> & {
        _id: mongoose.Types.ObjectId;
        lessons: (Omit<ILesson, '_id' | 'createdAt' | 'updatedAt' | 'resources'> & {
            _id: mongoose.Types.ObjectId;
            resources: IResource[];
        })[];
        tests: (Omit<ITest, '_id' | 'createdAt' | 'updatedAt' | 'questions'> & {
            _id: mongoose.Types.ObjectId;
            questions: (Omit<ITestQuestion, '_id'> & { _id: mongoose.Types.ObjectId })[];
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

const testQuestionSchema = new Schema({
    prompt: {
        type: String,
        required: [true, 'Question prompt is required'],
        trim: true,
    },
    options: {
        type: [String],
        required: true,
        validate: [(val: string[]) => val.length >= 2, 'At least two options are required'],
    },
    correctIndex: {
        type: Number,
        required: true,
        min: 0,
    },
}, { timestamps: true });

const testSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Test title is required'],
        trim: true,
    },
    questions: [testQuestionSchema],
}, { timestamps: true });

const moduleSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Module title is required'],
        trim: true,
    },
    lessons: [lessonSchema],
    tests: [testSchema],
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
