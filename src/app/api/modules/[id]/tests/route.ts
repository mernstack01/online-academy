import { NextResponse } from 'next/server';
import { withAuth } from '../../../../../lib/api-middleware';
import { addTest, findCourseByModuleId } from '../../../../../services/course.service';
import { UserRole } from '../../../../../types';

/**
 * @route POST /api/modules/[id]/tests
 * @desc Add a test to a module
 * @access Private (Admin, Teacher)
 */
export const POST = withAuth(async (req, { params }) => {
    try {
        const body = await req.json();

        const validationError = validateTest(body);
        if (validationError) {
            return NextResponse.json({ message: validationError }, { status: 400 });
        }

        const course = await findCourseByModuleId(params.id);
        if (!course) throw new Error('Course containing this module not found');

        const test = await addTest(course._id.toString(), params.id, body);
        return NextResponse.json(test, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }
}, [UserRole.ADMIN, UserRole.TEACHER]);

function validateTest(test: any) {
    if (!test || typeof test !== 'object') return 'Invalid test payload';
    if (!test.title || String(test.title).trim().length === 0) return 'Test title is required';
    if (!Array.isArray(test.questions) || test.questions.length === 0) {
        return 'At least one question is required';
    }

    for (const [index, q] of test.questions.entries()) {
        if (!q || typeof q !== 'object') return `Invalid question at #${index + 1}`;
        if (!q.prompt || String(q.prompt).trim().length === 0) {
            return `Question #${index + 1} prompt is required`;
        }
        if (!Array.isArray(q.options) || q.options.length < 2) {
            return `Question #${index + 1} must have at least 2 options`;
        }
        const options = q.options.map((opt: any) => String(opt || '').trim()).filter(Boolean);
        if (options.length < 2) {
            return `Question #${index + 1} must have at least 2 non-empty options`;
        }
        if (q.correctIndex === undefined || q.correctIndex === null) {
            return `Question #${index + 1} must have a correct option`;
        }
        const correctIndex = Number(q.correctIndex);
        if (Number.isNaN(correctIndex) || correctIndex < 0 || correctIndex >= q.options.length) {
            return `Question #${index + 1} has invalid correct option`;
        }
    }

    return null;
}
