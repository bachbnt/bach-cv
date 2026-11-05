---
name: web-design-guidelines
description: Review UI code for Web Interface Guidelines compliance. Use when asked to "review my UI", "check accessibility", "audit design", "review UX", or "check my site against best practices".
metadata:
  author: vercel
  version: "1.0.0"
  argument-hint: <file-or-pattern>
---

# Web Interface Guidelines

Review files for compliance with Web Interface Guidelines.

## How It Works

1. Read the guidelines in `command.md`, next to this file
2. Read the specified files (or prompt user for files/pattern)
3. Check against all rules in the guidelines
4. Output findings in the terse `file:line` format

## Guidelines Source

`command.md` is a pinned copy of
`https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md`
(commit 434b7f91, copied 2026-11-05). It contains all the rules and the output format. The upstream skill fetched
this file from the network before every review; this copy does not, so the rules only change when someone updates
the file by hand. To refresh it, read the new upstream file first, then replace `command.md` and update
`.claude/skills/SOURCES.md`.

Where a rule differs from this project's own conventions (for example Title Case for buttons; the project uses
sentence case), follow the project and skip that finding.

## Usage

When a user provides a file or pattern argument:
1. Read the guidelines in `command.md`
2. Read the specified files
3. Apply all rules from the guidelines
4. Output findings using the format specified in the guidelines

If no files specified, ask the user which files to review.
