import React from 'react';
import '@/app/globals.css'
import '@/styles/nes.css'
import Layout from '../components/Layout';

import { GoogleAnalytics } from '@next/third-parties/google'
import { useEffect } from 'react';
import initEruda from '../utils/eruda';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    initEruda();
  }, []);

  return (
    <Layout>
      {process.env.NODE_ENV === 'production' && (
        <GoogleAnalytics gaId="G-X9KC1Y41ER" />
      )}
      <Component {...pageProps} />
    </Layout>
  );
}

export default MyApp