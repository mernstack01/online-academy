'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ICourse } from '@/types';

export default function CoursesPage() {
    const [courses, setCourses] = useState<ICourse[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await fetch('/api/courses');
                const data = await res.json();
                if (Array.isArray(data)) {
                    setCourses(data);
                }
            } catch (error) {
                console.error('Failed to fetch courses:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="py-12 animate-fade-in">
            <div className="mb-12">
                <h1 className="text-4xl font-extrabold text-white mb-2">Explore Courses</h1>
                <p className="text-gray-400">Expand your skills with our premium academy content</p>
            </div>

            {courses.length === 0 ? (
                <div className="text-center py-20 glass rounded-2xl">
                    <p className="text-gray-400 text-lg italic">No courses available yet. Check back later!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {courses.map((course) => (
                        <Link
                            href={`/courses/${course._id}`}
                            key={course._id}
                            className="glass group flex flex-col h-full rounded-2xl overflow-hidden glass-hover shadow-xl hover:shadow-primary/5 border border-white/10"
                        >
                            <div className="relative h-48 w-full bg-white/5 overflow-hidden">
                                {course.thumbnail ? (
                                    <Image
                                        src={course.thumbnail}
                                        alt={course.title}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-white/10 font-black text-4xl">
                                        ACADEMY
                                    </div>
                                )}
                                <div className="absolute top-4 right-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                                    ${course.price}
                                </div>
                            </div>

                            <div className="p-6 flex flex-col flex-grow">
                                <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors mb-2 line-clamp-1">
                                    {course.title}
                                </h3>
                                <p className="text-gray-400 text-sm mb-6 line-clamp-3 flex-grow">
                                    {course.description}
                                </p>

                                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold text-white uppercase">
                                            {(course.instructor as any).name?.charAt(0) || 'I'}
                                        </div>
                                        <span className="text-xs text-gray-300 font-medium">
                                            {(course.instructor as any).name || 'Instructor'}
                                        </span>
                                    </div>
                                    <span className="text-xs text-primary font-semibold tracking-wider uppercase">View Details</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
