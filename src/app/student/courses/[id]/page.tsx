'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ICourse, ILesson, IModule, UserRole } from '@/types';
import { useAuth } from '@/context/AuthContext';
import LessonVideo from '@/components/LessonVideo';
import {
    BookOpen,
    ChevronRight,
    ChevronDown,
    PlayCircle,
    FileText,
    Download,
    CheckCircle2,
    ArrowLeft,
    Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

export default function StudentCourseView() {
    const params = useParams();
    const router = useRouter();
    const { user, isAuthenticated, loading: authLoading } = useAuth();

    const [course, setCourse] = useState<ICourse | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedLesson, setSelectedLesson] = useState<ILesson | null>(null);
    const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const courseId = params.id as string;

    useEffect(() => {
        const fetchCourseData = async () => {
            try {
                let isEnrolled = false;
                if (user?.role === UserRole.STUDENT) {
                    const enrollRes = await fetch(`/api/courses/${courseId}/enroll`);
                    if (enrollRes.ok) {
                        const data = await enrollRes.json();
                        isEnrolled = !!data.isEnrolled;
                    }
                }

                const canAccess = isEnrolled || user?.role === UserRole.TEACHER || user?.role === UserRole.ADMIN;

                if (!canAccess) {
                    router.push(`/courses/${courseId}`);
                    return;
                }

                // Fetch course details
                const courseRes = await fetch(`/api/courses/${courseId}`);
                if (courseRes.ok) {
                    const data: ICourse = await courseRes.json();
                    setCourse(data);

                    // Select first lesson by default
                    if (data.modules?.length > 0 && data.modules[0].lessons?.length > 0) {
                        const firstModule = data.modules.sort((a, b) => a.order - b.order)[0];
                        setSelectedLesson(firstModule.lessons.sort((a, b) => a.order - b.order)[0]);
                        setExpandedModules({ [firstModule._id]: true });
                    }
                }
            } catch (error) {
                console.error('Failed to fetch student course view:', error);
            } finally {
                setLoading(false);
            }
        };

        if (isAuthenticated && courseId) {
            fetchCourseData();
        } else if (!authLoading) {
            router.push(`/login?redirect=/student/courses/${courseId}`);
        }
    }, [courseId, isAuthenticated, user, router, authLoading]);

    const toggleModule = (moduleId: string) => {
        setExpandedModules(prev => ({
            ...prev,
            [moduleId]: !prev[moduleId]
        }));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
        );
    }

    if (!course) return null;

    return (
        <div className="flex h-[calc(100vh-64px)] bg-background overflow-hidden relative">
            {/* Sidebar Toggle (Mobile) */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden absolute bottom-6 right-6 z-50 bg-primary text-white p-4 rounded-full shadow-2xl"
            >
                <Menu className="h-6 w-6" />
            </button>

            {/* Sidebar Navigation */}
            <aside className={`
                ${sidebarOpen ? 'w-80 translate-x-0' : 'w-0 -translate-x-full lg:w-20 lg:translate-x-0'} 
                transition-all duration-300 bg-white/[0.02] border-r border-white/10 flex flex-col h-full z-40
            `}>
                <div className="p-6 border-b border-white/10 flex items-center justify-between overflow-hidden">
                    <h2 className={`font-black tracking-tighter italic text-xl whitespace-nowrap ${!sidebarOpen && 'lg:hidden'}`}>
                        CURRICULUM
                    </h2>
                    <Link href={`/courses/${course._id}`} className="text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar py-4">
                    {course.modules.sort((a, b) => a.order - b.order).map((module, mIdx) => (
                        <div key={module._id} className="mb-2">
                            <button
                                onClick={() => toggleModule(module._id)}
                                className="w-full px-6 py-3 flex items-center justify-between hover:bg-white/5 transition-colors group"
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <span className="text-primary/40 font-bold text-xs">0{mIdx + 1}</span>
                                    <span className={`text-sm font-bold truncate text-left ${!sidebarOpen && 'lg:hidden'}`}>
                                        {module.title}
                                    </span>
                                </div>
                                {expandedModules[module._id] ? (
                                    <ChevronDown className={`h-4 w-4 text-muted-foreground ${!sidebarOpen && 'lg:hidden'}`} />
                                ) : (
                                    <ChevronRight className={`h-4 w-4 text-muted-foreground ${!sidebarOpen && 'lg:hidden'}`} />
                                )}
                            </button>

                            {(expandedModules[module._id] || !sidebarOpen) && (
                                <div className="space-y-1 mt-1">
                                    {module.lessons.sort((a, b) => a.order - b.order).map((lesson, lIdx) => (
                                        <button
                                            key={lesson._id}
                                            onClick={() => setSelectedLesson(lesson)}
                                            className={`
                                                w-full pl-12 pr-6 py-3 flex items-center gap-3 transition-all
                                                ${selectedLesson?._id === lesson._id
                                                    ? 'bg-primary/10 text-primary border-r-2 border-primary'
                                                    : 'text-muted-foreground hover:text-foreground hover:bg-white/5'}
                                            `}
                                        >
                                            <PlayCircle className={`h-4 w-4 flex-shrink-0 ${selectedLesson?._id === lesson._id ? 'animate-pulse' : ''}`} />
                                            <span className={`text-xs font-medium text-left truncate ${!sidebarOpen && 'lg:hidden'}`}>
                                                {lesson.title}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </aside>

            {/* Main Player Area */}
            <main className="flex-1 overflow-y-auto bg-background flex flex-col items-center">
                {selectedLesson ? (
                    <div className="w-full max-w-5xl py-12 px-6 md:px-12 space-y-12">
                        {selectedLesson.videoUrl ? (
                            <LessonVideo
                                title={selectedLesson.title}
                                description={selectedLesson.description}
                                videoUrl={selectedLesson.videoUrl}
                            />
                        ) : (
                            <div className="aspect-video w-full rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center space-y-4 text-muted-foreground">
                                <PlayCircle className="h-20 w-20 opacity-10" />
                                <p className="italic font-medium">No video content for this lesson.</p>
                                <Badge variant="outline" className="border-white/10 text-muted-foreground">Reading Material Only</Badge>
                            </div>
                        )}

                        {/* Additional Content/Resources Section */}
                        {selectedLesson.content && (
                            <div className="glass p-8 rounded-2xl border border-white/10 space-y-4">
                                <h3 className="text-xl font-bold italic tracking-tight border-b border-white/10 pb-4 flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-primary" />
                                    LESSON NOTES
                                </h3>
                                <div className="prose max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap italic">
                                    {selectedLesson.content}
                                </div>
                            </div>
                        )}

                        {selectedLesson.resources && selectedLesson.resources.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold italic tracking-tight flex items-center gap-2">
                                    <Download className="h-5 w-5 text-primary" />
                                    RESOURCES
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {selectedLesson.resources.map((res, idx) => (
                                        <a
                                            key={idx}
                                            href={res.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-white/5 text-xs font-bold text-muted-foreground group-hover:text-primary transition-colors">
                                                    PDF
                                                </div>
                                                <span className="text-sm font-medium">{res.name}</span>
                                            </div>
                                            <Download className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-6 text-muted-foreground">
                        <BookOpen className="h-24 w-24 opacity-5" />
                        <div className="text-center space-y-2">
                            <h3 className="text-2xl font-black italic tracking-tighter text-muted-foreground">SELECT A LESSON</h3>
                            <p className="text-sm italic">Choose a topic from the curriculum to start learning.</p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
