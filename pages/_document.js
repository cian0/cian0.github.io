import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Fonts and Styles */}
        <link href="https://unpkg.com/nes.css@latest/css/nes.min.css" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet" />
        
        {/* SEO Meta Tags */}
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#212529" />
        <meta name="author" content="Cian Portfolio" />
        <link rel="canonical" href="https://cian0.github.io" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://cian0.github.io" />
        <meta property="og:site_name" content="Cian Portfolio" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://cian0.github.io" />
        
        {/* Structured Data - Organization/Person Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              "name": "Cian",
              "url": "https://cian0.github.io",
              "sameAs": [
                "https://github.com/cian0"
              ],
              "jobTitle": "Software Developer",
              "description": "Interactive portfolio showcasing web development projects, games, and AI/ML experiments"
            })
          }}
        />
      </Head>
      <body className="is-dark">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
