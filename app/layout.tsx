import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { ClerkProviderGate } from "@/providers/clerk-provider";
import { ThemeProvider } from "@/providers/theme-provider";

// Zoho uses Roboto across its products
const roboto = Roboto({
  subsets: ["latin"],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "Inventory",
  description: "Inventory management back office",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${roboto.variable} font-sans`}>
        <ClerkProviderGate>
          <ThemeProvider attribute="class">
            {children}
            <Toaster position="bottom-right" richColors />
          </ThemeProvider>
        </ClerkProviderGate>
      </body>
    </html>
  );
}
