import { Logo } from "@/components/app/Logo";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="py-4 px-4 sm:px-6 lg:px-8 bg-background/80 backdrop-blur-sm sticky top-0 z-10 border-b no-print">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Logo className="h-8 w-8 text-primary" />
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            CallSense AI
          </h1>
        </div>
        <nav className="flex items-center gap-4">
            <Button variant="ghost" asChild>
                <Link href="/">Call Analysis</Link>
            </Button>
            <Button variant="ghost" asChild>
                <Link href="/qa-score">QA Score</Link>
            </Button>
        </nav>
      </div>
    </header>
  );
}
