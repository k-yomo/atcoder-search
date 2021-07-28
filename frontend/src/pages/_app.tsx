import React from 'react';
import { AppProps } from 'next/app';
import Head from 'next/head';
import '../../styles/globals.css';
import Header from '@src/components/Header';
import Footer from '@src/components/Footer';
import { ToastProvider } from '@src/components/Toast';
import { existsGaId, usePageView } from '@src/lib/gtag';
import { GA_ID } from '@src/config/env';

export default function MyApp({ Component, pageProps }: AppProps) {
  usePageView();

  return (
    <body className="flex flex-col min-h-screen">
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/site.webmanifest" />
        {existsGaId && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${GA_ID}', {
                    page_path: window.location.pathname,
                  });`,
              }}
            />
          </>
        )}
      </Head>
      <Header />
      <main className="z-0 flex-grow relative">
        <ToastProvider>
          <Component {...pageProps} />
        </ToastProvider>
      </main>
      <Footer />
    </body>
  );
}
