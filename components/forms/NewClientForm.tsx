"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { toast } from "sonner";
import { useState } from "react";

// A Zod séma definiálja az űrlap mezőit és a validációs szabályokat.
const formSchema = z.object({
  clientName: z.string().min(2, { message: "A név legalább 2 karakter hosszú legyen." }),
  adminEmail: z.string().email({ message: "Érvénytelen e-mail cím." }),
  licenseCount: z.coerce.number().min(1, { message: "A licencek száma legalább 1." }),
  courseId: z.string().min(1, { message: "Válasszon egy oktatást." }),
});

// A séma alapján létrehozunk egy TypeScript típust.
type NewClientFormValues = z.infer<typeof formSchema>;

interface NewClientFormProps {
  courses: { value: string; label: string }[];
}

export function NewClientForm({ courses }: NewClientFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  // A react-hook-form inicializálása a sémánkkal és az alapértelmezett értékekkel.
  const form = useForm<NewClientFormValues>({
    resolver: zodResolver(formSchema),
    // FONTOS JAVÍTÁS: Az alapértelmezett értékeknek minden mezőt tartalmazniuk kell,
    // ami a sémában szerepel, hogy a TypeScript típusok helyesek legyenek.
    defaultValues: {
      clientName: "",
      adminEmail: "",
      licenseCount: 1,
      courseId: "", // Ez a sor lett hozzáadva a hiba javításához.
    },
  });

  // Az űrlap elküldésekor lefutó aszinkron függvény.
  async function onSubmit(values: NewClientFormValues) {
    setIsLoading(true);
    try {
      const response = await fetch('/api/clients/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Ismeretlen hiba történt.");
      }

      toast.success("Sikeres létrehozás!", {
        description: `${values.clientName} ügyfél fiókja elkészült.`,
      });
      form.reset();

    } catch (error: any) {
      toast.error("Hiba történt!", {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      {/* A handleSubmit most már hiba nélkül fogadja az onSubmit függvényt. */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="clientName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cégnév</FormLabel>
              <FormControl>
                <Input placeholder="Példa Kft." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="adminEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ügyfél Admin E-mail címe</FormLabel>
              <FormControl>
                <Input placeholder="admin@pelda.hu" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="licenseCount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Licencek száma</FormLabel>
              <FormControl>
                <Input type="number" min="1" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="courseId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hozzárendelt Oktatás</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Válasszon egy oktatási anyagot" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {courses.map(course => (
                    <SelectItem key={course.value} value={course.value}>
                      {course.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Létrehozás..." : "Ügyfél Létrehozása"}
        </Button>
      </form>
    </Form>
  );
}