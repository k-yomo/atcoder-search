import React from 'react';
import { AppProps } from 'next/app';
import { ThemeProvider } from 'next-themes';
import '../../styles/globals.css';
import Header from '@src/components/Header';
import Footer from '@src/components/Footer';
import { ToastProvider } from '@src/components/Toast';
import { usePageView } from '@src/lib/gtag';

export default function MyApp({ Component, pageProps }: AppProps) {
  usePageView();

  return (
    <ThemeProvider attribute="class">
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="z-0 flex-grow relative bg-white dark:bg-black">
          <ToastProvider>
            <Component {...pageProps} />
          </ToastProvider>
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
}
