import Head from 'next/head';

const SEO = ({
  title = 'Cian Portfolio - Interactive Web Apps & Games',
  description = 'Explore interactive web applications, games, and AI/ML experiments. Portfolio featuring Next.js, React, and modern web technologies.',
  url = 'https://cian0.github.io',
  image = 'https://cian0.github.io/preview.png',
  keywords = 'portfolio, web development, react, nextjs, games, AI, ML, interactive apps'
}) => {
  const fullTitle = title.includes('Cian Portfolio') ? title : `${title} | Cian Portfolio`;

  return (
    <Head>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      
      {/* Twitter */}
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={url} />
    </Head>
  );
};

export default SEO;
