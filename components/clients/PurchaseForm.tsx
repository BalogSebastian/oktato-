// components/client/PurchaseForm.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
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
import { Loader2 } from "lucide-react";

const purchaseSchema = z.object({
  packageType: z.enum(['5_LICENSES', '10_LICENSES', '15_LICENSES', '20_LICENSES', 'CUSTOM'], {
    message: "Kérjük, válasszon egy csomagtípust."
  }),
  customLicenses: z.coerce.number().int().min(1, { message: "Az egyedi licensz száma legalább 1." }).optional(),
}).superRefine((data, ctx) => {
  // Egyedi validáció: ha 'CUSTOM' a packageType, akkor a customLicenses kötelező
  if (data.packageType === 'CUSTOM' && (data.customLicenses === undefined || data.customLicenses <= 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Egyedi licensz választása esetén a darabszám megadása kötelező (min. 1).",
      path: ['customLicenses'],
    });
  }
});

type PurchaseFormValues = z.infer<typeof purchaseSchema>;

export function PurchaseForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<PurchaseFormValues>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      packageType: '5_LICENSES',
      customLicenses: undefined,
    },
  });

  const selectedPackageType = form.watch("packageType");

  async function onSubmit(values: PurchaseFormValues) {
    setIsLoading(true);
    try {
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Ismeretlen hiba történt a vásárlás során.");
      }

      toast.success("Sikeres vásárlás!", {
        description: data.message, // "Licenszcsomag sikeresen megvásárolva és hozzáadva!"
      });
      form.reset({ packageType: '5_LICENSES', customLicenses: undefined });
      router.refresh(); // Frissíti a dashboardot az új licenszszámmal

    } catch (error: any) {
      console.error("Vásárlási hiba:", error);
      toast.error("Hiba történt a vásárlás során.", {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="packageType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Válasszon licensz csomagot</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Válasszon egy csomagot" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="5_LICENSES">5 licensz</SelectItem>
                  <SelectItem value="10_LICENSES">10 licensz</SelectItem>
                  <SelectItem value="15_LICENSES">15 licensz</SelectItem>
                  <SelectItem value="20_LICENSES">20 licensz</SelectItem>
                  <SelectItem value="CUSTOM">Egyedi licensz száma</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedPackageType === 'CUSTOM' && (
          <FormField
            control={form.control}
            name="customLicenses"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Egyedi licensz darabszám</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="1" 
                    placeholder="Pl. 25" 
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
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? "Vásárlás feldolgozása..." : "Licensz csomag vásárlása"}
        </Button>
      </form>
    </Form>
  );
}