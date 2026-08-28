#!/usr/bin/env python3
"""Read-only parity check for Satisium UI component and skills contracts."""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path


def passed(message: str) -> str:
    return f"PASS: {message}"


def failed(message: str) -> str:
    return f"FAIL: {message}"


def review(message: str) -> str:
    return f"REVIEW: {message}"


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def load_json(path: Path) -> tuple[dict, list[str]]:
    if not path.is_file():
        return {}, [failed(f"{path.name} is missing")]
    try:
        return json.loads(read_text(path)), []
    except json.JSONDecodeError as error:
        return {}, [failed(f"{path.name} is invalid JSON: {error}")]


def frontmatter(path: Path) -> str:
    if not path.is_file():
        return ""
    match = re.match(r"^---\n(.*?)\n---\n", read_text(path), flags=re.DOTALL)
    return match.group(1) if match else ""


def yaml_list(frontmatter_text: str, key: str) -> list[str]:
    match = re.search(
        rf"^{re.escape(key)}:\s*\n((?:^[ \t]+-\s+[^\n]+\n?)+)",
        frontmatter_text,
        flags=re.MULTILINE,
    )
    if not match:
        return []
    return [item.strip().strip('"\'') for item in re.findall(r"^\s*-\s+(.+?)\s*$", match.group(1), flags=re.MULTILINE)]


def registry_keys(path: Path) -> set[str]:
    if not path.is_file():
        return set()
    return set(re.findall(r'^\s*"([^"]+)":\s*\{', read_text(path), flags=re.MULTILINE))


def taxonomy_keys(path: Path) -> set[str]:
    if not path.is_file():
        return set()
    match = re.search(r"export const TAXONOMY\s*=\s*\{(.*?)\}\s*as const", read_text(path), flags=re.DOTALL)
    if not match:
        return set()
    keys = re.findall(r'^\s*(?:"([a-z0-9-]+)"|([a-z0-9-]+)):\s*\[\]', match.group(1), flags=re.MULTILINE)
    return {quoted or bare for quoted, bare in keys}


def changed_paths(repo: Path, changed_file: str | None) -> set[str]:
    if not changed_file:
        return set()
    path = Path(changed_file)
    if not path.is_file():
        return set()
    result: set[str] = set()
    for raw in read_text(path).splitlines():
        candidate = raw.strip().removeprefix("a/").removeprefix("b/")
        if candidate:
            result.add(candidate)
    return result


def is_source_manifest_item(item: dict, slug: str) -> bool:
    for file_entry in item.get("files", []):
        if file_entry.get("path") == f"registry/ui/{slug}.tsx":
            return True
    return False


