import { Toaster } from "@/components/ui/sonner";

import CommunityShowcase from "./contact/community-showcase";
import MainSiteFooter from "./contact/Footer";
import ForBusinessHero from "./contact/for-business-hero/ForBusinessHero";
import ForBusinessHeader from "./contact/ForBusinessHeader";

const page = () => {
  return (
    <>
      <main className="font-business bg-white">
        <ForBusinessHeader />
        <ForBusinessHero />
        <CommunityShowcase />
        <MainSiteFooter />
        <Toaster />
      </main>
    </>
  );
};

export default page;
