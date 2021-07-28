import React from 'react';
import { AppProps } from 'next/app';
import Head from 'next/head';
import '../../styles/globals.css';
import Header from '@src/components/Header';
import Footer from '@src/components/Footer';
import { ToastProvider } from '@src/components/Toast';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <body className="flex flex-col min-h-screen">
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/site.webmanifest" />
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
