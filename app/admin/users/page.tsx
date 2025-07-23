// app/admin/users/page.tsx

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/dbConnect";
import User from "@/lib/models/User.model";
import Client from "@/lib/models/Client.model"; // Szükséges a kliens nevének populálásához
import { IUser, IClient } from "@/lib/types"; // Típusok importálása
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
import { Users as UsersIcon, PlusCircle } from "lucide-react"; // Átneveztem, hogy ne ütközzön a modell User-rel
import { Button } from "@/components/ui/button";
import Link from "next/link";
// Importálhatunk egy UserActions komponenst is, ha lesznek egyedi felhasználói akciók
// import { UserActions } from "@/components/admin/UserActions"; 

// A felhasználó adatainak típusa a listához
type UserData = {
  _id: string;
  email: string;
  role: string;
  clientName: string; // Ügyfél neve
  createdAt: string;
};

export default async function UsersPage() {
  const session = await getServerSession(authOptions);

  // Jogosultság ellenőrzés: csak Super Admin férhet hozzá
  if (!session || session.user?.role !== 'SUPER_ADMIN') {
    redirect('/login');
  }

  await dbConnect();

  // Lekérjük az összes felhasználót, és populáljuk a hozzájuk tartozó ügyfelet
  const users: IUser[] = await User.find({})
    .populate({
      path: 'client',
      model: Client,
      select: 'name' // Csak a kliens nevét kérjük le
    })
    .sort({ createdAt: -1 });

  const usersData: UserData[] = users.map(user => {
    // JAVÍTÁS: Ellenőrizzük, hogy a 'client' mező létezik és objektum (populálva van)
    // TypeScript type assertion a populált adatokhoz
    const clientData = user.client as IClient; 

    return {
      _id: user._id.toString(),
      email: user.email,
      role: user.role,
      // JAVÍTÁS: Most már biztonságosan elérhetjük a clientData.name-t
      clientName: clientData ? clientData.name : 'N/A (Super Admin)',
      createdAt: new Date(user.createdAt).toLocaleDateString('hu-HU'),
    };
  });

  const totalUsers = usersData.length;
  const superAdmins = usersData.filter(u => u.role === 'SUPER_ADMIN').length;
  const clientAdmins = usersData.filter(u => u.role === 'CLIENT_ADMIN').length;
  const regularUsers = usersData.filter(u => u.role === 'USER').length;

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Felhasználók</h1>
        <Button size="sm" className="gap-1" disabled> {/* Egyelőre inaktív a hozzáadás */}
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Új Felhasználó
          </span>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Összes Felhasználó</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">A rendszerben regisztrált összes felhasználó</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Super Adminok</CardTitle>
            <Badge variant="default" className="h-4 w-auto px-2 py-0 text-xs flex items-center">
                <UsersIcon className="h-3 w-3 mr-1" /> {superAdmins}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{superAdmins}</div>
            <p className="text-xs text-muted-foreground">Rendszergazdai jogkörrel</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cég Adminok</CardTitle>
            <Badge variant="secondary" className="h-4 w-auto px-2 py-0 text-xs flex items-center">
                <UsersIcon className="h-3 w-3 mr-1" /> {clientAdmins}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientAdmins}</div>
            <p className="text-xs text-muted-foreground">Ügyfelek adminisztrátorai</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Munkavállalók</CardTitle>
            <Badge variant="outline" className="h-4 w-auto px-2 py-0 text-xs flex items-center">
                <UsersIcon className="h-3 w-3 mr-1" /> {regularUsers}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{regularUsers}</div>
            <p className="text-xs text-muted-foreground">Regisztrált munkavállalók</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Felhasználók Listája</CardTitle>
          <CardDescription>
            A rendszerben regisztrált összes felhasználó áttekintése.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>E-mail cím</TableHead>
                <TableHead>Szerepkör</TableHead>
                <TableHead>Ügyfél</TableHead>
                <TableHead className="text-right">Regisztráció Dátuma</TableHead>
                {/* <TableHead><span className="sr-only">Akciók</span></TableHead> */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {usersData.map((user) => (
                <TableRow key={user._id}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={
                      user.role === 'SUPER_ADMIN' ? 'default' :
                      user.role === 'CLIENT_ADMIN' ? 'secondary' : 'outline'
                    }>
                      {user.role === 'SUPER_ADMIN' ? 'Super Admin' : 
                       user.role === 'CLIENT_ADMIN' ? 'Cég Admin' : 'Munkavállaló'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {user.clientName}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {user.createdAt}
                  </TableCell>
                  {/* Akciók oszlop, ha lesz UserActions komponens */}
                  {/* <TableCell>
                    <UserActions userId={user._id} userName={user.email} />
                  </TableCell> */}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}