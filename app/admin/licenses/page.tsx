// app/admin/licenses/page.tsx
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/dbConnect";
import Client from "@/lib/models/Client.model";
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
import { Users, FileText, PlusCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import User from "@/lib/models/User.model";
import { ClientActions } from "@/components/admin/ClientActions";
import { AddLicensesForm } from "@/components/admin/AddLicensesForm";

// A licensz adatok típusa
type LicenseData = {
  _id: string;
  clientName: string;
  adminEmail: string;
  licenseCount: number;
  usedLicenses: number;
  status: 'aktív' | 'lejárt' | 'teljesen kihasznált';
};

export default async function LicensesPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== 'SUPER_ADMIN') {
    redirect('/login');
  }

  await dbConnect();

  const clients = await Client.find({}).populate({
    path: 'adminUser',
    model: User,
    select: 'email'
  }).sort({ createdAt: -1 });

  const licensesData: LicenseData[] = await Promise.all(
    clients.map(async (client) => {
      const usedLicenses = await User.countDocuments({ client: client._id, role: 'USER' });
      
      let status: LicenseData['status'] = 'aktív';
      if (usedLicenses >= client.licenseCount) {
        status = 'teljesen kihasznált';
      }

      return {
        _id: client._id.toString(),
        clientName: client.name,
        // @ts-ignore
        adminEmail: client.adminUser?.email || 'N/A',
        licenseCount: client.licenseCount,
        usedLicenses: usedLicenses,
        status: status,
      };
    })
  );

  const totalActiveLicenses = licensesData.reduce((sum, client) => sum + client.licenseCount, 0);
  const totalUsedLicenses = licensesData.reduce((sum, client) => sum + client.usedLicenses, 0);

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Licenszek</h1>
        <AddLicensesForm /> {/* Itt használjuk az AddLicensesForm-ot */}
      </div>

      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Összes licensz</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActiveLicenses}</div>
            <p className="text-xs text-muted-foreground">Összesen kiosztott licensz a rendszerben</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Felhasznált licenszek</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsedLicenses}</div>
            <p className="text-xs text-muted-foreground">Jelenleg használt licenszek száma</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kihasználtság</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalActiveLicenses > 0 ? ((totalUsedLicenses / totalActiveLicenses) * 100).toFixed(0) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Az összes licensz kihasználtsága</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Licenszek Ügyfelenként</CardTitle>
          <CardDescription>
            Az egyes ügyfelekhez rendelt licenszek és azok státusza.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ügyfél</TableHead>
                <TableHead>Admin E-mail</TableHead>
                <TableHead className="text-center">Licensz Keret</TableHead>
                <TableHead className="text-center">Felhasznált</TableHead>
                <TableHead className="text-center">Státusz</TableHead>
                <TableHead>
                  <span className="sr-only">Akciók</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {licensesData.map((license) => (
                <TableRow key={license._id}>
                  <TableCell className="font-medium">
                    <Link href={`/admin/clients/${license._id}`} className="hover:underline">
                      {license.clientName}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{license.adminEmail}</TableCell>
                  <TableCell className="text-center">{license.licenseCount}</TableCell>
                  <TableCell className="text-center">{license.usedLicenses}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={license.status === 'teljesen kihasznált' ? 'destructive' : 'default'}>
                      {license.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <ClientActions clientId={license._id} clientName={license.clientName} />
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