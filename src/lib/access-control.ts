import dbConnect from '@/lib/db';
import Assignment from '@/models/Assignment';
import Course from '@/models/Course';
import Enrollment from '@/models/Enrollment';
import Submission from '@/models/Submission';
import { UserRole } from '@/types';

export type AuthenticatedUser = {
    id: string;
    email: string;
    role: UserRole;
};

export class AppError extends Error {
    status: number;

    constructor(message: string, status = 400) {
        super(message);
        this.name = 'AppError';
        this.status = status;
    }
}

export function getErrorStatus(error: unknown, fallbackStatus = 500) {
    if (error instanceof AppError) {
        return error.status;
    }

    return fallbackStatus;
}

export function getErrorMessage(error: unknown, fallbackMessage = 'Internal Server Error') {
    if (error instanceof Error && error.message) {
        return error.message;
    }

    return fallbackMessage;
}

function toId(value: unknown) {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && '_id' in (value as Record<string, unknown>)) {
        return String((value as { _id?: unknown })._id ?? '');
    }

    return String(value);
}

function isAdmin(user: AuthenticatedUser) {
    return user.role === UserRole.ADMIN;
}

function isInstructorForCourse(user: AuthenticatedUser, course: { instructor?: unknown }) {
    return user.role === UserRole.TEACHER && toId(course.instructor) === user.id;
}

export async function getCourseOrThrow(courseId: string) {
    await dbConnect();
    const course = await Course.findById(courseId).populate('instructor', 'name email');

    if (!course) {
        throw new AppError('Course not found', 404);
    }

    return course;
}

export async function getAssignmentOrThrow(assignmentId: string) {
    await dbConnect();
    const assignment = await Assignment.findById(assignmentId);

    if (!assignment) {
        throw new AppError('Assignment not found', 404);
    }

    return assignment;
}

export async function getSubmissionOrThrow(submissionId: string) {
    await dbConnect();
    const submission = await Submission.findById(submissionId)
        .populate('studentId', 'name email')
        .populate('assignmentId', 'title description dueDate courseId');

    if (!submission) {
        throw new AppError('Submission not found', 404);
    }

    return submission;
}

export async function ensureStudentEnrollment(studentId: string, courseId: string, message = 'Enrollment required') {
    await dbConnect();
    const enrollment = await Enrollment.findOne({ studentId, courseId });

    if (!enrollment) {
        throw new AppError(message, 403);
    }

    return enrollment;
}

export async function canStudentAccessCourse(studentId: string, courseId: string) {
    await dbConnect();
    const enrollment = await Enrollment.findOne({ studentId, courseId }).select('_id');
    return Boolean(enrollment);
}

export async function assertCourseManageAccess(user: AuthenticatedUser, courseId: string) {
    const course = await getCourseOrThrow(courseId);

    if (!isAdmin(user) && !isInstructorForCourse(user, course)) {
        throw new AppError('Forbidden: You can only manage your own courses', 403);
    }

    return course;
}

export async function assertCourseReadAccess(user: AuthenticatedUser | null, courseId: string) {
    const course = await getCourseOrThrow(courseId);

    if (course.isPublished) {
        return course;
    }

    if (user && (isAdmin(user) || isInstructorForCourse(user, course))) {
        return course;
    }

    if (user?.role === UserRole.STUDENT) {
        const enrolled = await canStudentAccessCourse(user.id, courseId);
        if (enrolled) {
            return course;
        }
    }

    throw new AppError('Course not available', 403);
}

export async function assertAssignmentManageAccess(user: AuthenticatedUser, assignmentId: string) {
    const assignment = await getAssignmentOrThrow(assignmentId);
    const course = await assertCourseManageAccess(user, toId(assignment.courseId));
    return { assignment, course };
}

export async function assertAssignmentReadAccess(user: AuthenticatedUser, assignmentId: string) {
    const assignment = await getAssignmentOrThrow(assignmentId);
    const courseId = toId(assignment.courseId);

    if (isAdmin(user)) {
        return assignment;
    }

    if (user.role === UserRole.TEACHER) {
        await assertCourseManageAccess(user, courseId);
        return assignment;
    }

    if (user.role === UserRole.STUDENT) {
        await ensureStudentEnrollment(user.id, courseId, 'You must be enrolled in this course');
        return assignment;
    }

    throw new AppError('Forbidden', 403);
}

export async function assertSubmissionManageAccess(user: AuthenticatedUser, submissionId: string) {
    const submission = await getSubmissionOrThrow(submissionId);
    const assignmentRef = submission.assignmentId as { courseId?: unknown } | null;
    const assignmentCourseId = toId(assignmentRef?.courseId);

    if (!assignmentCourseId) {
        throw new AppError('Assignment course not found', 404);
    }

    if (!isAdmin(user)) {
        await assertCourseManageAccess(user, assignmentCourseId);
    }

    return submission;
}

export async function assertSubmissionOwnership(studentId: string, submissionId: string) {
    await dbConnect();
    const submission = await Submission.findById(submissionId).populate({
        path: 'assignmentId',
        select: 'courseId',
    });

    if (!submission) {
        throw new AppError('Submission not found', 404);
    }

    if (toId(submission.studentId) !== studentId) {
        throw new AppError('You can only use your own submission', 403);
    }

    const assignmentRef = submission.assignmentId as { courseId?: unknown } | null;
    const courseId = toId(assignmentRef?.courseId);
    if (!courseId) {
        throw new AppError('Assignment course not found', 404);
    }

    await ensureStudentEnrollment(studentId, courseId, 'You must be enrolled in this course');

    return submission;
}
