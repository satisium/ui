export default function Page() {
  return (
    <div className="flex max-w-2xl animate-in flex-col gap-12 duration-700 fade-in slide-in-from-bottom-4">
      {/* Logo/Brand Header */}
      <div className="mb-8 flex items-center gap-3 text-foreground">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground/10">
          <span className="text-2xl">☺</span>
        </div>
        <span className="font-display text-xl font-medium tracking-tight">
          emblemo
        </span>
      </div>

      <div className="space-y-6">
        <h1 className="font-crop text-display-lg text-foreground">
          Product design & <br /> Illustration.
        </h1>
      </div>

      <div className="space-y-8 font-body text-lg leading-relaxed text-muted-foreground">
        <p>
          Hey, I'm Paweł. I've spent 15+ years making interfaces look and feel
          great. Started with illustration, moved to UI, now I'm obsessed with
          frontend interactions.
        </p>

        <p>
          Drawing is where I started. Still do it. That eye for detail moved to
          code. Check{" "}
          <a href="#" className="font-medium text-primary hover:underline">
            Behance
          </a>{" "}
          or{" "}
          <a href="#" className="font-medium text-primary hover:underline">
            Dribbble
          </a>
          .
        </p>

        <p>
          AI lets me experiment like never before. Now I am exploring what
          happens when art meets code.
        </p>
      </div>
    </div>
  )
}
