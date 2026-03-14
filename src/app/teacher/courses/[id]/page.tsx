'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { IAssignment, ICourse, UserRole } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
    ArrowLeft,
    Plus,
    Save,
    BookOpen,
    ListChecks,
    PlayCircle,
    CalendarDays
} from 'lucide-react';

export default function TeacherCourseEditor() {
    const params = useParams();
    const router = useRouter();
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const courseId = params.id as string;

    const [course, setCourse] = useState<ICourse | null>(null);
    const [assignments, setAssignments] = useState<IAssignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [savingCourse, setSavingCourse] = useState(false);
    const [creatingModule, setCreatingModule] = useState(false);
    const [creatingAssignment, setCreatingAssignment] = useState(false);

    const [courseForm, setCourseForm] = useState({
        title: '',
        description: '',
        price: '',
        thumbnail: '',
        isPublished: false,
    });

    const [moduleForm, setModuleForm] = useState({
        title: '',
        order: 1,
    });

    type LessonForm = {
        title: string;
        description: string;
        videoUrl: string;
        content: string;
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

    useEffect(() => {
        if (!authLoading && (!isAuthenticated || !canEdit)) {
            router.push('/login?redirect=/teacher/dashboard');
            return;
        }

        const loadData = async () => {
            try {
                const authHeaders = getAuthHeaders();
                const [courseRes, assignmentsRes] = await Promise.all([
                    fetch(`/api/courses/${courseId}`, { headers: authHeaders }),
                    fetch(`/api/assignments?courseId=${courseId}`, { headers: authHeaders }),
                ]);

                if (courseRes.ok) {
                    const data = await courseRes.json();
                    setCourse(data);
                    setCourseForm({
                        title: data.title || '',
                        description: data.description || '',
                        price: String(data.price ?? ''),
                        thumbnail: data.thumbnail || '',
                        isPublished: !!data.isPublished,
                    });
                    const nextOrder = data.modules?.length ? data.modules.length + 1 : 1;
                    setModuleForm((prev) => ({ ...prev, order: nextOrder }));
                }

                if (assignmentsRes.ok) {
                    const data = await assignmentsRes.json();
                    setAssignments(Array.isArray(data) ? data : []);
                }
            } catch (error) {
                console.error('Failed to load course editor data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (isAuthenticated && courseId) {
            loadData();
        }
    }, [authLoading, canEdit, courseId, isAuthenticated, router]);

    const refreshCourse = async () => {
        const courseRes = await fetch(`/api/courses/${courseId}`, { headers: getAuthHeaders() });
        if (courseRes.ok) {
            const data = await courseRes.json();
            setCourse(data);
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
                alert(data.message || 'Failed to update course');
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
                    order: Number(moduleForm.order),
                }),
            });

            if (res.ok) {
                setModuleForm({ title: '', order: moduleForm.order + 1 });
                await refreshCourse();
            } else {
                const data = await res.json();
                alert(data.message || 'Failed to add module');
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
                description: '',
                videoUrl: '',
                content: '',
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
            const module = course?.modules.find((m) => m._id === moduleId);
            const nextOrder = module ? module.lessons.length + 1 : 1;
            const res = await fetch(`/api/modules/${moduleId}/lessons`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({
                    title: form.title,
                    description: form.description,
                    videoUrl: form.videoUrl,
                    content: form.content,
                    order: nextOrder,
                }),
            });

            if (res.ok) {
                handleLessonChange(moduleId, {
                    title: '',
                    description: '',
                    videoUrl: '',
                    content: '',
                });
                await refreshCourse();
            } else {
                const data = await res.json();
                alert(data.message || 'Failed to add lesson');
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
                alert(data.message || 'Failed to add test');
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
                alert(data.message || 'Failed to create assignment');
            }
        } catch (error) {
            console.error('Create assignment failed:', error);
        } finally {
            setCreatingAssignment(false);
        }
    };

    if (loading || authLoading) {
        return (
            <div className="min-h-screen bg-background text-foreground p-8 flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-2 border-white/20 border-t-white rounded-full"></div>
            </div>
        );
    }

    if (!course) return null;

    return (
        <div className="min-h-screen bg-background text-foreground py-12 px-6 md:px-12 space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <Link href="/teacher/dashboard" className="text-muted-foreground hover:text-foreground flex items-center gap-2 w-fit group transition-all">
                        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Dashboard
                    </Link>
                    <h1 className="text-4xl font-black italic tracking-tighter uppercase flex items-center gap-3">
                        <BookOpen className="h-9 w-9 text-primary" />
                        Edit Course
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    <Badge className={`border-none ${course.isPublished ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-muted-foreground'}`}>
                        {course.isPublished ? 'Published' : 'Draft'}
                    </Badge>
                    {courseForm.isPublished ? (
                        <Button
                            type="button"
                            onClick={() => handlePublishToggle(false)}
                            disabled={savingCourse}
                            className="bg-white/10 hover:bg-white/20 text-foreground border border-white/10"
                        >
                            Unpublish
                        </Button>
                    ) : (
                        <Button
                            type="button"
                            onClick={() => handlePublishToggle(true)}
                            disabled={savingCourse}
                            className="bg-green-500 hover:bg-green-600 text-black font-semibold"
                        >
                            Publish Now
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="bg-white/5 border-white/10 lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Course Basics</CardTitle>
                        <CardDescription>Update the public info and publish state.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCourseSave} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Title</label>
                                <input
                                    value={courseForm.title}
                                    onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                                    className="w-full bg-card border border-white/10 rounded-lg py-3 px-4 text-sm focus:outline-none focus:border-primary/50 transition-all text-foreground placeholder-muted-foreground"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Description</label>
                                <textarea
                                    value={courseForm.description}
                                    onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                                    className="w-full bg-card border border-white/10 rounded-lg p-4 text-sm focus:outline-none focus:border-primary/50 transition-all h-28 resize-none text-foreground placeholder-muted-foreground"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Price</label>
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
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Publish</label>
                                    <button
                                        type="button"
                                        onClick={() => handlePublishToggle(!courseForm.isPublished)}
                                        className={`w-full h-11 rounded-lg text-sm font-semibold transition-all ${courseForm.isPublished ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-muted-foreground'}`}
                                    >
                                        {courseForm.isPublished ? 'Published' : 'Draft'}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Thumbnail URL</label>
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
                                className="w-full h-12 bg-white hover:bg-white/90 text-black font-black text-lg skew-x-[-12deg] transition-all disabled:opacity-50"
                            >
                                <span className="skew-x-[12deg] flex items-center justify-center gap-2">
                                    <Save className="h-5 w-5" />
                                    {savingCourse ? 'SAVING...' : 'SAVE CHANGES'}
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
                                Curriculum Builder
                            </CardTitle>
                            <CardDescription>Create modules and lessons for your students.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <form onSubmit={handleAddModule} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <input
                                    value={moduleForm.title}
                                    onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                                    placeholder="New module title"
                                    className="md:col-span-2 bg-card border border-white/10 rounded-lg py-3 px-4 text-sm focus:outline-none focus:border-primary/50 transition-all text-foreground placeholder-muted-foreground"
                                    required
                                />
                                <Button
                                    type="submit"
                                    disabled={creatingModule}
                                    className="h-12 bg-white text-black font-semibold hover:bg-white/90 transition-all"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    {creatingModule ? 'Adding...' : 'Add Module'}
                                </Button>
                            </form>

                            <div className="space-y-4">
                                {course.modules.length === 0 && (
                                    <div className="text-muted-foreground italic">No modules yet. Add your first module above.</div>
                                )}
                                {course.modules.sort((a, b) => a.order - b.order).map((module) => {
                                    const testForm = testForms[module._id] || { title: '', questions: [] };
                                    return (
                                        <div key={module._id} className="border border-white/10 rounded-2xl overflow-hidden">
                                            <div className="px-4 py-3 bg-white/[0.03] flex items-center justify-between">
                                                <div className="font-semibold">{module.title}</div>
                                                <Badge variant="outline" className="border-white/10 text-muted-foreground">
                                                    {module.lessons.length} Lessons
                                                </Badge>
                                            </div>
                                            <div className="p-4 space-y-6">
                                                <div className="space-y-3">
                                                    {module.lessons.length === 0 && (
                                                        <div className="text-xs text-muted-foreground italic">No lessons yet.</div>
                                                    )}
                                                    {module.lessons.sort((a, b) => a.order - b.order).map((lesson) => (
                                                        <div key={lesson._id} className="flex items-center gap-3 text-sm text-muted-foreground">
                                                            <PlayCircle className="h-4 w-4 text-primary/70" />
                                                            <span>{lesson.title}</span>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    <input
                                                        value={lessonForms[module._id]?.title || ''}
                                                        onChange={(e) => handleLessonChange(module._id, { title: e.target.value })}
                                                        placeholder="Lesson title"
                                                        className="bg-card border border-white/10 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-primary/50 transition-all text-foreground placeholder-muted-foreground"
                                                    />
                                                    <input
                                                        value={lessonForms[module._id]?.videoUrl || ''}
                                                        onChange={(e) => handleLessonChange(module._id, { videoUrl: e.target.value })}
                                                        placeholder="Vimeo or YouTube URL (optional)"
                                                        className="bg-card border border-white/10 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-primary/50 transition-all text-foreground placeholder-muted-foreground"
                                                    />
                                                    <p className="md:col-span-2 text-xs text-muted-foreground">
                                                        Only Vimeo or YouTube links are supported.
                                                    </p>
                                                    <textarea
                                                        value={lessonForms[module._id]?.description || ''}
                                                        onChange={(e) => handleLessonChange(module._id, { description: e.target.value })}
                                                        placeholder="Lesson description"
                                                        className="md:col-span-2 bg-card border border-white/10 rounded-lg p-3 text-sm focus:outline-none focus:border-primary/50 transition-all h-20 resize-none text-foreground placeholder-muted-foreground"
                                                    />
                                                    <textarea
                                                        value={lessonForms[module._id]?.content || ''}
                                                        onChange={(e) => handleLessonChange(module._id, { content: e.target.value })}
                                                        placeholder="Lesson notes / content"
                                                        className="md:col-span-2 bg-card border border-white/10 rounded-lg p-3 text-sm focus:outline-none focus:border-primary/50 transition-all h-24 resize-none text-foreground placeholder-muted-foreground"
                                                    />
                                                    <Button
                                                        type="button"
                                                        onClick={() => handleAddLesson(module._id)}
                                                        className="md:col-span-2 h-11 bg-white text-black font-semibold hover:bg-white/90 transition-all"
                                                    >
                                                        <Plus className="h-4 w-4 mr-2" />
                                                        Add Lesson
                                                    </Button>
                                                </div>

                                                <div className="border-t border-white/10 pt-5 space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="font-semibold">Module Tests</div>
                                                        <Badge variant="outline" className="border-white/10 text-muted-foreground">
                                                            {module.tests?.length || 0} Tests
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
                                                                    <span className="text-muted-foreground/60">({test.questions.length} Q)</span>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="text-xs text-muted-foreground italic">No tests yet.</div>
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
                                                            placeholder="Test title"
                                                            className="bg-card border border-white/10 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-primary/50 transition-all text-foreground placeholder-muted-foreground"
                                                        />

                                                        {testForm.questions.map((question, qIdx) => (
                                                            <div key={qIdx} className="border border-white/10 rounded-xl p-3 space-y-3">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                                                                        Question {qIdx + 1}
                                                                    </div>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleRemoveTestQuestion(module._id, qIdx)}
                                                                        className="text-xs text-red-400 hover:text-red-300"
                                                                    >
                                                                        Remove
                                                                    </button>
                                                                </div>
                                                                <input
                                                                    value={question.prompt}
                                                                    onChange={(e) =>
                                                                        handleTestQuestionChange(module._id, qIdx, { prompt: e.target.value })
                                                                    }
                                                                    placeholder="Question prompt"
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
                                                                                placeholder={`Option ${optIdx + 1}`}
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
                                                                                    Remove
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
                                                                        Add Option
                                                                    </button>
                                                                    <div className="text-xs text-muted-foreground">
                                                                        Correct option:
                                                                    </div>
                                                                    <select
                                                                        value={question.correctIndex}
                                                                        onChange={(e) =>
                                                                            handleTestQuestionChange(module._id, qIdx, {
                                                                                correctIndex: Number(e.target.value),
                                                                            })
                                                                        }
                                                                        className="bg-card border border-white/10 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-primary/50 transition-all text-foreground"
                                                                    >
                                                                        {question.options.map((_, optIdx) => (
                                                                            <option key={optIdx} value={optIdx}>
                                                                                Option {optIdx + 1}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                            </div>
                                                        ))}

                                                        <div className="flex flex-col md:flex-row gap-3">
                                                            <Button
                                                                type="button"
                                                                onClick={() => handleAddTestQuestion(module._id)}
                                                                className="bg-white/10 hover:bg-white/20 text-foreground border border-white/10"
                                                            >
                                                                Add Question
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                onClick={() => handleSaveTest(module._id)}
                                                                className="bg-white text-black font-semibold hover:bg-white/90"
                                                            >
                                                                Save Test
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
                                Assignments
                            </CardTitle>
                            <CardDescription>Create tasks and track upcoming deadlines.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <form onSubmit={handleCreateAssignment} className="space-y-4">
                                <input
                                    value={assignmentForm.title}
                                    onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
                                    placeholder="Assignment title"
                                    className="w-full bg-card border border-white/10 rounded-lg py-3 px-4 text-sm focus:outline-none focus:border-primary/50 transition-all text-foreground placeholder-muted-foreground"
                                    required
                                />
                                <textarea
                                    value={assignmentForm.description}
                                    onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })}
                                    placeholder="Assignment description"
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
                                    className="w-full h-11 bg-white text-black font-semibold hover:bg-white/90 transition-all"
                                >
                                    {creatingAssignment ? 'Creating...' : 'Create Assignment'}
                                </Button>
                            </form>

                            <div className="space-y-3">
                                {assignments.length === 0 && (
                                    <div className="text-xs text-muted-foreground italic">No assignments yet.</div>
                                )}
                                {assignments.map((assignment) => (
                                    <div key={assignment._id} className="flex flex-col md:flex-row md:items-center justify-between gap-2 border border-white/10 rounded-xl p-4">
                                        <div>
                                            <div className="font-semibold">{assignment.title}</div>
                                            <div className="text-xs text-muted-foreground">Due {new Date(assignment.dueDate).toLocaleDateString()}</div>
                                        </div>
                                        <Link href={`/teacher/assignments/${assignment._id}`} className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">
                                            View Submissions
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
