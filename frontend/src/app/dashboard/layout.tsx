'use client';

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  BookOpen, 
  FileText, 
  Settings, 
  Bell,
  LogOut,
  Briefcase,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserProfileMenu } from "@/components/dashboard/user-profile-menu";

const navItems = [
  { href: "/dashboard",             label: "Overview",    icon: LayoutDashboard },
  { href: "/dashboard/internships", label: "Internships", icon: Briefcase },
  { href: "/dashboard/diary",       label: "Daily Diary", icon: BookOpen },
  { href: "/dashboard/logs",        label: "Log History", icon: Calendar },
  { href: "/dashboard/reports",     label: "Reports",     icon: FileText },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("workdiary-current-user");
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen w-full bg-zinc-50 dark:bg-zinc-950">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
      
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-zinc-200/50 dark:border-zinc-800/50 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl z-10">
        <div className="h-14 flex items-center px-6 border-b border-zinc-200/50 dark:border-zinc-800/50">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
              <Briefcase className="w-5 h-5" />
            </div>
            WorkDiary AI
          </Link>
        </div>

        <div className="flex-1 overflow-auto py-4">
          <nav className="grid gap-1 px-4 text-sm font-medium">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive = href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                    isActive
                      ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 font-semibold"
                      : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-4 border-t border-zinc-200/50 dark:border-zinc-800/50">
          <nav className="grid gap-1 text-sm font-medium">
            <Link
              href="/settings"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-zinc-500 transition-all hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
            <button onClick={handleLogout} className="flex items-center gap-3 rounded-lg px-3 py-2 text-red-500 transition-all hover:bg-red-50 dark:hover:bg-red-950/50 w-full text-left">
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex flex-col flex-1 z-10 overflow-hidden">
        <header className="h-14 flex items-center justify-end px-6 border-b border-zinc-200/50 dark:border-zinc-800/50 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-zinc-500" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>
            <UserProfileMenu />
          </div>
        </header>
        <div className="flex-1 p-6 md:p-8 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
