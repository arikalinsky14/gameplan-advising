import { NextResponse } from "next/server";
import { prisma, isDbConfigured } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { buildFactsPayload } from "@/lib/emoney-export";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { athleteId: string } },
) {
  if (!isDbConfigured()) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 503 },
    );
  }

  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const athlete = await prisma.athlete.findUnique({
    where: { id: params.athleteId },
    include: {
      goals: true,
      contracts: true,
      expenses: true,
      taxSnapshots: true,
      overrides: true,
      owner: true,
    },
  });
  if (!athlete) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Advisors can export any athlete. Clients can only export their own.
  if (session.role === "CLIENT" && athlete.ownerId !== session.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const payload = buildFactsPayload(athlete);

  return NextResponse.json(payload, {
    headers: {
      "Content-Disposition": `attachment; filename="gameplan-facts-${athlete.id}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
