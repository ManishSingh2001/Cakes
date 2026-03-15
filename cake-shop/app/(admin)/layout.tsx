import { SessionProvider } from "@/components/providers/session-provider";
import { Sidebar } from "@/components/admin/Sidebar";
import { Topbar } from "@/components/admin/Topbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <div className="lg:pl-64">
          <Topbar />
          <main className="p-6">{children}</main>
        </div>
      </div>
    </SessionProvider>
  );
}
