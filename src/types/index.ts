export enum UserRole {
    ADMIN = 'admin',
    TEACHER = 'teacher',
    STUDENT = 'student',
}

export interface User {
    _id?: string;
    id?: string;
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    image?: string;
    provider?: 'credentials' | 'google';
    googleId?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IResource {
    name: string;
    url: string;
}

export interface ILesson {
    _id: string;
    title: string;
    description?: string;
    content?: string;
    videoUrl?: string; // Vimeo or YouTube URL
    resources?: IResource[];
    order: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface ITestQuestion {
    _id: string;
    prompt: string;
    options: string[];
    correctIndex: number;
}

export interface ITest {
    _id: string;
    title: string;
    questions: ITestQuestion[];
    createdAt: Date;
    updatedAt: Date;
}

export interface IModule {
    _id: string;
    title: string;
    lessons: ILesson[];
    tests: ITest[];
    order: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface ICourse {
    _id: string;
    title: string;
    description: string;
    thumbnail?: string;
    price: number;
    instructor: string | User; // User ID or populated User
    modules: IModule[];
    isPublished: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface IAssignment {
    _id: string;
    courseId: string | ICourse;
    title: string;
    description: string;
    dueDate: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface ISubmission {
    _id: string;
    assignmentId: string | IAssignment;
    studentId: string | User;
    fileUrl: string;
    comment?: string;
    status: 'pending' | 'graded';
    grade?: number;
    teacherComment?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IPortfolio {
    _id: string;
    studentId: string | User;
    submissionId: string | ISubmission;
    title: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface IEnrollment {
    _id: string;
    studentId: string | User;
    courseId: string | ICourse;
    status: 'active' | 'completed';
    createdAt: Date;
    updatedAt: Date;
}
