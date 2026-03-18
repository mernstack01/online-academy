import dbConnect from '@/lib/db';
import Course from '@/models/Course';
import Assignment from '@/models/Assignment';
import Submission from '@/models/Submission';
import Enrollment from '@/models/Enrollment';

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

    const enrollmentCounts = await Enrollment.aggregate([
        {
            $match: {
                courseId: { $in: courses.map((course) => course._id) },
            },
        },
        {
            $group: {
                _id: '$courseId',
                total: { $sum: 1 },
            },
        },
    ]);

    const enrollmentCountMap = new Map(
        enrollmentCounts.map((item) => [item._id.toString(), item.total as number])
    );

    const coursesWithStudentCount = courses.map((course) => ({
        ...course.toObject(),
        studentCount: enrollmentCountMap.get((course._id as any).toString()) ?? 0,
    }));

    return {
        courses: coursesWithStudentCount,
        assignments,
        pendingSubmissions,
        stats: {
            totalCourses: courses.length,
            totalAssignments: assignments.length,
            pendingGrading: pendingSubmissions.length
        }
    };
};
