import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import Logo from "./Logo.jpg";

type Props = {
  className?: string;
};

const MainSiteFooter = (props: Props) => {
  const { className } = props;
  return (
    <footer
      className={cn(
        "bg-white p-4 dark:bg-dark sm:p-6 lg:mt-16 lg:py-16",
        className
      )}
    >
      <div className="mx-auto max-w-screen-xl">
        <div className="lg:flex lg:justify-between">
          <div className="mb-6 md:mb-0">
            <a href="https://www.unimelb.edu.au/" className="flex items-center">
              <Image src={Logo} alt="Taper Logo" className="w-16 lg:w-32" />
            </a>
          </div>
          <div className="block space-y-8 lg:grid lg:grid-cols-4 lg:space-y-0">
            <div>
              <h2 className="mb-2 text-md font-semibold uppercase text-gray-900 dark:text-white">
                About
              </h2>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>
                  <Link href={""} className="hover:underline">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href={""} className="hover:underline">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="mb-2 text-md font-semibold uppercase text-gray-900 dark:text-white">
                Legal
              </h2>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>
                  <Link href={""} className="hover:underline">
                    Privacy Policy
                  </Link>
                </li>
                {/* <li>
                  <a
                    href="https://tailwindcss.com/"
                    className="hover:underline"
                  >
                    Terms and Conditions
                  </a>
                </li> */}
                <li>
                  <Link href={""} className="hover:underline">
                    Data Deletion Instructions
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <hr className="my-6 border-gray-200 dark:border-gray-700 sm:mx-auto lg:my-8" />
        <div className="sm:flex sm:items-center sm:justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400 sm:text-center">
            © 2025{" "}
            . All
            Rights Reserved.
          </span>
          <div className="mt-4 flex space-x-6 sm:mt-0 sm:justify-center">
            {/* <a
              href="#"
              className="text-gray-500 hover:text-gray-900 dark:hover:text-white"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                  clipRule="evenodd"
                />
              </svg>
            </a> */}
            {/* <a
              href="#"
              className="text-gray-500 hover:text-gray-900 dark:hover:text-white"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a> */}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default MainSiteFooter;
