import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
});

export const metadata: Metadata = {
  title: "Projetos · Crisol",
  description: "Os projetos em mãos, do sim na chamada até pago.",
  icons: { icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect x='4' y='6' width='24' height='20' rx='2' fill='%23141414'/><rect x='8' y='10' width='16' height='12' fill='%23fbfbf9'/><ellipse cx='16' cy='16' rx='13' ry='11' fill='none' stroke='%23d32f2f' stroke-width='2.5'/></svg>" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-PT" className={archivo.variable}>
      <body>{children}</body>
    </html>
  );
}
