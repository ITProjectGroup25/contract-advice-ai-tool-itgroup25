import { Toaster } from "@/components/ui/sonner";

import CommunityShowcase from "./community-showcase";
import MainSiteFooter from "./Footer";
import ForBusinessHero from "./for-business-hero/ForBusinessHero";
import ForBusinessHeader from "./ForBusinessHeader";

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
