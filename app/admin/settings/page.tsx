// app/admin/settings/page.tsx
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/dbConnect";
import Setting from "@/lib/models/Setting.model";
import { ISetting } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Cog } from "lucide-react"; // Ikon
import { SettingForm } from "@/components/admin/SettingForm"; // ÚJ IMPORT

// A beállítás adatainak típusa a UI számára
type SettingData = {
  _id: string;
  key: string;
  value: any;
  description?: string;
  type: 'string' | 'number' | 'boolean' | 'json';
};

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  // Jogosultság ellenőrzés: csak Super Admin férhet hozzá
  if (!session || session.user?.role !== 'SUPER_ADMIN') {
    redirect('/login');
  }

  await dbConnect();

  // Lekérjük az összes beállítást
  const settings: ISetting[] = await Setting.find({}).sort({ key: 1 });

  // Konvertáljuk az adatokat a kliens oldali komponens számára
  const initialSettings: SettingData[] = settings.map(setting => ({
    _id: setting._id.toString(),
    key: setting.key,
    value: setting.value,
    description: setting.description,
    type: setting.type,
  }));

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Beállítások</h1>
        <Cog className="h-6 w-6 text-muted-foreground" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rendszer Beállítások</CardTitle>
          <CardDescription>
            Itt módosíthatja a platform működésére vonatkozó globális beállításokat.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SettingForm initialSettings={initialSettings} />
        </CardContent>
      </Card>
    </>
  );
}