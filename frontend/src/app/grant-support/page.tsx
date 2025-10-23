"use client";

import Script from "next/script";

import GrantSupportApp from "./_components/GrantSupportApp";

export default function GrantSupportPage() {
  return (
    <>
      <Script src="/js/email.min.js" strategy="afterInteractive" />
      <GrantSupportApp />
    </>
  );
}
