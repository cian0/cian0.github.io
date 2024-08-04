import React from 'react';
import '@/app/globals.css'
import '@/styles/nes.css'
import Layout from '../components/Layout';

import { useEffect } from 'react';
import initEruda from '../utils/eruda';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    initEruda();
  }, []);

  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}

export default MyApp