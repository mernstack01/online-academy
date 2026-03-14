'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import {
    BookPlus,
    ArrowLeft,
    Type,
    AlignLeft,
    DollarSign,
    Image as ImageIcon,
    Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';

export default function CreateCoursePage() {
    const router = useRouter();
    const { user, isAuthenticated, loading: authLoading } = useAuth();

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        thumbnail: '',
    });

    const getAuthHeaders = () => {
        if (typeof window === 'undefined') return {};
        const token = localStorage.getItem('token');
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-background text-foreground p-8 flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-2 border-white/20 border-t-white rounded-full"></div>
            </div>
        );
    }

    if (!isAuthenticated || (user?.role !== UserRole.TEACHER && user?.role !== UserRole.ADMIN)) {
        router.push('/');
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/courses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({
                    ...formData,
                    price: Number(formData.price),
                    instructor: user?.id,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                alert('Course created successfully!');
                router.push(`/teacher/courses/${data._id}`);
            } else {
                const data = await res.json();
                alert(data.message || 'Failed to create course');
            }
        } catch (error) {
            console.error('Create course error:', error);
            alert('An error occurred while creating the course');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground py-12 px-6 md:px-12">
            <div className="max-w-3xl mx-auto space-y-8">
                <Link href="/teacher/dashboard" className="text-muted-foreground hover:text-foreground flex items-center gap-2 w-fit group transition-all">
                    <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Dashboard
                </Link>

                <div className="space-y-2">
                    <h1 className="text-4xl font-black italic tracking-tighter uppercase flex items-center gap-4">
                        <BookPlus className="h-10 w-10 text-primary" />
                        Create New Course
                    </h1>
                    <p className="text-muted-foreground italic">Start building your community by sharing your knowledge.</p>
                </div>

                <Card className="bg-white/5 border-white/10 overflow-hidden">
                    <CardHeader className="bg-white/[0.02] border-b border-white/10">
                        <CardTitle className="text-lg italic uppercase">Course Fundamentals</CardTitle>
                        <CardDescription>Fill in the basic information about your new course.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                    <Type className="h-3 w-3" />
                                    Course Title
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g. Master Class: Modern UI Design"
                                    className="w-full bg-card border border-white/10 rounded-lg py-3 px-4 text-sm focus:outline-none focus:border-primary/50 transition-all italic text-foreground placeholder-muted-foreground"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                    <AlignLeft className="h-3 w-3" />
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Tell your students what they will learn..."
                                    className="w-full bg-card border border-white/10 rounded-lg p-4 text-sm focus:outline-none focus:border-primary/50 transition-all h-32 resize-none italic text-foreground placeholder-muted-foreground"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                        <DollarSign className="h-3 w-3" />
                                        Enrollment Price ($)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        placeholder="0 for free"
                                        className="w-full bg-card border border-white/10 rounded-lg py-3 px-4 text-sm focus:outline-none focus:border-primary/50 transition-all italic text-foreground placeholder-muted-foreground"
                                        required
                                        min="0"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                        <ImageIcon className="h-3 w-3" />
                                        Thumbnail URL
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.thumbnail}
                                        onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                                        placeholder="https://..."
                                        className="w-full bg-card border border-white/10 rounded-lg py-3 px-4 text-sm focus:outline-none focus:border-primary/50 transition-all italic text-foreground placeholder-muted-foreground"
                                    />
                                </div>
                            </div>

                            <div className="pt-6 border-t border-white/10">
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-14 bg-white hover:bg-white/90 text-black font-black text-lg skew-x-[-12deg] transition-all disabled:opacity-50"
                                >
                                    <span className="skew-x-[12deg] flex items-center justify-center gap-2">
                                        <Save className="h-5 w-5" />
                                        {loading ? 'CREATING...' : 'CREATE & CONTINUE'}
                                    </span>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
