'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { BookOpen, ClipboardList, AlertCircle, Users, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/types';

interface TeacherStats {
    courses: any[];
    assignments: any[];
    pendingSubmissions: any[];
    stats: {
        totalCourses: number;
        totalAssignments: number;
        pendingGrading: number;
    };
}

export default function TeacherDashboard() {
    const { isAuthenticated, user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [data, setData] = useState<TeacherStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [seeding, setSeeding] = useState(false);

    const getAuthHeaders = () => {
        if (typeof window === 'undefined') return {};
        const token = localStorage.getItem('token');
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    useEffect(() => {
        if (!authLoading && (!isAuthenticated || !user || (user.role !== UserRole.TEACHER && user.role !== UserRole.ADMIN))) {
            router.push('/login?redirect=/teacher/dashboard');
            return;
        }

        const fetchStats = async () => {
            try {
                const res = await fetch('/api/teacher/dashboard', { headers: getAuthHeaders() });
                if (res.ok) {
                    const stats = await res.json();
                    setData(stats);
                }
            } catch (error) {
                console.error('Failed to fetch teacher stats:', error);
            } finally {
                setLoading(false);
            }
        };

        if (isAuthenticated) {
            fetchStats();
        }
    }, [authLoading, isAuthenticated, router, user]);

    const handleSeedCourse = async () => {
        setSeeding(true);
        try {
            const res = await fetch('/api/dev/seed-course', { method: 'POST', headers: getAuthHeaders() });
            if (res.ok) {
                const course = await res.json();
                router.push(`/teacher/courses/${course._id}`);
            } else {
                const data = await res.json();
                alert(data.message || 'Failed to seed course');
            }
        } catch (error) {
            console.error('Seed course failed:', error);
        } finally {
            setSeeding(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background text-foreground p-8 flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-2 border-white/20 border-t-white rounded-full"></div>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="min-h-screen bg-background text-foreground p-4 md:p-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                        Teacher Dashboard
                    </h1>
                    <p className="text-muted-foreground mt-2">Manage your courses and evaluate student progress.</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/teacher/courses/new" className="bg-white text-black px-4 py-2 rounded-lg font-semibold hover:bg-white/90 transition-all text-sm">
                        Create Course
                    </Link>
                    <button
                        onClick={handleSeedCourse}
                        disabled={seeding}
                        className="bg-white/10 text-foreground px-4 py-2 rounded-lg font-semibold hover:bg-white/20 transition-all text-sm border border-white/10 disabled:opacity-60"
                    >
                        {seeding ? 'Seeding...' : 'Seed Demo Course'}
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">My Courses</CardTitle>
                        <BookOpen className="h-4 w-4 text-blue-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.stats.totalCourses}</div>
                    </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Assignments</CardTitle>
                        <ClipboardList className="h-4 w-4 text-purple-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.stats.totalAssignments}</div>
                    </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10 backdrop-blur-sm border-orange-500/20">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-orange-400">Needs Grading</CardTitle>
                        <AlertCircle className="h-4 w-4 text-orange-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-400">{data.stats.pendingGrading}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs for Management */}
            <Tabs defaultValue="grading" className="space-y-4">
                <TabsList className="bg-white/5 border-white/10">
                    <TabsTrigger value="grading" className="relative">
                        Grading Queue
                        {data.stats.pendingGrading > 0 && (
                            <span className="ml-2 bg-orange-500 text-white text-[10px] h-4 w-4 flex items-center justify-center rounded-full">
                                {data.stats.pendingGrading}
                            </span>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="courses">My Courses</TabsTrigger>
                    <TabsTrigger value="assignments">Assignments</TabsTrigger>
                </TabsList>

                {/* Grading Queue Tab */}
                <TabsContent value="grading">
                    <Card className="bg-white/5 border-white/10">
                        <CardHeader>
                            <CardTitle>Submissions to Grade</CardTitle>
                            <CardDescription>Review and provide feedback to student work.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-white/10 hover:bg-transparent">
                                        <TableHead className="text-muted-foreground">Student</TableHead>
                                        <TableHead className="text-muted-foreground">Assignment</TableHead>
                                        <TableHead className="text-muted-foreground">Date</TableHead>
                                        <TableHead className="text-muted-foreground text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.pendingSubmissions.map((sub) => (
                                        <TableRow key={sub._id} className="border-white/10 hover:bg-white/5 transition-colors">
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-xs">
                                                        {sub.studentId.name[0]}
                                                    </div>
                                                    <span>{sub.studentId.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">{sub.assignmentId.title}</TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {new Date(sub.createdAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Link href={`/teacher/submissions/${sub._id}`} className="inline-flex items-center gap-1 text-xs bg-white text-black px-3 py-1.5 rounded-md font-medium hover:bg-white/90">
                                                    Grade Item
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {data.pendingSubmissions.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-12">
                                                <CheckCircle className="h-12 w-12 text-green-500/20 mx-auto mb-4" />
                                                <p className="text-muted-foreground">Inbox zero! No submissions waiting for grading.</p>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Courses Management Tab */}
                <TabsContent value="courses">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {data.courses.map((course) => (
                            <Card key={course._id} className="bg-white/5 border-white/10 group overflow-hidden hover:border-white/20 transition-all">
                                <div className="aspect-video bg-white/5 relative">
                                    {course.thumbnail && (
                                        <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                                    )}
                                    <Badge className={`absolute top-3 right-3 ${course.isPublished ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-muted-foreground'} border-none`}>
                                        {course.isPublished ? 'Published' : 'Draft'}
                                    </Badge>
                                </div>
                                <CardHeader>
                                    <CardTitle className="text-lg italic">{course.title}</CardTitle>
                                    <CardDescription className="line-clamp-2 text-muted-foreground">{course.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="flex justify-between items-center text-xs text-muted-foreground border-t border-white/5 pt-4">
                                    <div className="flex items-center gap-1">
                                        <Users className="h-3 w-3" />
                                        <span>12 Students</span>
                                    </div>
                                    <Link href={`/teacher/courses/${course._id}`} className="hover:text-foreground underline">Edit Content</Link>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* Assignments Tab */}
                <TabsContent value="assignments">
                    <Card className="bg-white/5 border-white/10">
                        <CardHeader>
                            <CardTitle>Course Assignments</CardTitle>
                            <CardDescription>Overview of all active tasks across your courses.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-white/10 hover:bg-transparent">
                                        <TableHead className="text-muted-foreground">Title</TableHead>
                                        <TableHead className="text-muted-foreground">Course</TableHead>
                                        <TableHead className="text-muted-foreground">Due Date</TableHead>
                                        <TableHead className="text-muted-foreground text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.assignments.map((assignment) => (
                                        <TableRow key={assignment._id} className="border-white/10 hover:bg-white/5">
                                            <TableCell className="font-medium">{assignment.title}</TableCell>
                                            <TableCell className="italic text-muted-foreground">{assignment.courseId.title}</TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {new Date(assignment.dueDate).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Link href={`/teacher/assignments/${assignment._id}`} className="text-xs hover:text-foreground underline">Manage</Link>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
