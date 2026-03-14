import dbConnect from '../lib/db';
import Course from '../models/Course';
import { ICourse, IModule, ILesson, ITest } from '../types';

/**
 * Course Services
 */

export const createCourse = async (courseData: Partial<ICourse>) => {
    await dbConnect();
    return await Course.create(courseData as any);
};

export const getCourses = async (query = {}) => {
    await dbConnect();
    return await Course.find(query).populate('instructor', 'name email');
};

export const getCourseById = async (courseId: string) => {
    await dbConnect();
    return await Course.findById(courseId).populate('instructor', 'name email');
};

export const updateCourse = async (courseId: string, data: Partial<ICourse>) => {
    await dbConnect();
    return await Course.findByIdAndUpdate(courseId, data, { new: true });
};

export const deleteCourse = async (courseId: string) => {
    await dbConnect();
    return await Course.findByIdAndDelete(courseId);
};

/**
 * Module Services (Embedded)
 */

export const addModule = async (courseId: string, moduleData: Partial<IModule>) => {
    await dbConnect();
    const course = await Course.findById(courseId);
    if (!course) throw new Error('Course not found');

    course.modules.push(moduleData as any);
    await course.save();
    return course.modules[course.modules.length - 1];
};

export const updateModule = async (courseId: string, moduleId: string, data: Partial<IModule>) => {
    await dbConnect();
    const course = await Course.findById(courseId);
    if (!course) throw new Error('Course not found');

    const module = (course.modules as any).id(moduleId);
    if (!module) throw new Error('Module not found');

    Object.assign(module, data);
    await course.save();
    return module;
};

/**
 * Lesson Services (Embedded)
 */

export const addLesson = async (courseId: string, moduleId: string, lessonData: Partial<ILesson>) => {
    await dbConnect();
    const course = await Course.findById(courseId);
    if (!course) throw new Error('Course not found');

    const module = (course.modules as any).id(moduleId);
    if (!module) throw new Error('Module not found');

    module.lessons.push(lessonData as any);
    await course.save();
    return module.lessons[module.lessons.length - 1];
};

export const updateLesson = async (courseId: string, moduleId: string, lessonId: string, data: Partial<ILesson>) => {
    await dbConnect();
    const course = await Course.findById(courseId);
    if (!course) throw new Error('Course not found');

    const module = (course.modules as any).id(moduleId);
    if (!module) throw new Error('Module not found');

    const lesson = module.lessons.id(lessonId);
    if (!lesson) throw new Error('Lesson not found');

    Object.assign(lesson, data);
    await course.save();
    return lesson;
};

/**
 * Test Services (Embedded)
 */

export const addTest = async (courseId: string, moduleId: string, testData: Partial<ITest>) => {
    await dbConnect();
    const course = await Course.findById(courseId);
    if (!course) throw new Error('Course not found');

    const module = (course.modules as any).id(moduleId);
    if (!module) throw new Error('Module not found');

    module.tests.push(testData as any);
    await course.save();
    return module.tests[module.tests.length - 1];
};

/**
 * Helper to find course by module ID
 * Useful for legacy API structures
 */
export const findCourseByModuleId = async (moduleId: string) => {
    await dbConnect();
    return await Course.findOne({ 'modules._id': moduleId });
};
