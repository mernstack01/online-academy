'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { IAssignment, ISubmission, UserRole } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, ClipboardList, User2, Send } from 'lucide-react';

type GradeDraft = {
    grade: string;
    teacherComment: string;
};

export default function TeacherAssignmentDetail() {
    const params = useParams();
    const router = useRouter();
    const { isAuthenticated, user, loading: authLoading } = useAuth();
    const assignmentId = params.id as string;

    const [assignment, setAssignment] = useState<IAssignment | null>(null);
    const [submissions, setSubmissions] = useState<ISubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [gradingId, setGradingId] = useState<string | null>(null);
    const [drafts, setDrafts] = useState<Record<string, GradeDraft>>({});

    const getAuthHeaders = (): Record<string, string> => {
        if (typeof window === 'undefined') return {};
        const token = localStorage.getItem('token');
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    useEffect(() => {
        if (!authLoading && (!isAuthenticated || !user || (user.role !== UserRole.TEACHER && user.role !== UserRole.ADMIN))) {
            router.push('/login?redirect=/teacher/dashboard');
            return;
        }

        const loadData = async () => {
            try {
                const authHeaders = getAuthHeaders();
                const [assignmentRes, submissionsRes] = await Promise.all([
                    fetch(`/api/assignments/${assignmentId}`, { headers: authHeaders }),
                    fetch(`/api/assignments/${assignmentId}/submissions`, { headers: authHeaders }),
                ]);

                if (assignmentRes.ok) {
                    const data = await assignmentRes.json();
                    setAssignment(data);
                }
                if (submissionsRes.ok) {
                    const data = await submissionsRes.json();
                    setSubmissions(Array.isArray(data) ? data : []);
                }
            } catch (error) {
                console.error('Failed to load assignment data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (isAuthenticated && assignmentId) {
            loadData();
        }
    }, [assignmentId, authLoading, isAuthenticated, router, user]);

    const handleDraftChange = (submissionId: string, patch: Partial<GradeDraft>) => {
        setDrafts((prev) => {
            const current = prev[submissionId] ?? { grade: '', teacherComment: '' };
            return {
                ...prev,
                [submissionId]: {
                    ...current,
                    ...patch,
                },
            };
        });
    };

    const handleGrade = async (submissionId: string) => {
        const draft = drafts[submissionId];
        if (!draft?.grade) return;
        setGradingId(submissionId);
        try {
            const res = await fetch('/api/submissions/grade', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({
                    submissionId,
                    grade: Number(draft.grade),
                    teacherComment: draft.teacherComment,
                }),
            });

            if (res.ok) {
                const updated = await res.json();
                setSubmissions((prev) => prev.map((s) => (s._id === updated._id ? updated : s)));
            } else {
                const data = await res.json();
                alert(data.message || 'Failed to grade submission');
            }
        } catch (error) {
            console.error('Grade submission failed:', error);
        } finally {
            setGradingId(null);
        }
    };

    if (loading || authLoading) {
        return (
            <div className="min-h-screen bg-background text-foreground p-8 flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-2 border-white/20 border-t-white rounded-full"></div>
            </div>
        );
    }

    if (!assignment) return null;

    return (
        <div className="min-h-screen bg-background text-foreground py-12 px-6 md:px-12 space-y-8">
            <Link href="/teacher/dashboard" className="text-muted-foreground hover:text-foreground flex items-center gap-2 w-fit group transition-all">
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Back to Dashboard
            </Link>

            <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
                    <ClipboardList className="h-4 w-4 text-primary" />
                    Assignment
                </div>
                <h1 className="text-4xl font-black italic tracking-tighter">{assignment.title}</h1>
                <p className="text-muted-foreground max-w-3xl">{assignment.description}</p>
            </div>

            <Card className="bg-white/5 border-white/10">
                <CardHeader>
                    <CardTitle>Submissions</CardTitle>
                    <CardDescription>Review and grade student work.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {submissions.length === 0 && (
                        <div className="text-muted-foreground italic text-center py-10">No submissions yet.</div>
                    )}

                    {submissions.map((submission) => (
                        <div key={submission._id} className="border border-white/10 rounded-2xl p-4 space-y-4">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center text-xs">
                                        <User2 className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <div className="font-semibold">{(submission.studentId as any)?.name || 'Student'}</div>
                                        <div className="text-xs text-muted-foreground">{(submission.studentId as any)?.email}</div>
                                    </div>
                                </div>
                                <Badge className={`${submission.status === 'graded' ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-muted-foreground'} border-none`}>
                                    {submission.status === 'graded' ? `Graded • ${submission.grade ?? 0}%` : 'Pending'}
                                </Badge>
                            </div>

                            <div className="text-xs text-muted-foreground">
                                <a href={submission.fileUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
                                    View Submission Link
                                </a>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={drafts[submission._id]?.grade ?? (submission.grade !== undefined && submission.grade !== null ? String(submission.grade) : '')}
                                    onChange={(e) => handleDraftChange(submission._id, { grade: e.target.value })}
                                    placeholder="Grade (%)"
                                    className="bg-card border border-white/10 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-primary/50 transition-all text-foreground placeholder-muted-foreground"
                                />
                                <input
                                    value={drafts[submission._id]?.teacherComment ?? (submission.teacherComment || '')}
                                    onChange={(e) => handleDraftChange(submission._id, { teacherComment: e.target.value })}
                                    placeholder="Feedback (optional)"
                                    className="md:col-span-2 bg-card border border-white/10 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:border-primary/50 transition-all text-foreground placeholder-muted-foreground"
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <Link href={`/teacher/submissions/${submission._id}`} className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">
                                    Open Detail View
                                </Link>
                                <Button
                                    type="button"
                                    onClick={() => handleGrade(submission._id)}
                                    disabled={gradingId === submission._id || !drafts[submission._id]?.grade}
                                    className="h-10 bg-white text-black font-semibold hover:bg-white/90 transition-all"
                                >
                                    <Send className="h-4 w-4 mr-2" />
                                    {gradingId === submission._id ? 'Grading...' : 'Submit Grade'}
                                </Button>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
