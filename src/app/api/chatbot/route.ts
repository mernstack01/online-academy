import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Course from '@/models/Course';

const INTEREST_KEYWORDS: Record<string, string[]> = {
  game: ['game', 'o\'yin', 'gaming', 'unity', 'unreal', 'gamedev', 'game development', 'development', 'developer'],
  animation: ['3d', 'animatsiya', 'animation', 'blender', 'maya', 'cinema4d', 'render', 'model'],
  ai: ['ai', 'sun\'iy intellekt', 'computer vision', 'machine learning', 'deep learning', 'neural', 'python', 'opencv', 'ml'],
  uiux: ['ui', 'ux', 'dizayn', 'design', 'figma', 'interface', 'user experience', 'prototype', 'wireframe'],
};

// Kurs tavsiyasi uchun GET
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

// Gemini AI bilan erkin suhbat uchun POST
export async function POST(req: NextRequest) {
  try {
    const { message, lang } = await req.json();
    const language: string = lang === 'en' ? 'en' : 'uz';

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ reply: language === 'en' ? 'Message cannot be empty.' : 'Xabar bo\'sh bo\'lishi mumkin emas.' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ reply: 'AI xizmati hozircha mavjud emas.' }, { status: 500 });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: language === 'en'
                    ? `You are the AI assistant of "Grafik Ta'lim" online learning platform.
The platform offers courses in: Game Development, 3D Animation, AI & Computer Vision, UI/UX Design.
Give short, clear and helpful answers in English.
If the question is not related to the platform or education, politely redirect to the platform.

User question: ${message}`
                    : `Siz "Grafik Ta'lim" online ta'lim platformasining AI yordamchisisiz.
Platforma quyidagi yo'nalishlar bo'yicha kurslar taqdim etadi: Game Development, 3D Animatsiya, AI & Computer Vision, UI/UX Dizayn.
Foydalanuvchilarga qisqa, aniq va foydali javoblar bering. O'zbek tilida javob bering.
Agar savol platforma yoki ta'lim bilan bog'liq bo'lmasa, muloyimlik bilan platformaga yo'naltiring.

Foydalanuvchi savoli: ${message}`,
                },
              ],
            },
          ],
          generationConfig: {
            maxOutputTokens: 300,
            temperature: 0.7,
          },
        }),
      }
    );

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.error('Gemini API xato:', response.status, JSON.stringify(errData));
      return NextResponse.json({ reply: `Gemini xato: ${response.status} — ${JSON.stringify(errData)}` }, { status: 500 });
    }

    const data = await response.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Javob olishda xatolik yuz berdi.';

    return NextResponse.json({ reply });
  } catch (err) {
    console.error('POST /api/chatbot catch xatosi:', err);
    return NextResponse.json({ reply: 'Xatolik yuz berdi. Qayta urinib ko\'ring.' }, { status: 500 });
  }
}
