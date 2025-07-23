// components/admin/SettingForm.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Path } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

const createSettingSchema = (settings: SettingData[]) => {
  const schemaFields: { [key: string]: z.ZodTypeAny } = {};
  settings.forEach(setting => {
    switch (setting.type) {
      case 'string':
        schemaFields[setting.key] = z.string().min(1, `${setting.description} megadása kötelező.`);
        break;
      case 'number':
        schemaFields[setting.key] = z.coerce.number().min(0, `${setting.description} nem lehet negatív.`).int().optional();
        break;
      case 'boolean':
        schemaFields[setting.key] = z.boolean();
        break;
      case 'json':
        schemaFields[setting.key] = z.string().refine(val => {
          try {
            JSON.parse(val);
            return true;
          } catch {
            return false;
          }
        }, `${setting.description} érvénytelen JSON formátum.`);
        break;
      default:
        schemaFields[setting.key] = z.any();
    }
  });
  return z.object(schemaFields);
};

type SettingData = {
  _id: string;
  key: string;
  value: any;
  description?: string;
  type: 'string' | 'number' | 'boolean' | 'json';
};

interface SettingFormProps {
  initialSettings: SettingData[];
}

export function SettingForm({ initialSettings }: SettingFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const formSchema = createSettingSchema(initialSettings);
  type FormValues = z.infer<typeof formSchema>;

  const defaultValues: FormValues = initialSettings.reduce((acc, setting) => {
    if (setting.type === 'number') {
      acc[setting.key] = Number(setting.value);
    } else if (setting.type === 'boolean') {
      acc[setting.key] = Boolean(setting.value);
    } else if (setting.type === 'json') {
      acc[setting.key] = JSON.stringify(setting.value, null, 2);
    }
    else {
      acc[setting.key] = setting.value;
    }
    return acc;
  }, {} as FormValues);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues,
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    try {
      for (const setting of initialSettings) {
        let valueToSave = values[setting.key as keyof FormValues];

        if (setting.type === 'json' && typeof valueToSave === 'string') {
          valueToSave = JSON.parse(valueToSave);
        } 
        
        const response = await fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            key: setting.key,
            value: valueToSave,
            type: setting.type,
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || `Hiba a(z) '${setting.key}' beállítás mentésekor.`);
        }
      }

      toast.success("Beállítások sikeresen mentve!");
      router.refresh();

    } catch (error: any) {
      console.error("Beállítások mentési hiba:", error);
      toast.error("Hiba történt a beállítások mentésekor.", {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {initialSettings.map(setting => (
          <FormField
            key={setting.key}
            name={setting.key as Path<FormValues>} 
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{setting.description}</FormLabel>
                <FormControl>
                  {/* JAVÍTVA: React.Fragment helyett DIV használata */}
                  <div className="flex flex-col space-y-2"> 
                    {setting.type === 'string' && (
                      <Input {...field} type="text" />
                    )}
                    {setting.type === 'number' && (
                      <Input 
                          {...field} 
                          type="number" 
                          value={field.value === undefined || field.value === null ? "" : String(field.value)}
                          onChange={e => field.onChange(e.target.value)} 
                      />
                    )}
                    {setting.type === 'boolean' && (
                      <Switch 
                        checked={field.value} 
                        onCheckedChange={field.onChange} 
                      />
                    )}
                     {setting.type === 'json' && (
                      <Textarea 
                        {...field} 
                        rows={5} 
                        placeholder="Írja be a JSON adatokat..." 
                        value={typeof field.value === 'object' && field.value !== null ? JSON.stringify(field.value, null, 2) : String(field.value || "")}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    )}
                  </div>
                </FormControl>
                <FormDescription>Kulcs: `{setting.key}`</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? "Mentés..." : "Beállítások Mentése"}
        </Button>
      </form>
    </Form>
  );
}