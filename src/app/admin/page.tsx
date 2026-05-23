'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/LanguageContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Users, BookOpen, GraduationCap, ClipboardCheck, Shield } from 'lucide-react';
import Link from 'next/link';
import { ICourse, UserRole } from '@/types';

interface AdminStats {
    totalTeachers: number;
    totalCourses: number;
    totalStudents: number;
    totalSubmissions: number;
}

interface StudentOption {
    _id: string;
    name: string;
    email: string;
}

interface TeacherOption {
    _id: string;
    name: string;
    email: string;
}

const DISPLAY_STUDENT_COUNT_OFFSET = 70;

export default function AdminDashboard() {
    const { isAuthenticated, user, loading: authLoading } = useAuth();
    const { t } = useI18n();
    const router = useRouter();
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [enrollCourse, setEnrollCourse] = useState('');
    const [enrollLoading, setEnrollLoading] = useState(false);
    const [enrollMessage, setEnrollMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [studentQuery, setStudentQuery] = useState('');
    const [students, setStudents] = useState<StudentOption[]>([]);
    const [studentLoading, setStudentLoading] = useState(false);
    const [courses, setCourses] = useState<ICourse[]>([]);
    const [coursesLoading, setCoursesLoading] = useState(false);
    const [teachers, setTeachers] = useState<TeacherOption[]>([]);
    const [teacherLoading, setTeacherLoading] = useState(false);
    const [teacherMessage, setTeacherMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [teacherForm, setTeacherForm] = useState({
        id: '',
        name: '',
        email: '',
        password: '',
    });

    const getAuthHeaders = (): Record<string, string> => {
        if (typeof window === 'undefined') return {};
        const token = localStorage.getItem('token');
        const headers: Record<string, string> = {};
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }
        return headers;
    };

    useEffect(() => {
        if (!authLoading && (!isAuthenticated || user?.role !== UserRole.ADMIN)) {
            router.push('/login?redirect=/admin');
            return;
        }

        const fetchStats = async () => {
            try {
                const res = await fetch('/api/admin/stats');
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (error) {
                console.error('Failed to fetch admin stats:', error);
            } finally {
                setLoading(false);
            }
        };

        const fetchCourses = async () => {
            setCoursesLoading(true);
            try {
                const res = await fetch('/api/courses?includeDrafts=true', { headers: getAuthHeaders() });
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data)) {
                        setCourses(data);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch courses:', error);
            } finally {
                setCoursesLoading(false);
            }
        };

        const fetchTeachers = async () => {
            setTeacherLoading(true);
            try {
                const res = await fetch('/api/admin/teachers', { headers: getAuthHeaders() });
                if (res.ok) {
                    const data = await res.json();
                    setTeachers(Array.isArray(data) ? data : []);
                }
            } catch (error) {
                console.error('Failed to fetch teachers:', error);
            } finally {
                setTeacherLoading(false);
            }
        };

        if (isAuthenticated) {
            fetchStats();
            fetchCourses();
            fetchTeachers();
        }
    }, [authLoading, isAuthenticated, router, user]);

    useEffect(() => {
        if (!isAuthenticated || user?.role !== UserRole.ADMIN) {
            setStudents([]);
            setStudentLoading(false);
            return;
        }

        let active = true;
        setStudentLoading(true);
        const query = studentQuery.trim();
        const timer = setTimeout(async () => {
            try {
                const url = query
                    ? `/api/students?q=${encodeURIComponent(query)}&limit=50`
                    : '/api/students?limit=50';
                const res = await fetch(url, { headers: getAuthHeaders() });
                if (!active) return;
                if (res.ok) {
                    const data = await res.json();
                    setStudents(Array.isArray(data) ? data : []);
                } else {
                    setStudents([]);
                }
            } catch (error) {
                if (active) setStudents([]);
            } finally {
                if (active) setStudentLoading(false);
            }
        }, 300);

        return () => {
            active = false;
            clearTimeout(timer);
        };
    }, [studentQuery, isAuthenticated, user]);

    const handleManualEnroll = async (e: FormEvent) => {
        e.preventDefault();
        setEnrollMessage(null);
        const student = selectedStudentId.trim();
        const courseId = enrollCourse.trim();

        if (!student || !courseId) {
            setEnrollMessage({ type: 'error', text: t('adminDashboard.enrollment.validation') });
            return;
        }

        setEnrollLoading(true);
        try {
            const res = await fetch('/api/admin/enrollments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders(),
                },
                body: JSON.stringify({ studentId: student, courseId }),
            });
            const data = await res.json().catch(() => ({}));
            if (res.ok) {
                setEnrollMessage({ type: 'success', text: t('adminDashboard.enrollment.success') });
                setSelectedStudentId('');
                setEnrollCourse('');
                setStudentQuery('');
                setStudents([]);
            } else {
                setEnrollMessage({ type: 'error', text: data.message || t('adminDashboard.enrollment.failed') });
            }
        } catch (error: any) {
            setEnrollMessage({ type: 'error', text: error.message || t('adminDashboard.enrollment.failed') });
        } finally {
            setEnrollLoading(false);
        }
    };

    const resetTeacherForm = () => {
        setTeacherForm({ id: '', name: '', email: '', password: '' });
    };

    const handleTeacherSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setTeacherMessage(null);
        const name = teacherForm.name.trim();
        const email = teacherForm.email.trim();
        const password = teacherForm.password;

        if (!name || !email || (!teacherForm.id && !password)) {
            setTeacherMessage({ type: 'error', text: t('adminDashboard.mentors.validation') });
            return;
        }

        try {
            const url = teacherForm.id ? `/api/admin/teachers/${teacherForm.id}` : '/api/admin/teachers';
            const method = teacherForm.id ? 'PATCH' : 'POST';
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({
                    name,
                    email,
                    ...(password ? { password } : {}),
                }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(data.message || t('adminDashboard.mentors.saveFailed'));
            }

            setTeacherMessage({
                type: 'success',
                text: teacherForm.id ? t('adminDashboard.mentors.updateSuccess') : t('adminDashboard.mentors.createSuccess'),
            });
            resetTeacherForm();
            const listRes = await fetch('/api/admin/teachers', { headers: getAuthHeaders() });
            if (listRes.ok) {
                const list = await listRes.json();
                setTeachers(Array.isArray(list) ? list : []);
            }
        } catch (error: any) {
            setTeacherMessage({ type: 'error', text: error.message || t('adminDashboard.mentors.saveFailed') });
        }
    };

    const handleTeacherEdit = (teacher: TeacherOption) => {
        setTeacherForm({ id: teacher._id, name: teacher.name, email: teacher.email, password: '' });
    };

    const handleTeacherDelete = async (teacherId: string) => {
        setTeacherMessage(null);
        try {
            const res = await fetch(`/api/admin/teachers/${teacherId}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(data.message || t('adminDashboard.mentors.deleteFailed'));
            }
            setTeachers((prev) => prev.filter((t) => t._id !== teacherId));
            setTeacherMessage({ type: 'success', text: t('adminDashboard.mentors.deleteSuccess') });
        } catch (error: any) {
            setTeacherMessage({ type: 'error', text: error.message || t('adminDashboard.mentors.deleteFailed') });
        }
    };


    if (loading || authLoading) {
        return (
            <div className="min-h-screen bg-background text-foreground p-8 flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-2 border-white/20 border-t-white rounded-full"></div>
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div className="min-h-screen bg-background text-foreground p-4 md:p-8 space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground uppercase tracking-widest">
                        <Shield className="h-4 w-4 text-primary" />
                        {t('adminDashboard.badge')}
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter italic">{t('adminDashboard.title')}</h1>
                    <p className="text-muted-foreground">{t('adminDashboard.subtitle')}</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/teacher/dashboard" className="px-4 py-2 rounded-lg bg-foreground text-background text-sm font-semibold hover:bg-foreground/90 transition-all">
                        {t('adminDashboard.links.teacherView')}
                    </Link>
                    <Link href="/courses" className="px-4 py-2 rounded-lg bg-white/10 text-foreground text-sm font-semibold hover:bg-white/20 transition-all border border-white/10">
                        {t('adminDashboard.links.browseCourses')}
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">{t('adminDashboard.stats.teachers')}</CardTitle>
                        <Users className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black">{stats.totalTeachers}</div>
                    </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">{t('adminDashboard.stats.courses')}</CardTitle>
                        <BookOpen className="h-4 w-4 text-blue-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black">{stats.totalCourses}</div>
                    </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">{t('adminDashboard.stats.students')}</CardTitle>
                        <GraduationCap className="h-4 w-4 text-green-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black">{stats.totalStudents + DISPLAY_STUDENT_COUNT_OFFSET}</div>
                    </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">{t('adminDashboard.stats.submissions')}</CardTitle>
                        <ClipboardCheck className="h-4 w-4 text-orange-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black">{stats.totalSubmissions}</div>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-white/5 border-white/10">
                <CardHeader>
                    <CardTitle>{t('adminDashboard.quickActions.title')}</CardTitle>
                    <CardDescription>{t('adminDashboard.quickActions.description')}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row gap-4">
                    <Link href="/teacher/courses/new" className="flex-1 px-4 py-3 rounded-xl bg-foreground text-background font-semibold text-center hover:bg-foreground/90 transition-all">
                        {t('adminDashboard.quickActions.createCourse')}
                    </Link>
                    <Link href="/admin/users" className="flex-1 px-4 py-3 rounded-xl bg-white/10 text-foreground font-semibold text-center hover:bg-white/20 transition-all border border-white/10">
                        {t('adminDashboard.quickActions.manageUsers')}
                    </Link>
                    <Link href="/teacher/dashboard" className="flex-1 px-4 py-3 rounded-xl bg-white/10 text-foreground font-semibold text-center hover:bg-white/20 transition-all border border-white/10">
                        {t('adminDashboard.quickActions.reviewTeacherStats')}
                    </Link>
                </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
                <CardHeader>
                    <CardTitle>{t('adminDashboard.mentors.title')}</CardTitle>
                    <CardDescription>{t('adminDashboard.mentors.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <form onSubmit={handleTeacherSubmit} className="space-y-4">
                            {teacherMessage && (
                                <div
                                    className={
                                        teacherMessage.type === 'success'
                                            ? 'bg-green-500/10 border border-green-500/50 text-green-400 p-3 rounded-lg text-sm'
                                            : 'bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm'
                                    }
                                >
                                    {teacherMessage.text}
                                </div>
                            )}

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-muted-foreground ml-1">{t('adminDashboard.mentors.fullName')}</label>
                                <input
                                    type="text"
                                    value={teacherForm.name}
                                    onChange={(e) => setTeacherForm((prev) => ({ ...prev, name: e.target.value }))}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                    placeholder={t('adminDashboard.mentors.namePlaceholder')}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-muted-foreground ml-1">{t('auth.labels.email')}</label>
                                <input
                                    type="email"
                                    value={teacherForm.email}
                                    onChange={(e) => setTeacherForm((prev) => ({ ...prev, email: e.target.value }))}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                    placeholder="mentor@example.com"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-muted-foreground ml-1">{t('auth.labels.password')}</label>
                                <input
                                    type="password"
                                    value={teacherForm.password}
                                    onChange={(e) => setTeacherForm((prev) => ({ ...prev, password: e.target.value }))}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                    placeholder={teacherForm.id ? t('adminDashboard.mentors.passwordKeepCurrent') : t('adminDashboard.mentors.passwordPlaceholder')}
                                />
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    type="submit"
                                    className="w-full py-3 px-4 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary/20"
                                >
                                    {teacherForm.id ? t('adminDashboard.mentors.update') : t('adminDashboard.mentors.create')}
                                </button>
                                {teacherForm.id ? (
                                    <button
                                        type="button"
                                        onClick={resetTeacherForm}
                                        className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 text-foreground font-semibold rounded-xl transition-all border border-white/10"
                                    >
                                        {t('adminDashboard.mentors.cancel')}
                                    </button>
                                ) : null}
                            </div>
                        </form>

                        <div className="space-y-3">
                            {teacherLoading ? (
                                <div className="text-sm text-muted-foreground">{t('adminDashboard.mentors.loading')}</div>
                            ) : teachers.length === 0 ? (
                                <div className="text-sm text-muted-foreground">{t('adminDashboard.mentors.empty')}</div>
                            ) : (
                                teachers.map((teacher) => (
                                    <div
                                        key={teacher._id}
                                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-white/10 bg-white/5 rounded-xl px-4 py-3"
                                    >
                                        <div>
                                            <div className="text-sm font-semibold">{teacher.name}</div>
                                            <div className="text-xs text-muted-foreground">{teacher.email}</div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleTeacherEdit(teacher)}
                                                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/10 hover:bg-white/20 transition-all border border-white/10"
                                            >
                                                {t('adminDashboard.mentors.edit')}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleTeacherDelete(teacher._id)}
                                                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all border border-red-500/20"
                                            >
                                                {t('adminDashboard.mentors.delete')}
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
                <CardHeader>
                    <CardTitle>{t('adminDashboard.enrollment.title')}</CardTitle>
                    <CardDescription>{t('adminDashboard.enrollment.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleManualEnroll} className="space-y-4 max-w-xl">
                        {enrollMessage && (
                            <div
                                className={
                                    enrollMessage.type === 'success'
                                        ? 'bg-green-500/10 border border-green-500/50 text-green-400 p-3 rounded-lg text-sm'
                                        : 'bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm'
                                }
                            >
                                {enrollMessage.text}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground ml-1">{t('adminDashboard.enrollment.searchStudent')}</label>
                            <input
                                type="text"
                                value={studentQuery}
                                onChange={(e) => setStudentQuery(e.target.value)}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                placeholder={t('adminDashboard.enrollment.searchPlaceholder')}
                            />

                            {studentLoading ? (
                                <div className="text-xs text-muted-foreground">{t('adminDashboard.enrollment.loadingStudents')}</div>
                            ) : students.length === 0 ? (
                                <div className="text-xs text-muted-foreground">{t('adminDashboard.enrollment.noStudents')}</div>
                            ) : null}

                            <Select
                                value={selectedStudentId || null}
                                onValueChange={(value) => setSelectedStudentId(value ?? '')}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder={t('adminDashboard.enrollment.selectStudent')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>{t('adminDashboard.enrollment.studentsLabel')}</SelectLabel>
                                        {students.map((student) => (
                                            <SelectItem key={student._id} value={student._id}>
                                                {student.name} — {student.email}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-muted-foreground ml-1">{t('adminDashboard.enrollment.course')}</label>
                            <Select
                                value={enrollCourse || null}
                                onValueChange={(value) => setEnrollCourse(value ?? '')}
                                disabled={coursesLoading}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder={coursesLoading ? t('adminDashboard.enrollment.loadingCourses') : t('adminDashboard.enrollment.selectCourse')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>{t('adminDashboard.enrollment.coursesLabel')}</SelectLabel>
                                        {courses.map((course) => (
                                            <SelectItem key={course._id} value={course._id}>
                                                {course.title} {course.price > 0 ? `($${course.price})` : `(${t('courses.freeBadge')})`}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>

                        <button
                            type="submit"
                            disabled={enrollLoading}
                            className="w-full py-3 px-4 bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary/20"
                        >
                            {enrollLoading ? t('adminDashboard.enrollment.submitting') : t('adminDashboard.enrollment.submit')}
                        </button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
