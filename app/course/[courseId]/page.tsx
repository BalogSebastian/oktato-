// FÁJL 3: app/course/[courseId]/page.tsx (JAVÍTVA - await params)
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/dbConnect";
import Course from "@/lib/models/Course.model";
import Progress from "@/lib/models/Progress.model";
import Client from "@/lib/models/Client.model";
import { IClient, ICourse, IProgress } from "@/lib/types";
import { CoursePlayer } from "@/components/course/CoursePlayer";
import { Schema } from "mongoose";

export const dynamic = 'force-dynamic';

interface CoursePageProps {
  params: Promise<{
    courseId: string;
  }>;
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { courseId } = await params;
  
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect('/login');
  }

  await dbConnect();

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

  const plainCourse = JSON.parse(JSON.stringify(course));
  const plainProgress = JSON.parse(JSON.stringify(progress));

  return (
    <div className="container mx-auto max-w-7xl py-6">
      <CoursePlayer initialCourse={plainCourse} initialProgress={plainProgress} />
    </div>
  );
}