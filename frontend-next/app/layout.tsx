
import React from "react";
import type { Metadata } from "next";
import { Roboto, Bebas_Neue, DM_Mono } from "next/font/google";
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
  display: 'swap',
  variable: '--font-roboto',
});

const bebas = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas',
  display: 'swap',
});

const dmMono = DM_Mono({
  weight: ['300', '400'],
  subsets: ['latin'],
  variable: '--font-dm-mono',
  display: 'swap',
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
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_IS_CAPACITOR === 'true' ? (process.env.NEXT_PUBLIC_API_URL || 'https://flipzokart-backend.onrender.com') : 'https://flipzokart-backend.onrender.com'} crossOrigin="anonymous" />
        {/* OneSignal Push Notifications */}
        <Script
          src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js"
          strategy="afterInteractive"
        />
        <Script id="onesignal-init" strategy="afterInteractive">
          {`
            window.OneSignalDeferred = window.OneSignalDeferred || [];
            OneSignalDeferred.push(async function(OneSignal) {
              await OneSignal.init({
                appId: "a9ac4952-87c5-4000-b1a7-fdb9de4d800e",
                safari_web_id: "web.onesignal.auto.1b5ff574-1f63-4acf-ab26-dadb313db610",
                notifyButton: {
                  enable: true,
                },
              });
              await OneSignal.Notifications.requestPermission();
            });
          `}
        </Script>
      </head>
      <body className={`${roboto.className} ${bebas.variable} ${dmMono.variable} font-roboto`}>
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
