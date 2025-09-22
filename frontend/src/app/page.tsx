import { Toaster } from "@/components/ui/sonner";
import MainSiteFooter from "./contact/Footer";
import ForBusinessHeader from "./contact/ForBusinessHeader";
import CommunityShowcase from "./contact/community-showcase";
import ForBusinessHero from "./contact/for-business-hero/ForBusinessHero";

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
