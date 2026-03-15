import { connectDB } from "@/lib/db";
import { Header as HeaderModel } from "@/lib/models/Header";
import { Footer as FooterModel } from "@/lib/models/Footer";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { SessionProvider } from "@/components/providers/session-provider";

async function getLayoutData() {
  await connectDB();
  const [header, footer] = await Promise.all([
    HeaderModel.findOne().lean(),
    FooterModel.findOne().lean(),
  ]);
  return {
    header: header ? JSON.parse(JSON.stringify(header)) : null,
    footer: footer ? JSON.parse(JSON.stringify(footer)) : null,
  };
}

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { header, footer } = await getLayoutData();

  return (
    <SessionProvider>
      <div className="flex min-h-screen flex-col">
        <Header data={header} />
        <main className="flex-1">{children}</main>
        <Footer data={footer} />
      </div>
    </SessionProvider>
  );
}
