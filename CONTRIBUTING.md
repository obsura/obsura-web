# Contributing to Obsura Web

Thank you for your interest in contributing.
This guide defines a reliable, review-friendly workflow for contributors.

## Contribution Principles

- Keep changes focused and scoped to one feature or fix per branch.
- Prefer small, reviewable pull requests over large batches.
- Add tests or validation notes for behavior changes.
- Keep documentation updated with code changes.

## Development Setup

1. Install Node.js 20+ and npm 10+.
2. Install dependencies:

   npm ci

3. Run development server:

   npm run dev

4. Validate types before opening a pull request:

   npm run lint

5. Build for production verification:

   npm run build

## Branching and Commit Convention

For every feature or change, use this exact flow:

1. Create feature branch:

   git checkout -b feat/<feat_name>

2. Stage changes:

   git add .

3. Commit with conventional format:

   git commit -m "feat(<feat_name>): <description>"

4. Push branch:

   git push -u origin feat/<feat_name>

## Pull Request Requirements

Every pull request should include:

- Clear problem statement and context.
- Scope summary of what changed.
- Testing evidence (commands and results).
- Rollback and risk notes for production-impacting work.
- Links to related issues, if available.

Use the pull request template in .github/PULL_REQUEST_TEMPLATE.md.

## Coding Expectations

- Preserve existing style and naming conventions.
- Avoid unrelated refactors in focused PRs.
- Keep public APIs backward compatible unless explicitly discussed.
- Document configuration changes in README.md.

## Security and Responsible Disclosure

Do not open public issues for sensitive vulnerabilities.
Report security concerns using SECURITY.md.

## Contributor License

By submitting a contribution, you agree that your contribution is licensed under
the repository license in LICENSE.
