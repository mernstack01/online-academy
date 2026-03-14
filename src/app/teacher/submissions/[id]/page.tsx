'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ISubmission, UserRole } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Send } from 'lucide-react';

export default function TeacherSubmissionDetail() {
    const params = useParams();
    const router = useRouter();
    const { isAuthenticated, user, loading: authLoading } = useAuth();
    const submissionId = params.id as string;

    const [submission, setSubmission] = useState<ISubmission | null>(null);
    const [loading, setLoading] = useState(true);
    const [grade, setGrade] = useState('');
    const [teacherComment, setTeacherComment] = useState('');
    const [saving, setSaving] = useState(false);

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

        const loadSubmission = async () => {
            try {
            const res = await fetch(`/api/submissions/${submissionId}`, { headers: getAuthHeaders() });
            if (res.ok) {
                const data = await res.json();
                setSubmission(data);
                    if (data.grade !== undefined && data.grade !== null) {
                        setGrade(String(data.grade));
                    }
                    setTeacherComment(data.teacherComment || '');
                }
            } catch (error) {
                console.error('Failed to load submission:', error);
            } finally {
                setLoading(false);
            }
        };

        if (isAuthenticated && submissionId) {
            loadSubmission();
        }
    }, [authLoading, isAuthenticated, router, submissionId, user]);

    const handleGrade = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!grade) return;
        setSaving(true);
        try {
            const res = await fetch('/api/submissions/grade', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({
                    submissionId,
                    grade: Number(grade),
                    teacherComment,
                }),
            });

            if (res.ok) {
                const updated = await res.json();
                setSubmission(updated);
            } else {
                const data = await res.json();
                alert(data.message || 'Failed to grade submission');
            }
        } catch (error) {
            console.error('Grading error:', error);
        } finally {
            setSaving(false);
        }
    };

    if (loading || authLoading) {
        return (
            <div className="min-h-screen bg-background text-foreground p-8 flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-2 border-white/20 border-t-white rounded-full"></div>
            </div>
        );
    }

    if (!submission) return null;

    return (
        <div className="min-h-screen bg-background text-foreground py-12 px-6 md:px-12 space-y-8">
            <Link href="/teacher/dashboard" className="text-muted-foreground hover:text-foreground flex items-center gap-2 w-fit group transition-all">
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Back to Dashboard
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="bg-white/5 border-white/10 lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Submission Details</CardTitle>
                        <CardDescription>Review the student work and provide feedback.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm text-muted-foreground">
                        <div>
                            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Student</div>
                            <div className="text-foreground">{(submission.studentId as any)?.name || 'Student'}</div>
                            <div className="text-muted-foreground">{(submission.studentId as any)?.email}</div>
                        </div>
                        <div>
                            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Assignment</div>
                            <div className="text-foreground">{(submission.assignmentId as any)?.title || 'Assignment'}</div>
                        </div>
                        <div>
                            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Submission Link</div>
                            <a href={submission.fileUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
                                Open Work
                            </a>
                        </div>
                        {submission.comment && (
                            <div>
                                <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Student Comment</div>
                                <div className="text-muted-foreground">{submission.comment}</div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                        <CardTitle>Grade Submission</CardTitle>
                        <CardDescription>Set score and provide feedback.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleGrade} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Grade (%)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={grade}
                                    onChange={(e) => setGrade(e.target.value)}
                                    className="w-full bg-card border border-white/10 rounded-lg py-3 px-4 text-sm focus:outline-none focus:border-primary/50 transition-all text-foreground placeholder-muted-foreground"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Feedback</label>
                                <textarea
                                    value={teacherComment}
                                    onChange={(e) => setTeacherComment(e.target.value)}
                                    className="w-full bg-card border border-white/10 rounded-lg p-3 text-sm focus:outline-none focus:border-primary/50 transition-all h-24 resize-none text-foreground placeholder-muted-foreground"
                                    placeholder="Share constructive feedback..."
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={saving}
                                className="w-full h-11 bg-white text-black font-semibold hover:bg-white/90 transition-all"
                            >
                                <Send className="h-4 w-4 mr-2" />
                                {saving ? 'Saving...' : 'Save Grade'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
