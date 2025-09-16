import { Toaster } from "@/components/ui/sonner";
import MainSiteFooter from "./Footer";
import ForBusinessHeader from "./ForBusinessHeader";
import CommunityShowcase from "./community-showcase";
import ForBusinessHero from "./for-business-hero/ForBusinessHero";

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
