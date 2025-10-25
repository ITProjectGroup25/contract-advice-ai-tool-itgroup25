import DashboardNav from "@/components/navigation/navbar";
import Header from "@/components/ui/header";
import { SidebarNavItem } from "@/types/nav-types";
import SessionProvider from "@/components/providers/session-provider";
import FormGenerator from "../form-generator/form-generator";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const dashboardConfig: {
    sidebarNav: SidebarNavItem[];
  } = {
    sidebarNav: [
      {
        title: "My Forms",
        href: "/view-forms",
        icon: "library",
      },
      {
        title: "Results",
        href: "/results",
        icon: "list",
      },
      {
        title: "Analytics",
        href: "/analytics",
        icon: "lineChart",
      },
      {
        title: "Charts",
        href: "/charts",
        icon: "pieChart",
      },
      {
        title: "Settings",
        href: "/settings",
        icon: "settings",
      },
    ],
  };
  return (
    <div className="flex min-h-screen flex-col space-y-6">
      <Header />
      <div className="container grid flex-1 gap-12 md:grid-cols-[200px_1fr]">
        <aside className="hidden w-[200px] flex-col justify-between border-r pr-2 md:flex">
          <DashboardNav items={dashboardConfig.sidebarNav} />
        </aside>
        <main className="flex w-full flex-1 flex-col overflow-hidden">
          <header className="flex items-center">
            <h1 className="m-5 p-4 text-4xl font-normal">Dashboard</h1>
            <SessionProvider>
              <FormGenerator />
            </SessionProvider>
          </header>
          <hr className="my-4" />
          {children}
        </main>
      </div>
    </div>
  );
}
