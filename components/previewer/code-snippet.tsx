import { useState } from "react"
import { Button } from "../ui/button"
import { Check, Copy } from "lucide-react"

export function CodeSnippet({
  text,
  isSingleLine = false,
}: {
  text: string
  isSingleLine?: boolean
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="group relative overflow-hidden rounded-lg border border-border bg-background">
      <div className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100">
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7 bg-background shadow-sm"
          onClick={handleCopy}
        >
          {copied ? (
            <Check className="h-3 w-3 text-green-500" />
          ) : (
            <Copy className="h-3 w-3 text-muted-foreground" />
          )}
        </Button>
      </div>
      <pre
        className={`overflow-x-auto p-4 font-mono text-xs text-muted-foreground sm:text-sm ${
          isSingleLine ? "whitespace-nowrap" : "whitespace-pre-wrap"
        }`}
      >
        <code>{text}</code>
      </pre>
    </div>
  )
}
