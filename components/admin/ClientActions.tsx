// Fájl: components/admin/ClientActions.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Trash2, Edit, Eye } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link"; // Fontos import

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface ClientActionsProps {
  clientId: string;
  clientName: string;
}

export function ClientActions({ clientId, clientName }: ClientActionsProps) {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "A törlés sikertelen.");
      }

      toast.success(`"${clientName}" sikeresen törölve!`);
      setIsDeleteDialogOpen(false);
      router.refresh();

    } catch (error: any) {
      toast.error("Hiba történt a törlés során.", {
        description: error.message,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button aria-haspopup="true" size="icon" variant="ghost">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Menü</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Akciók</DropdownMenuLabel>
          
          {/* JAVÍTÁS: A "Részletek" most már egy link, ami a megfelelő oldalra visz */}
          <DropdownMenuItem asChild>
            <Link href={`/admin/clients/${clientId}`}>
              <Eye className="mr-2 h-4 w-4" />
              <span>Részletek</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem>
            <Edit className="mr-2 h-4 w-4" />
            Szerkesztés
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-600 focus:text-red-600 focus:bg-red-50"
            onSelect={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Törlés
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Törlés Megerősítése Dialógus (változatlan) */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Biztosan törli?</AlertDialogTitle>
            <AlertDialogDescription>
              Ez a művelet véglegesen törli a(z) **"{clientName}"** nevű ügyfelet és az összes hozzá tartozó felhasználót. Ezt nem lehet visszavonni.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Mégse</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Törlés..." : "Igen, törlöm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}