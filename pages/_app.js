import React from 'react';
import '@/app/globals.css'
import '@/styles/nes.css'

import { useEffect } from 'react';
import initEruda from '../utils/eruda';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    initEruda();
  }, []);

  return <Component {...pageProps} />
}

export default MyApp
