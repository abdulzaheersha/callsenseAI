"use client";

import { useActionState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { analyzeQaData } from "./actions";
import { Header } from "@/components/app/Header";
import { QADataUploadForm } from "@/components/app/QADataUploadForm";
import { QADashboard } from "@/components/app/QADashboard";
import { Loader2 } from "lucide-react";

const initialState = {
  data: null,
  error: null,
};

export default function QAScorePage() {
  const [state, formAction, isSubmitting] = useActionState(analyzeQaData, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state.error) {
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: state.error,
      });
    }
  }, [state.error, toast]);

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
              <h2 className="text-2xl font-semibold">Analyzing Data...</h2>
              <p className="text-muted-foreground">
                This might take a moment. Please wait.
              </p>
            </div>
          )}

          {showForm && <QADataUploadForm action={formAction} />}

          {showDashboard && <QADashboard qaData={state.data} />}
        </div>
      </main>
    </div>
  );
}
