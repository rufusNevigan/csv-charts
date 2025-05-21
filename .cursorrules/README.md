# Cursor Rules

This directory contains rules and automation for the Cursor IDE to ensure consistent workflows.

## PR Creation

The `rules.json` file defines an automated workflow for creating pull requests:

1. Automatically pushes your branch to origin
2. Creates a PR body from the template
3. Creates a draft PR with proper formatting
4. Cleans up temporary files

### Usage

When working with an AI agent, use this format:
```
task_id: "XX.YY"    (e.g. "05.02")
summary: "brief description"  (e.g. "disable non-numeric Y options")
```

The agent will:
1. Create a properly formatted branch name
2. Run required validations (lint, tests)
3. Create a PR following our template
4. Clean up temporary files

### Variables

- `${task_id}`: The milestone and step (e.g. "05.02")
- `${summary}`: Brief description of the change
- `${kebab_summary}`: Summary converted to kebab-case
- `${pr_title}`: Generated from template "feat(step XX.YY): summary"

### Required Checks

Before creating a PR, these checks must pass:
- `npm run lint`
- `npm test`
- `npm run test:e2e` 