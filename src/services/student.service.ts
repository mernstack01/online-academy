import dbConnect from '@/lib/db';
import Enrollment from '@/models/Enrollment';
import Submission from '@/models/Submission';
import Assignment from '@/models/Assignment';
import Portfolio from '@/models/Portfolio';
import { IEnrollment, ISubmission, IAssignment, IPortfolio } from '@/types';

/**
 * Student Dashboard Services
 */

export const getStudentDashboardStats = async (studentId: string) => {
    await dbConnect();

    // 1. Get Enrolled Courses
    const enrollments = await Enrollment.find({ studentId })
        .populate({
            path: 'courseId',
            select: 'title description thumbnail'
        })
        .sort('-createdAt');

    // 2. Get Recent Submissions & Grades
    const recentSubmissions = await Submission.find({ studentId })
        .populate({
            path: 'assignmentId',
            select: 'title dueDate'
        })
        .sort('-updatedAt')
        .limit(5);

    // 3. Get Upcoming Assignments (Deadlines)
    // Find course IDs student is enrolled in
    const courseIds = enrollments.map(e => (e.courseId as any)._id?.toString() || e.courseId.toString());
    const upcomingAssignments = await Assignment.find({
        courseId: { $in: courseIds },
        dueDate: { $gte: new Date() }
    })
        .sort('dueDate')
        .limit(5);

    // 4. Get Portfolio Items
    const portfolioItems = await Portfolio.find({ studentId })
        .populate({
            path: 'submissionId',
            populate: { path: 'assignmentId', select: 'title' }
        })
        .limit(4);

    return {
        enrollments,
        recentSubmissions,
        upcomingAssignments,
        portfolioItems,
    };
};

export const enrollInCourse = async (studentId: string, courseId: string) => {
    await dbConnect();
    return await Enrollment.create({ studentId, courseId });
};
