#!/usr/bin/env python3
"""Non-destructive structural audit for Satisium UI skills and component artifacts."""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Iterable


STANDARD_SKILL_FIELDS = {
    "name",
    "description",
    "license",
    "compatibility",
    "metadata",
    "allowed-tools",
}


def fail(message: str) -> str:
    return f"FAIL: {message}"


def warn(message: str) -> str:
    return f"WARN: {message}"


def ok(message: str) -> str:
    return f"PASS: {message}"


def parse_frontmatter(path: Path) -> tuple[dict[str, str], list[str]]:
    content = path.read_text(encoding="utf-8")
    match = re.match(r"^---\n(.*?)\n---\n", content, flags=re.DOTALL)
    if not match:
        return {}, [fail(f"{path.relative_to(path.parents[3])} has no YAML frontmatter")]

    data: dict[str, str] = {}
    messages: list[str] = []
    for line in match.group(1).splitlines():
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        if ":" not in line:
            messages.append(fail(f"{path.name} has malformed frontmatter line: {line}"))
            continue
        key, value = line.split(":", 1)
        data[key.strip()] = value.strip().strip('"')
    return data, messages


def find_markdown_relative_links(content: str) -> Iterable[str]:
    for target in re.findall(r"\[[^\]]+\]\(([^)]+)\)", content):
        if not target.startswith(("http://", "https://", "#")):
            yield target.split("#", 1)[0]


def audit_skills(repo: Path) -> list[str]:
    skills_root = repo / ".agents" / "skills"
    messages: list[str] = []
    if not skills_root.is_dir():
        return [fail(".agents/skills directory is missing")]

    skill_files = sorted(skills_root.glob("*/SKILL.md"))
    if not skill_files:
        return [fail("no SKILL.md files found under .agents/skills")]

    for skill_file in skill_files:
        content = skill_file.read_text(encoding="utf-8")
        frontmatter, errors = parse_frontmatter(skill_file)
        messages.extend(errors)
        skill_name = skill_file.parent.name
        if frontmatter.get("name") != skill_name:
            messages.append(fail(f"{skill_file.relative_to(repo)} name must match directory '{skill_name}'"))
        description = frontmatter.get("description", "")
        if not description or len(description) > 1024:
            messages.append(fail(f"{skill_file.relative_to(repo)} needs a non-empty description up to 1024 characters"))
        invalid_fields = set(frontmatter) - STANDARD_SKILL_FIELDS
        if invalid_fields:
            messages.append(warn(f"{skill_file.relative_to(repo)} uses host-specific fields: {', '.join(sorted(invalid_fields))}"))
        if len(content.splitlines()) > 500:
            messages.append(warn(f"{skill_file.relative_to(repo)} exceeds 500 lines; move detail to references"))
        for relative_target in find_markdown_relative_links(content):
            if not (skill_file.parent / relative_target).resolve().exists():
                messages.append(fail(f"{skill_file.relative_to(repo)} links to missing resource '{relative_target}'"))
        messages.append(ok(f"{skill_file.relative_to(repo)} checked"))
    return messages


def load_registry(repo: Path) -> tuple[dict, list[str]]:
    registry_file = repo / "registry.json"
    if not registry_file.is_file():
        return {}, [fail("registry.json is missing")]
    try:
        return json.loads(registry_file.read_text(encoding="utf-8")), []
    except json.JSONDecodeError as error:
        return {}, [fail(f"registry.json is invalid JSON: {error}")]


