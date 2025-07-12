// Fájl: components/forms/ForgotPasswordForm.tsx

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useState } from "react";

const formSchema = z.object({
  email: z.string().email({ message: "Érvénytelen e-mail cím." }),
});

type FormValues = z.infer<typeof formSchema>;

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    try {
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Ismeretlen hiba történt.");
      }

      // Sikeres beküldés után már nem a toast üzenetet használjuk,
      // hanem egyből a felületen jelenítjük meg az üzenetet.
      setIsSubmitted(true);

    } catch (error: any) {
      toast.error("Hiba", { description: error.message });
    } finally {
      setIsLoading(false);
    }
  }

  // Ha a felhasználó már elküldte a kérést, egy üzenetet mutatunk neki.
  if (isSubmitted) {
    return (
      <div className="text-center">
        <p>Kérés elküldve.</p>
        <p className="text-sm text-muted-foreground mt-2">Ha a megadott e-mail cím létezik a rendszerünkben, hamarosan kapni fog egy linket a jelszó visszaállításához. Kérjük, ellenőrizze a beérkezett üzeneteit (a spam mappát is beleértve).</p>
      </div>
    );
  }

  // Alapértelmezetten az űrlapot mutatjuk.
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Regisztrált e-mail cím</FormLabel>
              <FormControl>
                <Input placeholder="az.on.email.cime@pelda.hu" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Küldés..." : "Jelszó-visszaállító link küldése"}
        </Button>
      </form>
    </Form>
  );
}