// Design system reminder: Shared Satisium UI grammar — neutral surfaces, rounded geometry and primary orange as a restrained utility signal. Modal content must retain a reachable reading path, a clear complete-package download action, and safe viewport bounds at every size.

import readmeMarkdown from "@/content/LumenHousePlan/README.md?raw";
import briefMarkdown from "@/content/LumenHousePlan/00-brief.md?raw";
import visualSystemMarkdown from "@/content/LumenHousePlan/01-visual-system.md?raw";
import contentDataMarkdown from "@/content/LumenHousePlan/02-content-data.md?raw";
import routeBlueprintsMarkdown from "@/content/LumenHousePlan/03-route-blueprints.md?raw";
import registryContractMarkdown from "@/content/LumenHousePlan/04-registry-contract.md?raw";
import interactionQaMarkdown from "@/content/LumenHousePlan/05-interaction-qa.md?raw";
import siteTourMarkdown from "@/content/LumenHousePlan/06-site-tour.md?raw";
import downloadBundleMarkdown from "@/content/LumenHousePlan/07-download-bundle.md?raw";
import manifestMarkdown from "@/content/LumenHousePlan/manifest.json?raw";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Download, FileText } from "lucide-react";
import { useState } from "react";

const completePackageDownloadHref = `${import.meta.env.BASE_URL}downloads/lumen-house-studio-example-2.4.0.zip`;

const manifestContent =
  "# Machine-readable manifest\n\n```json\n" +
  manifestMarkdown.trim() +
  "\n```";

const planFiles = [
  { name: "README.md", label: "Overview", content: readmeMarkdown },
  { name: "00-brief.md", label: "Brief", content: briefMarkdown },
  {
    name: "01-visual-system.md",
    label: "Visual system",
    content: visualSystemMarkdown,
  },
  {
    name: "02-content-data.md",
    label: "Content",
    content: contentDataMarkdown,
  },
  {
    name: "03-route-blueprints.md",
    label: "Routes",
    content: routeBlueprintsMarkdown,
  },
  {
    name: "04-registry-contract.md",
    label: "Registry contract",
    content: registryContractMarkdown,
  },
  {
    name: "05-interaction-qa.md",
    label: "QA",
    content: interactionQaMarkdown,
  },
  { name: "06-site-tour.md", label: "Site tour", content: siteTourMarkdown },
  {
    name: "07-download-bundle.md",
    label: "Download bundle",
    content: downloadBundleMarkdown,
  },
  {
    name: "manifest.json",
    label: "Manifest",
    content: manifestContent,
  },
] as const;

const dialogContentClassName =
  "flex h-[min(88dvh,800px)] max-h-[calc(100dvh-1.5rem)] w-[calc(100%-1.5rem)] max-w-5xl flex-col gap-0 overflow-hidden rounded-[1.4rem] border-border bg-background p-0 text-foreground shadow-2xl sm:w-[calc(100%-3rem)]";

const fileNavigationClassName =
  "flex shrink-0 gap-1 overflow-x-auto border-b border-border bg-muted/50 p-3 lg:flex-col lg:overflow-y-auto lg:border-r lg:border-b-0";

function fileButtonClassName(isActive: boolean) {
  return [
    "min-h-10 shrink-0 rounded-lg px-3 text-left font-mono text-[10px] tracking-[0.08em] uppercase outline-offset-2 transition-colors focus-visible:outline-2 focus-visible:outline-primary lg:w-full",
    isActive
      ? "bg-background text-foreground shadow-sm"
      : "text-muted-foreground hover:bg-background/70 hover:text-foreground",
  ].join(" ");
}

export function BuildPlanDialog() {
  const [selectedFile, setSelectedFile] = useState<
    (typeof planFiles)[number]["name"]
  >(planFiles[0].name);
  const activeFile =
    planFiles.find(file => file.name === selectedFile) ?? planFiles[0];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="h-11 rounded-xl border-border bg-background px-3 font-sans text-[10px] tracking-[0.1em] text-foreground uppercase hover:border-primary hover:bg-background hover:text-primary"
        >
          <FileText className="mr-2 size-3.5" />
          View build plan
        </Button>
      </DialogTrigger>
      <DialogContent className={dialogContentClassName}>
        <DialogHeader className="shrink-0 border-b border-border px-6 py-5 pr-14 sm:px-8">
          <p className="font-mono text-[10px] font-medium tracking-[0.14em] text-primary uppercase">
            Lumen House Build Kit
          </p>
          <DialogTitle className="font-sans text-2xl font-bold tracking-tight sm:text-3xl">
            Build the same studio, frame by frame.
          </DialogTitle>
          <DialogDescription className="font-sans text-sm leading-6 text-muted-foreground">
            Open the kit file by file, then download the complete source and
            media package to recreate the studio exactly.
          </DialogDescription>
        </DialogHeader>
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-3 sm:px-8">
          <span className="font-mono text-[10px] tracking-[0.1em] text-muted-foreground uppercase">
            Complete build package · v2.4
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              asChild
              className="h-11 rounded-xl bg-primary px-4 font-sans text-xs tracking-[0.1em] uppercase hover:bg-primary/90"
            >
              <a
                href={completePackageDownloadHref}
                download="lumen-house-studio-example-2.4.0.zip"
                aria-label="Download the complete Lumen House source and media package"
              >
                <Download className="mr-2 size-4" />
                Download package
              </a>
            </Button>
          </div>
        </div>
        <div className="min-h-0 flex-1 lg:grid lg:grid-cols-[11rem_minmax(0,1fr)]">
          <nav
            aria-label="Lumen House build kit files"
            className={fileNavigationClassName}
          >
            {planFiles.map(file => (
              <button
                key={file.name}
                type="button"
                aria-pressed={activeFile.name === file.name}
                onClick={() => setSelectedFile(file.name)}
                className={fileButtonClassName(activeFile.name === file.name)}
              >
                <span className="block whitespace-nowrap">{file.label}</span>
                <span className="hidden truncate text-[8px] tracking-normal normal-case opacity-70 lg:block">
                  {file.name}
                </span>
              </button>
            ))}
          </nav>
          <div
            tabIndex={0}
            role="region"
            aria-label={`${activeFile.label} build plan file`}
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-6 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary sm:px-8"
          >
            <p className="mb-4 font-mono text-[10px] tracking-[0.12em] text-primary uppercase">
              {activeFile.name}
            </p>
            <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-6 text-muted-foreground">
              {activeFile.content}
            </pre>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
