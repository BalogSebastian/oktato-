// Fájl: components/forms/SetPasswordForm.tsx

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
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";

// Zod séma, ami ellenőrzi a jelszó erősségét és az egyezőséget
const formSchema = z.object({
  password: z.string().min(8, { message: "A jelszónak legalább 8 karakter hosszúnak kell lennie." }),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "A két jelszó nem egyezik.",
  path: ["confirmPassword"], // A hibaüzenet a 'confirmPassword' mező alatt jelenjen meg
});

type SetPasswordFormValues = z.infer<typeof formSchema>;

interface SetPasswordFormProps {
  token: string;
}

export function SetPasswordForm({ token }: SetPasswordFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SetPasswordFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: SetPasswordFormValues) {
    setIsLoading(true);
    try {
      const response = await fetch('/api/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: token,
          password: values.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Ismeretlen hiba történt.");
      }

      toast.success("Jelszó sikeresen beállítva!", {
        description: "Most már bejelentkezhet az új jelszavával.",
      });

      router.push('/login');

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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Új jelszó</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Jelszó megerősítése</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Mentés..." : "Jelszó Beállítása"}
        </Button>
      </form>
    </Form>
  );
}