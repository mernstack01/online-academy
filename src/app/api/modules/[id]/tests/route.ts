import { NextResponse } from 'next/server';
import { withAuth } from '../../../../../lib/api-middleware';
import { addTest, findCourseByModuleId } from '../../../../../services/course.service';
import { UserRole } from '../../../../../types';
import { assertCourseManageAccess, getErrorMessage, getErrorStatus } from '@/lib/access-control';

/**
 * @route POST /api/modules/[id]/tests
 * @desc Add a test to a module
 * @access Private (Admin, Teacher)
 */
export const POST = withAuth(async (req, { params, user }) => {
    try {
        const body = await req.json();

        const validationError = validateTest(body);
        if (validationError) {
            return NextResponse.json({ message: validationError }, { status: 400 });
        }

        const course = await findCourseByModuleId(params.id);
        if (!course) throw new Error('Course containing this module not found');
        await assertCourseManageAccess(user, course._id.toString());

        const test = await addTest(course._id.toString(), params.id, body);
        return NextResponse.json(test, { status: 201 });
    } catch (error: unknown) {
        return NextResponse.json({ message: getErrorMessage(error) }, { status: getErrorStatus(error, 400) });
    }
}, [UserRole.ADMIN, UserRole.TEACHER]);

function validateTest(test: unknown) {
    if (!test || typeof test !== 'object') return 'Invalid test payload';
    const parsedTest = test as { title?: unknown; questions?: Array<Record<string, unknown>> };

    if (!parsedTest.title || String(parsedTest.title).trim().length === 0) return 'Test title is required';
    if (!Array.isArray(parsedTest.questions) || parsedTest.questions.length === 0) {
        return 'At least one question is required';
    }

    for (const [index, q] of parsedTest.questions.entries()) {
        if (!q || typeof q !== 'object') return `Invalid question at #${index + 1}`;
        const prompt = q.prompt;
        const options = Array.isArray(q.options) ? q.options : [];
        const correctIndexValue = q.correctIndex;

        if (!prompt || String(prompt).trim().length === 0) {
            return `Question #${index + 1} prompt is required`;
        }
        if (options.length < 2) {
            return `Question #${index + 1} must have at least 2 options`;
        }
        const normalizedOptions = options.map((opt) => String(opt || '').trim()).filter(Boolean);
        if (normalizedOptions.length < 2) {
            return `Question #${index + 1} must have at least 2 non-empty options`;
        }
        if (correctIndexValue === undefined || correctIndexValue === null) {
            return `Question #${index + 1} must have a correct option`;
        }
        const correctIndex = Number(correctIndexValue);
        if (Number.isNaN(correctIndex) || correctIndex < 0 || correctIndex >= options.length) {
            return `Question #${index + 1} has invalid correct option`;
        }
    }

    return null;
}
