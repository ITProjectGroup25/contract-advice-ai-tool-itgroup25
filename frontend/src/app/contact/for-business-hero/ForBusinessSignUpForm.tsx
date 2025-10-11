import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

const ForBusinessSignUpForm = () => {
  return (
    <Card className="w-full rounded-2xl bg-white border-none pb-8 shadow-2xl lg:flex-[2_2_0%] lg:px-8">
      <CardHeader>
        <CardTitle className="text-3xl text-black font-bold text-center">
          Need assistance with grant applications?
        </CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center">
        <Link
          href="/grant-support"
          className="flex justify-center w-full p-4 font-bold text-white text-2xl bg-purple-500 rounded-full shadow-xl text-md hover:bg-purple-600 hover:opacity-80 transition-all"
        >
          Access Referral Assistant
        </Link>
      </CardContent>
    </Card>
  );
};

export default ForBusinessSignUpForm;
