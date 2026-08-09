import { getSession } from "@/lib/auth";
import { prisma, isDbConfigured } from "@/lib/db";
import { listContracts } from "@/app/actions/contracts";
import ConsolidatedTaxClient from "./ConsolidatedTaxClient";

async function currentAthlete() {
  if (!isDbConfigured()) return null;
  const s = await getSession();
  if (!s) return null;
  try {
    const u = await prisma.user.findUnique({
      where: { id: s.userId },
      include: { athlete: true },
    });
    return u?.athlete ?? null;
  } catch {
    return null;
  }
}

export default async function ConsolidatedTaxPage() {
  const athlete = await currentAthlete();
  const contracts = athlete ? await listContracts() : [];

  return (
    <ConsolidatedTaxClient
      homeStateInit={athlete?.homeState ?? "AL"}
      isMinorInit={!!athlete?.isMinor}
      // Serialize contracts for the client component with only the fields
      // the sourcing function needs.
      contracts={contracts.map((c) => ({
        id: c.id,
        brand: c.brand,
        grossAmount: c.grossAmount,
        nonCashFmv: c.nonCashFmv,
        agentFeePct: c.agentFeePct,
        workState: c.workState,
        workStateConfirmed: c.workStateConfirmed,
        workLog: c.workLog.map((w) => ({
          id: w.id,
          contractId: w.contractId,
          date: w.date.toISOString(),
          state: w.state,
          hours: w.hours,
        })),
      }))}
    />
  );
}
