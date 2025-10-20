"use client";
import Script from "next/script";
import GrantSupportWrapper from "./_components/GrantSupportWrapper";

export default function GrantSupportPage() {
  return (
    <>
      <Script src="/js/email.min.js" strategy="afterInteractive" />
      <GrantSupportWrapper />
    </>
  );
}
