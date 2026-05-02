"use client"

import { ActionButton } from "@/components/ui/action-button"
import {
  CheckmarkBadge03Icon,
  TextAlignLeftIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

interface CopyMdxButtonProps {
  rawMdx: string
  className?: string
}

export function CopyMdxButton({ rawMdx, className }: CopyMdxButtonProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(rawMdx)
  }

  return (
    <ActionButton
      label="Copy MD"
      icon={<HugeiconsIcon icon={TextAlignLeftIcon} />}
      successLabel="Copied!"
      successIcon={<HugeiconsIcon icon={CheckmarkBadge03Icon} />}
      onClick={handleCopy}
      disabled={!rawMdx}
      variant="outline"
      size="sm"
      className={className}
    />
  )
}
