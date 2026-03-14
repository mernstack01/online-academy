import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import dbConnect from '@/lib/db';
import Course from '@/models/Course';
import Assignment from '@/models/Assignment';
import { UserRole } from '@/types';

/**
 * @route POST /api/dev/seed-course
 * @desc Create a demo course for the current teacher/admin (dev helper)
 * @access Private (Admin, Teacher)
 */
export const POST = withAuth(async (req, { user }) => {
    if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ message: 'Not allowed in production' }, { status: 403 });
    }

    await dbConnect();

    const existing = await Course.findOne({
        instructor: user.id,
        title: 'Demo: Creative Foundations',
    });

    if (existing) {
        return NextResponse.json(existing);
    }

    const course = await Course.create({
        title: 'Demo: Creative Foundations',
        description: 'A short starter course with a module, lesson, and a graded assignment.',
        price: 0,
        thumbnail: '',
        instructor: user.id,
        isPublished: false,
        modules: [
            {
                title: 'Welcome Module',
                order: 1,
                lessons: [
                    {
                        title: 'Getting Started',
                        description: 'Overview of the platform and how to succeed in the course.',
                        content: 'Welcome! This is a demo lesson. Add video or resources anytime.',
                        videoUrl: '',
                        resources: [],
                        order: 1,
                    },
                ],
            },
        ],
    });

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);

    await Assignment.create({
        courseId: course._id.toString(),
        title: 'Demo Assignment: Your First Project',
        description: 'Share a link to your first project and write a short reflection.',
        dueDate,
    });

    return NextResponse.json(course);
}, [UserRole.ADMIN, UserRole.TEACHER]);
