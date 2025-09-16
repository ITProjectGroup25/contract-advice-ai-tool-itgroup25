import { Separator } from "@/components/ui/separator";
import ForBusinessSignUpForm from "./ForBusinessSignUpForm";

const HeroSubtext = () => {
  return (
    <div className="text-white">
      <p className="text-lg">
        Welcome to the home <strong>of some of</strong> Australia’s finest{" "}
        <strong>legal information</strong> and <strong>people</strong>
      </p>
      <Separator className="my-4" />
      <div>
        <p className="text-lg ">
          💼 <strong>Search</strong> for <strong>your enquiries</strong>
        </p>
        <p className="text-lg ">
          🌎 <strong>Learn</strong> more <strong>of the legal world</strong>
        </p>
        {/* <p className="text-lg ">
          ⚙️ <strong>Integrates</strong> with your{' '}
          <strong>existing systems</strong>{' '}
          <span className="text-sm">(Square, SetMore...)</span>
        </p> */}
        <Separator className="my-4" />
      </div>
    </div>
  );
};

const ForBusinessHero = () => {
  return (
    <section className="relative flex items-center justify-center bg-gray-900">
      <div
        style={{ width: "100vw" }}
        className="absolute inset-0 z-[-10] bg-gray-900"
      />
      <div
        id="main"
        style={{ maxWidth: "1280px" }}
        className="flex flex-col gap-8 px-5 pt-16 pb-24 bg-dark md:px-32 lg:flex-row lg:items-center lg:justify-center lg:py-48 lg:pt-8"
      >
        <div className="text-white lg:mt-8 lg:flex-[3_3_0%] lg:space-y-8 lg:pr-8">
          <h1 className="text-5xl font-bold">
            Uncover your grants
            <Separator className="mt-4" />
            Double check any enquiries
          </h1>
          <HeroSubtext />
        </div>
        <ForBusinessSignUpForm />
      </div>
    </section>
  );
};

export default ForBusinessHero;
