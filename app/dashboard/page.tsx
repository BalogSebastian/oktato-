// Fájl: app/dashboard/page.tsx

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/dbConnect";
import Client from "@/lib/models/Client.model";
import User from "@/lib/models/User.model";
import Course from "@/lib/models/Course.model"; // <-- JAVÍTÁS: Ez a sor a megoldás!
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { AddEmployeeForm } from "@/components/forms/AddEmployeeForm";

export default async function ClientDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.client) {
    redirect('/login');
  }

  await dbConnect();

  // A .populate() most már működni fog, mert a Course modell importálva van.
  const client = await Client.findById(session.user.client).populate('subscribedCourses');
  if (!client) {
    return <div>Hiba: A cég adatai nem találhatóak.</div>;
  }

  const employees = await User.find({ client: client._id, role: 'USER' }).sort({ createdAt: -1 });

  const licenseCount = client.licenseCount;
  const usedLicenses = employees.length;
  const progressValue = licenseCount > 0 ? (usedLicenses / licenseCount) * 100 : 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Licensz Állapot</CardTitle>
            <CardDescription>Felhasznált licencek a teljes keretből.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{usedLicenses} / {licenseCount}</div>
            <Progress value={progressValue} className="mt-2 h-3" />
          </CardContent>
        </Card>
        <Card className="flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle>Új Munkavállaló</CardTitle>
            <CardDescription>Új munkavállaló hozzáadása a rendszerhez.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex items-center justify-center">
            <AddEmployeeForm isDisabled={usedLicenses >= licenseCount} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Elérhető Tanfolyamok</CardTitle>
          <CardDescription>Az Ön cége által előfizetett oktatási anyagok.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {client.subscribedCourses.map((course: any) => (
            <div key={course._id} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">{course.title}</h3>
                <p className="text-sm text-muted-foreground">{course.description}</p>
              </div>
              <Button asChild>
                <Link href={`/course/${course._id}`}>
                  Tanfolyam indítása <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Munkavállalók</CardTitle>
          <CardDescription>A céghez regisztrált munkavállalók listája.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>E-mail cím</TableHead>
                <TableHead>Státusz</TableHead>
                <TableHead className="text-right">Regisztráció Dátuma</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee._id}>
                  <TableCell className="font-medium">{employee.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">Meghívva</Badge>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {new Date(employee.createdAt).toLocaleDateString('hu-HU')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}