// Fájl: components/forms/LoginForm.tsx

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
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link"; // <-- FONTOS: Új import

const formSchema = z.object({
  email: z.string().email({ message: "Érvénytelen e-mail cím." }),
  password: z.string().min(1, { message: "A jelszó megadása kötelező." }),
});

type LoginFormValues = z.infer<typeof formSchema>;

export function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginFormValues) {
    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: values.email,
        password: values.password,
      });

      if (result?.error) {
        throw new Error(result.error);
      }
      
      if (result?.ok) {
        toast.success("Sikeres bejelentkezés! Átirányítás...");
        router.push('/'); 
      }

    } catch (error: any) {
      toast.error("Hiba történt!", {
        description: error.message || "Ismeretlen hiba a bejelentkezés során.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      {/* A space-y-t csökkentettem 4-re, hogy jobban nézzen ki */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail cím</FormLabel>
              <FormControl>
                <Input placeholder="admin@pelda.hu" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              {/* JAVÍTÁS: A jelszó címke és az új link egy sorban */}
              <div className="flex items-center">
                <FormLabel>Jelszó</FormLabel>
                <Link
                  href="/forgot-password"
                  className="ml-auto inline-block text-sm underline"
                >
                  Elfelejtett jelszó?
                </Link>
              </div>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Bejelentkezés..." : "Bejelentkezés"}
        </Button>
      </form>
    </Form>
  );
}