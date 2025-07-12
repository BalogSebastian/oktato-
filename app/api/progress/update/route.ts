// Fájl: app/api/progress/update/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from '@/lib/dbConnect';
import Progress from '@/lib/models/Progress.model';
import Course from '@/lib/models/Course.model';
import { IChapter, IModule } from '@/lib/types';
import { Schema } from "mongoose";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Nincs jogosultsága.' }, { status: 403 });
    }

    const { courseId, chapterId } = await request.json();
    if (!courseId || !chapterId) {
      return NextResponse.json({ message: 'Hiányzó adatok.' }, { status: 400 });
    }

    await dbConnect();

    const course = await Course.findById(courseId).select('modules.chapters');
    if (!course) {
        return NextResponse.json({ message: 'A kurzus nem található.' }, { status: 404 });
    }
    
    // JAVÍTÁS: Explicit típusokat adunk az 'm' (module) és 'c' (chapter) paramétereknek
    const chapter = course.modules
      .flatMap((m: IModule) => m.chapters)
      .find((c: IChapter) => c._id.toString() === chapterId);


    if (!chapter) {
        return NextResponse.json({ message: 'A fejezet nem található.' }, { status: 404 });
    }

    const existingProgress = await Progress.findOne({ user: session.user.id, course: courseId });

    const isAlreadyCompleted = existingProgress?.completedChapters.some((id: Schema.Types.ObjectId) => id.toString() === chapterId);

    const progress = await Progress.findOneAndUpdate(
      { user: session.user.id, course: courseId },
      { 
        $addToSet: { completedChapters: chapterId },
        ...(isAlreadyCompleted ? {} : { $inc: { score: chapter.points } })
      },
      { new: true, upsert: true }
    );
    
    const totalChapters = course.modules.reduce((acc: number, module: IModule) => acc + module.chapters.length, 0);
    if (progress.completedChapters.length === totalChapters) {
        progress.isCompleted = true;
        await progress.save();
    }

    return NextResponse.json({ message: 'Haladás sikeresen mentve.', progress });

  } catch (error) {
    console.error("API Hiba (Haladás mentése):", error);
    return NextResponse.json({ message: 'Szerverhiba történt.' }, { status: 500 });
  }
}