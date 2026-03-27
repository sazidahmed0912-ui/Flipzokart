"use client";
import React, { useEffect } from 'react';

export const DelayedScripts: React.FC = () => {
  useEffect(() => {
    // Inject scripts after 3 seconds to ensure they do not block main thread during LCP/FCP
    const timer = setTimeout(() => {
      // 1. Google Ads
      const adsScript = document.createElement("script");
      adsScript.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1922737502570845";
      adsScript.async = true;
      adsScript.crossOrigin = "anonymous";
      document.head.appendChild(adsScript);

      // 2. Google Tag Manager (GTM)
      (function(w: any, d, s, l, i) {
        w[l] = w[l] || [];
        w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
        var f = d.getElementsByTagName(s)[0],
          j: any = d.createElement(s),
          dl = l !== 'dataLayer' ? '&l=' + l : '';
        j.async = true;
        j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
        if (f && f.parentNode) {
            f.parentNode.insertBefore(j, f);
        } else {
            document.head.appendChild(j);
        }
      })(window, document, 'script', 'dataLayer', 'GTM-5PBFNG4P');

      // 3. Google Customer Reviews Badge (Global Rating)
      const widgetScript = document.createElement('script');
      widgetScript.id = 'merchantWidgetScript';
      widgetScript.src = 'https://www.gstatic.com/shopping/merchant/merchantwidget.js';
      widgetScript.defer = true;
      widgetScript.addEventListener('load', () => {
        if ((window as any).merchantwidget) {
          (window as any).merchantwidget.start({
            merchant_id: 5753470473,
            position: 'BOTTOM_LEFT', // Can be BOTTOM_RIGHT
          });
        }
      });
      document.head.appendChild(widgetScript);

    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return null;
};
