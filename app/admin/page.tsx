// app/admin/page.tsx
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/dbConnect";
import User from "@/lib/models/User.model";
import Client from "@/lib/models/Client.model";
import Payment from "@/lib/models/Payment.model";
import Course from "@/lib/models/Course.model";
import Setting from "@/lib/models/Setting.model";
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
import {
  Users, DollarSign, BookOpen, Zap, Activity, CheckCircle, XCircle,
  Mail, Settings, TrendingUp, Package, Gift, LayoutDashboard, Clock
} from "lucide-react";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== 'SUPER_ADMIN') {
    redirect('/login');
  }

  await dbConnect();

  // --- Adatok Lekérdezése ---
  const totalUsers = await User.countDocuments({});
  const superAdmins = await User.countDocuments({ role: 'SUPER_ADMIN' });
  const clientAdmins = await User.countDocuments({ role: 'CLIENT_ADMIN' });
  const regularUsers = await User.countDocuments({ role: 'USER' });
  const recentUsers = await User.find({})
    .populate({ path: 'client', select: 'name' })
    .sort({ createdAt: -1 })
    .limit(5) as any[];

  const totalClients = await Client.countDocuments({});
  const totalLicenses = (await Client.aggregate([
    { $group: { _id: null, total: { $sum: "$licenseCount" } } }
  ]))[0]?.total || 0;
  const usedLicenses = await User.countDocuments({ role: 'USER' });
  const licenseUtilization = totalLicenses > 0 ? ((usedLicenses / totalLicenses) * 100).toFixed(1) : 0;

  const totalRevenue = (await Payment.aggregate([
    { $match: { status: 'completed' } },
    { $group: { _id: null, total: { $sum: "$amount" } } }
  ]))[0]?.total || 0;
  const totalLicensesSoldViaPayments = (await Payment.aggregate([
    { $match: { status: 'completed' } },
    { $group: { _id: null, total: { $sum: "$licensesAdded" } } }
  ]))[0]?.total || 0;
  const recentPayments = await Payment.find({})
    .populate({ path: 'client', select: 'name' })
    .populate({ path: 'user', select: 'email' })
    .sort({ createdAt: -1 })
    .limit(5) as any[];

  const totalCourses = await Course.countDocuments({});

  const mockEmailLogsResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/emails`, {
    cache: 'no-store',
    headers: { 'Authorization': `Bearer ${session.accessToken}` }
  });
  const mockEmailLogs = mockEmailLogsResponse.ok ? await mockEmailLogsResponse.json() : [];
  const totalEmailsSent = mockEmailLogs.filter((log: any) => log.status === 'Küldve').length;
  const totalEmailsFailed = mockEmailLogs.filter((log: any) => log.status === 'Sikertelen').length;
  const recentEmailLogs = mockEmailLogs.slice(0, 5);

  const totalSettings = await Setting.countDocuments({});

  // --- Aktuális időpont ---
  const currentTime = new Date().toLocaleString('hu-HU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return (
    // FŐ JAVÍTÁS: Külső div a fekete háttérhez és világos szöveghez
    <div className="bg-black text-white min-h-screen p-6"> 
      {/* Fejléc és Valós idejű indikátor */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-extrabold tracking-tight flex items-center gap-3">
          <LayoutDashboard className="h-10 w-10 text-gray-500 animate-pulse-slow" /> {/* Szürke ikon */}
          Admin Vezérlőpult <span className="text-gray-600 text-2xl">| Átfogó Képernyő</span>
        </h1>
        <div className="flex items-center text-base text-gray-400 bg-gray-900 p-2 rounded-lg shadow-inner"> {/* Sötétszürke háttér */}
          <Zap className="h-5 w-5 mr-2 text-blue-400 animate-pulse" /> {/* Halványabb kék ikon */}
          <span className="font-semibold text-gray-300">ÉLŐ ADATOK:</span> {currentTime}
        </div>
      </div>

      {/* Áttekintő Kártyák */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="hover:shadow-lg transition-shadow duration-200 bg-gray-900 text-gray-200 border-gray-700"> {/* Sötétebb kártya háttér */}
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold">Összes Felhasználó</CardTitle>
            <Users className="h-6 w-6 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{totalUsers}</div>
            <p className="text-sm text-gray-400 flex items-center">
                <span className="mr-2">Roles:</span>
                <Badge variant="default" className="mr-1 bg-gray-700 text-white border-gray-600">{superAdmins} SA</Badge> {/* Sötétebb badge */}
                <Badge variant="secondary" className="mr-1 bg-gray-700 text-white border-gray-600">{clientAdmins} CA</Badge>
                <Badge variant="outline" className="bg-gray-700 text-white border-gray-600">{regularUsers} USR</Badge>
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow duration-200 bg-gray-900 text-gray-200 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold">Licensz Kihasználtság</CardTitle>
            <Activity className="h-6 w-6 text-green-400" /> {/* Halványabb zöld */}
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{licenseUtilization}%</div>
            <p className="text-sm text-gray-400">{usedLicenses} / {totalLicenses} licensz használatban</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow duration-200 bg-gray-900 text-gray-200 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold">Összes Bevétel</CardTitle>
            <DollarSign className="h-6 w-6 text-purple-400" /> {/* Halványabb lila */}
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{totalRevenue} Ft</div>
            <p className="text-sm text-gray-400">{totalLicensesSoldViaPayments} licensz eladva</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow duration-200 bg-gray-900 text-gray-200 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold">Elküldött E-mailek</CardTitle>
            <Mail className="h-6 w-6 text-yellow-400" /> {/* Halványabb sárga */}
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{totalEmailsSent}</div>
            <p className="text-sm text-gray-400 flex items-center">
                <CheckCircle className="h-4 w-4 mr-1 text-green-400" /> {totalEmailsSent} sikeres,
                <XCircle className="h-4 w-4 ml-2 mr-1 text-red-400" /> {totalEmailsFailed} sikertelen
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Részletesebb Statisztikák és Tevékenységek */}
      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3 mb-8">
        {/* Legutóbbi Fizetések */}
        <Card className="bg-gray-900 text-gray-200 border-gray-700">
          <CardHeader>
            <CardTitle>Legutóbbi Fizetések</CardTitle>
            <CardDescription className="text-gray-400">A legutóbbi {recentPayments.length} sikeres tranzakció.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-gray-400">Ügyfél</TableHead>
                  <TableHead className="text-gray-400">Vásárló</TableHead>
                  <TableHead className="text-right text-gray-400">Összeg</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentPayments.length === 0 ? (
                    <TableRow><TableCell colSpan={3} className="text-center text-gray-500">Nincsenek friss fizetések.</TableCell></TableRow>
                ) : (
                    recentPayments.map((payment) => (
                      <TableRow key={payment._id}>
                        <TableCell className="font-medium">
                            {(payment.client as any)?.name || 'N/A'}
                        </TableCell>
                        <TableCell className="text-gray-500">{((payment.user as any)?.email as string)?.split('@')[0] || 'N/A'}</TableCell>
                        <TableCell className="text-right text-gray-300">{payment.amount} Ft</TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Legutóbbi Regisztrációk */}
        <Card className="bg-gray-900 text-gray-200 border-gray-700">
          <CardHeader>
            <CardTitle>Legutóbbi Regisztrációk</CardTitle>
            <CardDescription className="text-gray-400">A legutóbbi {recentUsers.length} új felhasználó.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-gray-400">E-mail</TableHead>
                  <TableHead className="text-gray-400">Szerepkör</TableHead>
                  <TableHead className="text-gray-400">Ügyfél</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentUsers.length === 0 ? (
                    <TableRow><TableCell colSpan={3} className="text-center text-gray-500">Nincsenek friss regisztrációk.</TableCell></TableRow>
                ) : (
                    recentUsers.map((user) => (
                      <TableRow key={user._id}>
                        <TableCell className="font-medium">{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={
                            user.role === 'SUPER_ADMIN' ? 'default' :
                            user.role === 'CLIENT_ADMIN' ? 'secondary' : 'outline'
                          } className="bg-gray-700 text-white border-gray-600">
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-500">
                          {(user.client as any)?.name || 'N/A'}
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Legutóbbi E-mail Logok */}
        <Card className="bg-gray-900 text-gray-200 border-gray-700">
          <CardHeader>
            <CardTitle>Legutóbbi E-mail Logok</CardTitle>
            <CardDescription className="text-gray-400">A legutóbbi {recentEmailLogs.length} e-mail küldési kísérlet.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-gray-400">Címzett</TableHead>
                  <TableHead className="text-gray-400">Típus</TableHead>
                  <TableHead className="text-right text-gray-400">Státusz</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentEmailLogs.length === 0 ? (
                    <TableRow><TableCell colSpan={3} className="text-center text-gray-500">Nincsenek friss e-mail logok.</TableCell></TableRow>
                ) : (
                    recentEmailLogs.map((log: any) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">{log.to.split('@')[0]}@...</TableCell>
                        <TableCell className="text-gray-500">{log.type}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant={log.status === 'Küldve' ? 'default' : 'destructive'} 
                            className={log.status === 'Küldve' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}> {/* Direkt színek a státusznál */}
                            {log.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Globális Rendszer Állapot & Teljesítmény (Jövőbeli Grafikonok) */}
      <Card className="mt-6 border-2 border-dashed border-gray-700 bg-gray-950 text-gray-300"> {/* Sötétebb, textúráltabb hatás */}
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-200">
            Globális Rendszer Állapot & Teljesítmény
          </CardTitle>
          <CardDescription className="text-gray-400">
            Részletesebb elemzések, trendek és beállítások áttekintése.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-gray-500 py-10 space-y-4">
          <p className="text-xl font-semibold text-gray-400">
            🚧 Fejlesztés alatt lévő rész: Hamarosan érkeznek a gyönyörű grafikonok és a valós idejű riasztások! 🚧
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-4">
            <div className="flex flex-col items-center p-4 bg-gray-800 rounded-lg shadow-sm">
                <TrendingUp className="h-10 w-10 text-green-500 mb-2 animate-bounce-custom" />
                <span className="font-medium text-gray-300">Növekedési Trendek</span>
                <p className="text-xs text-gray-500">Új ügyfelek/hó</p>
            </div>
            <div className="flex flex-col items-center p-4 bg-gray-800 rounded-lg shadow-sm">
                <Package className="h-10 w-10 text-orange-500 mb-2 animate-spin-slow-custom" />
                <span className="font-medium text-gray-300">Csomag Elosztás</span>
                <p className="text-xs text-gray-500">Licensz típusok</p>
            </div>
            <div className="flex flex-col items-center p-4 bg-gray-800 rounded-lg shadow-sm">
                <Settings className="h-10 w-10 text-gray-500 mb-2 animate-pulse" />
                <span className="font-medium text-gray-300">Beállítások Száma: {totalSettings}</span>
                <p className="text-xs text-gray-500">Konfigurációs elemek</p>
            </div>
            <div className="flex flex-col items-center p-4 bg-gray-800 rounded-lg shadow-sm">
                <Users className="h-10 w-10 text-blue-500 mb-2" />
                <span className="font-medium text-gray-300">Aktív Felhasználók</span>
                <p className="text-xs text-gray-500">Bejelentkezettek száma (placeholder)</p>
            </div>
            <div className="flex flex-col items-center p-4 bg-gray-800 rounded-lg shadow-sm">
                <BookOpen className="h-10 w-10 text-teal-500 mb-2" />
                <span className="font-medium text-gray-300">Összes Kurzus: {totalCourses}</span>
                <p className="text-xs text-gray-500">Elérhető oktatási anyagok</p>
            </div>
            <div className="flex flex-col items-center p-4 bg-gray-800 rounded-lg shadow-sm">
                <Clock className="h-10 w-10 text-yellow-500 mb-2" />
                <span className="font-medium text-gray-300">Rendszer Üzemidő</span>
                <p className="text-xs text-gray-500">99.9% (feltételezve 😉)</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-6">
            Figyelem: A fenti "grafikonok" csak illusztrációk, a valós adatok feldolgozása és vizualizációja még fejlesztés alatt áll.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}