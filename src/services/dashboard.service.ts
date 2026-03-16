import dbConnect from '@/lib/db';
import User from '@/models/User';
import Course from '@/models/Course';
import Submission from '@/models/Submission';
import { UserRole } from '@/types';

/**
 * Dashboard Services
 */

export const getAdminStats = async () => {
    await dbConnect();

    const [totalTeachers, totalCourses, totalStudents, totalSubmissions] = await Promise.all([
        User.countDocuments({ role: UserRole.TEACHER }),
        Course.countDocuments(),
        User.countDocuments({ role: UserRole.STUDENT }),
        Submission.countDocuments(),
    ]);

    return {
        totalTeachers,
        totalCourses,
        totalStudents,
        totalSubmissions,
    };
};