def audit_component(repo: Path, slug: str, registry: dict) -> list[str]:
    messages: list[str] = []
    required = [
        repo / "registry" / "ui" / f"{slug}.tsx",
        repo / "registry" / "strings" / f"{slug}.ts",
        repo / "content" / "docs" / "components" / f"{slug}.mdx",
        repo / "public" / "llms" / "components" / f"{slug}.md",
    ]
    for path in required:
        if path.is_file():
            messages.append(ok(f"{path.relative_to(repo)} exists"))
        else:
            messages.append(fail(f"{path.relative_to(repo)} is missing for slug '{slug}'"))

    items = registry.get("items", [])
    manifest_item = next((item for item in items if item.get("name") == slug), None)
    if manifest_item:
        messages.append(ok(f"registry.json contains base item '{slug}'"))
        for file_entry in manifest_item.get("files", []):
            source_path = repo / file_entry.get("path", "")
            if source_path.is_file():
                messages.append(ok(f"manifest source {file_entry['path']} exists"))
            else:
                messages.append(fail(f"manifest source {file_entry.get('path')} is missing"))
    else:
        messages.append(fail(f"registry.json has no item named '{slug}'"))

    mdx_path = repo / "content" / "docs" / "components" / f"{slug}.mdx"
    if mdx_path.is_file():
        mdx = mdx_path.read_text(encoding="utf-8")
        if "registryKeys:" in mdx:
            messages.append(ok(f"{mdx_path.relative_to(repo)} declares registryKeys"))
        else:
            messages.append(warn(f"{mdx_path.relative_to(repo)} has no registryKeys declaration"))
    return messages


def audit_ci_scripts(repo: Path) -> list[str]:
    ci_file = repo / ".github" / "workflows" / "ci.yml"
    if not ci_file.is_file():
        return [warn("CI workflow not found; skipped CI script reference check")]
    text = ci_file.read_text(encoding="utf-8")
    paths = sorted(set(re.findall(r"(?:node\s+)?(scripts/[\w.-]+\.mjs)", text)))
    messages: list[str] = []
    for script_path in paths:
        if (repo / script_path).is_file():
            messages.append(ok(f"CI script {script_path} exists"))
        else:
            messages.append(warn(f"CI references missing script {script_path}"))
    return messages


def audit_freshness_assets(repo: Path) -> list[str]:
    script = repo / ".agents" / "skills" / "satisium-contribution-validate" / "scripts" / "check_freshness.py"
    workflow = repo / ".github" / "workflows" / "skills-freshness.yml"
    messages: list[str] = []
    if script.is_file():
        messages.append(ok("read-only freshness script exists"))
    else:
        messages.append(fail("read-only freshness script is missing"))
    if not workflow.is_file():
        return messages + [fail("skills-freshness workflow is missing")]

    text = workflow.read_text(encoding="utf-8")
    required_fragments = ["pull_request:", "workflow_dispatch:", "contents: read", "check_freshness.py"]
    for fragment in required_fragments:
        if fragment in text:
            messages.append(ok(f"skills-freshness workflow contains '{fragment}'"))
        else:
            messages.append(fail(f"skills-freshness workflow is missing required fragment '{fragment}'"))
    forbidden_fragments = ["pull_request_target:", "contents: write", "pull-requests: write"]
    for fragment in forbidden_fragments:
        if fragment in text:
            messages.append(fail(f"skills-freshness workflow must not contain '{fragment}'"))
    return messages


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", default=".", help="Path to the Satisium UI repository")
    parser.add_argument("--slug", help="Audit the complete source/docs/LLM/manifest path for one component slug")
    args = parser.parse_args()

    repo = Path(args.repo).resolve()
    if not (repo / "package.json").is_file():
        print(fail(f"{repo} is not a Satisium UI repository root (package.json missing)"))
        return 2

    messages = audit_skills(repo)
    registry, registry_messages = load_registry(repo)
    messages.extend(registry_messages)
    if args.slug and registry:
        messages.extend(audit_component(repo, args.slug, registry))
    messages.extend(audit_ci_scripts(repo))
    messages.extend(audit_freshness_assets(repo))

    for message in messages:
        print(message)
    failures = [message for message in messages if message.startswith("FAIL:")]
    warnings = [message for message in messages if message.startswith("WARN:")]
    print(f"SUMMARY: {len(failures)} failure(s), {len(warnings)} warning(s), {len(messages)} check(s)")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
