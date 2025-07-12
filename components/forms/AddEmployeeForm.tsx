// Fájl: components/forms/AddEmployeeForm.tsx

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
import { PlusCircle } from "lucide-react";

const formSchema = z.object({
  email: z.string().email({ message: "Érvénytelen e-mail cím." }),
});

type AddEmployeeFormValues = z.infer<typeof formSchema>;

interface AddEmployeeFormProps {
  isDisabled: boolean;
}

export function AddEmployeeForm({ isDisabled }: AddEmployeeFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<AddEmployeeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: AddEmployeeFormValues) {
    setIsLoading(true);
    try {
      const response = await fetch('/api/employees/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Ismeretlen hiba történt.");
      }

      toast.success("Munkavállaló sikeresen hozzáadva!", {
        description: `${values.email} meghívót kapott a rendszerhez.`,
      });

      setOpen(false); // Bezárjuk a dialógus ablakot
      form.reset();
      router.refresh(); // Frissítjük az oldalt, hogy a táblázatban megjelenjen az új user

    } catch (error: any) {
      toast.error("Hiba történt!", {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" disabled={isDisabled}>
          <PlusCircle className="mr-2 h-5 w-5" />
          Munkavállaló Hozzáadása
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Új munkavállaló hozzáadása</DialogTitle>
          <DialogDescription>
            Adja meg a munkavállaló e-mail címét. A rendszer automatikusan küld neki egy meghívót.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail cím</FormLabel>
                  <FormControl>
                    <Input placeholder="munkavallalo@ceg.hu" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Hozzáadás..." : "Meghívó Küldése"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}