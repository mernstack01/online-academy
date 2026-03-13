'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center py-20 animate-fade-in text-center">
      <div className="max-w-3xl space-y-8">
        <div className="space-y-4">
          <h2 className="text-primary font-bold tracking-widest uppercase text-sm">
            Future of Education
          </h2>
          <h1 className="text-5xl md:text-7xl font-black text-white leading-tight tracking-tighter">
            Unlock Your <span className="text-primary">Creative</span> Potential
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Experience a new way of learning with our high-impact courses,
            expert mentors, and a community dedicated to growth.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/courses"
            className="w-full sm:w-auto px-10 py-4 bg-primary hover:bg-primary-hover text-white font-bold rounded-2xl transition-all shadow-xl shadow-primary/30 hover:scale-105 active:scale-95"
          >
            Explore Courses
          </Link>
          {!user && (
            <Link
              href="/register"
              className="w-full sm:w-auto px-10 py-4 glass text-white font-bold rounded-2xl hover:bg-white/10 transition-all hover:scale-105 active:scale-95"
            >
              Get Started
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-20">
          <div className="p-8 glass rounded-3xl space-y-4 text-left">
            <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary text-2xl font-bold">
              ★
            </div>
            <h3 className="text-xl font-bold text-white">Expert Tutoring</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Learn from the best in the industry with personalized feedback loops.
            </p>
          </div>
          <div className="p-8 glass rounded-3xl space-y-4 text-left">
            <div className="w-12 h-12 bg-secondary/20 rounded-2xl flex items-center justify-center text-secondary text-2xl font-bold">
              ⎙
            </div>
            <h3 className="text-xl font-bold text-white">Flexible Learning</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Learn at your own pace with lifetime access to all course materials.
            </p>
          </div>
          <div className="p-8 glass rounded-3xl space-y-4 text-left">
            <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary text-2xl font-bold">
              ∞
            </div>
            <h3 className="text-xl font-bold text-white">Career Support</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Get the tools you need to succeed in your professional journey.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
