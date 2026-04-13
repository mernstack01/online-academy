'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/LanguageContext';
import { IAssignment, ICourse, UserRole } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import {
    ArrowLeft,
    Plus,
    Save,
    BookOpen,
    ListChecks,
    PlayCircle,
    CalendarDays,
    Trash2,
    Pencil,
    Check,
    X
} from 'lucide-react';

type JsonResult<T> = {
    ok: boolean;
    data: T | null;
    message: string;
};

export default function TeacherCourseEditor() {
    const params = useParams();
    const router = useRouter();
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const { t } = useI18n();
    const courseId = params.id as string;

    const [course, setCourse] = useState<ICourse | null>(null);
    const [assignments, setAssignments] = useState<IAssignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [savingCourse, setSavingCourse] = useState(false);
    const [creatingModule, setCreatingModule] = useState(false);
    const [creatingAssignment, setCreatingAssignment] = useState(false);

    const [courseForm, setCourseForm] = useState({
        title: '',
        titleEn: '',
        description: '',
        descriptionEn: '',
        price: '',
        thumbnail: '',
        isPublished: false,
    });

    const [moduleForm, setModuleForm] = useState({
        title: '',
        titleEn: '',
        order: 1,
    });

    type LessonForm = {
        title: string;
        titleEn: string;
        description: string;
        descriptionEn: string;
        videoUrl: string;
        content: string;
        contentEn: string;
    };

    type TestQuestionForm = {
        prompt: string;
        options: string[];
        correctIndex: number;
    };

    type TestForm = {
        title: string;
        questions: TestQuestionForm[];
    };

    const [lessonForms, setLessonForms] = useState<Record<string, LessonForm>>({});
    const [testForms, setTestForms] = useState<Record<string, TestForm>>({});

    // Edit state: moduleId -> {title, titleEn} being edited
    const [editingModule, setEditingModule] = useState<Record<string, { title: string; titleEn: string }>>({});
    // Edit state: lessonId -> fields being edited
    const [editingLesson, setEditingLesson] = useState<Record<string, { title: string; titleEn: string; videoUrl: string; description: string; descriptionEn: string; content: string; contentEn: string }>>({});

    const [assignmentForm, setAssignmentForm] = useState({
        title: '',
        description: '',
        dueDate: '',
    });

    const getAuthHeaders = (): Record<string, string> => {
        if (typeof window === 'undefined') return {};
        const token = localStorage.getItem('token');
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    const canEdit = useMemo(
        () => user?.role === UserRole.TEACHER || user?.role === UserRole.ADMIN,
        [user]
    );

    const fetchJson = useCallback(async <T,>(url: string, init?: RequestInit): Promise<JsonResult<T>> => {
        try {
            const res = await fetch(url, init);
            const data = await res.json().catch(() => null);

            if (!res.ok) {
                const message =
                    data && typeof data === 'object' && 'message' in data && typeof data.message === 'string'
                        ? data.message
                        : '';

                return { ok: false, data: null, message };
            }

            return { ok: true, data: data as T, message: '' };
        } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') {
                throw error;
            }

            return {
                ok: false,
                data: null,
                message: t('teacherCourseEditor.errors.network'),
            };
        }
    }, [t]);

    useEffect(() => {
        if (!authLoading && (!isAuthenticated || !canEdit)) {
            router.push('/login?redirect=/teacher/dashboard');
            return;
        }

        const controller = new AbortController();

        const loadData = async () => {
            try {
                const authHeaders = getAuthHeaders();
                const [courseResult, assignmentsResult] = await Promise.all([
                    fetchJson<ICourse>(`/api/courses/${courseId}`, {
                        headers: authHeaders,
                        signal: controller.signal,
                    }),
                    fetchJson<IAssignment[]>(`/api/assignments?courseId=${courseId}`, {
                        headers: authHeaders,
                        signal: controller.signal,
                    }),
                ]);

                if (courseResult.ok && courseResult.data) {
                    const data = courseResult.data;
                    if (controller.signal.aborted) return;
                    setCourse(data);
                    setCourseForm({
                        title: data.title || '',
                        titleEn: (data as any).titleEn || '',
                        description: data.description || '',
                        descriptionEn: (data as any).descriptionEn || '',
                        price: String(data.price ?? ''),
                        thumbnail: data.thumbnail || '',
                        isPublished: !!data.isPublished,
                    });
                    const nextOrder = data.modules?.length ? data.modules.length + 1 : 1;
                    setModuleForm((prev) => ({ ...prev, order: nextOrder }));
                    setLoadError('');
                } else {
                    if (controller.signal.aborted) return;
                    setLoadError(courseResult.message || t('teacherCourseEditor.noAccess'));
                }

                if (assignmentsResult.ok && assignmentsResult.data) {
                    const data = assignmentsResult.data;
                    if (controller.signal.aborted) return;
                    setAssignments(Array.isArray(data) ? data : []);
                } else if (!courseResult.ok && assignmentsResult.message && !controller.signal.aborted) {
                    setLoadError(assignmentsResult.message);
                }
            } catch (error) {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return;
                }
                console.error('Failed to load course editor data:', error);
                if (!controller.signal.aborted) {
                    setLoadError(t('teacherCourseEditor.errors.network'));
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        if (isAuthenticated && courseId) {
            loadData();
        }

        return () => {
            controller.abort();
        };
    }, [authLoading, canEdit, courseId, fetchJson, isAuthenticated, router, t]);

    const refreshCourse = async () => {
        const courseRes = await fetch(`/api/courses/${courseId}`, { headers: getAuthHeaders() });
        if (courseRes.ok) {
            const data = await courseRes.json();
            setCourse(data);
            setCourseForm({
                title: data.title || '',
                titleEn: data.titleEn || '',
                description: data.description || '',
                descriptionEn: data.descriptionEn || '',
                price: String(data.price ?? ''),
                thumbnail: data.thumbnail || '',
                isPublished: !!data.isPublished,
            });
            const nextOrder = data.modules?.length ? data.modules.length + 1 : 1;
            setModuleForm((prev) => ({ ...prev, order: nextOrder }));
        }
    };

    const refreshAssignments = async () => {
        const res = await fetch(`/api/assignments?courseId=${courseId}`, { headers: getAuthHeaders() });
        if (res.ok) {
            const data = await res.json();
            setAssignments(Array.isArray(data) ? data : []);
        }
    };

    const saveCourse = async (payload: typeof courseForm) => {
        setSavingCourse(true);
        try {
            const res = await fetch(`/api/courses/${courseId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({
                    ...payload,
                    price: Number(payload.price),
                }),
            });

            if (res.ok) {
                setCourseForm(payload);
                await refreshCourse();
            } else {
                const data = await res.json();
                alert(data.message || t('teacherCourseEditor.alerts.failedUpdateCourse'));
            }
        } catch (error) {
            console.error('Course update failed:', error);
        } finally {
            setSavingCourse(false);
        }
    };

    const handleCourseSave = async (e: React.FormEvent) => {
        e.preventDefault();
        await saveCourse(courseForm);
    };

    const handlePublishToggle = async (nextState: boolean) => {
        await saveCourse({ ...courseForm, isPublished: nextState });
    };

    const handleAddModule = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!moduleForm.title) return;
        setCreatingModule(true);
        try {
            const res = await fetch(`/api/courses/${courseId}/modules`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({
                    title: moduleForm.title,
                    titleEn: moduleForm.titleEn,
                    order: Number(moduleForm.order),
                }),
            });

            if (res.ok) {
                setModuleForm({ title: '', titleEn: '', order: moduleForm.order + 1 });
                await refreshCourse();
            } else {
                const data = await res.json();
                alert(data.message || t('teacherCourseEditor.alerts.failedAddModule'));
            }
        } catch (error) {
            console.error('Add module failed:', error);
        } finally {
            setCreatingModule(false);
        }
    };

    const handleLessonChange = (moduleId: string, patch: Partial<LessonForm>) => {
        setLessonForms((prev) => {
            const current = prev[moduleId] ?? {
                title: '',
                titleEn: '',
                description: '',
                descriptionEn: '',
                videoUrl: '',
                content: '',
                contentEn: '',
            };
            return {
                ...prev,
                [moduleId]: {
                    ...current,
                    ...patch,
                },
            };
        });
    };

    const handleAddLesson = async (moduleId: string) => {
        const form = lessonForms[moduleId];
        if (!form?.title) return;

        try {
            const courseModule = course?.modules.find((m) => m._id === moduleId);
            const nextOrder = courseModule ? courseModule.lessons.length + 1 : 1;
            const res = await fetch(`/api/modules/${moduleId}/lessons`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({
                    title: form.title,
                    titleEn: form.titleEn,
                    description: form.description,
                    descriptionEn: form.descriptionEn,
                    videoUrl: form.videoUrl,
                    content: form.content,
                    contentEn: form.contentEn,
                    order: nextOrder,
                }),
            });

            if (res.ok) {
                handleLessonChange(moduleId, {
                    title: '',
                    titleEn: '',
                    description: '',
                    descriptionEn: '',
                    videoUrl: '',
                    content: '',
                    contentEn: '',
                });
                await refreshCourse();
            } else {
                const data = await res.json();
                alert(data.message || t('teacherCourseEditor.alerts.failedAddLesson'));
            }
        } catch (error) {
            console.error('Add lesson failed:', error);
        }
    };

    const updateTestForm = (moduleId: string, updater: (form: TestForm) => TestForm) => {
        setTestForms((prev) => {
            const current = prev[moduleId] || { title: '', questions: [] };
            return { ...prev, [moduleId]: updater(current) };
        });
    };

    const handleAddTestQuestion = (moduleId: string) => {
        updateTestForm(moduleId, (form) => ({
            ...form,
            questions: [
                ...form.questions,
                { prompt: '', options: ['', ''], correctIndex: 0 },
            ],
        }));
    };

    const handleRemoveTestQuestion = (moduleId: string, qIndex: number) => {
        updateTestForm(moduleId, (form) => ({
            ...form,
            questions: form.questions.filter((_, idx) => idx !== qIndex),
        }));
    };

    const handleTestQuestionChange = (moduleId: string, qIndex: number, patch: Partial<TestQuestionForm>) => {
        updateTestForm(moduleId, (form) => ({
            ...form,
            questions: form.questions.map((q, idx) => (idx === qIndex ? { ...q, ...patch } : q)),
        }));
    };

    const handleTestOptionChange = (moduleId: string, qIndex: number, optIndex: number, value: string) => {
        updateTestForm(moduleId, (form) => ({
            ...form,
            questions: form.questions.map((q, idx) => {
                if (idx !== qIndex) return q;
                const nextOptions = [...q.options];
                nextOptions[optIndex] = value;
                return { ...q, options: nextOptions };
            }),
        }));
    };

    const handleAddTestOption = (moduleId: string, qIndex: number) => {
        updateTestForm(moduleId, (form) => ({
            ...form,
            questions: form.questions.map((q, idx) => {
                if (idx !== qIndex) return q;
                if (q.options.length >= 5) return q;
                return { ...q, options: [...q.options, ''] };
            }),
        }));
    };

    const handleRemoveTestOption = (moduleId: string, qIndex: number, optIndex: number) => {
        updateTestForm(moduleId, (form) => ({
            ...form,
            questions: form.questions.map((q, idx) => {
                if (idx !== qIndex) return q;
                if (q.options.length <= 2) return q;
                const nextOptions = q.options.filter((_, oIdx) => oIdx !== optIndex);
                const nextCorrect = Math.max(0, Math.min(q.correctIndex, nextOptions.length - 1));
                return { ...q, options: nextOptions, correctIndex: nextCorrect };
            }),
        }));
    };

    const handleSaveTest = async (moduleId: string) => {
        const form = testForms[moduleId] || { title: '', questions: [] };
        if (!form.title.trim() || form.questions.length === 0) return;

        try {
            const res = await fetch(`/api/modules/${moduleId}/tests`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({
                    title: form.title.trim(),
                    questions: form.questions.map((q) => ({
                        prompt: q.prompt.trim(),
                        options: q.options.map((opt) => opt.trim()),
                        correctIndex: q.correctIndex,
                    })),
                }),
            });

            if (res.ok) {
                setTestForms((prev) => ({
                    ...prev,
                    [moduleId]: { title: '', questions: [] },
                }));
                await refreshCourse();
            } else {
                const data = await res.json();
                alert(data.message || t('teacherCourseEditor.alerts.failedAddTest'));
            }
        } catch (error) {
            console.error('Add test failed:', error);
        }
    };

    const handleCreateAssignment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!assignmentForm.title || !assignmentForm.dueDate) return;
        setCreatingAssignment(true);
        try {
            const res = await fetch('/api/assignments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({
                    courseId,
                    title: assignmentForm.title,
                    description: assignmentForm.description,
                    dueDate: assignmentForm.dueDate,
                }),
            });

            if (res.ok) {
                setAssignmentForm({ title: '', description: '', dueDate: '' });
                await refreshAssignments();
            } else {
                const data = await res.json();
                alert(data.message || t('teacherCourseEditor.alerts.failedCreateAssignment'));
            }
        } catch (error) {
            console.error('Create assignment failed:', error);
        } finally {
            setCreatingAssignment(false);
        }
    };

    const handleDeleteModule = async (moduleId: string) => {
        if (!confirm(t('teacherCourseEditor.alerts.confirmDeleteModule'))) return;
        try {
            const res = await fetch(`/api/modules/${moduleId}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });
            if (res.ok) {
                await refreshCourse();
            } else {
                const data = await res.json();
                alert(data.message || t('teacherCourseEditor.alerts.failedDeleteModule'));
            }
        } catch (error) {
            console.error('Delete module failed:', error);
        }
    };

    const handleSaveModuleTitle = async (moduleId: string) => {
        const data = editingModule[moduleId];
        if (!data?.title?.trim()) return;
        try {
            const res = await fetch(`/api/modules/${moduleId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({ title: data.title.trim(), titleEn: data.titleEn.trim() }),
            });
            if (res.ok) {
                setEditingModule((prev) => { const next = { ...prev }; delete next[moduleId]; return next; });
                await refreshCourse();
            } else {
                const data = await res.json();
                alert(data.message || t('teacherCourseEditor.alerts.failedUpdateModule'));
            }
        } catch (error) {
            console.error('Update module failed:', error);
        }
    };

    const handleDeleteLesson = async (moduleId: string, lessonId: string) => {
        if (!confirm(t('teacherCourseEditor.alerts.confirmDeleteLesson'))) return;
        try {
            const res = await fetch(`/api/modules/${moduleId}/lessons/${lessonId}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });
            if (res.ok) {
                await refreshCourse();
            } else {
                const data = await res.json();
                alert(data.message || t('teacherCourseEditor.alerts.failedDeleteLesson'));
            }
        } catch (error) {
            console.error('Delete lesson failed:', error);
        }
    };

    const handleSaveLesson = async (moduleId: string, lessonId: string) => {
        const fields = editingLesson[lessonId];
        if (!fields?.title?.trim()) return;
        try {
            const res = await fetch(`/api/modules/${moduleId}/lessons/${lessonId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({
                    title: fields.title.trim(),
                    titleEn: fields.titleEn.trim(),
                    videoUrl: fields.videoUrl,
                    description: fields.description,
                    descriptionEn: fields.descriptionEn,
                    content: fields.content,
                    contentEn: fields.contentEn,
                }),
            });
            if (res.ok) {
                setEditingLesson((prev) => { const next = { ...prev }; delete next[lessonId]; return next; });
                await refreshCourse();
            } else {
                const data = await res.json();
                alert(data.message || t('teacherCourseEditor.alerts.failedUpdateLesson'));
            }
        } catch (error) {
            console.error('Update lesson failed:', error);
        }
    };

    if (loading || authLoading) {
        return (
            <div className="min-h-screen bg-background text-foreground p-8 flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-2 border-white/20 border-t-white rounded-full"></div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen bg-background text-foreground p-8 flex items-center justify-center">
                <div className="max-w-lg text-center space-y-4">
                    <h2 className="text-2xl font-black italic">{t('teacherCourseEditor.unavailableTitle')}</h2>
                    <p className="text-muted-foreground">{loadError || t('teacherCourseEditor.unavailableMessage')}</p>
                    <Button type="button" onClick={() => router.push('/teacher/dashboard')}>
                        {t('teacherCourseEditor.backToDashboard')}
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground py-12 px-6 md:px-12 space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <Link href="/teacher/dashboard" className="text-muted-foreground hover:text-foreground flex items-center gap-2 w-fit group transition-all">
                        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        {t('teacherCourseEditor.backToDashboard')}
                    </Link>
                    <h1 className="text-4xl font-black italic tracking-tighter uppercase flex items-center gap-3">
                        <BookOpen className="h-9 w-9 text-primary" />
                        {t('teacherCourseEditor.title')}
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    <Badge className={`border-none ${course.isPublished ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-muted-foreground'}`}>
                        {course.isPublished ? t('teacherCourseEditor.status.published') : t('teacherCourseEditor.status.draft')}
                    </Badge>
                    {courseForm.isPublished ? (
                        <Button
                            type="button"
                            onClick={() => handlePublishToggle(false)}
                            disabled={savingCourse}
                            className="bg-white/10 hover:bg-white/20 text-foreground border border-white/10"
                        >
                            {t('teacherCourseEditor.actions.unpublish')}
                        </Button>
                    ) : (
                        <Button
                            type="button"
                            onClick={() => handlePublishToggle(true)}
                            disabled={savingCourse}
                            className="bg-green-500 hover:bg-green-600 text-white font-semibold"
                        >
                            {t('teacherCourseEditor.actions.publishNow')}
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="bg-white/5 border-white/10 lg:col-span-1">
                    <CardHeader>
                        <CardTitle>{t('teacherCourseEditor.basics.title')}</CardTitle>
                        <CardDescription>{t('teacherCourseEditor.basics.description')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCourseSave} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t('teacherCourseEditor.basics.titleLabel')} 🇺🇿</label>
                                <input
                                    value={courseForm.title}
                                    onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                                    className="w-full bg-card border border-white/10 rounded-lg py-3 px-4 text-sm focus:outline-none focus:border-primary/50 transition-all text-foreground placeholder-muted-foreground"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t('teacherCourseEditor.basics.titleLabel')} 🇬🇧</label>
                                <input
                                    value={courseForm.titleEn}
                                    onChange={(e) => setCourseForm({ ...courseForm, titleEn: e.target.value })}
                                    placeholder="Title in English"
                                    className="w-full bg-card border border-white/10 rounded-lg py-3 px-4 text-sm focus:outline-none focus:border-primary/50 transition-all text-foreground placeholder-muted-foreground"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t('teacherCourseEditor.basics.descriptionLabel')} 🇺🇿</label>
                                <textarea
                                    value={courseForm.description}
                                    onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                                    className="w-full bg-card border border-white/10 rounded-lg p-4 text-sm focus:outline-none focus:border-primary/50 transition-all h-24 resize-none text-foreground placeholder-muted-foreground"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t('teacherCourseEditor.basics.descriptionLabel')} 🇬🇧</label>
                                <textarea
                                    value={courseForm.descriptionEn}
                                    onChange={(e) => setCourseForm({ ...courseForm, descriptionEn: e.target.value })}
                                    placeholder="Description in English"
                                    className="w-full bg-card border border-white/10 rounded-lg p-4 text-sm focus:outline-none focus:border-primary/50 transition-all h-24 resize-none text-foreground placeholder-muted-foreground"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t('teacherCourseEditor.basics.priceLabel')}</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={courseForm.price}
                                        onChange={(e) => setCourseForm({ ...courseForm, price: e.target.value })}
                                        className="w-full bg-card border border-white/10 rounded-lg py-3 px-4 text-sm focus:outline-none focus:border-primary/50 transition-all text-foreground placeholder-muted-foreground"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t('teacherCourseEditor.basics.publishLabel')}</label>
                                    <button
                                        type="button"
                                        onClick={() => handlePublishToggle(!courseForm.isPublished)}
                                        className={`w-full h-11 rounded-lg text-sm font-semibold transition-all ${courseForm.isPublished ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-muted-foreground'}`}
                                    >
                                        {courseForm.isPublished ? t('teacherCourseEditor.status.published') : t('teacherCourseEditor.status.draft')}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t('teacherCourseEditor.basics.thumbnailLabel')}</label>
                                <input
                                    type="url"
                                    value={courseForm.thumbnail}
                                    onChange={(e) => setCourseForm({ ...courseForm, thumbnail: e.target.value })}
                                    className="w-full bg-card border border-white/10 rounded-lg py-3 px-4 text-sm focus:outline-none focus:border-primary/50 transition-all text-foreground placeholder-muted-foreground"
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={savingCourse}
                                className="w-full h-12 bg-foreground hover:bg-foreground/90 text-background font-black text-lg skew-x-[-12deg] transition-all disabled:opacity-50"
                            >
                                <span className="skew-x-[12deg] flex items-center justify-center gap-2">
                                    <Save className="h-5 w-5" />
                                    {savingCourse ? t('teacherCourseEditor.actions.saving') : t('teacherCourseEditor.actions.saveChanges')}
                                </span>
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <div className="lg:col-span-2 space-y-8">
                    <Card className="bg-white/5 border-white/10">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ListChecks className="h-5 w-5 text-primary" />
                                {t('teacherCourseEditor.curriculum.title')}
                            </CardTitle>
                            <CardDescription>{t('teacherCourseEditor.curriculum.description')}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <form onSubmit={handleAddModule} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <input
                                    value={moduleForm.title}
                                    onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                                    placeholder={`${t('teacherCourseEditor.curriculum.newModuleTitle')} 🇺🇿`}
                                    className="md:col-span-2 bg-card border border-white/10 rounded-lg py-3 px-4 text-sm focus:outline-none focus:border-primary/50 transition-all text-foreground placeholder-muted-foreground"
                                    required
                                />
                                <input
                                    value={moduleForm.titleEn}
                                    onChange={(e) => setModuleForm({ ...moduleForm, titleEn: e.target.value })}
                                    placeholder="Module title in English 🇬🇧"
                                    className="md:col-span-2 bg-card border border-white/10 rounded-lg py-3 px-4 text-sm focus:outline-none focus:border-primary/50 transition-all text-foreground placeholder-muted-foreground"
                                />
                                <Button
                                    type="submit"
                                    disabled={creatingModule}
                                    className="h-12 bg-foreground text-background font-semibold hover:bg-foreground/90 transition-all"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    {creatingModule ? t('teacherCourseEditor.actions.addingModule') : t('teacherCourseEditor.actions.addModule')}
                                </Button>
                            </form>

                            <div className="space-y-4">
                                {course.modules.length === 0 && (
                                    <div className="text-muted-foreground italic">{t('teacherCourseEditor.curriculum.noModules')}</div>
                                )}
                                {course.modules.sort((a, b) => a.order - b.order).map((module) => {
                                    const testForm = testForms[module._id] || { title: '', questions: [] };
                                    return (
                                        <div key={module._id} className="border border-white/10 rounded-2xl overflow-hidden">
                                            <div className="px-4 py-3 bg-white/[0.03] flex items-center justify-between gap-3">
                                                {editingModule[module._id] !== undefined ? (
                                                    <div className="flex items-center gap-2 flex-1 flex-wrap">
                                                        <input
                                                            value={editingModule[module._id].title}
                                                            onChange={(e) => setEditingModule((prev) => ({ ...prev, [module._id]: { ...prev[module._id], title: e.target.value } }))}
                                                            placeholder="UZ nomi"
                                                            className="flex-1 min-w-[120px] bg-card border border-primary/50 rounded-lg py-1.5 px-3 text-sm focus:outline-none text-foreground"
                                                            autoFocus
                                                        />
                                                        <input
                                                            value={editingModule[module._id].titleEn}
                                                            onChange={(e) => setEditingModule((prev) => ({ ...prev, [module._id]: { ...prev[module._id], titleEn: e.target.value } }))}
                                                            placeholder="EN title"
                                                            className="flex-1 min-w-[120px] bg-card border border-white/10 rounded-lg py-1.5 px-3 text-sm focus:outline-none focus:border-primary/50 text-foreground"
                                                        />
                                                        <button type="button" onClick={() => handleSaveModuleTitle(module._id)} className="text-green-400 hover:text-green-300">
                                                            <Check className="h-4 w-4" />
                                                        </button>
                                                        <button type="button" onClick={() => setEditingModule((prev) => { const n = { ...prev }; delete n[module._id]; return n; })} className="text-muted-foreground hover:text-foreground">
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                                        <span className="font-semibold truncate">{module.title}</span>
                                                        <button type="button" onClick={() => setEditingModule((prev) => ({ ...prev, [module._id]: { title: module.title, titleEn: (module as any).titleEn || '' } }))} className="text-muted-foreground hover:text-foreground shrink-0">
                                                            <Pencil className="h-3.5 w-3.5" />
                                                        </button>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <Badge variant="outline" className="border-white/10 text-muted-foreground">
                                                        {t('teacherCourseEditor.curriculum.lessonsCount', { count: module.lessons.length })}
                                                    </Badge>
                                                    <button type="button" onClick={() => handleDeleteModule(module._id)} className="text-red-400 hover:text-red-300">
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="p-4 space-y-6">
                                                <div className="space-y-3">
                                                    {module.lessons.length === 0 && (
                                                        <div className="text-xs text-muted-foreground italic">{t('teacherCourseEditor.curriculum.noLessons')}</div>
                                                    )}
                                                    {module.lessons.sort((a, b) => a.order - b.order).map((lesson) => (
                                                        <div key={lesson._id} className="border border-white/5 rounded-xl overflow-hidden">
                                                            {/* Lesson header row */}
                                                            <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground bg-white/[0.02]">
                                                                <PlayCircle className="h-4 w-4 text-primary/70 shrink-0" />
                                                                <span className="flex-1 truncate">{lesson.title}</span>
                                                                {editingLesson[lesson._id] === undefined && (
                                                                    <div className="flex items-center gap-1.5 shrink-0">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => setEditingLesson((prev) => ({
                                                                                ...prev,
                                                                                [lesson._id]: {
                                                                                    title: lesson.title,
                                                                                    titleEn: (lesson as any).titleEn || '',
                                                                                    videoUrl: lesson.videoUrl || '',
                                                                                    description: lesson.description || '',
                                                                                    descriptionEn: (lesson as any).descriptionEn || '',
                                                                                    content: lesson.content || '',
                                                                                    contentEn: (lesson as any).contentEn || '',
                                                                                },
                                                                            }))}
                                                                            className="text-muted-foreground hover:text-foreground"
                                                                        >
                                                                            <Pencil className="h-3.5 w-3.5" />
                                                                        </button>
                                                                        <button type="button" onClick={() => handleDeleteLesson(module._id, lesson._id)} className="text-red-400 hover:text-red-300">
                                                                            <Trash2 className="h-3.5 w-3.5" />
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Expanded edit form */}
                                                            {editingLesson[lesson._id] !== undefined && (
                                                                <div className="px-3 pb-3 pt-2 space-y-2 bg-white/[0.02]">
                                                                    <div className="grid grid-cols-2 gap-2">
                                                                        <input
                                                                            value={editingLesson[lesson._id].title}
                                                                            onChange={(e) => setEditingLesson((prev) => ({ ...prev, [lesson._id]: { ...prev[lesson._id], title: e.target.value } }))}
                                                                            placeholder={`${t('teacherCourseEditor.curriculum.lessonTitle')} 🇺🇿`}
                                                                            className="bg-card border border-primary/50 rounded-lg py-2 px-3 text-sm focus:outline-none text-foreground placeholder-muted-foreground"
                                                                            autoFocus
                                                                        />
                                                                        <input
                                                                            value={editingLesson[lesson._id].titleEn}
                                                                            onChange={(e) => setEditingLesson((prev) => ({ ...prev, [lesson._id]: { ...prev[lesson._id], titleEn: e.target.value } }))}
                                                                            placeholder="Lesson title EN 🇬🇧"
                                                                            className="bg-card border border-white/10 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-primary/50 text-foreground placeholder-muted-foreground"
                                                                        />
                                                                    </div>
                                                                    <input
                                                                        value={editingLesson[lesson._id].videoUrl}
                                                                        onChange={(e) => setEditingLesson((prev) => ({ ...prev, [lesson._id]: { ...prev[lesson._id], videoUrl: e.target.value } }))}
                                                                        placeholder={t('teacherCourseEditor.curriculum.videoUrl')}
                                                                        className="w-full bg-card border border-white/10 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-primary/50 text-foreground placeholder-muted-foreground"
                                                                    />
                                                                    <div className="grid grid-cols-2 gap-2">
                                                                        <textarea
                                                                            value={editingLesson[lesson._id].description}
                                                                            onChange={(e) => setEditingLesson((prev) => ({ ...prev, [lesson._id]: { ...prev[lesson._id], description: e.target.value } }))}
                                                                            placeholder={`${t('teacherCourseEditor.curriculum.lessonDescription')} 🇺🇿`}
                                                                            className="bg-card border border-white/10 rounded-lg p-3 text-sm focus:outline-none focus:border-primary/50 h-16 resize-none text-foreground placeholder-muted-foreground"
                                                                        />
                                                                        <textarea
                                                                            value={editingLesson[lesson._id].descriptionEn}
                                                                            onChange={(e) => setEditingLesson((prev) => ({ ...prev, [lesson._id]: { ...prev[lesson._id], descriptionEn: e.target.value } }))}
                                                                            placeholder="Description EN 🇬🇧"
                                                                            className="bg-card border border-white/10 rounded-lg p-3 text-sm focus:outline-none focus:border-primary/50 h-16 resize-none text-foreground placeholder-muted-foreground"
                                                                        />
                                                                    </div>
                                                                    <div className="grid grid-cols-2 gap-2">
                                                                        <textarea
                                                                            value={editingLesson[lesson._id].content}
                                                                            onChange={(e) => setEditingLesson((prev) => ({ ...prev, [lesson._id]: { ...prev[lesson._id], content: e.target.value } }))}
                                                                            placeholder={`${t('teacherCourseEditor.curriculum.lessonContent')} 🇺🇿`}
                                                                            className="bg-card border border-white/10 rounded-lg p-3 text-sm focus:outline-none focus:border-primary/50 h-20 resize-none text-foreground placeholder-muted-foreground"
                                                                        />
                                                                        <textarea
                                                                            value={editingLesson[lesson._id].contentEn}
                                                                            onChange={(e) => setEditingLesson((prev) => ({ ...prev, [lesson._id]: { ...prev[lesson._id], contentEn: e.target.value } }))}
                                                                            placeholder="Content EN 🇬🇧"
                                                                            className="bg-card border border-white/10 rounded-lg p-3 text-sm focus:outline-none focus:border-primary/50 h-20 resize-none text-foreground placeholder-muted-foreground"
                                                                        />
                                                                    </div>
                                                                    <div className="flex gap-2 pt-1">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleSaveLesson(module._id, lesson._id)}
                                                                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 text-xs font-semibold transition-colors"
                                                                        >
                                                                            <Check className="h-3.5 w-3.5" />
                                                                            {t('teacherCourseEditor.actions.saveChanges')}
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => setEditingLesson((prev) => { const n = { ...prev }; delete n[lesson._id]; return n; })}
                                                                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/5 text-muted-foreground hover:text-foreground text-xs font-semibold transition-colors"
                                                                        >
                                                                            <X className="h-3.5 w-3.5" />
                                                                            {t('teacherCourseEditor.actions.cancel')}
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    <input
                                                        value={lessonForms[module._id]?.title || ''}
                                                        onChange={(e) => handleLessonChange(module._id, { title: e.target.value })}
                                                        placeholder={`${t('teacherCourseEditor.curriculum.lessonTitle')} 🇺🇿`}
                                                        className="bg-card border border-white/10 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-primary/50 transition-all text-foreground placeholder-muted-foreground"
                                                    />
                                                    <input
                                                        value={lessonForms[module._id]?.titleEn || ''}
                                                        onChange={(e) => handleLessonChange(module._id, { titleEn: e.target.value })}
                                                        placeholder="Lesson title EN 🇬🇧"
                                                        className="bg-card border border-white/10 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-primary/50 transition-all text-foreground placeholder-muted-foreground"
                                                    />
                                                    <input
                                                        value={lessonForms[module._id]?.videoUrl || ''}
                                                        onChange={(e) => handleLessonChange(module._id, { videoUrl: e.target.value })}
                                                        placeholder={t('teacherCourseEditor.curriculum.videoUrl')}
                                                        className="md:col-span-2 bg-card border border-white/10 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-primary/50 transition-all text-foreground placeholder-muted-foreground"
                                                    />
                                                    <p className="md:col-span-2 text-xs text-muted-foreground">
                                                        {t('teacherCourseEditor.curriculum.videoSupport')}
                                                    </p>
                                                    <textarea
                                                        value={lessonForms[module._id]?.description || ''}
                                                        onChange={(e) => handleLessonChange(module._id, { description: e.target.value })}
                                                        placeholder={`${t('teacherCourseEditor.curriculum.lessonDescription')} 🇺🇿`}
                                                        className="bg-card border border-white/10 rounded-lg p-3 text-sm focus:outline-none focus:border-primary/50 transition-all h-20 resize-none text-foreground placeholder-muted-foreground"
                                                    />
                                                    <textarea
                                                        value={lessonForms[module._id]?.descriptionEn || ''}
                                                        onChange={(e) => handleLessonChange(module._id, { descriptionEn: e.target.value })}
                                                        placeholder="Description EN 🇬🇧"
                                                        className="bg-card border border-white/10 rounded-lg p-3 text-sm focus:outline-none focus:border-primary/50 transition-all h-20 resize-none text-foreground placeholder-muted-foreground"
                                                    />
                                                    <textarea
                                                        value={lessonForms[module._id]?.content || ''}
                                                        onChange={(e) => handleLessonChange(module._id, { content: e.target.value })}
                                                        placeholder={`${t('teacherCourseEditor.curriculum.lessonContent')} 🇺🇿`}
                                                        className="bg-card border border-white/10 rounded-lg p-3 text-sm focus:outline-none focus:border-primary/50 transition-all h-24 resize-none text-foreground placeholder-muted-foreground"
                                                    />
                                                    <textarea
                                                        value={lessonForms[module._id]?.contentEn || ''}
                                                        onChange={(e) => handleLessonChange(module._id, { contentEn: e.target.value })}
                                                        placeholder="Content EN 🇬🇧"
                                                        className="bg-card border border-white/10 rounded-lg p-3 text-sm focus:outline-none focus:border-primary/50 transition-all h-24 resize-none text-foreground placeholder-muted-foreground"
                                                    />
                                                    <Button
                                                        type="button"
                                                        onClick={() => handleAddLesson(module._id)}
                                                        className="md:col-span-2 h-11 bg-foreground text-background font-semibold hover:bg-foreground/90 transition-all"
                                                    >
                                                        <Plus className="h-4 w-4 mr-2" />
                                                        {t('teacherCourseEditor.actions.addLesson')}
                                                    </Button>
                                                </div>

                                                <div className="border-t border-white/10 pt-5 space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="font-semibold">{t('teacherCourseEditor.curriculum.testsTitle')}</div>
                                                        <Badge variant="outline" className="border-white/10 text-muted-foreground">
                                                            {t('teacherCourseEditor.curriculum.testsCount', { count: module.tests?.length || 0 })}
                                                        </Badge>
                                                    </div>

                                                    <div className="space-y-2">
                                                        {module.tests?.length ? (
                                                            module.tests.map((test) => (
                                                                <div
                                                                    key={test._id}
                                                                    className="flex items-center gap-3 text-xs text-muted-foreground"
                                                                >
                                                                    <PlayCircle className="h-3 w-3 text-primary/70" />
                                                                    <span>{test.title}</span>
                                                                    <span className="text-muted-foreground/60">({t('teacherCourseEditor.curriculum.questionShort', { count: test.questions.length })})</span>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="text-xs text-muted-foreground italic">{t('teacherCourseEditor.curriculum.noTests')}</div>
                                                        )}
                                                    </div>

                                                    <div className="space-y-3">
                                                        <input
                                                            value={testForm.title}
                                                            onChange={(e) =>
                                                                updateTestForm(module._id, (form) => ({
                                                                    ...form,
                                                                    title: e.target.value,
                                                                }))
                                                            }
                                                            placeholder={t('teacherCourseEditor.curriculum.testTitle')}
                                                            className="bg-card border border-white/10 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-primary/50 transition-all text-foreground placeholder-muted-foreground"
                                                        />

                                                        {testForm.questions.map((question, qIdx) => (
                                                            <div key={qIdx} className="border border-white/10 rounded-xl p-3 space-y-3">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                                                                        {t('teacherCourseEditor.curriculum.question', { index: qIdx + 1 })}
                                                                    </div>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleRemoveTestQuestion(module._id, qIdx)}
                                                                        className="text-xs text-red-400 hover:text-red-300"
                                                                    >
                                                                        {t('teacherCourseEditor.curriculum.remove')}
                                                                    </button>
                                                                </div>
                                                                <input
                                                                    value={question.prompt}
                                                                    onChange={(e) =>
                                                                        handleTestQuestionChange(module._id, qIdx, { prompt: e.target.value })
                                                                    }
                                                                    placeholder={t('teacherCourseEditor.curriculum.questionPrompt')}
                                                                    className="bg-card border border-white/10 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-primary/50 transition-all text-foreground placeholder-muted-foreground"
                                                                />
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                                    {question.options.map((option, optIdx) => (
                                                                        <div key={optIdx} className="flex items-center gap-2">
                                                                            <input
                                                                                value={option}
                                                                                onChange={(e) =>
                                                                                    handleTestOptionChange(
                                                                                        module._id,
                                                                                        qIdx,
                                                                                        optIdx,
                                                                                        e.target.value
                                                                                    )
                                                                                }
                                                                                placeholder={t('teacherCourseEditor.curriculum.option', { index: optIdx + 1 })}
                                                                                className="flex-1 bg-card border border-white/10 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-primary/50 transition-all text-foreground placeholder-muted-foreground"
                                                                            />
                                                                            {question.options.length > 2 ? (
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() =>
                                                                                        handleRemoveTestOption(module._id, qIdx, optIdx)
                                                                                    }
                                                                                    className="text-xs text-red-400 hover:text-red-300"
                                                                                >
                                                                                    {t('teacherCourseEditor.curriculum.remove')}
                                                                                </button>
                                                                            ) : null}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                <div className="flex flex-col md:flex-row md:items-center gap-3">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleAddTestOption(module._id, qIdx)}
                                                                        className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground"
                                                                    >
                                                                        {t('teacherCourseEditor.actions.addOption')}
                                                                    </button>
                                                                    <div className="text-xs text-muted-foreground">
                                                                        {t('teacherCourseEditor.curriculum.correctOption')}
                                                                    </div>
                                                                    <Select
                                                                        value={String(question.correctIndex)}
                                                                        onValueChange={(value) =>
                                                                            handleTestQuestionChange(module._id, qIdx, {
                                                                                correctIndex: Number(value),
                                                                            })
                                                                        }
                                                                    >
                                                                        <SelectTrigger className="h-9 w-40 bg-card border border-white/10 px-3 py-2 text-xs">
                                                                            <SelectValue placeholder={t('teacherCourseEditor.curriculum.selectOption')} />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {question.options.map((_, optIdx) => (
                                                                                <SelectItem key={optIdx} value={String(optIdx)}>
                                                                                    {t('teacherCourseEditor.curriculum.option', { index: optIdx + 1 })}
                                                                                </SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>
                                                            </div>
                                                        ))}

                                                        <div className="flex flex-col md:flex-row gap-3">
                                                            <Button
                                                                type="button"
                                                                onClick={() => handleAddTestQuestion(module._id)}
                                                                className="bg-white/10 hover:bg-white/20 text-foreground border border-white/10"
                                                            >
                                                                {t('teacherCourseEditor.actions.addQuestion')}
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                onClick={() => handleSaveTest(module._id)}
                                                                className="bg-white text-black font-semibold hover:bg-white/90"
                                                            >
                                                                {t('teacherCourseEditor.actions.saveTest')}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/5 border-white/10">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CalendarDays className="h-5 w-5 text-primary" />
                                {t('teacherCourseEditor.assignments.title')}
                            </CardTitle>
                            <CardDescription>{t('teacherCourseEditor.assignments.description')}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <form onSubmit={handleCreateAssignment} className="space-y-4">
                                <input
                                    value={assignmentForm.title}
                                    onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
                                    placeholder={t('teacherCourseEditor.assignments.assignmentTitle')}
                                    className="w-full bg-card border border-white/10 rounded-lg py-3 px-4 text-sm focus:outline-none focus:border-primary/50 transition-all text-foreground placeholder-muted-foreground"
                                    required
                                />
                                <textarea
                                    value={assignmentForm.description}
                                    onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })}
                                    placeholder={t('teacherCourseEditor.assignments.assignmentDescription')}
                                    className="w-full bg-card border border-white/10 rounded-lg p-3 text-sm focus:outline-none focus:border-primary/50 transition-all h-24 resize-none text-foreground placeholder-muted-foreground"
                                    required
                                />
                                <input
                                    type="date"
                                    value={assignmentForm.dueDate}
                                    onChange={(e) => setAssignmentForm({ ...assignmentForm, dueDate: e.target.value })}
                                    className="w-full bg-card border border-white/10 rounded-lg py-3 px-4 text-sm focus:outline-none focus:border-primary/50 transition-all text-foreground placeholder-muted-foreground"
                                    required
                                />
                                <Button
                                    type="submit"
                                    disabled={creatingAssignment}
                                    className="w-full h-11 bg-foreground text-background font-semibold hover:bg-foreground/90 transition-all"
                                >
                                    {creatingAssignment ? t('teacherCourseEditor.actions.creatingAssignment') : t('teacherCourseEditor.actions.createAssignment')}
                                </Button>
                            </form>

                            <div className="space-y-3">
                                {assignments.length === 0 && (
                                    <div className="text-xs text-muted-foreground italic">{t('teacherCourseEditor.assignments.noAssignments')}</div>
                                )}
                                {assignments.map((assignment) => (
                                    <div key={assignment._id} className="flex flex-col md:flex-row md:items-center justify-between gap-2 border border-white/10 rounded-xl p-4">
                                        <div>
                                            <div className="font-semibold">{assignment.title}</div>
                                            <div className="text-xs text-muted-foreground">{t('teacherCourseEditor.assignments.due', { date: new Date(assignment.dueDate).toLocaleDateString() })}</div>
                                        </div>
                                        <Link href={`/teacher/assignments/${assignment._id}`} className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">
                                            {t('teacherCourseEditor.actions.viewSubmissions')}
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
