import { AnalysisDashboard } from "@/components/app/AnalysisDashboard";
import { FileUploadForm } from "@/components/app/FileUploadForm";
import { Header } from "@/components/app/Header";
import { Loader2 } from "lucide-react";
import { useActionState } from "react";
import { analyzeCall } from "../actions";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardClient } from "./client";

export async function Dashboard() {
    const session = await getSession();
    if (!session) {
        redirect('/login');
    }

    return (
        <DashboardClient session={session} />
    )
}

// Since the original page.tsx was a client component and we need a server component for auth,
// we create a client component to hold the state and effects.
"use client";

import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import type { Session } from "@/lib/types";

const initialState = {
  data: null,
  error: null,
};

function DashboardClient({ session }: { session: Session }) {
  const [state, formAction, isSubmitting] = useActionState(analyzeCall, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state.error) {
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: state.error,
      });
    }
  }, [state, toast]);

  const handleReset = () => {
    window.location.reload();
  };

  const showDashboard = state?.data && !isSubmitting;
  const showForm = !state?.data && !isSubmitting;
  const showLoading = isSubmitting;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-7xl mx-auto">
          {showLoading && (
            <div className="flex flex-col items-center justify-center gap-4 text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <h2 className="text-2xl font-semibold">Analyzing Call...</h2>
              <p className="text-muted-foreground">
                This might take a moment. Please don't close this page.
              </p>
            </div>
          )}

          {showForm && <FileUploadForm action={formAction} />}

          {showDashboard && (
            <AnalysisDashboard
              key={state.data.fileName}
              result={state.data}
              onReset={handleReset}
            />
          )}
        </div>
      </main>
    </div>
  );
}
