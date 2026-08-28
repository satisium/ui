// Design system reminder: Shared Satisium UI grammar — the fallback uses neutral rounded surfaces, primary intent and a clear route home.

import { StudioShell } from "@/components/studio/StudioShell";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <StudioShell>
      <main className="grid min-h-[65svh] place-items-center bg-muted p-3 sm:p-5">
        <div className="w-full max-w-2xl rounded-[1.4rem] bg-background px-6 py-20 text-center shadow-sm sm:px-10">
          <p className="font-mono text-[10px] text-primary uppercase">
            Page not found / 404
          </p>
          <h1 className="mt-5 font-sans text-5xl font-extrabold tracking-[-0.06em] sm:text-7xl">
            This page is out of frame.
          </h1>
          <p className="mx-auto mt-5 max-w-md font-sans text-sm leading-6 text-muted-foreground">
            The page does not exist, but the studio is still open.
          </p>
          <Link href="/">
            <Button className="mt-8 h-12 rounded-xl bg-primary px-5 font-sans text-xs font-semibold hover:bg-primary/90">
              Return to studio
            </Button>
          </Link>
        </div>
      </main>
    </StudioShell>
  );
}
