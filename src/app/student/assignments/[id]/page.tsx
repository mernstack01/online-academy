'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { IAssignment, ISubmission } from '@/types';
import { useAuth } from '@/context/AuthContext';
import {
    FileText,
    Calendar,
    Link as LinkIcon,
    Send,
    CheckCircle,
    AlertCircle,
    ArrowLeft,
    Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useI18n } from '@/context/LanguageContext';

export default function AssignmentSubmissionPage() {
    const params = useParams();
    const router = useRouter();
    const { isAuthenticated, loading: authLoading } = useAuth();
    const { t } = useI18n();

    const [assignment, setAssignment] = useState<IAssignment | null>(null);
    const [submission, setSubmission] = useState<ISubmission | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [fileUrl, setFileUrl] = useState('');
    const [comment, setComment] = useState('');

    const assignmentId = params.id as string;

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch assignment details
                const assignRes = await fetch(`/api/assignments/${assignmentId}`);
                if (assignRes.ok) {
                    const data = await assignRes.json();
                    setAssignment(data);
                } else {
                    router.push('/student/dashboard');
                    return;
                }

                // Check for existing submission
                const subRes = await fetch(`/api/submissions?assignmentId=${assignmentId}`);
                if (subRes.ok) {
                    const data = await subRes.json();
                    if (data) {
                        setSubmission(data);
                        setFileUrl(data.fileUrl);
                        setComment(data.comment || '');
                    }
                }
            } catch (error) {
                console.error('Failed to fetch assignment data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (isAuthenticated && assignmentId) {
            fetchData();
        } else if (!authLoading) {
            router.push(`/login?redirect=/student/assignments/${assignmentId}`);
        }
    }, [assignmentId, isAuthenticated, router, authLoading]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!fileUrl) {
            alert(t('studentAssignment.alerts.missingFile'));
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch('/api/submissions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    assignmentId,
                    fileUrl,
                    comment
                })
            });

            if (res.ok) {
                const data = await res.json();
                setSubmission(data);
                alert(t('studentAssignment.alerts.submitted'));
            } else {
                const data = await res.json();
                alert(data.message || t('studentAssignment.alerts.failed'));
            }
        } catch (error) {
            console.error('Submission error:', error);
            alert(t('studentAssignment.alerts.error'));
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
        );
    }

    if (!assignment) return null;

    const isPastDue = new Date(assignment.dueDate) < new Date();

    return (
        <div className="min-h-screen bg-background text-foreground py-12 px-6 md:px-12">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <Link href="/student/dashboard" className="text-muted-foreground hover:text-foreground flex items-center gap-2 mb-4 group w-fit transition-all">
                            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                            {t('studentAssignment.backToDashboard')}
                        </Link>
                        <h1 className="text-4xl font-black italic tracking-tighter uppercase">
                            {assignment.title}
                        </h1>
                        <div className="flex items-center gap-4 text-sm">
                        <div className={`flex items-center gap-2 ${isPastDue ? 'text-red-400' : 'text-orange-400'}`}>
                            <Calendar className="h-4 w-4" />
                            <span>{t('studentAssignment.due', { date: new Date(assignment.dueDate).toLocaleDateString() })}</span>
                        </div>
                        <Badge variant="outline" className="border-white/10 text-muted-foreground">
                            {t('studentAssignment.pointsMax')}
                        </Badge>
                    </div>
                    </div>

                    {submission && (
                        <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-4 rounded-2xl">
                            {submission.status === 'graded' ? (
                                <>
                                    <CheckCircle className="h-8 w-8 text-green-500" />
                                    <div>
                                        <div className="text-xs text-muted-foreground uppercase font-bold tracking-widest">{t('studentAssignment.finalGrade')}</div>
                                        <div className="text-2xl font-black tracking-tighter text-green-400">{submission.grade}%</div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Clock className="h-8 w-8 text-orange-400 animate-pulse" />
                                    <div>
                                        <div className="text-xs text-muted-foreground uppercase font-bold tracking-widest">{t('studentAssignment.status')}</div>
                                        <div className="text-sm font-bold italic">{t('studentAssignment.pendingReview')}</div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Instructions */}
                    <div className="lg:col-span-2 space-y-8">
                        <section className="glass p-8 rounded-2xl border border-white/10 space-y-4">
                            <h2 className="text-xl font-bold italic tracking-tight flex items-center gap-2 border-b border-white/10 pb-4 uppercase">
                                <FileText className="h-5 w-5 text-primary" />
                                {t('studentAssignment.instructions')}
                            </h2>
                            <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap italic">
                                {assignment.description}
                            </div>
                        </section>

                        {submission?.teacherComment && (
                            <section className="bg-primary/10 p-8 rounded-2xl border border-primary/20 space-y-4">
                                <h2 className="text-xl font-bold italic tracking-tight flex items-center gap-2 text-primary uppercase">
                                    <AlertCircle className="h-5 w-5" />
                                    {t('studentAssignment.teacherFeedback')}
                                </h2>
                                <p className="text-primary/80 leading-relaxed italic">
                                    "{submission.teacherComment}"
                                </p>
                            </section>
                        )}
                    </div>

                    {/* Submission Form */}
                    <div className="lg:col-span-1">
                        <Card className="bg-white/5 border-white/10 overflow-hidden sticky top-24">
                            <CardHeader className="bg-white/[0.02] border-b border-white/10">
                                <CardTitle className="text-lg italic uppercase">{t('studentAssignment.yourSubmission')}</CardTitle>
                                <CardDescription>
                                    {submission ? t('studentAssignment.updatePrevious') : t('studentAssignment.submitFinal')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t('studentAssignment.projectUrlLabel')}</label>
                                <div className="relative">
                                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <input
                                        type="url"
                                        value={fileUrl}
                                        onChange={(e) => setFileUrl(e.target.value)}
                                        placeholder={t('studentAssignment.projectUrlPlaceholder')}
                                        className="w-full bg-card border border-white/10 rounded-lg py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-all italic text-foreground placeholder-muted-foreground"
                                        required
                                        disabled={submission?.status === 'graded'}
                                    />
                                </div>
                                    </div>

                                    <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t('studentAssignment.commentsLabel')}</label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder={t('studentAssignment.commentsPlaceholder')}
                                    className="w-full bg-card border border-white/10 rounded-lg p-4 text-sm focus:outline-none focus:border-primary/50 transition-all h-32 resize-none italic text-foreground placeholder-muted-foreground"
                                    disabled={submission?.status === 'graded'}
                                />
                            </div>

                                    {submission?.status !== 'graded' && (
                                        <Button
                                            type="submit"
                                            disabled={submitting || (isPastDue && !submission)}
                                            className="w-full h-14 bg-foreground hover:bg-foreground/90 text-background font-black text-lg skew-x-[-12deg] transition-all disabled:opacity-50"
                                        >
                                            <span className="skew-x-[12deg] flex items-center justify-center gap-2">
                                                <Send className="h-5 w-5" />
                                                {submitting
                                                    ? t('studentAssignment.submitting')
                                                    : (submission ? t('studentAssignment.updateSubmission') : t('studentAssignment.submitProject'))
                                                }
                                            </span>
                                        </Button>
                                    )}

                                    {isPastDue && !submission && (
                                        <p className="text-xs text-red-400 text-center italic">
                                            {t('studentAssignment.pastDue')}
                                        </p>
                                    )}
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
