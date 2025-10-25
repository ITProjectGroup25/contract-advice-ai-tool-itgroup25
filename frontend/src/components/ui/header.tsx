import { authOptions } from "@backend";
import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { LayoutDashboard } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ThemeChange } from "./ThemeChange";
import { Button } from "./button";
import SignOutButton from "./sign-out-button";

type Props = {};

const Header = async (props: Props) => {
  const session: Session | null = await getServerSession(authOptions as any);

  return (
    <header className="bottom-1 border">
      <nav className="border-gray-200 px-4 py-3">
        <div className="mx-auto flex max-w-screen-xl flex-wrap items-center justify-between">
          <Link href="/">
            <h1 className="md:text-2xl lg:text-2xl">Grants Review Team</h1>
          </Link>
          <div>
            {session?.user ? (
              <div className="flex items-center gap-1 md:gap-1 lg:gap-4">
                <ThemeChange />
                <Link href="/view-forms">
                  <Button variant="outline">
                    <span className="hidden md:inline">Dashboard</span>{" "}
                    <LayoutDashboard className="md:hidden" />
                  </Button>
                </Link>
                {session.user.name && session.user.image && (
                  <Image
                    src={session.user.image}
                    alt={session.user.name}
                    width={32}
                    height={32}
                    className="hidden rounded-full md:block"
                  />
                )}
                <SignOutButton />
              </div>
            ) : (
              <div className="flex">
                {/* <ThemeChange />
                <Link href="/api/auth/signin">
                  <Button variant="link" className="text-md">
                    Sign in
                  </Button>
                </Link> */}
              </div>
            )}
          </div>
          {/* // This is menu */}
          {/* <div className="md:hidden">
            <Menu />
          </div> */}
        </div>
      </nav>
    </header>
  );
};

export default Header;
