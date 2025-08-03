import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pizzaofen-Steuerung",
  description: "W3M20035.1 Cloud Infrastructures and Cloud Native Applications",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
