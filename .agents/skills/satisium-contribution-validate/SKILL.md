---
name: satisium-contribution-validate
description: Validate Satisium UI skill bundles and component contributions with structural audits, registry/docs parity checks, generated-artifact commands, declared CI commands, changeset readiness, and a non-destructive PR summary. Use when asked to validate, audit, test, prepare, review, or assess the readiness of a Satisium UI contribution or Agent Skills package.
license: MIT
---

# Satisium Contribution Validation

Use this skill as the final evidence pass. It never pushes, publishes, releases, suppresses a failed check, or creates a changeset unless the contributor explicitly asks to generate one.

## Select the validation scope

For a skills-only contribution, run the bundled audit first. For a component contribution, run the freshness checker for the changed slug and then run its relevant generation commands. For a broader refactor, run the global freshness check and list any components requiring targeted review.

Read [the repository contract](../_shared/repository-contract.md). Read [evaluation cases](references/evaluation-cases.md) when checking whether a skill triggers and responds correctly.

## Run checks in order

1. Run `python .agents/skills/satisium-contribution-validate/scripts/audit_repository.py --repo .` to validate skills and CI references.
2. Run `python .agents/skills/satisium-contribution-validate/scripts/check_freshness.py --repo .`. Add `--slug <slug>` for component-specific work. When validating a diff, pass `--changed-files <path-list>` generated from `git diff --name-only`.
3. If the freshness check reports generated-artifact drift, run only the matching generator: `pnpm registry:public`, `pnpm build:registry:meta`, and/or `pnpm llm`, then rerun the check.
4. Run declared repository checks: `pnpm lint`, `pnpm typecheck`, and `pnpm build`. Also inspect the CI workflow for scripts it invokes but that do not exist locally.
5. Review the changed-file diff. Confirm one contribution scope, correct Conventional Commit category, no unrelated generated edits, and a changeset only where project policy requires it.

## Report honestly

Separate results into **package structural checks**, **changed-artifact checks**, **repository baseline checks**, and **manual evidence still required**. If a declared command fails before touching the contribution, call it a baseline blocker and include its exact command and first actionable error. Do not call the contribution clean merely because the audit script passes.

Use this result shape for every area:

- **Area:** Skills/package structure, Freshness contract, Component pipeline, Repository checks, or Contributor readiness.
- **Status:** `pass`, `fail`, `not applicable`, `review required`, `baseline blocker`, `contribution blocker`, `not run`, `ready`, `needs changes`, or `blocked`.
- **Evidence:** State the audit, freshness output, generated output, command outcome, or policy/diff assessment.
- **Required next action:** Name the smallest safe follow-up.

The report may recommend a local branch and an appropriate PR template, but it must stop before any push or PR submission.
