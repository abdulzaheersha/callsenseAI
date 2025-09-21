"use client";

import { useEffect } from "react";
import { useActionState } from "react";
import { useToast } from "@/hooks/use-toast";
import { analyzeCall } from "./actions";

import { Header } from "@/components/app/Header";
import { FileUploadForm } from "@/components/app/FileUploadForm";
import { AnalysisDashboard } from "@/components/app/AnalysisDashboard";
import { Loader2 } from "lucide-react";

const initialState = {
  data: null,
  error: null,
};

export default function Home() {
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
    // A full reload is the simplest way to reset all state, including form state.
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
