import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Course from '@/models/Course';

const INTEREST_KEYWORDS: Record<string, string[]> = {
  game: ['game', 'o\'yin', 'gaming', 'unity', 'unreal', 'gamedev', 'game development', 'development', 'developer'],
  animation: ['3d', 'animatsiya', 'animation', 'blender', 'maya', 'cinema4d', 'render', 'model'],
  ai: ['ai', 'sun\'iy intellekt', 'computer vision', 'machine learning', 'deep learning', 'neural', 'python', 'opencv', 'ml'],
  uiux: ['ui', 'ux', 'dizayn', 'design', 'figma', 'interface', 'user experience', 'prototype', 'wireframe'],
};

export async function GET(req: NextRequest) {
  const interest = req.nextUrl.searchParams.get('interest') || '';

  try {
    await connectDB();

    const keywords = INTEREST_KEYWORDS[interest] || [];

    let courses;

    if (keywords.length > 0) {
      const regex = new RegExp(keywords.join('|'), 'i');
      courses = await Course.find({
        isPublished: true,
        $or: [
          { title: { $regex: regex } },
          { description: { $regex: regex } },
        ],
      })
        .select('_id title description price')
        .limit(3)
        .lean();
    }

    // Mos kurs topilmasa, oxirgi qo'shilgan kurslarni qaytarish
    if (!courses || courses.length === 0) {
      courses = await Course.find({ isPublished: true })
        .select('_id title description price')
        .sort({ createdAt: -1 })
        .limit(3)
        .lean();
    }

    return NextResponse.json({
      courses: courses.map(c => ({
        id: c._id.toString(),
        title: c.title,
        description: c.description,
        price: c.price,
      })),
    });
  } catch {
    return NextResponse.json({ courses: [] }, { status: 500 });
  }
}
