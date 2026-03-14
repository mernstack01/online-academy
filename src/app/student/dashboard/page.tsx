'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { BookOpen, GraduationCap, Clock, Award, FolderOpen } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface DashboardStats {
    enrollments: any[];
    recentSubmissions: any[];
    upcomingAssignments: any[];
    portfolioItems: any[];
}

export default function StudentDashboard() {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login?redirect=/student/dashboard');
            return;
        }

        const fetchStats = async () => {
            try {
                const res = await fetch('/api/student/dashboard');
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (error) {
                console.error('Failed to fetch dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };

        if (isAuthenticated) {
            fetchStats();
        }
    }, [authLoading, isAuthenticated, router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background text-foreground p-8 flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-12 w-12 bg-white/10 rounded-full mb-4"></div>
                    <div className="h-4 w-32 bg-white/10 rounded"></div>
                </div>
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div className="min-h-screen bg-background text-foreground p-4 md:p-8 space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                    Student Dashboard
                </h1>
                <p className="text-muted-foreground mt-2">Welcome back! Here's a summary of your learning progress.</p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Enrolled Courses</CardTitle>
                        <BookOpen className="h-4 w-4 text-purple-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.enrollments.length}</div>
                    </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Grades</CardTitle>
                        <GraduationCap className="h-4 w-4 text-green-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.recentSubmissions.filter(s => s.status === 'graded').length}
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming Deadlines</CardTitle>
                        <Clock className="h-4 w-4 text-orange-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.upcomingAssignments.length}</div>
                    </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Portfolio Items</CardTitle>
                        <Award className="h-4 w-4 text-blue-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.portfolioItems.length}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="courses" className="space-y-4">
                <TabsList className="bg-white/5 border-white/10">
                    <TabsTrigger value="courses">My Courses</TabsTrigger>
                    <TabsTrigger value="assignments">Deadlines</TabsTrigger>
                    <TabsTrigger value="grades">Recent Grades</TabsTrigger>
                    <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
                </TabsList>

                {/* Courses Tab */}
                <TabsContent value="courses" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {stats.enrollments.map((enrollment) => (
                            <Card key={enrollment._id} className="bg-white/5 border-white/10 overflow-hidden hover:border-white/20 transition-all group">
                                <div className="aspect-video w-full bg-white/5 relative">
                                    {enrollment.courseId.thumbnail ? (
                                        <img src={enrollment.courseId.thumbnail} alt={enrollment.courseId.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full">
                                        <BookOpen className="h-12 w-12 text-muted-foreground/40" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all"></div>
                                </div>
                                <CardHeader>
                                    <CardTitle className="text-lg italic">{enrollment.courseId.title}</CardTitle>
                                    <CardDescription className="text-muted-foreground line-clamp-2">
                                        {enrollment.courseId.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>Progress</span>
                                            <span>{enrollment.status === 'completed' ? '100%' : '25%'}</span>
                                        </div>
                                        <Progress value={enrollment.status === 'completed' ? 100 : 25} className="h-1 bg-white/5" />
                                    </div>
                                    <Link href={`/student/courses/${enrollment.courseId._id}`} className="mt-4 block text-center py-2 rounded-lg bg-white text-black font-semibold text-sm hover:bg-white/90 transition-all">
                                        Continue Learning
                                    </Link>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* Deadlines Tab */}
                <TabsContent value="assignments">
                    <Card className="bg-white/5 border-white/10">
                        <CardHeader>
                            <CardTitle>Upcoming Assignments</CardTitle>
                            <CardDescription>Don't miss these deadlines.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent border-white/10">
                                        <TableHead className="text-muted-foreground">Assignment</TableHead>
                                        <TableHead className="text-muted-foreground">Course</TableHead>
                                        <TableHead className="text-muted-foreground">Due Date</TableHead>
                                        <TableHead className="text-muted-foreground text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {stats.upcomingAssignments.map((assignment) => (
                                        <TableRow key={assignment._id} className="border-white/10 hover:bg-white/5 transition-all">
                                            <TableCell className="font-medium">{assignment.title}</TableCell>
                                            <TableCell className="text-muted-foreground italic">{assignment.courseId?.title}</TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {new Date(assignment.dueDate).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Link href={`/student/assignments/${assignment._id}`} className="text-xs text-muted-foreground hover:text-foreground transition-all underline">View Details</Link>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {stats.upcomingAssignments.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-8 text-muted-foreground italic">No upcoming assignments.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Grades Tab */}
                <TabsContent value="grades">
                    <Card className="bg-white/5 border-white/10">
                        <CardHeader>
                            <CardTitle>Recent Grades</CardTitle>
                            <CardDescription>Track your performance across courses.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {stats.recentSubmissions.map((submission) => (
                                    <div key={submission._id} className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all">
                                        <div className="space-y-1">
                                            <div className="font-semibold">{submission.assignmentId?.title}</div>
                                            <div className="text-xs text-muted-foreground italic">Submitted on {new Date(submission.updatedAt).toLocaleDateString()}</div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {submission.status === 'graded' ? (
                                                <Badge className="bg-green-500/20 text-green-400 border-none px-3">
                                                    Grade: {submission.grade}%
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-muted-foreground border-white/10">
                                                    Pending Review
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {stats.recentSubmissions.length === 0 && (
                                    <div className="text-center py-8 text-muted-foreground italic">No submissions yet.</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Portfolio Tab */}
                <TabsContent value="portfolio">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {stats.portfolioItems.map((item) => (
                            <Card key={item._id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-all">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-lg italic">{item.title}</CardTitle>
                                        <Award className="h-5 w-5 text-blue-400" />
                                    </div>
                                    <CardDescription className="text-muted-foreground mt-2">{item.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-xs text-muted-foreground mb-4 bg-white/5 p-2 rounded italic">
                                        Original Assignment: {item.submissionId?.assignmentId?.title}
                                    </div>
                                    <a href={item.submissionId?.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 py-2 w-full rounded-lg border border-white/10 text-foreground hover:bg-white/10 transition-all text-sm font-medium">
                                        <FolderOpen className="h-4 w-4" />
                                        View Work
                                    </a>
                                </CardContent>
                            </Card>
                        ))}
                        {stats.portfolioItems.length === 0 && (
                            <Card className="col-span-full bg-white/5 border-white/10 border-dashed">
                                <CardContent className="py-12 flex flex-col items-center justify-center space-y-4">
                                    <Award className="h-12 w-12 text-muted-foreground/40" />
                                    <div className="text-center">
                                        <div className="font-semibold">No portfolio items yet</div>
                                        <div className="text-sm text-muted-foreground mt-1">Mark your best submissions as portfolio items to showcase them here.</div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
