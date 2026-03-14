# Governance

## Project Model

Obsura Web follows a maintainer-led open source governance model.
Maintainers are responsible for roadmap direction, review decisions, release
quality, and security response coordination.

## Roles

### Maintainers

- Review and merge pull requests.
- Enforce code quality and security standards.
- Manage release process and documentation quality.
- Enforce CODE_OF_CONDUCT.md fairly and consistently.

### Contributors

- Propose and implement changes through pull requests.
- Follow CONTRIBUTING.md and repository policies.
- Provide test evidence for behavior changes.

## Decision Process

- Routine changes: decided by maintainers during PR review.
- Significant changes (architecture, API contracts, deployment impacts):
  discussed in issues or PR threads and approved by at least one maintainer.
- Security-sensitive changes: coordinated under SECURITY.md process.

## Release Responsibility

- Main branch is the release source for production image publishing.
- Release automation and tags are managed through GitHub Actions workflows.

## Policy Hierarchy

When guidance conflicts, use this order:

1. SECURITY.md
2. CODE_OF_CONDUCT.md
3. CONTRIBUTING.md
4. README.md
