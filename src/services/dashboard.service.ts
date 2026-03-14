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

    const [totalUsers, totalCourses, totalStudents, totalSubmissions] = await Promise.all([
        User.countDocuments(),
        Course.countDocuments(),
        User.countDocuments({ role: UserRole.STUDENT }),
        Submission.countDocuments(),
    ]);

    return {
        totalUsers,
        totalCourses,
        totalStudents,
        totalSubmissions,
    };
};
