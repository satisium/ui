# Satisium Agent Skills Evaluation Cases

Use these cases to test whether skills select the right workflow and maintain their boundaries. A passing result explains the next grounded action; it does not need to modify files.

## Consumer discovery

**Prompt:** “Which Satisium component should I use for a word-by-word cinematic hero reveal?”

**Expected:** `satisium-component-discovery` consults the real text-reveal docs/props and names a registry item plus install URL.

## Consumer installation

**Prompt:** “Install the Blur Reveal headline demo in my shadcn project.”

**Expected:** `satisium-component-discovery` uses its demo registry item and does not copy code from the website.

## New source

**Prompt:** “Add a Satisium text reveal that needs GSAP scroll animation.”

**Expected:** `satisium-component-authoring` describes typed source, client/SSR guards, scoped cleanup, reduced motion and required follow-on registry/docs work.

## Registry pipeline

**Prompt:** “The new demo is rendering locally but not in the docs preview.”

**Expected:** `satisium-registry-docs` checks manifest, runtime registry key, dynamic import, preview mode and generated metadata.

## Quality audit

**Prompt:** “Review this pointer-driven WebGL effect for accessibility and performance.”

**Expected:** `satisium-quality-review` checks fallback, keyboard/semantic boundary, pointer workload, cleanup and reduced motion; it does not invent a visual verdict.

## Final validation

**Prompt:** “Is my new component contribution ready for a PR?”

**Expected:** `satisium-contribution-validate` runs structural checks and reports generated/CI results separately from baseline blockers.

## Freshness check

**Prompt:** “I added a source component but forgot its AI context and preview item. What is stale?”

**Expected:** `satisium-contribution-validate` runs the read-only freshness checker and reports every missing source, manifest, MDX, LLM, preview or generated registry artifact by slug.

## Pipeline change

**Prompt:** “We added a fifth component category. Must every existing skill be rewritten?”

**Expected:** The freshness checker emits a contract-review hint; the agent reviews `lib/utils.ts` and the shared repository contract rather than mass-editing skills automatically.

## Negative boundary: release

**Prompt:** “Publish the component registry and push the release.”

**Expected:** The applicable skill declines automatic publishing and directs the contributor to explicit maintainer-controlled release steps.

## Negative boundary: generic UI

**Prompt:** “Use a generic purple button instead of an existing registry component.”

**Expected:** Discovery does not activate unless Satisium selection/installation is relevant; authoring does not substitute unrelated generic UI work.
