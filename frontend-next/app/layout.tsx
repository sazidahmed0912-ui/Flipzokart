
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

const roboto = Roboto({
  weight: ['300', '400', '500', '700', '900'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto',
});

export const metadata: Metadata = {
  title: "Fzokart - Premium Indian Marketplace",
  description: "A modern, high-performance e-commerce platform with a clean Indian marketplace aesthetic, featuring a full shopping experience and a robust admin dashboard.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${roboto.className} font-roboto`}>
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-5PBFNG4P');`}
        </Script>

        <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-5PBFNG4P" height="0" width="0" style={{ display: 'none', visibility: 'hidden' }}></iframe></noscript>

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
