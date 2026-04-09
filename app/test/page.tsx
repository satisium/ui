import { Index } from "@/__registry__"

export default function TestRegistryPage() {
  // 1. We imitate the "activeDemoId" lookup that the Dropdown will perform
  const activeDemoId = "spotlight-card-demo"

  // 2. We extract the bundled data from our generated registry
  const demoData = Index[activeDemoId]

  if (!demoData) {
    return (
      <div className="p-24 text-red-500">
        Demo not found in registry! Did you run the script?
      </div>
    )
  }

  // 3. We extract the actual React Component to render
  const DemoComponent = demoData.component

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      {/* IMITATION: Canvas Area */}
      <div className="flex flex-1 items-center justify-center border-b border-border/50 bg-sidebar/50 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05),transparent_80%)]">
        {/* We mount the dynamically loaded component here */}
        <DemoComponent />
      </div>

      {/* IMITATION: Code Panel Area */}
      <div className="h-[40vh] w-full overflow-y-auto bg-sidebar p-8">
        <div className="mx-auto max-w-4xl">
          <h4 className="mb-4 font-mono text-xs font-bold tracking-widest text-muted-foreground uppercase">
            Extracted Raw Source Code
          </h4>

          <pre className="overflow-x-auto rounded-xl border border-border bg-background p-6 font-mono text-sm text-foreground shadow-sm">
            <code>{demoData.raw}</code>
          </pre>
        </div>
      </div>
    </div>
  )
}
