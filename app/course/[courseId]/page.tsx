// Fájl: app/course/[courseId]/page.tsx

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/dbConnect";
import Course from "@/lib/models/Course.model";
import Progress from "@/lib/models/Progress.model";
import Client from "@/lib/models/Client.model";
import { IClient, ICourse, IProgress } from "@/lib/types";
import { CoursePlayer } from "@/components/course/CoursePlayer";
import { Schema } from "mongoose";

// Ezzel a sorral jelezzük a Next.js-nek, hogy ez az oldal mindig
// dinamikusan renderelődjön, ami megoldja a korábbi 'params' hibákat.
export const dynamic = 'force-dynamic';

interface CoursePageProps {
  params: {
    courseId: string;
  };
}

export default async function CoursePage({ params }: CoursePageProps) {
  const courseId = params.courseId;
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  await dbConnect();

  // Jogosultság ellenőrzés: A Super Admin mindent láthat.
  // Mások csak akkor, ha a cégük előfizetett a tanfolyamra.
  let isSubscribed = session.user.role === 'SUPER_ADMIN';
  if (!isSubscribed && session.user.client) {
      const client: IClient | null = await Client.findById(session.user.client);
      isSubscribed = client?.subscribedCourses.some((id: Schema.Types.ObjectId) => id.toString() === courseId) || false;
  }

  if (!isSubscribed) {
    return (
        <div className="text-center mt-10">
            <h1 className="text-2xl font-bold">Hozzáférés megtagadva</h1>
            <p className="text-muted-foreground">Nincs jogosultsága megtekinteni ezt a tanfolyamot.</p>
        </div>
    );
  }

  // Adatok lekérése az adatbázisból
  const course: ICourse | null = await Course.findById(courseId);
  const progress: IProgress | null = await Progress.findOne({ user: session.user.id, course: courseId });

  if (!course) {
    return (
        <div className="text-center mt-10">
            <h1 className="text-2xl font-bold">A tanfolyam nem található</h1>
            <p className="text-muted-foreground">Lehet, hogy törölték, vagy hibás a link.</p>
        </div>
    );
  }

  // Átalakítjuk az adatokat egyszerű JavaScript objektumokká ("plain objects"),
  // hogy biztonságosan átadhassuk őket a kliens oldali komponensnek.
  const plainCourse = JSON.parse(JSON.stringify(course));
  const plainProgress = JSON.parse(JSON.stringify(progress));

  return (
    <div className="container mx-auto max-w-7xl py-6">
      {/* Itt hívjuk meg a "lejátszó" komponenst, ami a varázslatot csinálja */}
      <CoursePlayer initialCourse={plainCourse} initialProgress={plainProgress} />
    </div>
  );
}