import { SessionProvider } from "@/components/providers/session-provider";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SessionProvider>{children}</SessionProvider>;
}
