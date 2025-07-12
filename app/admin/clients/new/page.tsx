// Fájl: app/admin/clients/new/page.tsx

import dbConnect from "@/lib/dbConnect";
import Course from "@/lib/models/Course.model";
import { ICourse } from "@/lib/types"; // <-- JAVÍTÁS: Importálás a központi types.ts fájlból
import { NewClientForm } from "@/components/forms/NewClientForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

async function seedInitialCourse() {
  await dbConnect();
  const existingCourse = await Course.findOne({ title: "HACCP Alapoktatás" });
  if (!existingCourse) {
    console.log("Nincs HACCP oktatás, létrehozom a példa adatot...");
    await Course.create({
      title: "HACCP Alapoktatás",
      description: "Alapvető élelmiszerbiztonsági és higiéniai ismeretek.",
      content: "Itt található a HACCP oktatás teljes, részletes tananyaga...",
    });
    console.log("Példa oktatás létrehozva.");
  }
}

export default async function NewClientPage() {
  await seedInitialCourse();
  
  const courses: ICourse[] = await Course.find({});

  const courseOptions = courses.map(course => ({
    value: course._id.toString(),
    label: course.title,
  }));

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-gray-100 dark:bg-gray-950 p-4">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold tracking-tight">Új Ügyfél Létrehozása</CardTitle>
          <CardDescription>
            Adja meg az ügyfél adatait a fiók regisztrálásához.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NewClientForm courses={courseOptions} />
        </CardContent>
      </Card>
    </main>
  );
}