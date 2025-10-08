"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
{/*import ErrorText from "@/components/error-text";*/}
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
{/*import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";*/}
{/*import { Input } from "@/components/ui/input";*/}
import { LoadingSpinner } from "@/components/ui/spinner";
{/*import { Textarea } from "@/components/ui/textarea";*/}
import { useState, useTransition } from "react";
{/*import { useForm } from "react-hook-form";*/}
import { toast } from "sonner";

{/*type FormValues = {
  email: string;
  enquiry: string;
};*/}

const ForBusinessSignUpForm = () => {
  {/*const form = useForm<FormValues>();*/}

  {/*const { errors } = form.formState;*/}

  const [isPending, startTransition] = useTransition();
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [authError, setAuthError] = useState<string>("");

  {/*const onSubmit = async (values: FormValues) => {
    console.log({ values });
    toast.success("We have received your message :)");

    // startTransition(async () => {
    //   try {
    //     await emailSignup({ ...values, userType: "barbershop", redirectUrl });
    //     setSignupSuccess(true);
    //   } catch (error) {
    //     if (error instanceof Error) {
    //       setAuthError(error.message);
    //       return;
    //     }
    //   }
    // });
  };*/}

  return (
    <Card className="w-full rounded-2xl bg-white border-none pb-8 shadow-2xl lg:flex-[2_2_0%] lg:px-8 py-4">
      <CardHeader>
        <CardTitle className="text-4xl text-black font-bold text-center">
          Have a enquiry?
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 flex justify-center">
          <Button
            className="rounded-2xl bg-gray-900 text-4xl font-bold hover:bg-blue-900 px-12 py-8"
            asChild
          >
            <Link className="text-white" href="/grant-support">
              Send us a form!
            </Link>
          </Button>
          {/*<Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                rules={{ required: "Email is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        required
                        className="px-4 text-black py-6 bg-gray-100 border-none rounded-lg placeholder:font-roobert placeholder:font-semibold"
                        {...field}
                      />
                    </FormControl>
                    {errors.email && (
                      <FormMessage className="text-red-400">
                        Email is required
                      </FormMessage>
                    )}
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="enquiry"
                rules={{ required: "Enquiry is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        className="px-4 py-6 bg-gray-100 border-none rounded-lg placeholder:font-roobert placeholder:font-semibold text-black"
                        placeholder="I have a quick question..."
                        id="enquiry"
                        required
                        {...field}
                      />
                    </FormControl>
                    {errors.enquiry && (
                      <FormMessage className="text-red-400">
                        Enquiry is required
                      </FormMessage>
                    )}
                  </FormItem>
                )}
              />

              {authError && <ErrorText>{authError}</ErrorText>}
              <button
                type="submit"
                className="flex justify-center w-full p-4 font-bold text-white bg-purple-500 rounded-full shadow-xl text-md hover:bg-purple-500 hover:opacity-80"
              >
                {isPending ? (
                  <LoadingSpinner className="w-4 h-4 mx-auto" />
                ) : (
                  "Send"
                )}
              </button>
              <div className="mt-4 text-sm text-center text-black">
                Our team will get back to you in under 2 business days
              </div>
            </form>
          </Form>*/}
        </div>
      </CardContent>
    </Card>
  );
};

export default ForBusinessSignUpForm;
