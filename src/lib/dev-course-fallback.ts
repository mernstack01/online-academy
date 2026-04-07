import { ICourse, UserRole } from '@/types';

export const DEV_FALLBACK_COURSE_ID = '000000000000000000000001';

const now = new Date('2026-01-01T00:00:00.000Z');

const devFallbackCourses: ICourse[] = [
    {
        _id: DEV_FALLBACK_COURSE_ID,
        title: 'Demo: Creative Foundations',
        description: 'A development fallback course shown when MongoDB is unavailable locally.',
        thumbnail: '',
        price: 0,
        instructor: {
            _id: '000000000000000000000002',
            name: 'Demo Instructor',
            email: 'demo@academy.local',
            role: UserRole.TEACHER,
        },
        modules: [
            {
                _id: '000000000000000000000003',
                title: 'Welcome Module',
                order: 1,
                createdAt: now,
                updatedAt: now,
                lessons: [
                    {
                        _id: '000000000000000000000004',
                        title: 'Getting Started',
                        description: 'A quick overview of the academy and how to navigate the course.',
                        content: 'This is demo content used only when the database is unreachable in development.',
                        videoUrl: '',
                        resources: [],
                        order: 1,
                        createdAt: now,
                        updatedAt: now,
                    },
                ],
                tests: [],
            },
        ],
        isPublished: true,
        createdAt: now,
        updatedAt: now,
    },
];

export function getDevFallbackCourses() {
    return devFallbackCourses;
}

export function getDevFallbackCourseById(courseId: string) {
    return devFallbackCourses.find(course => course._id === courseId) ?? null;
}
