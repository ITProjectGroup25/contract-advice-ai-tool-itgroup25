import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

const ForBusinessSignUpForm = () => {
  return (
    <Card className="w-full rounded-2xl border-none bg-white pb-8 shadow-2xl lg:flex-[2_2_0%] lg:px-8">
      <CardHeader>
        <CardTitle className="text-center text-3xl font-bold text-black">
          Need assistance with grant applications?
        </CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center">
        <Link
          href="/grant-support"
          className="text-md flex w-full justify-center rounded-full bg-purple-500 p-4 text-2xl font-bold text-white shadow-xl transition-all hover:bg-purple-600 hover:opacity-80"
        >
          Access Referral Assistant
        </Link>
      </CardContent>
    </Card>
  );
};

export default ForBusinessSignUpForm;
