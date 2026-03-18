import dbConnect from '@/lib/db';
import Assignment from '@/models/Assignment';
import Submission from '@/models/Submission';
import { IAssignment, ISubmission } from '@/types';

/**
 * Assignment Services
 */

export const createAssignment = async (assignmentData: Partial<IAssignment>) => {
    await dbConnect();
    return await Assignment.create(assignmentData);
};

export const getAssignmentsByCourse = async (courseId: string) => {
    await dbConnect();
    return await Assignment.find({ courseId }).sort('createdAt');
};

export const getAssignmentById = async (id: string) => {
    await dbConnect();
    return await Assignment.findById(id);
};

/**
 * Submission Services
 */

export const submitAssignment = async (submissionData: Partial<ISubmission>) => {
    await dbConnect();
    const existing = await Submission.findOne({
        assignmentId: submissionData.assignmentId,
        studentId: submissionData.studentId,
    });

    if (existing) {
        existing.fileUrl = submissionData.fileUrl || existing.fileUrl;
        existing.comment = submissionData.comment || '';
        existing.status = 'pending';
        existing.grade = undefined;
        existing.teacherComment = undefined;
        return await existing.save();
    }

    return await Submission.create(submissionData);
};

export const getSubmissionsByAssignment = async (assignmentId: string) => {
    await dbConnect();
    return await Submission.find({ assignmentId }).populate('studentId', 'name email').sort('-createdAt');
};

export const gradeSubmission = async (submissionId: string, grade: number, teacherComment?: string) => {
    await dbConnect();
    return await Submission.findByIdAndUpdate(
        submissionId,
        { grade, teacherComment, status: 'graded' },
        { new: true }
    );
};

export const getStudentSubmissions = async (studentId: string) => {
    await dbConnect();
    return await Submission.find({ studentId }).populate('assignmentId').sort('-createdAt');
};
