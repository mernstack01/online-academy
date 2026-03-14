'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Users, BookOpen, GraduationCap, ClipboardCheck, Shield } from 'lucide-react';
import Link from 'next/link';
import { ICourse, UserRole } from '@/types';

interface AdminStats {
    totalUsers: number;
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

export default function AdminDashboard() {
    const { isAuthenticated, user, loading: authLoading } = useAuth();
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
            setEnrollMessage({ type: 'error', text: 'Select a student and a course' });
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
                setEnrollMessage({ type: 'success', text: 'Student enrolled successfully' });
                setSelectedStudentId('');
                setEnrollCourse('');
                setStudentQuery('');
                setStudents([]);
            } else {
                setEnrollMessage({ type: 'error', text: data.message || 'Failed to enroll student' });
            }
        } catch (error: any) {
            setEnrollMessage({ type: 'error', text: error.message || 'Failed to enroll student' });
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
            setTeacherMessage({ type: 'error', text: 'Name, email and password are required' });
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
                throw new Error(data.message || 'Failed to save mentor');
            }

            setTeacherMessage({
                type: 'success',
                text: teacherForm.id ? 'Mentor updated' : 'Mentor created',
            });
            resetTeacherForm();
            const listRes = await fetch('/api/admin/teachers', { headers: getAuthHeaders() });
            if (listRes.ok) {
                const list = await listRes.json();
                setTeachers(Array.isArray(list) ? list : []);
            }
        } catch (error: any) {
            setTeacherMessage({ type: 'error', text: error.message || 'Failed to save mentor' });
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
                throw new Error(data.message || 'Failed to delete mentor');
            }
            setTeachers((prev) => prev.filter((t) => t._id !== teacherId));
            setTeacherMessage({ type: 'success', text: 'Mentor deleted' });
        } catch (error: any) {
            setTeacherMessage({ type: 'error', text: error.message || 'Failed to delete mentor' });
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
                        Admin Control Room
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter italic">Platform Overview</h1>
                    <p className="text-muted-foreground">Monitor growth, courses, and student progress in real time.</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/teacher/dashboard" className="px-4 py-2 rounded-lg bg-white text-black text-sm font-semibold hover:bg-white/90 transition-all">
                        Teacher View
                    </Link>
                    <Link href="/courses" className="px-4 py-2 rounded-lg bg-white/10 text-foreground text-sm font-semibold hover:bg-white/20 transition-all border border-white/10">
                        Browse Courses
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black">{stats.totalUsers}</div>
                    </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Courses</CardTitle>
                        <BookOpen className="h-4 w-4 text-blue-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black">{stats.totalCourses}</div>
                    </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Students</CardTitle>
                        <GraduationCap className="h-4 w-4 text-green-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black">{stats.totalStudents}</div>
                    </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Submissions</CardTitle>
                        <ClipboardCheck className="h-4 w-4 text-orange-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black">{stats.totalSubmissions}</div>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-white/5 border-white/10">
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Jump into the most common admin workflows.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row gap-4">
                    <Link href="/teacher/courses/new" className="flex-1 px-4 py-3 rounded-xl bg-white text-black font-semibold text-center hover:bg-white/90 transition-all">
                        Create New Course
                    </Link>
                    <Link href="/teacher/dashboard" className="flex-1 px-4 py-3 rounded-xl bg-white/10 text-foreground font-semibold text-center hover:bg-white/20 transition-all border border-white/10">
                        Review Teacher Stats
                    </Link>
                </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
                <CardHeader>
                    <CardTitle>Mentor Management</CardTitle>
                    <CardDescription>Create, update, or remove mentors.</CardDescription>
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
                                <label className="text-sm font-medium text-muted-foreground ml-1">Full name</label>
                                <input
                                    type="text"
                                    value={teacherForm.name}
                                    onChange={(e) => setTeacherForm((prev) => ({ ...prev, name: e.target.value }))}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                    placeholder="Mentor name"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-muted-foreground ml-1">Email</label>
                                <input
                                    type="email"
                                    value={teacherForm.email}
                                    onChange={(e) => setTeacherForm((prev) => ({ ...prev, email: e.target.value }))}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                    placeholder="mentor@example.com"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-muted-foreground ml-1">Password</label>
                                <input
                                    type="password"
                                    value={teacherForm.password}
                                    onChange={(e) => setTeacherForm((prev) => ({ ...prev, password: e.target.value }))}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                    placeholder={teacherForm.id ? 'Leave blank to keep current' : 'Set a password'}
                                />
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    type="submit"
                                    className="w-full py-3 px-4 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary/20"
                                >
                                    {teacherForm.id ? 'Update Mentor' : 'Create Mentor'}
                                </button>
                                {teacherForm.id ? (
                                    <button
                                        type="button"
                                        onClick={resetTeacherForm}
                                        className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 text-foreground font-semibold rounded-xl transition-all border border-white/10"
                                    >
                                        Cancel
                                    </button>
                                ) : null}
                            </div>
                        </form>

                        <div className="space-y-3">
                            {teacherLoading ? (
                                <div className="text-sm text-muted-foreground">Loading mentors...</div>
                            ) : teachers.length === 0 ? (
                                <div className="text-sm text-muted-foreground">No mentors yet.</div>
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
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleTeacherDelete(teacher._id)}
                                                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all border border-red-500/20"
                                            >
                                                Delete
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
                    <CardTitle>Manual Enrollment</CardTitle>
                    <CardDescription>Grant course access after payment.</CardDescription>
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
                            <label className="text-sm font-medium text-muted-foreground ml-1">Search student</label>
                            <input
                                type="text"
                                value={studentQuery}
                                onChange={(e) => setStudentQuery(e.target.value)}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                placeholder="Type name or email"
                            />

                            {studentLoading ? (
                                <div className="text-xs text-muted-foreground">Loading students...</div>
                            ) : students.length === 0 ? (
                                <div className="text-xs text-muted-foreground">No students found</div>
                            ) : null}

                            <Select
                                value={selectedStudentId}
                                onChange={(e) => setSelectedStudentId(e.target.value)}
                            >
                                <option value="">Select a student</option>
                                {students.map((student) => (
                                    <option key={student._id} value={student._id}>
                                        {student.name} — {student.email}
                                    </option>
                                ))}
                            </Select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-muted-foreground ml-1">Course</label>
                            <Select
                                value={enrollCourse}
                                onChange={(e) => setEnrollCourse(e.target.value)}
                                disabled={coursesLoading}
                            >
                                <option value="">Select a course</option>
                                {courses.map((course) => (
                                    <option key={course._id} value={course._id}>
                                        {course.title} {course.price > 0 ? `($${course.price})` : '(FREE)'}
                                    </option>
                                ))}
                            </Select>
                        </div>

                        <button
                            type="submit"
                            disabled={enrollLoading}
                            className="w-full py-3 px-4 bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary/20"
                        >
                            {enrollLoading ? 'Enrolling...' : 'Enroll Student'}
                        </button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
