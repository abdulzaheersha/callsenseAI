"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload } from "lucide-react";
import React from "react";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      size="lg"
      className="w-full"
      disabled={pending}
      aria-disabled={pending}
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Analyzing...
        </>
      ) : (
        <>
          <Upload className="mr-2 h-5 w-5" />
          Analyze Dataset
        </>
      )}
    </Button>
  );
}

interface QADataUploadFormProps {
  action: (payload: FormData) => void;
}

export function QADataUploadForm({ action }: QADataUploadFormProps) {
  const formRef = React.useRef<HTMLFormElement>(null);
  // We can't use useFormStatus here as this component is not a child of the form
  // The submit button needs to be a child to get the status.
  // The page will handle the loading state.

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg animate-in fade-in-50 duration-500">
      <CardHeader>
        <CardTitle className="text-2xl">Upload QA Dataset</CardTitle>
        <CardDescription>
          Select a CSV or XLSX file with call data to build the QA dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={action} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="file" className="text-base">
              Dataset File
            </Label>
            <Input
              id="file"
              name="file"
              type="file"
              required
              accept=".csv,.xlsx"
            />
            <p className="text-sm text-muted-foreground">
              Supported formats: .csv, .xlsx. Max size: 5MB.
            </p>
          </div>
          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  );
}
