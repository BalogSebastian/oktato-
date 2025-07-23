// components/admin/AddLicensesForm.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  clientId: z.string().optional(),
  additionalLicenses: z.coerce.number().int().min(1, { message: "A licenszek száma legalább 1 kell legyen." }),
}).refine((data) => {
    // Ha nincs clientId prop megadva és nincs clientId kiválasztva az űrlapon, akkor hiba
    if (!data.clientId && !("clientId" in data)) { // Ha a clientId undefined a defaultValues-ban és nem is választották ki
        return false;
    }
    return true;
}, {
    message: "Kérem, válasszon ki egy ügyfelet.",
    path: ["clientId"],
});


type AddLicensesFormValues = z.infer<typeof formSchema>;

interface AddLicensesFormProps {
  initialClients?: { value: string; label: string }[];
  clientId?: string;
  clientName?: string;
}

export function AddLicensesForm({ initialClients, clientId, clientName }: AddLicensesFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [clients, setClients] = useState(initialClients || []);
  const [isFetchingClients, setIsFetchingClients] = useState(false);

  const form = useForm<AddLicensesFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientId: clientId,
      additionalLicenses: undefined, // undefined legyen a default!
    },
  });

  const handleOpenChange = async (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen && !clientId && clients.length === 0) {
      setIsFetchingClients(true);
      try {
        const response = await fetch('/api/clients');
        const data = await response.json();
        if (response.ok) {
          setClients(data.map((c: any) => ({ value: c._id, label: c.name })));
        } else {
          toast.error("Hiba az ügyfelek betöltésekor.", { description: data.message });
        }
      } catch (error: any) {
        toast.error("Hiba az ügyfelek betöltésekor.", { description: error.message });
      } finally {
        setIsFetchingClients(false);
      }
    }
  };

  async function onSubmit(values: AddLicensesFormValues) {
    setIsLoading(true);
    let targetClientId = values.clientId || clientId;

    if (!targetClientId) {
        toast.error("Kérem, válasszon egy ügyfelet, vagy adja meg az ügyfél ID-t!");
        setIsLoading(false);
        return;
    }

    try {
      const response = await fetch(`/api/clients/${targetClientId}/update-licenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ additionalLicenses: values.additionalLicenses }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Ismeretlen hiba történt.");
      }

      const currentClientName = clients.find(c => c.value === targetClientId)?.label || clientName || "Ismeretlen ügyfél";

      toast.success("Licenszek sikeresen hozzáadva!", {
        description: `${values.additionalLicenses} új licensz került hozzáadásra a(z) ${currentClientName} ügyfélhez.`,
      });

      setOpen(false);
      form.reset({ clientId: clientId, additionalLicenses: undefined });
      router.refresh();

    } catch (error: any) {
      console.error("API Hiba a licensz hozzáadásakor:", error);
      toast.error("Hiba történt!", {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  }

  const dialogDescriptionText = clientId 
    ? `Adja meg, hány további licenszt szeretne hozzáadni a(z) **${clientName}** ügyfélhez.`
    : `Válasszon egy ügyfelet, és adja meg, hány további licenszt szeretne hozzáadni.`;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm" className="gap-1">
          <PlusCircle className="mr-2 h-4 w-4" /> Licensz Hozzáadása
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Licenszek Hozzáadása</DialogTitle>
          <DialogDescription dangerouslySetInnerHTML={{ __html: dialogDescriptionText }} />
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {!clientId && (
              <FormField
                control={form.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ügyfél</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isFetchingClients}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={isFetchingClients ? "Ügyfelek betöltése..." : "Válasszon egy ügyfelet"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clients.length > 0 ? (
                            clients.map(client => (
                                <SelectItem key={client.value} value={client.value}>
                                    {client.label}
                                </SelectItem>
                            ))
                        ) : (
                            <SelectItem value="no-clients" disabled>Nincs elérhető ügyfél</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="additionalLicenses"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hozzáadandó licenszek száma</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      {...field}
                      value={field.value === undefined || field.value === null ? "" : String(field.value)}
                      onChange={(e) => {
                        field.onChange(e.target.value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isLoading || (!clientId && !form.watch('clientId'))}>
                {isLoading ? "Hozzáadás..." : "Licenszek Hozzáadása"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}