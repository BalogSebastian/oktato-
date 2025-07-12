// FÁJL: app/admin/clients/page.tsx

import dbConnect from "@/lib/dbConnect";
import Client from "@/lib/models/Client.model";
import User from "@/lib/models/User.model";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PlusCircle, Users, FileText } from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { ClientActions } from "@/components/admin/ClientActions"; // <-- MÓDOSÍTÁS 1: ÚJ IMPORT

export type ClientData = {
  _id: string;
  name: string;
  adminEmail: string;
  licenseCount: number;
  usedLicenses: number;
  createdAt: string;
};

export default async function ClientsListPage() {
  await dbConnect();

  const clients = await Client.find({}).populate({
    path: 'adminUser',
    model: User,
    select: 'email'
  }).sort({ createdAt: -1 });

  const totalClients = clients.length;
  let totalLicenses = 0;
  let totalUsedLicenses = 0;

  const clientsData: ClientData[] = await Promise.all(
    clients.map(async (client) => {
      const userCount = await User.countDocuments({ 
        client: client._id, 
        role: 'USER' 
      });
      
      totalLicenses += client.licenseCount;
      totalUsedLicenses += userCount;

      return {
        _id: client._id.toString(),
        name: client.name,
        // @ts-ignore - Tudjuk, hogy az adminUser objektum és van email-je
        adminEmail: client.adminUser?.email || 'N/A',
        licenseCount: client.licenseCount,
        usedLicenses: userCount,
        createdAt: new Date(client.createdAt).toLocaleDateString('hu-HU'),
      };
    })
  );

  return (
    <>
      {/* FEJLÉC ÉS STATISZTIKAI KÁRTYÁK */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Ügyfelek</h1>
        <Link href="/admin/clients/new">
          <Button size="sm" className="gap-1">
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Új Ügyfél
            </span>
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Összes Ügyfél</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClients}</div>
            <p className="text-xs text-muted-foreground">Regisztrált cégek száma</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktív Licencek</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLicenses}</div>
            <p className="text-xs text-muted-foreground">Összesen kiosztott licensz</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Licensz Kihasználtság</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsedLicenses} / {totalLicenses}</div>
            <Progress value={(totalUsedLicenses / totalLicenses) * 100} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* TÁBLÁZAT */}
      <Card>
        <CardHeader>
          <CardTitle>Ügyféllista</CardTitle>
          <CardDescription>
            A regisztrált ügyfelek kezelése és áttekintése.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ügyfél</TableHead>
                <TableHead className="hidden md:table-cell">Regisztráció</TableHead>
                <TableHead className="text-center">Licensz Állapot</TableHead>
                <TableHead>
                  <span className="sr-only">Akciók</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientsData.map((client) => (
                <TableRow key={client._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="hidden h-9 w-9 sm:flex">
                        <AvatarFallback>{client.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="grid gap-0.5">
                        <p className="font-medium">{client.name}</p>
                        <p className="text-xs text-muted-foreground">{client.adminEmail}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{client.createdAt}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={client.usedLicenses >= client.licenseCount ? "destructive" : "outline"}>
                      {client.usedLicenses} / {client.licenseCount}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {/* MÓDOSÍTÁS 2: Itt használjuk az új, interaktív komponenst */}
                    <ClientActions clientId={client._id} clientName={client.name} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}