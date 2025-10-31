import NextDynamic from "next/dynamic";

export const dynamic = "force-dynamic";
export const revalidate = 0;
const DynamicFormPageClient = NextDynamic(
  () => import("./DynamicFormPageClient"),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
        <div className="rounded-lg bg-white p-8 text-center shadow-lg">
          <p className="text-gray-600">Loading form...</p>
        </div>
      </div>
    ),
  },
);

export default function DynamicFormPage() {
  return <DynamicFormPageClient />;
}
