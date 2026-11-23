import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ziggy's Day",
  description: "Three AI agents negotiate what to do with a dog.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-stone-950 text-stone-100 antialiased">{children}</body>
    </html>
  );
}
