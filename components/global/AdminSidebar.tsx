// components/global/AdminSidebar.tsx

"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  BookOpen,
  BarChart3,
  Settings,
  Mail,
  ClipboardList,
  FolderKanban,
  ShieldCheck,
  Building2,
  BadgeDollarSign,
  Book,
  MonitorSmartphone,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Ügyfelek", href: "/admin/clients", icon: Building2 },
  { label: "Licenszek", href: "/admin/licenses", icon: CreditCard },
  { label: "Felhasználók", href: "/admin/users", icon: Users },
  { label: "Kurzusok", href: "/admin/courses", icon: BookOpen },
  { label: "Fizetések", href: "/admin/payments", icon: BadgeDollarSign },
  { label: "Statisztikák", href: "/admin/stats", icon: BarChart3 },
  { label: "Modulok", href: "/admin/modules", icon: FolderKanban },
  { label: "Fejezetek", href: "/admin/chapters", icon: ClipboardList },
  { label: "Tananyagok", href: "/admin/lessons", icon: Book },
  { label: "Kvízek", href: "/admin/quizzes", icon: MonitorSmartphone },
  { label: "Email logok", href: "/admin/emails", icon: Mail },
  { label: "Beállítások", href: "/admin/settings", icon: Settings },
  { label: "Jogosultságok", href: "/admin/roles", icon: ShieldCheck },
];

export default function AdminSidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  if (session?.user.role !== "SUPER_ADMIN") return null;

  return (
    <aside className="w-64 h-screen border-r hidden md:flex flex-col p-4 space-y-1">
      <h2 className="text-lg font-semibold px-2 mb-3">Oktatási Platform</h2>
      {navItems.map(({ label, href, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium hover:bg-muted",
            pathname === href && "bg-muted"
          )}
        >
          <Icon className="w-4 h-4" />
          {label}
        </Link>
      ))}
    </aside>
  );
}
