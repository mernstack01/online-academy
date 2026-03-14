'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface LessonVideoProps {
    title: string;
    description?: string;
    videoUrl: string;
}

/**
 * LessonVideo Component
 * Renders an embedded Vimeo or YouTube player with lesson metadata.
 */
const LessonVideo: React.FC<LessonVideoProps> = ({ title, description, videoUrl }) => {
    // Extract Video ID from common Vimeo URL formats
    const getVimeoId = (url: string) => {
        const regExp = /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/;
        const match = url.match(regExp);
        return match ? match[1] : null;
    };

    const getYouTubeId = (url: string) => {
        const regExp =
            /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/;
        const match = url.match(regExp);
        return match ? match[1] : null;
    };

    const vimeoId = getVimeoId(videoUrl);
    const youTubeId = getYouTubeId(videoUrl);

    if (!vimeoId && !youTubeId) {
        return (
            <Card className="w-full bg-destructive/10 border-destructive/20">
                <CardContent className="pt-6 text-center text-destructive">
                    Invalid video URL. Only Vimeo or YouTube links are supported.
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto p-4 md:p-0">
            {/* Video Player Section */}
            <div className="relative w-full overflow-hidden rounded-xl border border-white/10 bg-card shadow-2xl overflow-hidden aspect-video">
                {vimeoId ? (
                    <iframe
                        src={`https://player.vimeo.com/video/${vimeoId}?badge=0&autopause=0&player_id=0&app_id=58479`}
                        frameBorder="0"
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                        className="absolute inset-0 w-full h-full"
                        title={title}
                    ></iframe>
                ) : (
                    <iframe
                        src={`https://www.youtube.com/embed/${youTubeId}`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute inset-0 w-full h-full"
                        title={title}
                    ></iframe>
                )}
            </div>

            {/* Lesson Metadata Section */}
            <Card className="border-white/10 bg-card/60 backdrop-blur-xl transition-all hover:bg-card/80">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent italic">
                        {title}
                    </CardTitle>
                    {description && (
                        <CardDescription className="text-muted-foreground text-base leading-relaxed mt-2 whitespace-pre-wrap">
                            {description}
                        </CardDescription>
                    )}
                </CardHeader>
            </Card>
        </div>
    );
};

export default LessonVideo;
