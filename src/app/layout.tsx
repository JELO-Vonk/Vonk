import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vonk Blueprint",
  description: "Dating + video roulette blueprint met Next.js en Prisma"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  );
}
