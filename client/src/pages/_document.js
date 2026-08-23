import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en" className="dark">
      <Head>
        <title>Agentflow AI - AI Operations Automation Platform</title>
        <meta name="description" content="Agentic AI Automation Platform for orchestrating multi-agent visual workflows with LangGraph and real-time event streaming." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      <body className="bg-dark-950 text-slate-100 antialiased selection:bg-brand-500 selection:text-white">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
