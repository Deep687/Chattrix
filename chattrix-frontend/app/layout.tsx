import type { Metadata } from "next";
import type { ReactNode } from "react";
import StoreProvider from "./StoreProvider";
import AuthProvider from "./(auth)/AuthProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chattrix",
  description: "A modern chat application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <StoreProvider>
          <AuthProvider>{children}</AuthProvider>
        </StoreProvider>
      </body>
    </html>
  );
}