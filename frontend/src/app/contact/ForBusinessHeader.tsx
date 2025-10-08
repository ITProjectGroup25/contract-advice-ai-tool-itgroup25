import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import Logo from "./Logo.jpg";

const ForBusinessHeader = () => {
  return (
    <nav className="border-bottom-px sticky top-0 z-50 border-gray-200 bg-gray-900 lg:py-4">
      <div className="mx-auto flex flex-wrap items-center justify-between px-4 py-4 lg:px-16">
        <Link
          href="/"
          className="flex items-center space-x-3 rtl:space-x-reverse"
        >
          <Image src={Logo} alt="logo" className="w-24" />
        </Link>
        <div className="flex items-center gap-2">

          {/* the button under are currently ignored for web page clarity*/}
          
          {/*<Button
            className="rounded-full bg-emerald-500 text-sm font-bold hover:bg-emerald-600"
            asChild
          >
            <Link className="text-white" href="/grant-support">
              Referral Assistant
            </Link>
          </Button>

          <Button
            className="rounded-full bg-purple-500 text-sm font-bold"
            asChild
          >
            <Link className="text-white" href={"#questionnaire"}>
              Search for a grant case
            </Link>
          </Button>

          <Button
            className="rounded-full bg-blue-800 text-sm font-bold"
            asChild
          >
            <Link className="text-white" href={"view-forms"}>
              Dashboard
            </Link>
          </Button>*/}

          <button
            data-collapse-toggle="navbar-default"
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg p-2 text-sm text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600 md:hidden"
            aria-controls="navbar-default"
            aria-expanded="false"
          >
            <span className="sr-only">Open main menu</span>
            <svg
              className="h-5 w-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 17 14"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M1 1h15M1 7h15M1 13h15"
              />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default ForBusinessHeader;
