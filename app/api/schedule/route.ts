import { NextResponse } from "next/server";
import { fetchTeamSchedule } from "@/lib/schedule";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const sport = url.searchParams.get("sport") ?? "";
  const school = url.searchParams.get("school") ?? "";
  if (!sport || !school) {
    return NextResponse.json({ error: "sport and school required" }, { status: 400 });
  }
  const result = await fetchTeamSchedule(sport, school);
  return NextResponse.json(result);
}
