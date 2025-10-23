"use client";
import Image from "next/image";
import Link from "next/link";

import Logo from "./Logo.jpg"; // 按实际路径调整

export default function FixedLogo() {
  return (
    <div className="fixed left-4 top-4 z-50 lg:left-16 lg:top-8">
      <Link href="https://www.unimelb.edu.au/" className="pointer-events-auto block">
        <Image src={Logo} alt="logo" className="w-24 drop-shadow" priority />
      </Link>
    </div>
  );
}
