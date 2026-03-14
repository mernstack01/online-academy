import dbConnect from '@/lib/db';
import Course from '@/models/Course';
import Assignment from '@/models/Assignment';
import Submission from '@/models/Submission';

/**
 * Teacher Dashboard Services
 */

export const getTeacherDashboardStats = async (teacherId: string) => {
    await dbConnect();

    // 1. Get Courses created by this teacher
    const courses = await Course.find({ instructor: teacherId })
        .sort('-createdAt');

    const courseIds = courses.map(c => (c._id as any).toString());

    // 2. Get Assignments for these courses
    const assignments = await Assignment.find({ courseId: { $in: courseIds } })
        .populate({
            path: 'courseId',
            select: 'title'
        })
        .sort('-createdAt');

    const assignmentIds = assignments.map(a => (a._id as any).toString());

    // 3. Get Pending Submissions for these assignments
    const pendingSubmissions = await Submission.find({
        assignmentId: { $in: assignmentIds },
        status: 'pending'
    })
        .populate({
            path: 'assignmentId',
            select: 'title'
        })
        .populate({
            path: 'studentId',
            select: 'name email'
        })
        .sort('-createdAt');

    return {
        courses,
        assignments,
        pendingSubmissions,
        stats: {
            totalCourses: courses.length,
            totalAssignments: assignments.length,
            pendingGrading: pendingSubmissions.length
        }
    };
};
