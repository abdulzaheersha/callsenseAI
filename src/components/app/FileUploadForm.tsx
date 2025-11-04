"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
          Analyze Call
        </>
      )}
    </Button>
  );
}

interface FileUploadFormProps {
    action: (payload: FormData) => void;
}

export function FileUploadForm({ action }: FileUploadFormProps) {
  const formRef = React.useRef<HTMLFormElement>(null);
  const { pending } = useFormStatus();

  React.useEffect(() => {
    if(!pending) {
      formRef.current?.reset();
    }
  },[pending])


  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg animate-in fade-in-50 duration-500">
      <CardHeader>
        <CardTitle className="text-2xl">Upload Call Recording</CardTitle>
        <CardDescription>
          Select an audio file and provide compliance keywords to begin the analysis.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={action} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="audio" className="text-base">Audio File</Label>
            <Input id="audio" name="audio" type="file" required accept=".mp3,.wav" />
            <p className="text-sm text-muted-foreground">Supported formats: .mp3, .wav. Max size: 10MB.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="keywords" className="text-base">Compliance Keywords</Label>
            <Textarea
              id="keywords"
              name="keywords"
              placeholder="e.g., call is being recorded, privacy policy, approved script phrase..."
              required
              rows={4}
            />
            <p className="text-sm text-muted-foreground">
              Enter keywords or phrases separated by commas.
            </p>
          </div>
          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  );
}
