// app/admin/emails/page.tsx
"use client"; // <-- FONTOS: Ez teszi kliens oldali komponenssé

import { useState, useEffect } from 'react';
import { useSession } from "next-auth/react"; // <-- ÚJ IMPORT
import { useRouter } from "next/navigation"; // <-- ÚJ IMPORT
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
import { Mail, Send } from "lucide-react";

type EmailLogData = {
  id: string;
  to: string;
  from: string;
  subject: string;
  status: string;
  type: string;
  timestamp: string;
};

export default function EmailLogsPage() { // <-- MÓDOSÍTÁS: export default function, nem async
  const { data: session, status } = useSession(); // Lekérjük a sessiont és a státuszát
  const router = useRouter();
  const [emailLogs, setEmailLogs] = useState<EmailLogData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Csak akkor kérjük le az adatokat, ha a session már betöltődött
    if (status === 'loading') return;

    // Jogosultság ellenőrzés a kliens oldalon is
    if (!session || session.user?.role !== 'SUPER_ADMIN') {
      router.push('/login'); // Átirányítás
      return;
    }

    const fetchEmails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // A NEXTAUTH_URL nem elérhető a kliens oldalon közvetlenül,
        // ezért relatív útvonalat használunk, vagy a window.location.origin-t
        const baseUrl = window.location.origin; 
        const response = await fetch(`${baseUrl}/api/emails`, {
          cache: 'no-store',
          headers: {
            // FONTOS: Átadjuk a JWT tokent az Authorization headerben
            'Authorization': `Bearer ${session.accessToken}`, 
          }
        });

        if (response.ok) {
          const data = await response.json();
          setEmailLogs(data);
        } else {
          const errorData = await response.json();
          console.error("Hiba az e-mail logok lekérdezésekor:", response.status, response.statusText, errorData);
          setError(errorData.message || `Hiba az adatok lekérésekor: ${response.status}`);
        }
      } catch (err: any) {
        console.error("Hiba az e-mail logok fetch-elésekor:", err);
        setError(`Hálózati hiba: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmails();
  }, [session, status, router]); // Dependency array: újrafut, ha ezek változnak

  // Betöltési állapot kezelése
  if (isLoading || status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-120px)]">
        <p>E-mail logok betöltése...</p>
      </div>
    );
  }

  // Hibaüzenet megjelenítése
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-120px)] text-red-600">
        <p>Hiba: {error}</p>
      </div>
    );
  }

  const totalEmails = emailLogs.length;
  const sentEmails = emailLogs.filter(log => log.status === 'Küldve').length;
  const failedEmails = emailLogs.filter(log => log.status === 'Sikertelen').length;

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">E-mail Napló</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Összes E-mail</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmails}</div>
            <p className="text-xs text-muted-foreground">Összes küldési kísérlet</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sikeresen Elküldve</CardTitle>
            <Send className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sentEmails}</div>
            <p className="text-xs text-muted-foreground">Sikeresen célba ért e-mailek</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sikertelen Küldések</CardTitle>
            <Mail className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{failedEmails}</div>
            <p className="text-xs text-muted-foreground">Hibásan vagy sikertelenül küldött e-mailek</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>E-mail Napló Bejegyzések</CardTitle>
          <CardDescription>
            A rendszer által kiküldött e-mailek részletes logja.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Címzett</TableHead>
                <TableHead>Feladó</TableHead>
                <TableHead>Tárgy</TableHead>
                <TableHead className="text-center">Típus</TableHead>
                <TableHead className="text-center">Státusz</TableHead>
                <TableHead className="text-right">Dátum</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {emailLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-4">
                    Nincsenek e-mail log bejegyzések.
                  </TableCell>
                </TableRow>
              ) : (
                emailLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{log.to}</TableCell>
                    <TableCell>{log.from}</TableCell>
                    <TableCell className="text-muted-foreground">{log.subject}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">{log.type}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={log.status === 'Küldve' ? 'default' : 'destructive'}>
                        {log.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {new Date(log.timestamp).toLocaleString('hu-HU')}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}