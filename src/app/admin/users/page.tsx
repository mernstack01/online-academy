'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/LanguageContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { Users, Shield, GraduationCap } from 'lucide-react';
import { UserRole } from '@/types';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface UserOption {
    _id: string;
    name: string;
    email: string;
}

interface UserForm {
    id?: string;
    name: string;
    email: string;
    password: string;
}

const emptyForm: UserForm = { name: '', email: '', password: '' };

export default function AdminUsersPage() {
    const { isAuthenticated, user, loading: authLoading } = useAuth();
    const { t } = useI18n();
    const router = useRouter();

    const [teachers, setTeachers] = useState<UserOption[]>([]);
    const [teacherLoading, setTeacherLoading] = useState(false);
    const [teacherCreateForm, setTeacherCreateForm] = useState<UserForm>(emptyForm);
    const [teacherEditForm, setTeacherEditForm] = useState<UserForm>({ id: '', ...emptyForm });
    const [teacherEditOpen, setTeacherEditOpen] = useState(false);
    const [teacherDeleteOpen, setTeacherDeleteOpen] = useState(false);
    const [teacherDeleteTarget, setTeacherDeleteTarget] = useState<UserOption | null>(null);

    const [students, setStudents] = useState<UserOption[]>([]);
    const [studentLoading, setStudentLoading] = useState(false);
    const [studentCreateForm, setStudentCreateForm] = useState<UserForm>(emptyForm);
    const [studentEditForm, setStudentEditForm] = useState<UserForm>({ id: '', ...emptyForm });
    const [studentEditOpen, setStudentEditOpen] = useState(false);
    const [studentDeleteOpen, setStudentDeleteOpen] = useState(false);
    const [studentDeleteTarget, setStudentDeleteTarget] = useState<UserOption | null>(null);
    const [studentQuery, setStudentQuery] = useState('');

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
            router.push('/login?redirect=/admin/users');
            return;
        }

        const fetchTeachers = async () => {
            setTeacherLoading(true);
            try {
                const res = await fetch('/api/admin/teachers', { headers: getAuthHeaders() });
                if (res.ok) {
                    const data = await res.json();
                    setTeachers(Array.isArray(data) ? data : []);
                }
            } catch (error) {
                console.error('Failed to fetch mentors:', error);
            } finally {
                setTeacherLoading(false);
            }
        };

        if (isAuthenticated) {
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
                    ? `/api/admin/students?q=${encodeURIComponent(query)}&limit=50`
                    : '/api/admin/students?limit=50';
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

    const resetTeacherCreateForm = () => {
        setTeacherCreateForm(emptyForm);
    };

    const resetTeacherEditForm = () => {
        setTeacherEditForm({ id: '', ...emptyForm });
    };

    const resetStudentCreateForm = () => {
        setStudentCreateForm(emptyForm);
    };

    const resetStudentEditForm = () => {
        setStudentEditForm({ id: '', ...emptyForm });
    };

    const refreshTeachers = async () => {
        setTeacherLoading(true);
        try {
            const res = await fetch('/api/admin/teachers', { headers: getAuthHeaders() });
            if (res.ok) {
                const data = await res.json();
                setTeachers(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Failed to fetch mentors:', error);
        } finally {
            setTeacherLoading(false);
        }
    };

    const refreshStudents = async () => {
        setStudentLoading(true);
        try {
            const url = studentQuery.trim()
                ? `/api/admin/students?q=${encodeURIComponent(studentQuery.trim())}&limit=50`
                : '/api/admin/students?limit=50';
            const res = await fetch(url, { headers: getAuthHeaders() });
            if (res.ok) {
                const data = await res.json();
                setStudents(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Failed to fetch students:', error);
        } finally {
            setStudentLoading(false);
        }
    };

    const handleTeacherCreate = async (e: FormEvent) => {
        e.preventDefault();
        const name = teacherCreateForm.name.trim();
        const email = teacherCreateForm.email.trim();
        const password = teacherCreateForm.password;

        if (!name || !email || !password) {
            toast.error(t('adminUsers.mentors.validationCreate'));
            return;
        }

        try {
            const res = await fetch('/api/admin/teachers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(data.message || t('adminUsers.mentors.createFailed'));
            }

            toast.success(t('adminUsers.mentors.createSuccess'));
            resetTeacherCreateForm();
            await refreshTeachers();
        } catch (error: any) {
            toast.error(error.message || t('adminUsers.mentors.createFailed'));
        }
    };

    const handleTeacherEdit = (teacher: UserOption) => {
        setTeacherEditForm({ id: teacher._id, name: teacher.name, email: teacher.email, password: '' });
        setTeacherEditOpen(true);
    };

    const handleTeacherUpdate = async (e: FormEvent) => {
        e.preventDefault();
        const name = teacherEditForm.name.trim();
        const email = teacherEditForm.email.trim();
        const password = teacherEditForm.password;

        if (!teacherEditForm.id || !name || !email) {
            toast.error(t('adminUsers.mentors.validationUpdate'));
            return;
        }

        try {
            const res = await fetch(`/api/admin/teachers/${teacherEditForm.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({
                    name,
                    email,
                    ...(password ? { password } : {}),
                }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(data.message || t('adminUsers.mentors.updateFailed'));
            }
            toast.success(t('adminUsers.mentors.updateSuccess'));
            setTeacherEditOpen(false);
            resetTeacherEditForm();
            await refreshTeachers();
        } catch (error: any) {
            toast.error(error.message || t('adminUsers.mentors.updateFailed'));
        }
    };

    const handleTeacherDeleteConfirm = async () => {
        if (!teacherDeleteTarget) return;
        try {
            const res = await fetch(`/api/admin/teachers/${teacherDeleteTarget._id}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(data.message || t('adminUsers.mentors.deleteFailed'));
            }
            setTeachers((prev) => prev.filter((t) => t._id !== teacherDeleteTarget._id));
            toast.success(t('adminUsers.mentors.deleteSuccess'));
        } catch (error: any) {
            toast.error(error.message || t('adminUsers.mentors.deleteFailed'));
        } finally {
            setTeacherDeleteOpen(false);
            setTeacherDeleteTarget(null);
        }
    };

    const handleStudentCreate = async (e: FormEvent) => {
        e.preventDefault();
        const name = studentCreateForm.name.trim();
        const email = studentCreateForm.email.trim();
        const password = studentCreateForm.password;

        if (!name || !email || !password) {
            toast.error(t('adminUsers.students.validationCreate'));
            return;
        }

        try {
            const res = await fetch('/api/admin/students', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(data.message || t('adminUsers.students.createFailed'));
            }

            toast.success(t('adminUsers.students.createSuccess'));
            resetStudentCreateForm();
            await refreshStudents();
        } catch (error: any) {
            toast.error(error.message || t('adminUsers.students.createFailed'));
        }
    };

    const handleStudentEdit = (student: UserOption) => {
        setStudentEditForm({ id: student._id, name: student.name, email: student.email, password: '' });
        setStudentEditOpen(true);
    };

    const handleStudentUpdate = async (e: FormEvent) => {
        e.preventDefault();
        const name = studentEditForm.name.trim();
        const email = studentEditForm.email.trim();
        const password = studentEditForm.password;

        if (!studentEditForm.id || !name || !email) {
            toast.error(t('adminUsers.students.validationUpdate'));
            return;
        }

        try {
            const res = await fetch(`/api/admin/students/${studentEditForm.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({
                    name,
                    email,
                    ...(password ? { password } : {}),
                }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(data.message || t('adminUsers.students.updateFailed'));
            }
            toast.success(t('adminUsers.students.updateSuccess'));
            setStudentEditOpen(false);
            resetStudentEditForm();
            await refreshStudents();
        } catch (error: any) {
            toast.error(error.message || t('adminUsers.students.updateFailed'));
        }
    };

    const handleStudentDeleteConfirm = async () => {
        if (!studentDeleteTarget) return;
        try {
            const res = await fetch(`/api/admin/students/${studentDeleteTarget._id}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(data.message || t('adminUsers.students.deleteFailed'));
            }
            setStudents((prev) => prev.filter((s) => s._id !== studentDeleteTarget._id));
            toast.success(t('adminUsers.students.deleteSuccess'));
        } catch (error: any) {
            toast.error(error.message || t('adminUsers.students.deleteFailed'));
        } finally {
            setStudentDeleteOpen(false);
            setStudentDeleteTarget(null);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-background text-foreground p-8 flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-2 border-white/20 border-t-white rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground p-4 md:p-8 space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground uppercase tracking-widest">
                        <Shield className="h-4 w-4 text-primary" />
                        {t('adminUsers.badge')}
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter italic">{t('adminUsers.title')}</h1>
                    <p className="text-muted-foreground">{t('adminUsers.subtitle')}</p>
                </div>
                <div className="flex gap-3">
                    <Link
                        href="/admin"
                        className="px-4 py-2 rounded-lg bg-white/10 text-foreground text-sm font-semibold hover:bg-white/20 transition-all border border-white/10"
                    >
                        {t('adminUsers.links.backToDashboard')}
                    </Link>
                    <Link
                        href="/courses"
                        className="px-4 py-2 rounded-lg bg-foreground text-background text-sm font-semibold hover:bg-foreground/90 transition-all"
                    >
                        {t('adminUsers.links.browseCourses')}
                    </Link>
                </div>
            </div>

            <Card className="bg-white/5 border-white/10">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        {t('adminUsers.mentors.title')}
                    </CardTitle>
                    <CardDescription>{t('adminUsers.mentors.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <form onSubmit={handleTeacherCreate} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-muted-foreground ml-1">{t('adminUsers.fields.fullName')}</label>
                                <input
                                    type="text"
                                    value={teacherCreateForm.name}
                                    onChange={(e) => setTeacherCreateForm((prev) => ({ ...prev, name: e.target.value }))}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                    placeholder={t('adminUsers.fields.mentorName')}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-muted-foreground ml-1">{t('adminUsers.fields.email')}</label>
                                <input
                                    type="email"
                                    value={teacherCreateForm.email}
                                    onChange={(e) => setTeacherCreateForm((prev) => ({ ...prev, email: e.target.value }))}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                    placeholder={t('adminUsers.fields.mentorEmail')}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-muted-foreground ml-1">{t('adminUsers.fields.password')}</label>
                                <input
                                    type="password"
                                    value={teacherCreateForm.password}
                                    onChange={(e) => setTeacherCreateForm((prev) => ({ ...prev, password: e.target.value }))}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                    placeholder={t('adminUsers.fields.passwordPlaceholder')}
                                />
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    type="submit"
                                    className="w-full py-3 px-4 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary/20"
                                >
                                    {t('adminUsers.mentors.create')}
                                </button>
                                <button
                                    type="button"
                                    onClick={resetTeacherCreateForm}
                                    className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 text-foreground font-semibold rounded-xl transition-all border border-white/10"
                                >
                                    {t('adminUsers.mentors.clear')}
                                </button>
                            </div>
                        </form>

                        <div className="space-y-3">
                            {teacherLoading ? (
                                <div className="text-sm text-muted-foreground">{t('adminUsers.mentors.loading')}</div>
                            ) : teachers.length === 0 ? (
                                <div className="text-sm text-muted-foreground">{t('adminUsers.mentors.empty')}</div>
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
                                                {t('adminUsers.mentors.edit')}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setTeacherDeleteTarget(teacher);
                                                    setTeacherDeleteOpen(true);
                                                }}
                                                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all border border-red-500/20"
                                            >
                                                {t('adminUsers.mentors.delete')}
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
                    <CardTitle className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-green-400" />
                        {t('adminUsers.students.title')}
                    </CardTitle>
                    <CardDescription>{t('adminUsers.students.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <form onSubmit={handleStudentCreate} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-muted-foreground ml-1">{t('adminUsers.fields.fullName')}</label>
                                <input
                                    type="text"
                                    value={studentCreateForm.name}
                                    onChange={(e) => setStudentCreateForm((prev) => ({ ...prev, name: e.target.value }))}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                    placeholder={t('adminUsers.fields.studentName')}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-muted-foreground ml-1">{t('adminUsers.fields.email')}</label>
                                <input
                                    type="email"
                                    value={studentCreateForm.email}
                                    onChange={(e) => setStudentCreateForm((prev) => ({ ...prev, email: e.target.value }))}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                    placeholder={t('adminUsers.fields.studentEmail')}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-muted-foreground ml-1">{t('adminUsers.fields.password')}</label>
                                <input
                                    type="password"
                                    value={studentCreateForm.password}
                                    onChange={(e) => setStudentCreateForm((prev) => ({ ...prev, password: e.target.value }))}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                    placeholder={t('adminUsers.fields.passwordPlaceholder')}
                                />
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    type="submit"
                                    className="w-full py-3 px-4 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary/20"
                                >
                                    {t('adminUsers.students.create')}
                                </button>
                                <button
                                    type="button"
                                    onClick={resetStudentCreateForm}
                                    className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 text-foreground font-semibold rounded-xl transition-all border border-white/10"
                                >
                                    {t('adminUsers.students.clear')}
                                </button>
                            </div>
                        </form>

                        <div className="space-y-3">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground ml-1">{t('adminUsers.students.search')}</label>
                                <input
                                    type="text"
                                    value={studentQuery}
                                    onChange={(e) => setStudentQuery(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                    placeholder={t('adminUsers.students.searchPlaceholder')}
                                />
                            </div>

                            {studentLoading ? (
                                <div className="text-sm text-muted-foreground">{t('adminUsers.students.loading')}</div>
                            ) : students.length === 0 ? (
                                <div className="text-sm text-muted-foreground">{t('adminUsers.students.empty')}</div>
                            ) : (
                                students.map((student) => (
                                    <div
                                        key={student._id}
                                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-white/10 bg-white/5 rounded-xl px-4 py-3"
                                    >
                                        <div>
                                            <div className="text-sm font-semibold">{student.name}</div>
                                            <div className="text-xs text-muted-foreground">{student.email}</div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleStudentEdit(student)}
                                                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/10 hover:bg-white/20 transition-all border border-white/10"
                                            >
                                                {t('adminUsers.students.edit')}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setStudentDeleteTarget(student);
                                                    setStudentDeleteOpen(true);
                                                }}
                                                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all border border-red-500/20"
                                            >
                                                {t('adminUsers.students.delete')}
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Dialog
                open={teacherEditOpen}
                onOpenChange={(open) => {
                    setTeacherEditOpen(open);
                    if (!open) resetTeacherEditForm();
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('adminUsers.dialogs.editMentorTitle')}</DialogTitle>
                        <DialogDescription>{t('adminUsers.dialogs.editMentorDescription')}</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleTeacherUpdate} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-muted-foreground ml-1">{t('adminUsers.fields.fullName')}</label>
                            <input
                                type="text"
                                value={teacherEditForm.name}
                                onChange={(e) => setTeacherEditForm((prev) => ({ ...prev, name: e.target.value }))}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                placeholder={t('adminUsers.fields.mentorName')}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-muted-foreground ml-1">{t('adminUsers.fields.email')}</label>
                            <input
                                type="email"
                                value={teacherEditForm.email}
                                onChange={(e) => setTeacherEditForm((prev) => ({ ...prev, email: e.target.value }))}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                placeholder={t('adminUsers.fields.mentorEmail')}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-muted-foreground ml-1">{t('adminUsers.fields.password')}</label>
                            <input
                                type="password"
                                value={teacherEditForm.password}
                                onChange={(e) => setTeacherEditForm((prev) => ({ ...prev, password: e.target.value }))}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                placeholder={t('adminUsers.fields.keepCurrentPassword')}
                            />
                        </div>
                        <DialogFooter>
                            <button
                                type="button"
                                onClick={() => setTeacherEditOpen(false)}
                                className="w-full sm:w-auto py-2.5 px-4 bg-white/10 hover:bg-white/20 text-foreground font-semibold rounded-xl transition-all border border-white/10"
                            >
                                {t('adminUsers.dialogs.cancel')}
                            </button>
                            <button
                                type="submit"
                                className="w-full sm:w-auto py-2.5 px-4 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary/20"
                            >
                                {t('adminUsers.dialogs.save')}
                            </button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog
                open={teacherDeleteOpen}
                onOpenChange={(open) => {
                    setTeacherDeleteOpen(open);
                    if (!open) setTeacherDeleteTarget(null);
                }}
            >
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{t('adminUsers.dialogs.deleteMentorTitle')}</DialogTitle>
                        <DialogDescription>
                            {teacherDeleteTarget
                                ? t('adminUsers.dialogs.deleteMentorDescriptionNamed', { name: teacherDeleteTarget.name })
                                : t('adminUsers.dialogs.deleteMentorDescription')}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <button
                            type="button"
                            onClick={() => setTeacherDeleteOpen(false)}
                            className="w-full sm:w-auto py-2.5 px-4 bg-white/10 hover:bg-white/20 text-foreground font-semibold rounded-xl transition-all border border-white/10"
                        >
                            {t('adminUsers.dialogs.cancel')}
                        </button>
                        <button
                            type="button"
                            onClick={handleTeacherDeleteConfirm}
                            className="w-full sm:w-auto py-2.5 px-4 bg-red-500/10 text-red-400 hover:bg-red-500/20 font-semibold rounded-xl transition-all border border-red-500/20"
                        >
                            {t('adminUsers.dialogs.deleteMentorConfirm')}
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog
                open={studentEditOpen}
                onOpenChange={(open) => {
                    setStudentEditOpen(open);
                    if (!open) resetStudentEditForm();
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('adminUsers.dialogs.editStudentTitle')}</DialogTitle>
                        <DialogDescription>{t('adminUsers.dialogs.editStudentDescription')}</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleStudentUpdate} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-muted-foreground ml-1">{t('adminUsers.fields.fullName')}</label>
                            <input
                                type="text"
                                value={studentEditForm.name}
                                onChange={(e) => setStudentEditForm((prev) => ({ ...prev, name: e.target.value }))}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                placeholder={t('adminUsers.fields.studentName')}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-muted-foreground ml-1">{t('adminUsers.fields.email')}</label>
                            <input
                                type="email"
                                value={studentEditForm.email}
                                onChange={(e) => setStudentEditForm((prev) => ({ ...prev, email: e.target.value }))}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                placeholder={t('adminUsers.fields.studentEmail')}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-muted-foreground ml-1">{t('adminUsers.fields.password')}</label>
                            <input
                                type="password"
                                value={studentEditForm.password}
                                onChange={(e) => setStudentEditForm((prev) => ({ ...prev, password: e.target.value }))}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                placeholder={t('adminUsers.fields.keepCurrentPassword')}
                            />
                        </div>
                        <DialogFooter>
                            <button
                                type="button"
                                onClick={() => setStudentEditOpen(false)}
                                className="w-full sm:w-auto py-2.5 px-4 bg-white/10 hover:bg-white/20 text-foreground font-semibold rounded-xl transition-all border border-white/10"
                            >
                                {t('adminUsers.dialogs.cancel')}
                            </button>
                            <button
                                type="submit"
                                className="w-full sm:w-auto py-2.5 px-4 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary/20"
                            >
                                {t('adminUsers.dialogs.save')}
                            </button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog
                open={studentDeleteOpen}
                onOpenChange={(open) => {
                    setStudentDeleteOpen(open);
                    if (!open) setStudentDeleteTarget(null);
                }}
            >
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{t('adminUsers.dialogs.deleteStudentTitle')}</DialogTitle>
                        <DialogDescription>
                            {studentDeleteTarget
                                ? t('adminUsers.dialogs.deleteStudentDescriptionNamed', { name: studentDeleteTarget.name })
                                : t('adminUsers.dialogs.deleteStudentDescription')}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <button
                            type="button"
                            onClick={() => setStudentDeleteOpen(false)}
                            className="w-full sm:w-auto py-2.5 px-4 bg-white/10 hover:bg-white/20 text-foreground font-semibold rounded-xl transition-all border border-white/10"
                        >
                            {t('adminUsers.dialogs.cancel')}
                        </button>
                        <button
                            type="button"
                            onClick={handleStudentDeleteConfirm}
                            className="w-full sm:w-auto py-2.5 px-4 bg-red-500/10 text-red-400 hover:bg-red-500/20 font-semibold rounded-xl transition-all border border-red-500/20"
                        >
                            {t('adminUsers.dialogs.deleteStudentConfirm')}
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
