import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Dashboard } from "./dashboard/page";

export default async function Home() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  // If there's a session, the user is authenticated.
  // We can show the dashboard or redirect to a specific dashboard page.
  // For now, let's just render the dashboard component.
  return <Dashboard />;
}
