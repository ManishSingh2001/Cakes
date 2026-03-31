import type { Metadata } from "next";
import { Playfair_Display, Lato } from "next/font/google";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { connection } from "next/server";
import { connectDB } from "@/lib/db";
import { SiteSettings } from "@/lib/models/SiteSettings";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

const lato = Lato({
  variable: "--font-body",
  weight: ["300", "400", "700", "900"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Sweet Delights Bakery — Premium Cakes & Pastries",
    template: "%s | Sweet Delights Bakery",
  },
  description:
    "Handcrafted premium cakes and pastries for every occasion. Order online for delivery.",
};

async function getThemeColors() {
  try {
    await connection();
    await connectDB();
    const settings = await SiteSettings.findOne().lean();
    if (settings?.theme) {
      return {
        primaryColor: settings.theme.primaryColor || "#D4A574",
        secondaryColor: settings.theme.secondaryColor || "#8B4513",
        accentColor: settings.theme.accentColor || "#F5E6D3",
      };
    }
  } catch {
    // Fallback to defaults
  }
  return {
    primaryColor: "#D4A574",
    secondaryColor: "#8B4513",
    accentColor: "#F5E6D3",
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const theme = await getThemeColors();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${playfair.variable} ${lato.variable} font-body antialiased`}
        style={{
          "--cake-gold": theme.primaryColor,
          "--cake-brown": theme.secondaryColor,
          "--cake-cream": theme.accentColor,
        } as React.CSSProperties}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            {children}
          </TooltipProvider>
          <Toaster position="top-right" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
