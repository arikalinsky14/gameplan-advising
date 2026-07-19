import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function DashboardRouter() {
  const s = await getSession();
  if (!s) redirect("/login");
  if (s.role === "ADVISOR") redirect("/advisor");
  redirect("/intake");
}
