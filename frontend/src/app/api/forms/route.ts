import { NextResponse } from "next/server";
import { getUserForms } from "@/app/actions/getUserForms";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const forms = await getUserForms();
    return NextResponse.json({ forms });
  } catch (error) {
    console.error("Failed to fetch forms", error);
    return NextResponse.json({ error: "Failed to fetch forms" }, { status: 500 });
  }
}
