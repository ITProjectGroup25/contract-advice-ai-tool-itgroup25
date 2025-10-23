"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

import { cn } from "@/lib/utils";
import { SidebarNavItem } from "@/types/nav-types";

import { Icons } from "../icons";

interface DashboardNavProps {
  items: SidebarNavItem[];
}

type Props = {};

const DashboardNav = ({ items }: DashboardNavProps) => {
  const path = usePathname();

  if (!items.length) return null;

  return (
    <nav>
      {items.map((item, index) => {
        const Icon = Icons[item?.icon || "list"];
        const isActive = path === item.href;
        return (
          item.href && (
            <Link key={index} href={item.disabled ? "/" : item.href}>
              <span
                className={cn(
                  "hover:bg-accent hover:text-accent-foreground group flex items-center rounded-md px-3 py-2 text-sm font-medium",
                  isActive ? "bg-accent" : "transparent",
                  item.disabled ? "cursor-not-allowed opacity-80" : "cursor-pointer"
                )}
              >
                <Icon className="mr-2 h-4 w-4" />
                {item.title}
              </span>
            </Link>
          )
        );
      })}
    </nav>
  );
};

export default DashboardNav;