def inspect_component(
    repo: Path,
    slug: str,
    manifest: dict[str, dict],
    preview_entries: set[str],
    meta_entries: set[str],
    categories: set[str],
) -> list[str]:
    messages: list[str] = []
    required_paths = [
        repo / "registry" / "strings" / f"{slug}.ts",
        repo / "content" / "docs" / "components" / f"{slug}.mdx",
        repo / "public" / "llms" / "components" / f"{slug}.md",
        repo / "public" / "r" / f"{slug}.json",
    ]
    for path in required_paths:
        if path.is_file():
            messages.append(passed(f"{slug}: {path.relative_to(repo)} exists"))
        else:
            messages.append(failed(f"{slug}: missing {path.relative_to(repo)}; run the relevant generator or add the artifact"))

    base_item = manifest.get(slug)
    if not base_item:
        messages.append(failed(f"{slug}: registry.json is missing the base item"))
    elif is_source_manifest_item(base_item, slug):
        messages.append(passed(f"{slug}: registry.json links registry/ui/{slug}.tsx"))
    else:
        messages.append(failed(f"{slug}: registry.json base item does not link registry/ui/{slug}.tsx"))

    docs_path = repo / "content" / "docs" / "components" / f"{slug}.mdx"
    docs_frontmatter = frontmatter(docs_path)
    if docs_path.is_file() and not docs_frontmatter:
        messages.append(failed(f"{slug}: component MDX has no parseable frontmatter"))
    if docs_frontmatter:
        doc_categories = yaml_list(docs_frontmatter, "category")
        if not doc_categories:
            messages.append(failed(f"{slug}: component MDX has no category list"))
        for category in doc_categories:
            if category in categories:
                messages.append(passed(f"{slug}: category '{category}' is in lib/utils.ts"))
            else:
                messages.append(failed(f"{slug}: category '{category}' is not in lib/utils.ts"))

        doc_registry_keys = yaml_list(docs_frontmatter, "registryKeys")
        if not doc_registry_keys:
            messages.append(failed(f"{slug}: component MDX has no registryKeys list"))
        for key in doc_registry_keys:
            if key in preview_entries:
                messages.append(passed(f"{slug}: registry key '{key}' exists in registry/index.ts"))
            else:
                messages.append(failed(f"{slug}: registry key '{key}' is absent from registry/index.ts"))
            if key in manifest:
                messages.append(passed(f"{slug}: registry key '{key}' exists in registry.json"))
            else:
                messages.append(failed(f"{slug}: registry key '{key}' is absent from registry.json"))
            if key in meta_entries:
                messages.append(passed(f"{slug}: registry key '{key}' exists in generated registry/meta.ts"))
            else:
                messages.append(failed(f"{slug}: registry/meta.ts is stale or missing key '{key}'; run pnpm build:registry:meta"))
            public_entry = repo / "public" / "r" / f"{key}.json"
            if public_entry.is_file():
                messages.append(passed(f"{slug}: generated public registry item '{key}' exists"))
            else:
                messages.append(failed(f"{slug}: public registry item '{key}' is missing; run pnpm registry:public"))
    return messages


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", default=".", help="Path to the Satisium UI repository root")
    parser.add_argument("--slug", help="Limit the component-pipeline check to one source component slug")
    parser.add_argument("--changed-files", help="Optional newline-delimited path list from git diff for contract-review hints")
    parser.add_argument("--verbose", action="store_true", help="Print successful checks as well as failures and review hints")
    args = parser.parse_args()

    repo = Path(args.repo).resolve()
    if not (repo / "package.json").is_file():
        print(failed(f"{repo} is not a repository root with package.json"))
        return 2

    messages: list[str] = []
    registry, registry_errors = load_json(repo / "registry.json")
    messages.extend(registry_errors)
    if registry_errors:
        for message in messages:
            print(message)
        return 1

    items = registry.get("items", [])
    manifest = {item.get("name"): item for item in items if item.get("name")}
    source_dir = repo / "registry" / "ui"
    source_slugs = sorted(path.stem for path in source_dir.glob("*.tsx")) if source_dir.is_dir() else []
    if args.slug:
        source_slugs = [args.slug]
        if not (source_dir / f"{args.slug}.tsx").is_file():
            messages.append(failed(f"{args.slug}: registry/ui/{args.slug}.tsx does not exist"))

    if not source_slugs:
        messages.append(failed("no registry/ui/*.tsx source components found"))

    preview_entries = registry_keys(repo / "registry" / "index.ts")
    meta_entries = registry_keys(repo / "registry" / "meta.ts")
    categories = taxonomy_keys(repo / "lib" / "utils.ts")
    if not categories:
        messages.append(failed("could not read TAXONOMY keys from lib/utils.ts"))

    for slug in source_slugs:
        messages.extend(inspect_component(repo, slug, manifest, preview_entries, meta_entries, categories))

    changed = changed_paths(repo, args.changed_files)
    contract_anchors = {
        "lib/utils.ts",
        "source.config.ts",
        "scripts/build-llms.mjs",
        "scripts/build-registry-meta.mjs",
        ".agents/skills/_shared/repository-contract.md",
    }
    changed_anchors = sorted(changed & contract_anchors)
    if changed_anchors:
        messages.append(review("skill contract review required because a taxonomy or pipeline anchor changed: " + ", ".join(changed_anchors)))
    if args.changed_files and not changed:
        messages.append(review("changed-file list was empty or unavailable; parity checks still ran against the full repository"))

    for message in messages:
        if args.verbose or not message.startswith("PASS:"):
            print(message)
    failures = [message for message in messages if message.startswith("FAIL:")]
    reviews = [message for message in messages if message.startswith("REVIEW:")]
    print(f"SUMMARY: {len(failures)} failure(s), {len(reviews)} contract review hint(s), {len(messages)} check(s)")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
