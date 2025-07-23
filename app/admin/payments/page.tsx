// app/admin/payments/page.tsx
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/dbConnect";
import Payment from "@/lib/models/Payment.model";
import Client from "@/lib/models/Client.model";
import User from "@/lib/models/User.model";
import { IPayment, IClient, IUser } from "@/lib/types"; // Importáljuk az interfészeket
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
import { DollarSign, Layers, CheckCircle } from "lucide-react"; // Ikonok

// A fizetési adat típusa a listához
type PaymentData = {
  _id: string;
  clientName: string;
  userEmail: string;
  amount: number;
  licensesAdded: number;
  packageType: string;
  status: string;
  transactionId: string;
  createdAt: string;
};

export default async function PaymentsPage() {
  const session = await getServerSession(authOptions);

  // Jogosultság ellenőrzés: csak Super Admin férhet hozzá
  if (!session || session.user?.role !== 'SUPER_ADMIN') {
    redirect('/login');
  }

  await dbConnect();

  // Lekérjük az összes fizetést, populáljuk a klienst és a felhasználót
  const payments: IPayment[] = await Payment.find({})
    .populate({
      path: 'client',
      model: Client,
      select: 'name'
    })
    .populate({
      path: 'user',
      model: User,
      select: 'email'
    })
    .sort({ createdAt: -1 });

  const paymentsData: PaymentData[] = payments.map(payment => {
    // JAVÍTÁS ITT: Biztosítjuk, hogy a populált adatok típusbiztosan legyenek kezelve.
    // Használjuk az 'instanceof' ellenőrzést vagy a 'typeof object' és 'in' operátort,
    // majd típusátalakítást 'any' vagy egy részleges típusra.

    const clientName = (payment.client && typeof payment.client === 'object' && 'name' in payment.client) 
      ? (payment.client as { name: string }).name // Asszertálunk egy objektumra, amiben csak a 'name' van
      : 'N/A';
      
    const userEmail = (payment.user && typeof payment.user === 'object' && 'email' in payment.user) 
      ? (payment.user as { email: string }).email // Asszertálunk egy objektumra, amiben csak az 'email' van
      : 'N/A';

    return {
      _id: payment._id.toString(),
      clientName: clientName,
      userEmail: userEmail,
      amount: payment.amount,
      licensesAdded: payment.licensesAdded,
      packageType: payment.packageType.replace(/_/g, ' ').toLowerCase(), // pl. '5_LICENSES' -> '5 licenses'
      status: payment.status,
      transactionId: payment.transactionId || '-',
      createdAt: new Date(payment.createdAt).toLocaleDateString('hu-HU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }),
    };
  });

  const totalRevenue = paymentsData.reduce((sum, p) => sum + p.amount, 0);
  const totalLicensesSold = paymentsData.reduce((sum, p) => sum + p.licensesAdded, 0);
  const completedPayments = paymentsData.filter(p => p.status === 'completed').length;

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Fizetések</h1>
        {/* Itt lehetne egy szűrés vagy export funkció */}
      </div>

      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Összes Bevétel (szimulált)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRevenue} Ft</div> {/* Pénznem jelzése */}
            <p className="text-xs text-muted-foreground">Az összes sikeres tranzakció értéke</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eladott Licenszek</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLicensesSold}</div>
            <p className="text-xs text-muted-foreground">Összesen hozzáadott licensz</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sikeres Tranzakciók</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedPayments}</div>
            <p className="text-xs text-muted-foreground">Sikeresen feldolgozott fizetések</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fizetési Előzmények</CardTitle>
          <CardDescription>
            A rendszerben történt összes licensz vásárlási tranzakció.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ügyfél</TableHead>
                <TableHead>Vásárló E-mail</TableHead>
                <TableHead className="text-right">Összeg</TableHead>
                <TableHead className="text-center">Licensz Hozzáadva</TableHead>
                <TableHead className="text-center">Csomagtípus</TableHead>
                <TableHead className="text-center">Státusz</TableHead>
                <TableHead>Tranzakció ID</TableHead>
                <TableHead className="text-right">Dátum</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentsData.map((payment) => (
                <TableRow key={payment._id}>
                  <TableCell className="font-medium">{payment.clientName}</TableCell>
                  <TableCell>{payment.userEmail}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{payment.amount} Ft</TableCell>
                  <TableCell className="text-center">{payment.licensesAdded}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">{payment.packageType}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'}>
                      {payment.status === 'completed' ? 'Sikeres' : 'Függőben'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{payment.transactionId}</TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {payment.createdAt}
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