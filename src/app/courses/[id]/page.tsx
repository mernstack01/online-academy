'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ICourse, UserRole } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, CheckCircle, Clock, GraduationCap, PlayCircle, Users, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { ADMIN_TELEGRAM_URL } from '@/lib/constants';
import { useI18n } from '@/context/LanguageContext';

export default function CourseDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const { t } = useI18n();
    const [course, setCourse] = useState<ICourse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [enrolling, setEnrolling] = useState(false);

    const courseId = params.id as string;

    useEffect(() => {
        const fetchCourseData = async () => {
            try {
                // Fetch course details
                const courseRes = await fetch(`/api/courses/${courseId}`);
                const courseData = await courseRes.json();
                if (courseRes.ok) {
                    setCourse(courseData);
                } else {
                    setError(courseData.message || t('courseDetail.errors.notFound'));
                    setLoading(false);
                    return;
                }

                // Check enrollment status if student is logged in
                if (isAuthenticated && user?.role === UserRole.STUDENT) {
                    const enrollRes = await fetch(`/api/courses/${courseId}/enroll`);
                    if (enrollRes.ok) {
                        const { isEnrolled } = await enrollRes.json();
                        setIsEnrolled(isEnrolled);
                    }
                }
            } catch (error: any) {
                console.error('Failed to fetch course data:', error);
                setError(error.message || t('courseDetail.errors.loadFailed'));
            } finally {
                setLoading(false);
            }
        };

        if (courseId) {
            fetchCourseData();
        }
    }, [courseId, isAuthenticated, user, router, authLoading]);

    const handleEnroll = async () => {
        if ((course?.price ?? 0) > 0) {
            alert(t('courseDetail.alerts.paidContactAdmin'));
            return;
        }
        if (!isAuthenticated) {
            router.push(`/login?redirect=/courses/${courseId}`);
            return;
        }

        if (user?.role !== UserRole.STUDENT) {
            alert(t('courseDetail.alerts.onlyStudents'));
            return;
        }

        setEnrolling(true);
        try {
            const res = await fetch(`/api/courses/${courseId}/enroll`, {
                method: 'POST',
            });

            if (res.ok) {
                setIsEnrolled(true);
                alert(t('courseDetail.alerts.enrolled'));
            } else {
                const data = await res.json();
                alert(data.message || t('courseDetail.alerts.enrollFailed'));
            }
        } catch (error) {
            console.error('Enrollment error:', error);
            alert(t('courseDetail.alerts.enrollError'));
        } finally {
            setEnrolling(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
                <div className="glass p-10 rounded-3xl border border-white/10 text-center max-w-lg">
                    <h2 className="text-2xl font-black italic mb-3">{t('courseDetail.errors.unableToLoad')}</h2>
                    <p className="text-muted-foreground mb-6">{error}</p>
                    <Link href="/courses" className="px-5 py-3 rounded-xl bg-white text-black font-semibold hover:bg-white/90 transition-all">
                        {t('courseDetail.actions.backToCourses')}
                    </Link>
                </div>
            </div>
        );
    }

    if (!course) return null;
    const isPaid = (course.price ?? 0) > 0;

    return (
        <div className="min-h-screen bg-background text-foreground pb-20">
            {/* Hero Section */}
            <div className="relative h-[400px] w-full overflow-hidden">
                {course.thumbnail ? (
                    <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="absolute inset-0 h-full w-full object-cover opacity-60"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-900/20 to-black flex items-center justify-center">
                        <span className="text-muted-foreground/30 font-black text-9xl">{t('courseDetail.hero.academyFallback')}</span>
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 max-w-7xl mx-auto w-full">
                    <Link href="/courses" className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-all group w-fit">
                        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        {t('courseDetail.actions.backToCourses')}
                    </Link>
                    <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter italic">
                        {course.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-6 text-sm md:text-base">
                        <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-md">
                            <Users className="h-4 w-4 text-purple-400" />
                            <span className="font-medium">{(course.instructor as any).name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                            <span>{t('courseDetail.meta.modulesCount', { count: course.modules.length })}</span>
                        </div>
                        <Badge className="bg-primary text-white hover:bg-primary border-none text-lg px-4 py-1">
                            ${course.price}
                        </Badge>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-7xl mx-auto px-8 md:px-16 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-12">
                    <section>
                        <h2 className="text-2xl font-bold mb-4 border-l-4 border-primary pl-4">{t('courseDetail.labels.description')}</h2>
                        <p className="text-muted-foreground leading-relaxed text-lg italic">
                            {course.description}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-6 border-l-4 border-primary pl-4 uppercase tracking-widest">{t('courseDetail.labels.syllabus')}</h2>
                        <div className="space-y-4">
                            {course.modules.length === 0 ? (
                                <p className="text-muted-foreground italic">{t('courseDetail.labels.curriculumUpdating')}</p>
                            ) : (
                                course.modules.sort((a, b) => a.order - b.order).map((module, idx) => (
                                    <Card key={module._id} className="bg-white/5 border-white/10 overflow-hidden glass-hover">
                                        <CardHeader className="py-4 bg-white/[0.02]">
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-lg font-bold italic flex items-center gap-3">
                                                    <span className="text-primary/40">0{idx + 1}</span>
                                                    {module.title}
                                                </CardTitle>
                                                <Badge variant="outline" className="border-white/10 text-muted-foreground">
                                                    {t('courseDetail.meta.lessonsCount', { count: module.lessons.length })}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-4 space-y-3">
                                            {module.lessons.sort((a, b) => a.order - b.order).map((lesson) => (
                                                <div key={lesson._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-all text-muted-foreground hover:text-foreground group">
                                                    <PlayCircle className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                                                    <span className="text-sm font-medium">{lesson.title}</span>
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </section>
                </div>

                {/* Sidebar Action */}
                <div className="lg:col-span-1">
                    <Card className="bg-white/5 border-white/10 sticky top-24 overflow-hidden border-t-primary/20">
                        <div className="p-8 space-y-6">
                            <div className="space-y-2">
                                <h3 className="text-3xl font-black italic tracking-tight">${course.price}</h3>
                                <p className="text-sm text-muted-foreground">
                                    {isPaid ? t('courseDetail.labels.pricePaidNote') : t('courseDetail.labels.priceFreeNote')}
                                </p>
                            </div>

                            <div className="space-y-4">
                                {isEnrolled ? (
                                    <Link href={`/student/courses/${course._id}`} className="block">
                                        <Button className="w-full h-14 bg-green-500 hover:bg-green-600 text-black font-black text-lg skew-x-[-12deg] transition-all">
                                            <span className="skew-x-[12deg] flex items-center gap-2">
                                                <GraduationCap className="h-6 w-6" />
                                                {t('courseDetail.actions.continueLearning')}
                                            </span>
                                        </Button>
                                    </Link>
                                ) : isPaid ? (
                                    <a
                                        href={ADMIN_TELEGRAM_URL}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="block"
                                    >
                                        <Button className="w-full h-14 bg-white hover:bg-white/90 text-black font-black text-lg skew-x-[-12deg] transition-all">
                                            <span className="skew-x-[12deg] flex items-center gap-2 uppercase">
                                                {t('courseDetail.actions.contactAdminToBuy')}
                                            </span>
                                        </Button>
                                    </a>
                                ) : (
                                    <Button
                                        onClick={handleEnroll}
                                        disabled={enrolling}
                                        className="w-full h-14 bg-white hover:bg-white/90 text-black font-black text-lg skew-x-[-12deg] transition-all disabled:opacity-50"
                                    >
                                        <span className="skew-x-[12deg] flex items-center gap-2 uppercase">
                                            {enrolling
                                                ? t('courseDetail.actions.processing')
                                                : (isAuthenticated ? t('courseDetail.actions.enrollNow') : t('courseDetail.actions.loginToEnroll'))
                                            }
                                        </span>
                                    </Button>
                                )}
                                {isPaid && !isEnrolled ? (
                                    <p className="text-xs text-muted-foreground text-center">
                                        {t('courseDetail.labels.paidAccessNote')}
                                    </p>
                                ) : null}
                            </div>

                            <div className="space-y-4 pt-6 border-t border-white/10">
                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                    <CheckCircle className="h-4 w-4 text-primary" />
                                    <span>{t('courseDetail.labels.featureLifetime')}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                    <CheckCircle className="h-4 w-4 text-primary" />
                                    <span>{t('courseDetail.labels.featureDownloadable')}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                    <CheckCircle className="h-4 w-4 text-primary" />
                                    <span>{t('courseDetail.labels.featureCertificate')}</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
