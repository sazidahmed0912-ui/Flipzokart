
import React from "react";
import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { Providers } from "./Providers";
import ClientLayout from "./ClientLayout";
import FacebookPixel from "./components/analytics/FacebookPixel";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { DelayedScripts } from "./components/DelayedScripts";

const roboto = Roboto({
  weight: ['300', '400', '500', '700', '900'],
  subsets: ['latin'],
  display: 'optional',
  variable: '--font-roboto',
});

export const metadata: Metadata = {
  title: "Fzokart - Premium Indian Marketplace",
  description: "A modern, high-performance e-commerce platform with a clean Indian marketplace aesthetic, featuring a full shopping experience and a robust admin dashboard.",
  other: {
    "google-adsense-account": "ca-pub-1922737502570845",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
      </head>
      <body className={`${roboto.className} font-roboto`}>
        <DelayedScripts />


        <Providers>
          <React.Suspense fallback={null}>
            <FacebookPixel />
          </React.Suspense>
          <ClientLayout>
            {children}
          </ClientLayout>
        </Providers>
        <ToastContainer position="top-right" autoClose={2500} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover limit={3} />
      </body>
    </html>
  );
}
