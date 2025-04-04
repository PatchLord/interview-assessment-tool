"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Users, UserCircle, FileText, Settings, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"

export default function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const isAdmin = session?.user?.role === "admin"

  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      show: true,
    },
    {
      title: "Interviewers",
      href: "/dashboard/interviewers",
      icon: Users,
      show: isAdmin,
    },
    {
      title: "Candidates",
      href: "/dashboard/candidates",
      icon: UserCircle,
      show: true,
    },
    {
      title: "Interviews",
      href: "/dashboard/interviews",
      icon: FileText,
      show: true,
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
      show: true,
    },
  ]

  return (
    <div className="flex flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Interview Tool</h1>
      </div>
      <nav className="flex-1 px-4 space-y-1">
        {navItems
          .filter((item) => item.show)
          .map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center px-2 py-2 text-sm font-medium rounded-md",
                  pathname === item.href
                    ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700",
                )}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.title}
              </Link>
            )
          })}
      </nav>
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <Button variant="ghost" className="w-full justify-start" onClick={() => signOut({ callbackUrl: "/login" })}>
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  )
}

