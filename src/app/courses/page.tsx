'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ICourse } from '@/types';
import { ADMIN_TELEGRAM_URL } from '@/lib/constants';

export default function CoursesPage() {
    const [courses, setCourses] = useState<ICourse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await fetch('/api/courses');
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.message || 'Failed to load courses');
                }
                if (Array.isArray(data)) {
                    setCourses(data);
                }
            } catch (error: any) {
                console.error('Failed to fetch courses:', error);
                setError(error.message || 'Failed to load courses');
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
                <h1 className="text-4xl font-extrabold text-foreground mb-2">Explore Courses</h1>
                <p className="text-muted-foreground">Expand your skills with our premium academy content</p>
            </div>

            {error ? (
                <div className="text-center py-20 glass rounded-2xl">
                    <p className="text-grey-400 text-lg italic">{error}</p>
                </div>
            ) : courses.length === 0 ? (
                <div className="text-center py-20 glass rounded-2xl">
                    <p className="text-muted-foreground text-lg italic">No courses available yet. Check back later!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {courses.map((course) => (
                        <div
                            key={course._id}
                            className="glass group flex flex-col h-full rounded-2xl overflow-hidden glass-hover shadow-xl hover:shadow-primary/5 border border-white/10"
                        >
                            <Link href={`/courses/${course._id}`} className="block">
                                <div className="relative h-48 w-full bg-white/5 overflow-hidden">
                                    {course.thumbnail ? (
                                        <img
                                            src={course.thumbnail}
                                            alt={course.title}
                                            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-muted-foreground/40 font-black text-4xl">
                                            ACADEMY
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                                        {(course.price ?? 0) > 0 ? `$${course.price}` : 'FREE'}
                                    </div>
                                </div>
                            </Link>

                            <div className="p-6 flex flex-col grow">
                                <Link href={`/courses/${course._id}`} className="block">
                                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors mb-2 line-clamp-1">
                                        {course.title}
                                    </h3>
                                    <p className="text-muted-foreground text-sm mb-6 line-clamp-3 grow">
                                        {course.description}
                                    </p>
                                </Link>

                                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold text-white uppercase">
                                            {(course.instructor as any).name?.charAt(0) || 'I'}
                                        </div>
                                        <span className="text-xs text-muted-foreground font-medium">
                                            {(course.instructor as any).name || 'Instructor'}
                                        </span>
                                    </div>
                                    <Link
                                        href={`/courses/${course._id}`}
                                        className="text-xs text-primary font-semibold tracking-wider uppercase"
                                    >
                                        View Details
                                    </Link>
                                </div>

                                {(course.price ?? 0) > 0 ? (
                                    <a
                                        href={ADMIN_TELEGRAM_URL}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="mt-4 inline-flex items-center justify-center rounded-xl bg-white text-black text-xs font-bold px-4 py-3 uppercase tracking-wider hover:bg-white/90 transition-all"
                                    >
                                        Contact Admin to Buy
                                    </a>
                                ) : (
                                    <div className="mt-4 text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                                        Free Course — Enroll Inside
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
