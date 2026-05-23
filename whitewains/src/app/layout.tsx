import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "White Wains",
  description: "The White Wains family — Red Dead Redemption 2 RP",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-background text-foreground antialiased" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>{children}</body>
    </html>
  );
}
