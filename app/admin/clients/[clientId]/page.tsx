// Fájl: app/admin/clients/[clientId]/page.tsx

import dbConnect from "@/lib/dbConnect";
import Client from "@/lib/models/Client.model";
import User from "@/lib/models/User.model";
import { IClient, IUser } from "@/lib/types";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Users, FileText, Mail } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface ClientDetailPageProps {
  params: {
    clientId: string;
  };
}

export default async function ClientDetailPage({ params }: ClientDetailPageProps) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'SUPER_ADMIN') {
    redirect('/login');
  }

  await dbConnect();

  // Lekérjük a klienst és a hozzá tartozó admin felhasználó emailjét
  const client: IClient | null = await Client.findById(params.clientId).populate({
    path: 'adminUser',
    model: User,
    select: 'email'
  });

  // Ha nincs ilyen kliens, hibaoldalt mutatunk
  if (!client) {
    return (
      <div className="text-center mt-10">
        <h1 className="text-2xl font-bold">Ügyfél nem található</h1>
        <p className="text-muted-foreground">A megadott azonosítóval nem létezik ügyfél.</p>
        <Button asChild className="mt-4">
          <Link href="/admin/clients">
            <ArrowLeft className="mr-2 h-4 w-4" /> Vissza az ügyféllistához
          </Link>
        </Button>
      </div>
    );
  }

  // Lekérjük az összes felhasználót (admin + munkavállalók), aki ehhez a céghez tartozik
  const employees: IUser[] = await User.find({ client: client._id }).sort({ role: 1, createdAt: -1 });

  const usedLicenses = employees.filter(e => e.role === 'USER').length;
  const licenseCount = client.licenseCount;
  const progressValue = licenseCount > 0 ? (usedLicenses / licenseCount) * 100 : 0;

  return (
    <div className="flex flex-col gap-6">
      {/* FEJLÉC VISSZA GOMBBAL */}
      <div>
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/clients">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Vissza az ügyféllistához
          </Link>
        </Button>
      </div>

      {/* ÜGYFÉL ADATAI ÉS STATISZTIKA */}
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">{client.name}</CardTitle>
          <CardDescription>Részletes adatok és statisztikák</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-3">
          <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/50">
            <Users className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Összes Licensz</p>
              <p className="text-2xl font-bold">{licenseCount}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/50">
            <FileText className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Felhasznált Licensz</p>
              <p className="text-2xl font-bold">{usedLicenses}</p>
            </div>
          </div>
          <div className="flex flex-col justify-center gap-2 p-4 border rounded-lg bg-muted/50">
            <p className="text-sm font-medium text-muted-foreground">Kihasználtság</p>
            <Progress value={progressValue} className="h-3" />
            <p className="text-xs text-center text-muted-foreground">{Math.round(progressValue)}%</p>
          </div>
        </CardContent>
      </Card>

      {/* MUNKAVÁLLALÓK TÁBLÁZATA */}
      <Card>
        <CardHeader>
          <CardTitle>Felhasználók</CardTitle>
          <CardDescription>A(z) {client.name} céghez rendelt összes felhasználó.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>E-mail cím</TableHead>
                <TableHead>Szerepkör</TableHead>
                <TableHead className="text-right">Regisztráció Dátuma</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee._id.toString()}>
                  <TableCell className="font-medium">{employee.email}</TableCell>
                  <TableCell>
                    <Badge variant={employee.role === 'CLIENT_ADMIN' ? 'default' : 'secondary'}>
                      {employee.role === 'CLIENT_ADMIN' ? 'Adminisztrátor' : 'Munkavállaló'}
                    </Badge>
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