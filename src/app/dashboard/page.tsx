import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardClient } from "./client";

export default async function Dashboard() {
    const session = await getSession();
    if (!session) {
        redirect('/login');
    }

    return (
        <DashboardClient session={session} />
    )
}
