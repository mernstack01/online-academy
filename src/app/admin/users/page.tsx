'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
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
            toast.error('Name, email and password are required');
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
                throw new Error(data.message || 'Failed to create mentor');
            }

            toast.success('Mentor created');
            resetTeacherCreateForm();
            await refreshTeachers();
        } catch (error: any) {
            toast.error(error.message || 'Failed to create mentor');
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
            toast.error('Name and email are required');
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
                throw new Error(data.message || 'Failed to update mentor');
            }
            toast.success('Mentor updated');
            setTeacherEditOpen(false);
            resetTeacherEditForm();
            await refreshTeachers();
        } catch (error: any) {
            toast.error(error.message || 'Failed to update mentor');
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
                throw new Error(data.message || 'Failed to delete mentor');
            }
            setTeachers((prev) => prev.filter((t) => t._id !== teacherDeleteTarget._id));
            toast.success('Mentor deleted');
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete mentor');
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
            toast.error('Name, email and password are required');
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
                throw new Error(data.message || 'Failed to create student');
            }

            toast.success('Student created');
            resetStudentCreateForm();
            await refreshStudents();
        } catch (error: any) {
            toast.error(error.message || 'Failed to create student');
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
            toast.error('Name and email are required');
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
                throw new Error(data.message || 'Failed to update student');
            }
            toast.success('Student updated');
            setStudentEditOpen(false);
            resetStudentEditForm();
            await refreshStudents();
        } catch (error: any) {
            toast.error(error.message || 'Failed to update student');
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
                throw new Error(data.message || 'Failed to delete student');
            }
            setStudents((prev) => prev.filter((s) => s._id !== studentDeleteTarget._id));
            toast.success('Student deleted');
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete student');
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
                        Admin Users
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter italic">Manage People</h1>
                    <p className="text-muted-foreground">Create and control mentor and student accounts.</p>
                </div>
                <div className="flex gap-3">
                    <Link
                        href="/admin"
                        className="px-4 py-2 rounded-lg bg-white/10 text-foreground text-sm font-semibold hover:bg-white/20 transition-all border border-white/10"
                    >
                        Back to Dashboard
                    </Link>
                    <Link
                        href="/courses"
                        className="px-4 py-2 rounded-lg bg-white text-black text-sm font-semibold hover:bg-white/90 transition-all"
                    >
                        Browse Courses
                    </Link>
                </div>
            </div>

            <Card className="bg-white/5 border-white/10">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        Mentor Management
                    </CardTitle>
                    <CardDescription>Create, update, or remove mentors.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <form onSubmit={handleTeacherCreate} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-muted-foreground ml-1">Full name</label>
                                <input
                                    type="text"
                                    value={teacherCreateForm.name}
                                    onChange={(e) => setTeacherCreateForm((prev) => ({ ...prev, name: e.target.value }))}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                    placeholder="Mentor name"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-muted-foreground ml-1">Email</label>
                                <input
                                    type="email"
                                    value={teacherCreateForm.email}
                                    onChange={(e) => setTeacherCreateForm((prev) => ({ ...prev, email: e.target.value }))}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                    placeholder="mentor@example.com"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-muted-foreground ml-1">Password</label>
                                <input
                                    type="password"
                                    value={teacherCreateForm.password}
                                    onChange={(e) => setTeacherCreateForm((prev) => ({ ...prev, password: e.target.value }))}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                    placeholder="Set a password"
                                />
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    type="submit"
                                    className="w-full py-3 px-4 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary/20"
                                >
                                    Create Mentor
                                </button>
                                <button
                                    type="button"
                                    onClick={resetTeacherCreateForm}
                                    className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 text-foreground font-semibold rounded-xl transition-all border border-white/10"
                                >
                                    Clear
                                </button>
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
                                                onClick={() => {
                                                    setTeacherDeleteTarget(teacher);
                                                    setTeacherDeleteOpen(true);
                                                }}
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
                    <CardTitle className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-green-400" />
                        Student Management
                    </CardTitle>
                    <CardDescription>Create, update, or remove students.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <form onSubmit={handleStudentCreate} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-muted-foreground ml-1">Full name</label>
                                <input
                                    type="text"
                                    value={studentCreateForm.name}
                                    onChange={(e) => setStudentCreateForm((prev) => ({ ...prev, name: e.target.value }))}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                    placeholder="Student name"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-muted-foreground ml-1">Email</label>
                                <input
                                    type="email"
                                    value={studentCreateForm.email}
                                    onChange={(e) => setStudentCreateForm((prev) => ({ ...prev, email: e.target.value }))}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                    placeholder="student@example.com"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-muted-foreground ml-1">Password</label>
                                <input
                                    type="password"
                                    value={studentCreateForm.password}
                                    onChange={(e) => setStudentCreateForm((prev) => ({ ...prev, password: e.target.value }))}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                    placeholder="Set a password"
                                />
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    type="submit"
                                    className="w-full py-3 px-4 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary/20"
                                >
                                    Create Student
                                </button>
                                <button
                                    type="button"
                                    onClick={resetStudentCreateForm}
                                    className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 text-foreground font-semibold rounded-xl transition-all border border-white/10"
                                >
                                    Clear
                                </button>
                            </div>
                        </form>

                        <div className="space-y-3">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground ml-1">Search students</label>
                                <input
                                    type="text"
                                    value={studentQuery}
                                    onChange={(e) => setStudentQuery(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                    placeholder="Type name or email"
                                />
                            </div>

                            {studentLoading ? (
                                <div className="text-sm text-muted-foreground">Loading students...</div>
                            ) : students.length === 0 ? (
                                <div className="text-sm text-muted-foreground">No students found.</div>
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
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setStudentDeleteTarget(student);
                                                    setStudentDeleteOpen(true);
                                                }}
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

            <Dialog
                open={teacherEditOpen}
                onOpenChange={(open) => {
                    setTeacherEditOpen(open);
                    if (!open) resetTeacherEditForm();
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit mentor</DialogTitle>
                        <DialogDescription>Update mentor details and save changes.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleTeacherUpdate} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-muted-foreground ml-1">Full name</label>
                            <input
                                type="text"
                                value={teacherEditForm.name}
                                onChange={(e) => setTeacherEditForm((prev) => ({ ...prev, name: e.target.value }))}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                placeholder="Mentor name"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-muted-foreground ml-1">Email</label>
                            <input
                                type="email"
                                value={teacherEditForm.email}
                                onChange={(e) => setTeacherEditForm((prev) => ({ ...prev, email: e.target.value }))}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                placeholder="mentor@example.com"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-muted-foreground ml-1">Password</label>
                            <input
                                type="password"
                                value={teacherEditForm.password}
                                onChange={(e) => setTeacherEditForm((prev) => ({ ...prev, password: e.target.value }))}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                placeholder="Leave blank to keep current"
                            />
                        </div>
                        <DialogFooter>
                            <button
                                type="button"
                                onClick={() => setTeacherEditOpen(false)}
                                className="w-full sm:w-auto py-2.5 px-4 bg-white/10 hover:bg-white/20 text-foreground font-semibold rounded-xl transition-all border border-white/10"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="w-full sm:w-auto py-2.5 px-4 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary/20"
                            >
                                Save changes
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
                        <DialogTitle>Delete mentor</DialogTitle>
                        <DialogDescription>
                            {teacherDeleteTarget
                                ? `Are you sure you want to delete ${teacherDeleteTarget.name}? This action cannot be undone.`
                                : 'Are you sure you want to delete this mentor?'}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <button
                            type="button"
                            onClick={() => setTeacherDeleteOpen(false)}
                            className="w-full sm:w-auto py-2.5 px-4 bg-white/10 hover:bg-white/20 text-foreground font-semibold rounded-xl transition-all border border-white/10"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleTeacherDeleteConfirm}
                            className="w-full sm:w-auto py-2.5 px-4 bg-red-500/10 text-red-400 hover:bg-red-500/20 font-semibold rounded-xl transition-all border border-red-500/20"
                        >
                            Delete mentor
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
                        <DialogTitle>Edit student</DialogTitle>
                        <DialogDescription>Update student details and save changes.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleStudentUpdate} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-muted-foreground ml-1">Full name</label>
                            <input
                                type="text"
                                value={studentEditForm.name}
                                onChange={(e) => setStudentEditForm((prev) => ({ ...prev, name: e.target.value }))}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                placeholder="Student name"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-muted-foreground ml-1">Email</label>
                            <input
                                type="email"
                                value={studentEditForm.email}
                                onChange={(e) => setStudentEditForm((prev) => ({ ...prev, email: e.target.value }))}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                placeholder="student@example.com"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-muted-foreground ml-1">Password</label>
                            <input
                                type="password"
                                value={studentEditForm.password}
                                onChange={(e) => setStudentEditForm((prev) => ({ ...prev, password: e.target.value }))}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                placeholder="Leave blank to keep current"
                            />
                        </div>
                        <DialogFooter>
                            <button
                                type="button"
                                onClick={() => setStudentEditOpen(false)}
                                className="w-full sm:w-auto py-2.5 px-4 bg-white/10 hover:bg-white/20 text-foreground font-semibold rounded-xl transition-all border border-white/10"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="w-full sm:w-auto py-2.5 px-4 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary/20"
                            >
                                Save changes
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
                        <DialogTitle>Delete student</DialogTitle>
                        <DialogDescription>
                            {studentDeleteTarget
                                ? `Are you sure you want to delete ${studentDeleteTarget.name}? This action cannot be undone.`
                                : 'Are you sure you want to delete this student?'}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <button
                            type="button"
                            onClick={() => setStudentDeleteOpen(false)}
                            className="w-full sm:w-auto py-2.5 px-4 bg-white/10 hover:bg-white/20 text-foreground font-semibold rounded-xl transition-all border border-white/10"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleStudentDeleteConfirm}
                            className="w-full sm:w-auto py-2.5 px-4 bg-red-500/10 text-red-400 hover:bg-red-500/20 font-semibold rounded-xl transition-all border border-red-500/20"
                        >
                            Delete student
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
