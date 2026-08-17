"use client"

import { Annotation } from "@/components/home/annotation"
import React from "react"

export default function FreedomDemo() {
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@500;600&display=swap');
      `,
        }}
      />

      <div className="relative flex h-[200vh] min-h-screen w-full items-center justify-center bg-background font-sans">
        {/* THE TARGET */}
        <div
          id="center-target"
          className="h-28 w-28 animate-in rounded-[2rem] border border-border/50 bg-muted shadow-sm duration-1000 fill-mode-both fade-in"
        />

        {/* 
          1. DEAD-CENTER LEFT SIDE (Horizontal Side-to-Side)
          - Point to target's Left-Middle (0, 0.5)
          - Use the Bottom-Right tip of the SVG (1, 1) to touch it.
          - Rotate -45deg so the diagonal line swings to become flat.
        */}
        <Annotation
          targetId="center-target"
          targetAnchor={{ x: 0, y: 0 }} // Left middle of Squircle
          svgAnchor={{ x: 1, y: 1 }} // Bottom-Right of SVG
          title="Side-to-Side Flow"
          path="M0.496826 0.0561523C1.53849 9.28692 9.87183 42.1074 30.1843 61.5946C52.9242 83.4106 76.7121 92.7057 100.497 100.056"
          svgRotation="rotate-0"
          textPosition="top-0 right-0 pr-4 -mt-8 text-center"
          textClassName="text-muted-foreground text-sm"
        />

        {/* 
          2. DEAD-CENTER BOTTOM (Coming up from below)
          - Point to target's Bottom-Center (0.5, 1)
          - Use the Top-Right tip of the SVG (1, 0)
          - Rotate 45deg so the line points straight up.
        */}
        <Annotation
          targetId="center-target"
          targetAnchor={{ x: 0.5, y: 1.1 }} // Bottom center of Squircle
          svgAnchor={{ x: 1, y: 0 }} // Top-Right of SVG
          title="Rising Up"
          path="M0.110596 100.068C32.9148 92.6213 52.2403 77.7336 58.8408 68.6851C64.6609 60.7064 80.0048 33.0468 39.264 34.6426C-1.47676 36.2383 24.9355 83.2422 46.1423 87.8341C80.5339 95.2809 95.3487 34.6426 100.111 0.0681152"
          drawFrom="end"
          svgRotation="rotate-0"
          textClassName="text-muted-foreground text-sm"
          textPosition="top-1/2 right-full  mt-10 mr-4 text-right"
        />
      </div>
    </>
  )
}
