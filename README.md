# Obsura Web

Obsura Web is a frontend application for secure text and image redaction workflows,
built with React, TypeScript, Vite, and containerized NGINX deployment.

## Project Goals

- Reliable and privacy-aware redaction UX.
- Production-ready delivery through CI/CD and container publishing.
- Contributor-friendly open source governance and policies.

## Quick Start

1. Install dependencies:

   npm ci

2. Start development server:

   npm run dev

3. Validate types:

   npm run lint

4. Build production assets:

   npm run build

## Design System

The UI foundation (brand identity, design tokens, reusable component primitives,
and dark theme model) is documented in docs/design-system.md.

## Documentation

Browse the documentation index in docs/README.md.
and dark theme model) is documented in DESIGN_SYSTEM.md.
	npm ci

2. Start development server:

	npm run dev

3. Validate types:

	npm run lint

4. Build production assets:

	npm run build

## Open Source Governance

This repository includes enterprise-grade governance documents:

- License: see LICENSE.
- Code of Conduct: see CODE_OF_CONDUCT.md.
- Contribution workflow: see CONTRIBUTING.md.
- Security reporting and triage: see SECURITY.md.
- Support expectations: see SUPPORT.md.
- Maintainer model and policy hierarchy: see GOVERNANCE.md.
- Third-party notices: see THIRD_PARTY_NOTICES.md.

## Contribution Workflow (Required)

For every feature or change, use this exact command flow:

1. Create feature branch:

	git checkout -b feat/<feat_name>

2. Stage changes:

	git add .

3. Commit:

	git commit -m "feat(<feat_name>): <description>"

4. Push branch:

	git push -u origin feat/<feat_name>

Use .github/PULL_REQUEST_TEMPLATE.md when preparing PR details.

## CI/CD and Releases

- Push to main triggers release tagging, GitHub release creation, and image
  publishing to GHCR.
- Push to dev triggers dev image publishing to GHCR.

## Security

Do not report vulnerabilities in public issues.
Please follow SECURITY.md for private reporting.
