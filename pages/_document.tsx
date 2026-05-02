import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="es">
      <Head>
        <meta charSet="UTF-8" />
        <meta name="theme-color" content="#0a0f1e" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
        <title>Cotizador BYD — Bjack</title>
        <meta name="description" content="Cotizador oficial BYD Argentina — Bjack" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
